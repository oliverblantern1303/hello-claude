# THE FLOOR

**Stack:** Vite + React + TypeScript, localStorage persistence, deploys to Vercel.

A daily closing & transformation control panel. Not a productivity tracker — an instrument that makes building cost-neutral and asking the only path to a held floor.

## Run locally

```
npm install
npm run dev
```

Open http://localhost:5173.

## Deploy

Push to a Vercel-linked repo. Vercel auto-detects Vite via `vercel.json`. No environment variables required — all state lives in the browser's localStorage.

## Test

```
npm test
```

Tests cover the scoring engine, including the load-bearing 39-point build cap.

## What this is

See `BUILD_SPEC.md` if present, or read `src/score.ts` — the scoring engine is the entire IP. The UI is a thin shell around it. The binary `FLOOR HELD / FLOOR BROKEN` is the primary signal; the /100 is secondary. Building is invisible to the scoring engine by design.
