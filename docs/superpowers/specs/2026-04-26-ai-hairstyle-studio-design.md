# AI Hairstyle Studio — Design

**Date:** 2026-04-26
**Status:** Draft for implementation
**Owner:** patcharapolsohheng

## Overview

A free, mobile-first web app that lets anyone upload a photo and preview themselves with a different hairstyle and hair color. Users move through a 3-step wizard (upload → customize → result), then save or share the generated image. The app supports Thai and English, runs anonymously (no login), and uses Google's Gemini 2.5 Flash Image for image editing — keeping the entire experience free for the user and free to operate within Gemini's free tier.

## Goals

- Let anyone try a new hairstyle and hair color on their own photo, free, in under 60 seconds from page-open to result
- Aesthetic + minimal UX inspired by the Claude design system (cream / coral / serif)
- Privacy-first: no original or generated images stored on any server
- Support both male and female users
- Support Thai + English, auto-detected from browser locale

## Non-goals

- No login or accounts in this MVP
- No server-side image storage (no permanent shareable URLs — users save and share themselves)
- No beard, makeup, or skin edits
- No multi-image batch processing
- No desktop-first features — drag-drop is progressive enhancement on top of mobile-tap

## Tech stack

| Layer            | Choice                                       | Why                                                       |
| ---------------- | -------------------------------------------- | --------------------------------------------------------- |
| Framework        | Next.js 15 (App Router)                      | Server-side AI calls, image-friendly, Vercel native       |
| State / data     | TanStack Query v5                            | Mutations + cache for quota, persistence for history      |
| Styling          | Tailwind CSS v4                              | Speed, fits design tokens, mobile-first responsive        |
| i18n             | next-intl                                    | Standard for App Router, type-safe, server+client support |
| Validation       | zod                                          | API request/response validation                           |
| AI               | Google Gemini 2.5 Flash Image ("nano banana") | Free tier, natural-language image editing                 |
| Rate limiting    | Upstash Redis + `@upstash/ratelimit`         | Free tier 10k commands/day, native Vercel integration     |
| Hosting          | Vercel                                       | Free tier, native Next.js, env vars for keys              |
| Image transport  | base64 in-memory                             | No server storage, privacy-first                          |
| Client history   | localStorage with LRU eviction               | History without backend                                   |

## User flow (3-step wizard)

### Step 1 — Upload

- Headline: italic serif "Bring your face." (TH: "ส่งหน้ามาก่อน")
- Sub: "Upload a clear photo — front-facing works best. We don't store anything."
- Drop zone with dotted coral border, tap-to-upload on mobile
- Accepts JPG / PNG, max 10 MB
- Once a valid photo is loaded, shows a thumbnail and enables `Continue →`

### Step 2 — Customize

- Headline: italic serif "Choose your look." (TH: "เลือกลุคที่อยาก")
- Gender pill toggle: **Female | Male** — controls which preset library is shown
- Preset grid: 8–10 styles per gender (3-column on mobile)
- Color swatch row: 7 colors
- Optional custom text prompt (collapsed by default, expandable)
- Footer: `← Back` · `Generate ✨` (primary; disabled when quota = 0)

### Step 3 — Result

- Headline: italic serif "Here you are." (TH: "นี่คือคุณ")
- Drag-handle before/after comparison slider (with BEFORE / AFTER labels)
- Action chips: `⬇ Save`, `↗ Share`, `↻ Try again`
- Footer: `Start over` (resets to Step 1)
- On entering this step, the result is auto-saved as a thumbnail to localStorage history

### History

- Accessed via a small `Recent looks` link from Step 1
- Drawer / modal listing thumbnails of past generations
- Tap thumbnail → expand to full-screen view with `⬇ Save` / `↗ Share`
- Entries are LRU-evicted: when the localStorage estimate approaches 4 MB, the oldest entries are dropped silently to make room for new ones

### Save vs history

- **History (automatic)** — every successful generation auto-saves a 256 px webp thumbnail so users can browse back. Full-resolution result is NOT kept in localStorage; it lives in component memory only while the result step is active.
- **Save (explicit)** — `⬇ Save` button triggers a browser download of the full-resolution generated image to the device's Downloads / Photos folder. This is the user's permanent copy.
- **Share (explicit)** — `↗ Share` uses the Web Share API (Level 2) to open the native share sheet with the image binary on supported mobile browsers; falls back to download on browsers without Share API support.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Next.js App Router (Vercel)                │
│  ┌─────────────────────────────────────┐    │
│  │ Client (TanStack Query)             │    │
│  │  • useGenerateMutation()            │    │
│  │  • useQuotaQuery()                  │    │
│  │  • localStorage history (LRU)       │    │
│  │  • next-intl messages (th/en)       │    │
│  └────────────┬────────────────────────┘    │
│               │                              │
│  ┌────────────▼────────────────────────┐    │
│  │ POST /api/generate                  │    │
│  │  1. read IP from x-forwarded-for    │    │
│  │  2. Upstash rate limit (5 / IP / d) │    │
│  │  3. validate body (zod)             │    │
│  │  4. build prompt from preset+color  │    │
│  │  5. call Gemini 2.5 Flash Image     │    │
│  │  6. return base64 + remaining quota │    │
│  └────────────┬────────────────────────┘    │
│               │                              │
│  ┌────────────▼────────────────────────┐    │
│  │ GET /api/quota                      │    │
│  │  return remaining count for IP      │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
       │                          │
       ▼                          ▼
   Upstash Redis           Google Gemini API
   (rate limiting)         (image generation)
