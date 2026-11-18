import { Router } from 'express';

export function createLocationRouter({ geocodingBaseUrl, fetchImpl = fetch }) {
  const router = Router();

  router.get('/search', async (request, response, next) => {
    const query = typeof request.query.q === 'string' ? request.query.q.trim() : '';
    if (query.length < 2) {
      response.json({ locations: [] });
      return;
    }

    try {
      const url = new URL('/search', geocodingBaseUrl);
      url.searchParams.set('q', query);
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('limit', '6');

      const upstream = await fetchImpl(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'FortyGuard-Explorer/1.0'
        }
      });
      if (!upstream.ok) {
        throw new Error(`Location search failed with status ${upstream.status}.`);
      }
      const payload = await upstream.json();
      const locations = Array.isArray(payload)
        ? payload
          .filter((item) => Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lon)))
          .map((item) => {
            const address = item.address || {};
            const city = address.city || address.town || address.village ||
              address.municipality || address.county || item.name;
            const region = address.state || address.region || address.county;
            const country = address.country;
            const secondary = [region, country].filter(Boolean).filter((value, index, values) =>
              values.indexOf(value) === index
            ).join(', ');

            return {
              name: city,
              secondary,
              displayName: [city, secondary].filter(Boolean).join(', '),
              latitude: Number(item.lat),
              longitude: Number(item.lon)
            };
          })
        : [];
      response.json({ locations });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
