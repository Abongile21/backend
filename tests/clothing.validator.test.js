import test from 'node:test';
import assert from 'node:assert/strict';
import { validateClothingRequest } from '../src/validators/clothing.validator.js';

test('accepts a complete environmental analysis request', () => {
  assert.deepEqual(validateClothingRequest({
    latitude: -33.9,
    longitude: 18.4,
    location: 'Cape Town',
    temperatureCelsius: 21,
    startDate: '2026-11-17',
    startTime: '12:00'
  }), []);
});

test('rejects invalid coordinates, missing API temperature, and malformed time', () => {
  const issues = validateClothingRequest({
    latitude: 120,
    longitude: 200,
    location: '',
    startDate: '17-11-2026',
    startTime: '25:30'
  });
  assert.equal(issues.length, 6);
});