```

### File layout

```
app/
└── [locale]/
    ├── layout.tsx               # next-intl provider, QueryClientProvider, lang toggle
    ├── page.tsx                 # Wizard host (owns wizard state)
    └── api/
        ├── generate/route.ts    # POST: image → AI → result
        └── quota/route.ts       # GET: remaining quota
components/
├── wizard/
│   ├── Step1Upload.tsx
│   ├── Step2Customize.tsx
│   └── Step3Result.tsx
├── BeforeAfterSlider.tsx
├── PresetGrid.tsx
├── ColorSwatches.tsx
├── HistoryDrawer.tsx
├── QuotaCounter.tsx
└── LangToggle.tsx
lib/
├── presets.ts                   # gender → [{ id, label, promptFragment }]
├── colors.ts                    # color palette + prompt fragments
├── prompt.ts                    # buildPrompt({ presetId, colorId, customText, locale })
├── history.ts                   # localStorage CRUD with LRU eviction
├── queries/
│   ├── useGenerateMutation.ts
│   └── useQuotaQuery.ts
├── queryClient.ts               # TanStack Query setup + persistence
└── i18n/
    ├── config.ts                # next-intl config
    └── messages/{en,th}.json
```

### Component boundaries

- **Wizard host (`page.tsx`)** — owns wizard state: `currentStep`, `image`, `presetId`, `colorId`, `customText`, `generatedImage`. Renders the active step. No data fetching here directly.
- **Step components** — pure presentation: receive state + setters, emit `next` / `back` events. No queries / mutations of their own.
- **`useGenerateMutation()`** — wraps the generate POST. On success: pushes a thumbnail entry to history and invalidates the `['quota']` query.
- **`useQuotaQuery()`** — `staleTime: 30s`, refetches on window focus. Powers `QuotaCounter` and disables Generate when `remaining === 0`.
- **`HistoryDrawer`** — uses a `useHistory` hook that reads localStorage on mount and exposes `list / add / clear`. Add applies LRU eviction.

### Data flow

1. User uploads file → `Step1Upload` reads it as a base64 data URL via `FileReader` → wizard host stores it
2. User picks gender / preset / color (and optionally custom text) → host state updates
3. User taps `Generate ✨` → `useGenerateMutation` POSTs to `/api/generate`
4. Server route:
   1. Reads IP from `x-forwarded-for` (set by Vercel)
   2. Calls `@upstash/ratelimit` with key = IP, window = 24h, limit = 5
   3. If rate-limited → returns 429 with `retryAfter` and `remaining: 0`
   4. Validates body via zod
   5. Builds the prompt: localized base instruction + preset fragment + color fragment + optional custom text
   6. Calls Gemini 2.5 Flash Image with the original image and prompt
   7. Returns `{ generatedImage: <base64>, remaining: <int> }`
5. Client receives result → wizard advances to Step 3 → `history.add()` saves a 256 px thumbnail → quota cache invalidates

### API surface

`POST /api/generate`

```ts
// Request
{
  image: string            // base64 data URL, ≤10 MB encoded
  presetId: string         // matches an entry in lib/presets.ts
  colorId: string          // matches an entry in lib/colors.ts
  customText?: string      // optional, max 200 chars
  locale: 'th' | 'en'      // for prompt language
}

// 200 OK
{
  generatedImage: string   // base64 data URL
  remaining: number        // quota left for today
}

// 429 Too Many Requests
{
  error: 'rate_limited'
  retryAfter: number       // seconds until counter resets
  remaining: 0
}

// 400 / 422 / 500
{
  error: 'invalid_input' | 'image_too_large' | 'no_face_detected' | 'ai_failure'
  message: string          // user-facing localized message
}
```

`GET /api/quota`

```ts
// 200 OK
{
  remaining: number        // quota left for today
  resetAt: number          // Unix ms timestamp when counter resets
}
```

### Prompt construction

```ts
// lib/prompt.ts
function buildPrompt({ preset, color, customText, locale }: BuildPromptArgs): string {
  const base = locale === 'th'
    ? 'เปลี่ยนเฉพาะทรงผมและสีผมของบุคคลในรูปนี้ เก็บใบหน้า สีผิว แสง และพื้นหลังให้เหมือนเดิมทุกประการ'
    : 'Change only the hairstyle and hair color of the person in this image. Preserve the face, skin tone, lighting, and background exactly.'

  const styleFragment = preset.promptFragment[locale]
  const colorFragment = color.promptFragment[locale]

  let prompt = `${base}. ${styleFragment}. ${colorFragment}.`
  if (customText) prompt += ` ${customText}`
  return prompt
}
```

### LocalStorage history with LRU eviction

```ts
// lib/history.ts
const KEY = 'hairstyle-history-v1'
const MAX_BYTES = 4 * 1024 * 1024 // 4 MB ceiling, leaves headroom under typical 5–10 MB browser quotas

