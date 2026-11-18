# FortyGuard Explorer API

Independent Express backend for FortyGuard Explorer.

## Local development

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Set `FRONTEND_ORIGIN` to the exact origin of the separately deployed Angular app. Keep the FortyGuard API key in this backend's `.env`; never add it to the frontend.

## Tests

```powershell
npm test
```

Live FortyGuard requests are disabled until the documented response-to-time-series mapping is implemented and verified. The API docs confirm `POST /v1/env_params`, `api-key` authentication, and `GET /v1/status/{activity_id}` for async status. The environmental endpoint requires a Celsius temperature input; do not supply a guessed value.
