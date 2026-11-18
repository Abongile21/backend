import 'dotenv/config';

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const config = Object.freeze({
  port: positiveInteger(process.env.PORT, 3000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200,https://frontend-forty-guard.vercel.app',
  fortyGuardBaseUrl: process.env.FORTYGUARD_API_BASE_URL || 'https://api.fortyguard.com',
  fortyGuardApiKey: process.env.FORTYGUARD_API_KEY || '',
  fortyGuardEnvParamsPath: process.env.FORTYGUARD_ENV_PARAMS_PATH || '/v1/env_params',
  fortyGuardStatusPath: process.env.FORTYGUARD_STATUS_PATH || '/v1/status',
  fortyGuardLiveEnabled: process.env.FORTYGUARD_LIVE_ENABLED === 'true',
  fortyGuardResponseMappingVerified: false,
  geocodingBaseUrl: process.env.GEOCODING_BASE_URL || 'https://nominatim.openstreetmap.org',
  requestTimeoutMs: positiveInteger(process.env.FORTYGUARD_REQUEST_TIMEOUT_MS, 15000),
  pollIntervalMs: positiveInteger(process.env.FORTYGUARD_POLL_INTERVAL_MS, 2000),
  maxPollAttempts: positiveInteger(process.env.FORTYGUARD_MAX_POLL_ATTEMPTS, 30)
});