type Entry = {
  id: string                 // ulid
  createdAt: number          // Unix ms
  thumbnailBase64: string    // result downsized to 256 px webp
  presetId: string
  colorId: string
}

function add(entry: Entry) {
  const list = read()
  list.unshift(entry)
  while (sizeOf(list) > MAX_BYTES && list.length > 1) {
    list.pop()
  }
  write(list)
}
```

Thumbnails are produced client-side via canvas (256 px max side, webp at quality 0.85) before storage. The full-resolution result is never written to localStorage.

### TanStack Query setup

- Single `QueryClient` instance with defaults: `staleTime: 30_000`, `gcTime: 5 * 60_000`
- Persist via `@tanstack/query-sync-storage-persister` to localStorage so quota is consistent across tabs
- `useGenerateMutation` invalidates `['quota']` on success
- All hooks live in `lib/queries/*.ts`

### i18n

- next-intl with `[locale]` segment in App Router; routes are `/th/*` and `/en/*`
- Messages live in `lib/i18n/messages/{en,th}.json`
- On first visit, server inspects `Accept-Language` and redirects to the matching locale (`th` if header starts with `th`, otherwise `en`)
- LangToggle (top-right, next to the quota counter) writes `NEXT_LOCALE` cookie and navigates to the same path under the new locale

### Styling tokens

Extending Tailwind:

```ts
colors: {
  cream:    '#FAF9F5',
  ink:      '#3D3929',
  coral:    '#CC785C',
  coralDk:  '#A65A41',
  paper:    '#F0EDE3',
  faded:    '#999188',
}
fontFamily: {
  display: ['"Source Serif Pro"', 'Tiempos', 'Georgia', 'serif'],
  body:    ['Inter', 'system-ui', 'sans-serif'],
}
```

## Error handling

| Scenario             | Server                       | Client                                                                  |
| -------------------- | ---------------------------- | ----------------------------------------------------------------------- |
| Quota exceeded       | 429 + `retryAfter`           | Disable Generate, show "วันนี้เต็มแล้ว / Daily limit reached" + countdown |
| Image > 10 MB        | 400 `image_too_large`        | Block at upload step, toast                                             |
| Invalid file type    | client-side reject           | Toast "JPG หรือ PNG เท่านั้น / JPG or PNG only"                          |
| Gemini transient     | 500 `ai_failure`             | Retry button, console-log error                                         |
| Face not detected    | 422 `no_face_detected`       | "ไม่เจอใบหน้าในรูป / No face detected — try another photo" + back to Step 1 |
| Network failure      | n/a                          | TanStack Query auto-retries x2, then shows error UI with manual retry   |

## Testing strategy

- **Unit (Vitest)**
  - `prompt.test.ts` — preset + color → expected prompt string for both locales
  - `history.test.ts` — LRU eviction at threshold, ordering, dedup
  - `validators.test.ts` — zod schemas accept/reject edge cases
- **Integration (Vitest + node-mocks-http)**
  - `/api/generate` — Gemini SDK mocked, real Upstash test instance, exercise rate-limit hits
  - `/api/quota` — sane defaults for a fresh IP
- **E2E (Playwright)**
  - Mobile viewport (iPhone 13 emulation)
  - Happy path: upload → preset → color → generate (mocked) → result → save
  - Quota exhausted: API returns 429, UI disables Generate and shows countdown
  - Lang toggle: TH ↔ EN swaps every visible string
  - LRU: seed 50 history entries, verify oldest are evicted

## Deployment

- Vercel project linked to the GitHub repo (created when implementation begins)
- Required env vars (server-only, never exposed to client):
  - `GEMINI_API_KEY`
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
- Branch protection: only `main` → production
- Preview deploys for every PR
- Vercel Analytics enabled (free)

## Open questions

(none — all conceptual decisions resolved during brainstorm)

## Appendix — initial libraries

**Female presets (10):** Bob, Long Wavy, Pixie, Curly Long, Korean Layered, Beach Waves, High Ponytail, Blunt Shoulder, Side-swept, Asymmetric Cut

**Male presets (10):** Two-block (Korean), Buzz Cut, Undercut Fade, Comb-over, Pompadour, Shoulder-length, Slicked-back, Crew Cut, Curly Top, Modern Mullet

**Colors (7):** Black, Dark Brown, Brown, Blonde, Ginger, Burgundy, Pastel (open accent — used as a "fashion" wildcard)
