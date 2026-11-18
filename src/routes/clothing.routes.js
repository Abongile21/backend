import { Router } from 'express';
import { validateClothingRequest } from '../validators/clothing.validator.js';
import { FortyGuardApiError } from '../services/fortyguard-api.service.js';

export function createClothingRouter({ fortyGuardApi, recommendationService }) {
  const router = Router();

  router.post('/recommendations', async (request, response, next) => {
    const issues = validateClothingRequest(request.body);
    if (issues.length) {
      response.status(400).json({ error: 'Invalid request.', details: issues });
      return;
    }

    try {
      const { latitude, longitude, location, temperatureCelsius, startDate, startTime, endTime } = request.body;
      const dateTime = endTime
        ? { start_date: startDate, start_time: startTime, end_time: endTime, filter_type: 2 }
        : { start_date: startDate, start_time: startTime, filter_type: 1 };
      const submitted = await fortyGuardApi.submitEnvironmentalParameters({
        latitude,
        longitude,
        temperature: temperatureCelsius,
        date_time: dateTime
      });
      const activityId = submitted?.data?.activity_id;
      if (typeof activityId !== 'string' || !activityId) {
        throw new FortyGuardApiError('FortyGuard returned an unexpected submission response.');
      }

      const completed = await fortyGuardApi.waitForActivity(activityId);
      response.status(501).json({
        error: 'Analysis completed, but the response-to-observation mapping has not been verified.',
        activityId,
        status: completed.status
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
