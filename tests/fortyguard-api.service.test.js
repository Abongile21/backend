import test from 'node:test';
import assert from 'node:assert/strict';
import { FortyGuardApiService } from '../src/services/fortyguard-api.service.js';

const config = {
  fortyGuardBaseUrl: 'https://api.fortyguard.com',
  fortyGuardApiKey: 'test-key',
  fortyGuardEnvParamsPath: '/v1/env_params',
  fortyGuardStatusPath: '/v1/status',
  fortyGuardLiveEnabled: true,
  fortyGuardResponseMappingVerified: true,
  requestTimeoutMs: 1000,
  pollIntervalMs: 0,
  maxPollAttempts: 2
};

test('uses the documented authentication header and environmental endpoint', async () => {
  let captured;
  const service = new FortyGuardApiService(config, async (url, options) => {
    captured = { url: String(url), options };
    return { ok: true, json: async () => ({ data: { activity_id: 'activity-1' } }) };
  });
  await service.submitEnvironmentalParameters({ latitude: 1, longitude: 2 });
  assert.equal(captured.url, 'https://api.fortyguard.com/v1/env_params');
  assert.equal(captured.options.headers['api-key'], 'test-key');
  assert.equal(captured.options.method, 'POST');
});

test('does not contact FortyGuard unless live requests are enabled', async () => {
  let called = false;
  const service = new FortyGuardApiService(
    { ...config, fortyGuardLiveEnabled: false },
    async () => { called = true; }
  );
  await assert.rejects(service.submitEnvironmentalParameters({}), /disabled/);
  assert.equal(called, false);
});

test('does not contact FortyGuard when the response mapper is not verified', async () => {
  let called = false;
  const service = new FortyGuardApiService(
    { ...config, fortyGuardResponseMappingVerified: false },
    async () => { called = true; }
  );
  await assert.rejects(service.submitEnvironmentalParameters({}), /disabled/);
  assert.equal(called, false);
});

test('stops polling when an activity is completed', async () => {
  let calls = 0;
  const service = new FortyGuardApiService(config, async () => {
    calls += 1;
    return { ok: true, json: async () => ({ data: { status: 'Completed', result: {} } }) };
  });
  const result = await service.waitForActivity('activity-1');
  assert.equal(result.status, 'Completed');
  assert.equal(calls, 1);
});
