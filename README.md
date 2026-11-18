# FortyGuard Explorer API

Independent Express backend for FortyGuard Explorer.

## Local development

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Set `FRONTEND_ORIGIN` to the exact origin of the separately deployed Angular app. Keep the FortyGuard API key in this backend's `.env`; never add it to the frontend.

## Vercel deployment

The backend is configured for `https://fortyguard-explorer-backend.vercel.app`. Set these environment variables in the Vercel project:

- `FRONTEND_ORIGIN=https://your-fortyguard-frontend.vercel.app`
- `FORTYGUARD_API_KEY=...`
- `FORTYGUARD_LIVE_ENABLED=false` until the FortyGuard response mapping is verified
- `FORTYGUARD_REQUEST_TIMEOUT_MS=15000`
- `FORTYGUARD_POLL_INTERVAL_MS=2000`
- `FORTYGUARD_MAX_POLL_ATTEMPTS=30`

## Tests

```powershell
npm test
```

Live FortyGuard requests are disabled until the documented response-to-time-series mapping is implemented and verified. The API docs confirm `POST /v1/env_params`, `api-key` authentication, and `GET /v1/status/{activity_id}` for async status. The environmental endpoint requires a Celsius temperature input; do not supply a guessed value.
