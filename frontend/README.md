# ModEval v2

Fresh React frontend (Alloy Night theme) for ModEval.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- shadcn/ui
- Motion

## Develop

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to `https://modeval-api.bynipun.com` so CORS is not required for local development.

## Endpoints wired

- `GET /health`
- `GET /models`
- `POST /analyze`

## Panels

- Analysis
- How It Works
- Models
