import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { FortyGuardApiService } from './services/fortyguard-api.service.js';
import { ClothingRecommendationService } from './services/clothing-recommendation.service.js';
import { createClothingRouter } from './routes/clothing.routes.js';

const app = express();
const fortyGuardApi = new FortyGuardApiService(config);
const recommendationService = new ClothingRecommendationService();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: config.frontendOrigin }));
app.use(express.json({ limit: '16kb' }));
app.use(rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false }));

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    fortyGuard: fortyGuardApi.isConfigured() ? 'configured' : 'disabled'
  });
});
app.use('/api/clothing', createClothingRouter({ fortyGuardApi, recommendationService }));

app.use((error, _request, response, _next) => {
  const status = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  if (status >= 500) console.error(error.message);
  response.status(status).json({ error: error.message || 'Internal server error.' });
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`FortyGuard Explorer API listening on port ${config.port}`);
  });
}

export { app };
