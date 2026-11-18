export class FortyGuardApiError extends Error {
  constructor(message, statusCode = 502) {
    super(message);
    this.name = 'FortyGuardApiError';
    this.statusCode = statusCode;
  }
}

export class FortyGuardApiService {
  constructor(config, fetchImpl = fetch, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))) {
    this.config = config;
    this.fetchImpl = fetchImpl;
    this.sleep = sleep;
  }

  isConfigured() {
    return this.config.fortyGuardLiveEnabled &&
      this.config.fortyGuardResponseMappingVerified &&
      Boolean(this.config.fortyGuardApiKey);
  }

  async request(path, options = {}) {
    const url = new URL(path, this.config.fortyGuardBaseUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.requestTimeoutMs);

    try {
      const response = await this.fetchImpl(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.config.fortyGuardApiKey,
          ...options.headers
        }
      });
      let payload;
      try {
        payload = await response.json();
      } catch {
        throw new FortyGuardApiError('FortyGuard returned an invalid JSON response.');
      }

      if (!response.ok) {
        const messages = {
          401: 'FortyGuard rejected the API key.',
          403: 'The FortyGuard plan does not allow this request.',
          404: 'FortyGuard could not find the requested activity.',
          429: 'FortyGuard rate limit reached. Try again later.'
        };
        throw new FortyGuardApiError(messages[response.status] || 'FortyGuard request failed.', response.status);
      }
      return payload;
    } catch (error) {
      if (error instanceof FortyGuardApiError) throw error;
      if (error?.name === 'AbortError') {
        throw new FortyGuardApiError('The FortyGuard request timed out.', 504);
      }
      throw new FortyGuardApiError('Could not connect to FortyGuard.');
    } finally {
      clearTimeout(timeout);
    }
  }

  async submitEnvironmentalParameters(payload) {
    if (!this.isConfigured()) {
      throw new FortyGuardApiError(
        'Live FortyGuard requests are disabled until the documented response mapping is verified.',
        503
      );
    }
    return this.request(this.config.fortyGuardEnvParamsPath, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getActivityStatus(activityId) {
    if (!this.isConfigured()) {
      throw new FortyGuardApiError('Live FortyGuard requests are not configured.', 503);
    }
    const path = `${this.config.fortyGuardStatusPath}/${encodeURIComponent(activityId)}`;
    return this.request(path, { method: 'GET' });
  }

  async waitForActivity(activityId) {
    for (let attempt = 0; attempt < this.config.maxPollAttempts; attempt += 1) {
      const response = await this.getActivityStatus(activityId);
      const data = response?.data;
      if (!data || typeof data.status !== 'string') {
        throw new FortyGuardApiError('FortyGuard returned an unexpected activity status response.');
      }
      const status = data.status.toLowerCase();
      if (status === 'completed' || status === 'succeeded') return data;
      if (status === 'failed' || status === 'error') {
        throw new FortyGuardApiError('The FortyGuard analysis failed.');
      }
      await this.sleep(this.config.pollIntervalMs);
    }
    throw new FortyGuardApiError('The FortyGuard analysis did not finish in time.', 504);
  }
}
