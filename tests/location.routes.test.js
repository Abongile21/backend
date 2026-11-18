import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createLocationRouter } from '../src/routes/location.routes.js';

test('location search is limited to United States and normalizes coordinates', async () => {
  const app = express();
  app.use('/api/location', createLocationRouter({
    geocodingBaseUrl: 'https://nominatim.openstreetmap.org',
    fetchImpl: async (url) => {
      assert.equal(url.searchParams.get('countrycodes'), 'us');
      assert.equal(url.searchParams.get('q'), 'Austin, Texas');
      return {
        ok: true,
        json: async () => [{
          display_name: 'Austin, Travis County, Texas, United States',
          lat: '30.2672',
          lon: '-97.7431'
        }]
      };
    }
  }));

  const server = app.listen(0);
  const address = server.address();
  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/location/search?q=Austin%2C%20Texas`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(body.locations[0], {
      name: 'Austin, Travis County, Texas, United States',
      latitude: 30.2672,
      longitude: -97.7431
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
