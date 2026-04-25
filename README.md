# Hairstyle Studio

Free, mobile-first AI hairstyle preview. Upload a photo → pick a style + color → see yourself with a new look. Built with Next.js 15, TanStack Query, and Google Gemini 2.5 Flash Image. No signup, no server-side image storage.

## Stack

- Next.js 15 App Router · TypeScript · Tailwind v4
- TanStack Query v5 (with localStorage persistence)
- next-intl (Thai + English, auto-detected)
- @upstash/ratelimit (per-IP, 5/day)
- @google/genai (Gemini 2.5 Flash Image)
- Vitest + Playwright

## Local development

```bash
cp .env.example .env.local
# fill in GEMINI_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
npm install
npm run dev
```

Open <http://localhost:3000> — auto-redirects to `/en` or `/th` based on browser locale.

## Tests

```bash
npm test            # unit + API
npm run test:e2e    # Playwright (mocks Gemini)
npm run typecheck   # tsc --noEmit
```

## Generating preset thumbnails (one-off)

The 20 hairstyle preset cards in Step 2 fall back to a coloured gradient if no thumbnail image exists. To populate real sample portraits via Gemini 2.5 Flash Image:

```bash
npm run presets:thumbs
```

The script reads `GEMINI_API_KEY` from `.env.local`, generates one PNG per preset into `public/presets/<id>.png`, throttles to 6 requests per minute (10 s between calls) to stay under Gemini's free-tier rate limit, and retries with exponential back-off on 429 responses. It is idempotent — existing files are skipped, so the script can be re-run safely to fill in failed entries.

Total time for a clean run: ~3.5 minutes. Once committed, the thumbnails are static assets served from Vercel's CDN — no run-time Gemini cost.

## Deploy on Vercel

1. Push the repo to GitHub.
2. Import into Vercel.
3. Add env vars: `GEMINI_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
4. Deploy. Preview deploys are created on every PR.

## Environment

| Var | Where to get it |
| --- | --- |
| `GEMINI_API_KEY` | <https://aistudio.google.com/> → Get API key |
| `UPSTASH_REDIS_REST_URL` | <https://upstash.com/> → Create Redis DB → REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | same DB → REST Token |

## Privacy

- Original photos are never written to any server. They live only in process memory during the API call to Gemini.
- Generated images are returned as base64 directly to the client. The client decides whether to download them.
- Browser localStorage holds 256 px thumbnails of past generations only, with LRU eviction at 4 MB.
