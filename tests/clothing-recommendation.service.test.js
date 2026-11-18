import test from 'node:test';
import assert from 'node:assert/strict';
import { ClothingRecommendationService } from '../src/services/clothing-recommendation.service.js';

const service = new ClothingRecommendationService();
const sample = (overrides = {}) => ({
  location: 'Test location',
  temperatureCelsius: 20,
  feelsLikeCelsius: null,
  humidityPercent: null,
  windKph: null,
  precipitationMm: null,
  solarIrradianceWm2: null,
  forecastTemperaturesCelsius: [],
  ...overrides
});

test('recommends lightweight clothing in hot conditions', () => {
  const result = service.recommend(sample({ temperatureCelsius: 31 }));
  assert.ok(result.clothing.some((item) => item.includes('T-shirt')));
  assert.ok(result.explanations.length > 0);
});

test('recommends a light layer in moderate conditions', () => {
  const result = service.recommend(sample({ temperatureCelsius: 20 }));
  assert.ok(result.clothing.some((item) => item.includes('Long-sleeved')));
});

test('recommends insulating clothing in cold conditions', () => {
  const result = service.recommend(sample({ temperatureCelsius: 3 }));
  assert.ok(result.clothing.some((item) => item.includes('warm coat')));
});

test('adds rain gear and waterproof footwear for precipitation', () => {
  const result = service.recommend(sample({ precipitationMm: 2 }));
  assert.ok(result.clothing.some((item) => item.includes('raincoat')));
  assert.ok(result.footwear.some((item) => item.includes('Waterproof')));
});

test('advises breathable fabrics for high humidity', () => {
  const result = service.recommend(sample({ humidityPercent: 82 }));
  assert.ok(result.advice.some((item) => item.includes('High humidity')));
});

test('adds wind protection for strong wind', () => {
  const result = service.recommend(sample({ windKph: 40 }));
  assert.ok(result.clothing.some((item) => item.includes('Wind-resistant')));
});

test('reports missing temperature without inventing a temperature recommendation', () => {
  const result = service.recommend(sample({ temperatureCelsius: null }));
  assert.ok(result.advice.some((item) => item.includes('Temperature is unavailable')));
  assert.equal(result.observation.temperatureCelsius, null);
});

test('suggests layers for changing temperatures through the day', () => {
  const result = service.recommend(sample({ forecastTemperaturesCelsius: [25, 16, 11] }));
  assert.ok(result.clothing.some((item) => item.includes('removable layers')));
});
