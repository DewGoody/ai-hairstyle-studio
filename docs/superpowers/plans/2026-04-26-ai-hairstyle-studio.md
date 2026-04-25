# AI Hairstyle Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a free, mobile-first Next.js app where anyone can upload a photo and preview themselves with a different hairstyle and hair color via Gemini 2.5 Flash Image.

**Architecture:** Next.js 15 App Router, server route calls Gemini after rate-limit check via Upstash. Client uses TanStack Query for the generate mutation and quota query, plus localStorage with LRU for history. Thai + English via next-intl with `[locale]` routes. Privacy-first: images travel as base64 in-memory, never persisted server-side.

**Tech Stack:** Next.js 15 (App Router) · TypeScript · Tailwind v4 · TanStack Query v5 · zod · next-intl · @upstash/ratelimit · @google/genai · Vitest + Testing Library · Playwright

**Spec:** [`../specs/2026-04-26-ai-hairstyle-studio-design.md`](../specs/2026-04-26-ai-hairstyle-studio-design.md)

---

## File structure (what each task produces)

```
ai-hairstyle-studio/
├── .env.example                          # Task 1
├── .gitignore                            # already exists
├── README.md                             # Task 26
├── package.json                          # Task 1
├── tsconfig.json                         # Task 1
├── next.config.ts                        # Task 1, Task 9
├── tailwind.config.ts                    # Task 2
├── postcss.config.js                     # Task 1
├── vitest.config.ts                      # Task 3
├── vitest.setup.ts                       # Task 3
├── playwright.config.ts                  # Task 24
├── middleware.ts                         # Task 9
├── i18n.ts                               # Task 9 (next-intl request config)
├── app/
│   ├── globals.css                       # Task 2
│   ├── api/
│   │   ├── generate/route.ts             # Task 13
│   │   └── quota/route.ts                # Task 12
│   └── [locale]/
│       ├── layout.tsx                    # Task 16
│       └── page.tsx                      # Task 17
├── components/
│   ├── Providers.tsx                     # Task 14
│   ├── LangToggle.tsx                    # Task 16
│   ├── QuotaCounter.tsx                  # Task 16
│   ├── PresetGrid.tsx                    # Task 19
│   ├── ColorSwatches.tsx                 # Task 19
│   ├── BeforeAfterSlider.tsx             # Task 21
│   ├── HistoryDrawer.tsx                 # Task 23
│   └── wizard/
│       ├── Step1Upload.tsx               # Task 18
│       ├── Step2Customize.tsx            # Task 20
│       └── Step3Result.tsx               # Task 22
├── lib/
│   ├── presets.ts                        # Task 4
│   ├── colors.ts                         # Task 5
│   ├── prompt.ts                         # Task 6
│   ├── history.ts                        # Task 7
│   ├── thumbnail.ts                      # Task 8
│   ├── ratelimit.ts                      # Task 10
│   ├── gemini.ts                         # Task 11
│   ├── ipFromRequest.ts                  # Task 10
│   ├── queryClient.ts                    # Task 14
│   ├── queries/
│   │   ├── useQuotaQuery.ts              # Task 15
│   │   └── useGenerateMutation.ts        # Task 15
│   └── i18n/
│       ├── routing.ts                    # Task 9
│       └── messages/
│           ├── en.json                   # Task 9 (extended throughout)
│           └── th.json                   # Task 9 (extended throughout)
└── tests/
    ├── unit/
    │   ├── prompt.test.ts                # Task 6
    │   ├── history.test.ts               # Task 7
    │   ├── presets.test.ts               # Task 4
    │   ├── colors.test.ts                # Task 5
    │   └── thumbnail.test.ts             # Task 8
    ├── api/
    │   ├── generate.test.ts              # Task 13
    │   └── quota.test.ts                 # Task 12
    └── e2e/
        ├── happy-path.spec.ts            # Task 24
        ├── quota.spec.ts                 # Task 25
        ├── i18n.spec.ts                  # Task 25
        └── history-lru.spec.ts           # Task 25
```

---

## Phase 1 — Project foundation

### Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.js`, `.env.example`
- Modify: `.gitignore` (already exists, ensure `.next`, `node_modules` ignored)

- [ ] **Step 1: Run `create-next-app` non-interactively**

```bash
cd "/Users/patcharapolsohheng/Desktop/AI-Create picture"
# Use the "." current dir, no app name
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --no-git --use-npm --turbopack --yes
```

Expected: Creates `app/`, `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.js`, `tailwind.config.ts` (or similar), `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `public/`. Existing `.gitignore` is overwritten — re-add our entries.

- [ ] **Step 2: Re-merge .gitignore so our brainstorm artifacts stay ignored**

Replace contents of `.gitignore` with:

```
# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*

# testing
/coverage
/playwright-report
/test-results
/blob-report

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# env files (do not commit secrets)
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# project artifacts
.superpowers/
```

- [ ] **Step 3: Install runtime dependencies**

```bash
cd "/Users/patcharapolsohheng/Desktop/AI-Create picture"
npm install @tanstack/react-query @tanstack/query-sync-storage-persister @tanstack/react-query-persist-client zod next-intl @upstash/ratelimit @upstash/redis @google/genai ulid clsx
```

Expected: All install with no peer-dependency errors.

- [ ] **Step 4: Install dev dependencies**

```bash
npm install -D vitest @vitest/ui happy-dom @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitejs/plugin-react @playwright/test msw
```

- [ ] **Step 5: Create `.env.example` describing required secrets**

Create `.env.example`:

```bash
# Google AI Studio key with access to Gemini 2.5 Flash Image
GEMINI_API_KEY=

# Upstash Redis REST credentials (free tier)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

- [ ] **Step 6: Replace default `app/page.tsx` and `app/layout.tsx` with placeholders that compile**

We will move real UI under `app/[locale]/...` in Task 16. For now, leave the scaffold's defaults so `npm run build` still works at this stage.

- [ ] **Step 7: Verify build**

```bash
npm run build
```

Expected: Build succeeds with no errors. (Default Next.js homepage renders.)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 15 app with TS, Tailwind v4, deps"
```

---

### Task 2: Configure design tokens (cream / coral / serif)

**Files:**
- Modify: `tailwind.config.ts` (or `app/globals.css` if Tailwind v4 uses CSS-only config)
- Modify: `app/globals.css`

> **Note:** Next.js 15 + Tailwind v4 uses a CSS-first config with `@theme` blocks in `globals.css`. If your scaffold produced a `tailwind.config.ts`, the steps below adapt — both routes are shown.

- [ ] **Step 1: Replace `app/globals.css` with theme tokens**

Replace contents of `app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-cream: #FAF9F5;
  --color-paper: #F0EDE3;
  --color-ink: #3D3929;
  --color-faded: #999188;
  --color-coral: #CC785C;
  --color-coral-dk: #A65A41;

  --font-display: "Source Serif 4", "Source Serif Pro", Tiempos, Georgia, serif;
  --font-body: Inter, ui-sans-serif, system-ui, sans-serif;
}

html, body {
  background: var(--color-cream);
  color: var(--color-ink);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

.font-display { font-family: var(--font-display); }

::selection { background: rgba(204,120,92,0.25); }
```

- [ ] **Step 2: Add Inter and Source Serif 4 via next/font**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const serif = Source_Serif_4({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Hairstyle Studio",
  description: "Try a new hairstyle on your photo — free, private, AI-powered.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

(This root layout is temporary — Task 16 moves it under `[locale]`.)

- [ ] **Step 3: Verify build still passes**

```bash
npm run build
```

Expected: PASS, no Tailwind / theme errors.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: add cream/coral/serif design tokens"
```

---

### Task 3: Configure Vitest with happy-dom

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Modify: `package.json` (add scripts)
- Create: `tests/unit/smoke.test.ts`

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/unit/**/*.test.ts", "tests/api/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 2: Create `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Add scripts to `package.json`**

In the `"scripts"` block, add:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test",
"typecheck": "tsc --noEmit"
```

- [ ] **Step 4: Write a smoke test**

Create `tests/unit/smoke.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("smoke", () => {
  it("vitest is wired up", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run it**

```bash
npm test
```

Expected: 1 test passes.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts vitest.setup.ts package.json package-lock.json tests/unit/smoke.test.ts
git commit -m "chore: configure vitest with happy-dom"
```

---

## Phase 2 — Core domain libraries (TDD)

### Task 4: Preset library (gender → list)

**Files:**
- Create: `lib/presets.ts`
- Create: `tests/unit/presets.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/unit/presets.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { PRESETS, getPreset, getPresetsByGender } from "@/lib/presets";

describe("presets", () => {
  it("exposes 10 female presets and 10 male presets", () => {
    expect(getPresetsByGender("female")).toHaveLength(10);
    expect(getPresetsByGender("male")).toHaveLength(10);
  });

  it("each preset has bilingual label and prompt fragment", () => {
    for (const p of PRESETS) {
      expect(p.id).toMatch(/^[a-z0-9-]+$/);
      expect(p.label.en).toBeTruthy();
      expect(p.label.th).toBeTruthy();
      expect(p.promptFragment.en).toBeTruthy();
      expect(p.promptFragment.th).toBeTruthy();
    }
  });

  it("getPreset returns the right entry by id", () => {
    const p = getPreset("female-bob");
    expect(p?.label.en).toBe("Bob");
  });

  it("getPreset returns undefined for unknown id", () => {
    expect(getPreset("nope")).toBeUndefined();
  });

  it("preset ids are unique", () => {
    const ids = PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- presets
```

Expected: FAIL — `Cannot find module '@/lib/presets'`.

- [ ] **Step 3: Implement `lib/presets.ts`**

```ts
export type Gender = "female" | "male";
export type LocaleString = { en: string; th: string };

export type Preset = {
  id: string;
  gender: Gender;
  label: LocaleString;
  promptFragment: LocaleString;
};

export const PRESETS: Preset[] = [
  // Female
  { id: "female-bob", gender: "female", label: { en: "Bob", th: "บ๊อบ" },
    promptFragment: { en: "a chin-length classic bob with clean blunt ends", th: "ทรงบ๊อบยาวระดับคาง ปลายตัดตรง" } },
  { id: "female-long-wavy", gender: "female", label: { en: "Long Wavy", th: "ยาวลอน" },
    promptFragment: { en: "long loose wavy hair past the shoulders", th: "ผมยาวเป็นลอนสบายๆ ยาวเลยไหล่" } },
  { id: "female-pixie", gender: "female", label: { en: "Pixie", th: "พิกซี่" },
    promptFragment: { en: "a short cropped pixie cut with textured top", th: "ทรงพิกซี่สั้น ด้านบนซอยเป็นเลเยอร์" } },
  { id: "female-curly-long", gender: "female", label: { en: "Curly Long", th: "หยิกยาว" },
    promptFragment: { en: "long voluminous tight curls", th: "ผมหยิกแน่นยาว มีวอลลุ่ม" } },
  { id: "female-korean-layered", gender: "female", label: { en: "Korean Layered", th: "เกาหลีเลเยอร์" },
    promptFragment: { en: "Korean-style layered haircut with face-framing curtain bangs", th: "ทรงเลเยอร์สไตล์เกาหลี มีหน้าม้าซีทรู" } },
  { id: "female-beach-waves", gender: "female", label: { en: "Beach Waves", th: "บีชเวฟ" },
    promptFragment: { en: "shoulder-length tousled beach waves", th: "ผมยาวประบ่า ลอนนุ่มแบบบีชเวฟ" } },
  { id: "female-high-ponytail", gender: "female", label: { en: "High Ponytail", th: "หางม้าสูง" },
    promptFragment: { en: "a sleek high ponytail with smooth crown", th: "หางม้ามัดสูง ผมด้านบนเรียบ" } },
  { id: "female-blunt-shoulder", gender: "female", label: { en: "Blunt Shoulder", th: "ตรงประบ่า" },
    promptFragment: { en: "shoulder-length straight hair with blunt ends", th: "ผมตรงยาวประบ่า ปลายตัดตรง" } },
  { id: "female-side-swept", gender: "female", label: { en: "Side-swept", th: "ปาดข้าง" },
    promptFragment: { en: "long hair with a deep side part swept across the forehead", th: "ผมยาวแสกข้างลึก ปาดเฉียงผ่านหน้าผาก" } },
  { id: "female-asymmetric", gender: "female", label: { en: "Asymmetric Cut", th: "ตัดอสมมาตร" },
    promptFragment: { en: "an asymmetric bob, longer on one side", th: "ทรงบ๊อบไม่เท่ากัน ด้านหนึ่งยาวกว่า" } },
  // Male
  { id: "male-two-block", gender: "male", label: { en: "Two-block", th: "ทูบล็อก" },
    promptFragment: { en: "Korean two-block haircut, longer on top with shaved sides", th: "ทรงทูบล็อกสไตล์เกาหลี ด้านบนยาว ด้านข้างไถสั้น" } },
  { id: "male-buzz", gender: "male", label: { en: "Buzz Cut", th: "เกรียน" },
    promptFragment: { en: "an even buzz cut, very short all around", th: "ทรงเกรียนทั้งหัว ความยาวเท่ากัน" } },
  { id: "male-undercut-fade", gender: "male", label: { en: "Undercut Fade", th: "อันเดอร์คัทเฟด" },
    promptFragment: { en: "an undercut with a skin fade and longer textured top", th: "ทรงอันเดอร์คัท ด้านข้างเฟดสั้นมาก ด้านบนซอย" } },
  { id: "male-comb-over", gender: "male", label: { en: "Comb-over", th: "หวีข้าง" },
    promptFragment: { en: "a side-parted comb-over with neat tapered sides", th: "ทรงหวีแสกข้างเรียบ ข้างเทเปอร์" } },
  { id: "male-pompadour", gender: "male", label: { en: "Pompadour", th: "ปอมปาดัวร์" },
    promptFragment: { en: "a pompadour with volume swept up and back", th: "ทรงปอมปาดัวร์ ด้านบนเป่าฟูปัดไปด้านหลัง" } },
  { id: "male-shoulder-length", gender: "male", label: { en: "Shoulder-length", th: "ยาวประบ่า" },
    promptFragment: { en: "shoulder-length hair with a soft middle part", th: "ผมยาวประบ่า แสกกลางนุ่มๆ" } },
  { id: "male-slicked-back", gender: "male", label: { en: "Slicked-back", th: "หวีเรียบไปข้างหลัง" },
    promptFragment: { en: "slicked-back glossy hair", th: "ทรงหวีเรียบไปด้านหลัง ดูเงา" } },
  { id: "male-crew-cut", gender: "male", label: { en: "Crew Cut", th: "ครูว์คัท" },
    promptFragment: { en: "a classic short crew cut", th: "ทรงครูว์คัทคลาสสิก" } },
  { id: "male-curly-top", gender: "male", label: { en: "Curly Top", th: "ด้านบนหยิก" },
    promptFragment: { en: "short tapered sides with curly volume on top", th: "ด้านข้างเทเปอร์สั้น ด้านบนหยิกฟู" } },
  { id: "male-modern-mullet", gender: "male", label: { en: "Modern Mullet", th: "มัลเล็ตสมัยใหม่" },
    promptFragment: { en: "a modern mullet — short on top, longer at the back", th: "ทรงมัลเล็ตสมัยใหม่ ด้านบนสั้น ด้านหลังยาว" } },
];

export function getPresetsByGender(gender: Gender): Preset[] {
  return PRESETS.filter((p) => p.gender === gender);
}

export function getPreset(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- presets
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/presets.ts tests/unit/presets.test.ts
git commit -m "feat(presets): add bilingual hairstyle preset library (10 per gender)"
```

---

### Task 5: Color library

**Files:**
- Create: `lib/colors.ts`
- Create: `tests/unit/colors.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/unit/colors.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { COLORS, getColor } from "@/lib/colors";

describe("colors", () => {
  it("provides 7 color options", () => {
    expect(COLORS).toHaveLength(7);
  });

  it("each color has hex swatch + bilingual label + prompt fragment", () => {
    for (const c of COLORS) {
      expect(c.id).toMatch(/^[a-z-]+$/);
      expect(c.swatch).toMatch(/^#[0-9a-f]{6}$/i);
      expect(c.label.en).toBeTruthy();
      expect(c.label.th).toBeTruthy();
      expect(c.promptFragment.en).toBeTruthy();
      expect(c.promptFragment.th).toBeTruthy();
    }
  });

  it("getColor returns entry by id", () => {
    expect(getColor("black")?.label.en).toBe("Black");
    expect(getColor("nope")).toBeUndefined();
  });

  it("color ids are unique", () => {
    const ids = COLORS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- colors
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/colors.ts`**

```ts
import type { LocaleString } from "./presets";

export type ColorOption = {
  id: string;
  swatch: string;
  label: LocaleString;
  promptFragment: LocaleString;
};

export const COLORS: ColorOption[] = [
  { id: "black", swatch: "#1A1A1A", label: { en: "Black", th: "ดำ" },
    promptFragment: { en: "color it natural black", th: "ทำสีผมเป็นสีดำธรรมชาติ" } },
  { id: "dark-brown", swatch: "#3E2A1F", label: { en: "Dark Brown", th: "น้ำตาลเข้ม" },
    promptFragment: { en: "color it dark chocolate brown", th: "ทำสีผมเป็นสีน้ำตาลช็อกโกแลตเข้ม" } },
  { id: "brown", swatch: "#7A4A2B", label: { en: "Brown", th: "น้ำตาล" },
    promptFragment: { en: "color it medium warm brown", th: "ทำสีผมเป็นสีน้ำตาลโทนอุ่น" } },
  { id: "blonde", swatch: "#D4AF6E", label: { en: "Blonde", th: "บลอนด์" },
    promptFragment: { en: "color it warm honey blonde", th: "ทำสีผมเป็นสีบลอนด์โทนน้ำผึ้ง" } },
  { id: "ginger", swatch: "#B5562B", label: { en: "Ginger", th: "ส้มอบเชย" },
    promptFragment: { en: "color it natural ginger / copper red", th: "ทำสีผมเป็นสีส้มทองแดงธรรมชาติ" } },
  { id: "burgundy", swatch: "#7A2A35", label: { en: "Burgundy", th: "ไวน์แดง" },
    promptFragment: { en: "color it deep burgundy red", th: "ทำสีผมเป็นสีไวน์แดงเข้ม" } },
  { id: "pastel", swatch: "#C9A0C7", label: { en: "Pastel", th: "พาสเทล" },
    promptFragment: { en: "color it soft pastel lavender-pink", th: "ทำสีผมเป็นสีพาสเทลม่วง-ชมพูนุ่มๆ" } },
];

export function getColor(id: string): ColorOption | undefined {
  return COLORS.find((c) => c.id === id);
}
```

- [ ] **Step 4: Run to verify pass**

```bash
npm test -- colors
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/colors.ts tests/unit/colors.test.ts
git commit -m "feat(colors): add 7-color palette with bilingual labels"
```

---

### Task 6: Prompt builder

**Files:**
- Create: `lib/prompt.ts`
- Create: `tests/unit/prompt.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/unit/prompt.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildPrompt } from "@/lib/prompt";
import { getPreset } from "@/lib/presets";
import { getColor } from "@/lib/colors";

describe("buildPrompt", () => {
  const preset = getPreset("female-bob")!;
  const color = getColor("blonde")!;

  it("builds an English prompt with style and color fragments", () => {
    const prompt = buildPrompt({ preset, color, locale: "en" });
    expect(prompt).toContain("Change only the hairstyle and hair color");
    expect(prompt).toContain("classic bob");
    expect(prompt).toContain("honey blonde");
  });

  it("builds a Thai prompt", () => {
    const prompt = buildPrompt({ preset, color, locale: "th" });
    expect(prompt).toContain("เปลี่ยนเฉพาะทรงผมและสีผม");
    expect(prompt).toContain("บ๊อบ");
    expect(prompt).toContain("น้ำผึ้ง");
  });

  it("appends custom text when provided", () => {
    const prompt = buildPrompt({ preset, color, customText: "with side bangs", locale: "en" });
    expect(prompt.endsWith("with side bangs")).toBe(true);
  });

  it("does not include custom text marker when omitted", () => {
    const prompt = buildPrompt({ preset, color, locale: "en" });
    expect(prompt).not.toContain("undefined");
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- prompt
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/prompt.ts`**

```ts
import type { Preset } from "./presets";
import type { ColorOption } from "./colors";

export type Locale = "th" | "en";

export type BuildPromptArgs = {
  preset: Preset;
  color: ColorOption;
  customText?: string;
  locale: Locale;
};

export function buildPrompt({ preset, color, customText, locale }: BuildPromptArgs): string {
  const base =
    locale === "th"
      ? "เปลี่ยนเฉพาะทรงผมและสีผมของบุคคลในรูปนี้ เก็บใบหน้า สีผิว แสง และพื้นหลังให้เหมือนเดิมทุกประการ"
      : "Change only the hairstyle and hair color of the person in this image. Preserve the face, skin tone, lighting, and background exactly.";

  const styleFragment = preset.promptFragment[locale];
  const colorFragment = color.promptFragment[locale];

  let prompt = `${base}. ${styleFragment}. ${colorFragment}.`;
  if (customText && customText.trim().length > 0) {
    prompt += ` ${customText.trim()}`;
  }
  return prompt;
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- prompt
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/prompt.ts tests/unit/prompt.test.ts
git commit -m "feat(prompt): localized prompt builder"
```

---

### Task 7: localStorage history with LRU eviction

**Files:**
- Create: `lib/history.ts`
- Create: `tests/unit/history.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/unit/history.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { addEntry, readHistory, clearHistory, sizeOf, type HistoryEntry, MAX_BYTES } from "@/lib/history";

const baseEntry = (id: string, sizeKB = 1): HistoryEntry => ({
  id,
  createdAt: Date.now(),
  thumbnailBase64: "data:image/webp;base64," + "A".repeat(sizeKB * 1024),
  presetId: "female-bob",
  colorId: "blonde",
});

describe("history", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts empty", () => {
    expect(readHistory()).toEqual([]);
  });

  it("addEntry prepends new entry", () => {
    addEntry(baseEntry("a"));
    addEntry(baseEntry("b"));
    const list = readHistory();
    expect(list.map((e) => e.id)).toEqual(["b", "a"]);
  });

  it("evicts oldest when total size exceeds MAX_BYTES", () => {
    // each entry is ~5MB to force eviction
    const big = (id: string): HistoryEntry => ({
      ...baseEntry(id),
      thumbnailBase64: "data:image/webp;base64," + "B".repeat(2 * 1024 * 1024),
    });
    addEntry(big("a"));
    addEntry(big("b"));
    addEntry(big("c"));
    const list = readHistory();
    expect(sizeOf(list)).toBeLessThanOrEqual(MAX_BYTES);
    expect(list[0].id).toBe("c");
    expect(list.find((e) => e.id === "a")).toBeUndefined();
  });

  it("keeps at least one entry even if it alone exceeds the budget", () => {
    const huge: HistoryEntry = {
      ...baseEntry("solo"),
      thumbnailBase64: "data:image/webp;base64," + "X".repeat(5 * 1024 * 1024),
    };
    addEntry(huge);
    expect(readHistory()).toHaveLength(1);
  });

  it("clearHistory removes everything", () => {
    addEntry(baseEntry("a"));
    clearHistory();
    expect(readHistory()).toEqual([]);
  });

  it("survives malformed localStorage value", () => {
    localStorage.setItem("hairstyle-history-v1", "{not json}");
    expect(readHistory()).toEqual([]);
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- history
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/history.ts`**

```ts
const KEY = "hairstyle-history-v1";
export const MAX_BYTES = 4 * 1024 * 1024;

export type HistoryEntry = {
  id: string;
  createdAt: number;
  thumbnailBase64: string;
  presetId: string;
  colorId: string;
};

export function readHistory(): HistoryEntry[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeHistory(list: HistoryEntry[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function sizeOf(list: HistoryEntry[]): number {
  // utf-16 conservative estimate: 2 bytes per char
  return JSON.stringify(list).length * 2;
}

export function addEntry(entry: HistoryEntry, list: HistoryEntry[] = readHistory()): HistoryEntry[] {
  const next = [entry, ...list];
  while (sizeOf(next) > MAX_BYTES && next.length > 1) {
    next.pop();
  }
  writeHistory(next);
  return next;
}

export function clearHistory(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(KEY);
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- history
```

Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/history.ts tests/unit/history.test.ts
git commit -m "feat(history): localStorage with LRU eviction at 4MB"
```

---

### Task 8: Thumbnail generation utility

**Files:**
- Create: `lib/thumbnail.ts`
- Create: `tests/unit/thumbnail.test.ts`

We split logic into two pieces:
- `computeFitBox(originalW, originalH, maxSide)` — pure math, fully unit-tested
- `makeThumbnail(dataUrl, maxSide, quality)` — uses canvas, smoke-tested with happy-dom shim

- [ ] **Step 1: Write failing test**

Create `tests/unit/thumbnail.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeFitBox } from "@/lib/thumbnail";

describe("computeFitBox", () => {
  it("returns original size when smaller than maxSide", () => {
    expect(computeFitBox(120, 80, 256)).toEqual({ width: 120, height: 80 });
  });

  it("scales by the longer side (landscape)", () => {
    expect(computeFitBox(1024, 512, 256)).toEqual({ width: 256, height: 128 });
  });

  it("scales by the longer side (portrait)", () => {
    expect(computeFitBox(800, 1600, 256)).toEqual({ width: 128, height: 256 });
  });

  it("handles square images", () => {
    expect(computeFitBox(2000, 2000, 256)).toEqual({ width: 256, height: 256 });
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- thumbnail
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/thumbnail.ts`**

```ts
export function computeFitBox(
  originalWidth: number,
  originalHeight: number,
  maxSide: number,
): { width: number; height: number } {
  const longer = Math.max(originalWidth, originalHeight);
  if (longer <= maxSide) return { width: originalWidth, height: originalHeight };
  const scale = maxSide / longer;
  return {
    width: Math.round(originalWidth * scale),
    height: Math.round(originalHeight * scale),
  };
}

/**
 * Browser-only: downsizes a data URL via canvas and returns a webp data URL.
 * Falls back to the original input if canvas operations are unavailable.
 */
export async function makeThumbnail(
  dataUrl: string,
  maxSide = 256,
  quality = 0.85,
): Promise<string> {
  if (typeof document === "undefined") return dataUrl;
  const img = await loadImage(dataUrl);
  const { width, height } = computeFitBox(img.naturalWidth, img.naturalHeight, maxSide);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/webp", quality);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- thumbnail
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/thumbnail.ts tests/unit/thumbnail.test.ts
git commit -m "feat(thumbnail): canvas-based downsize with fit-box math"
```

---

## Phase 3 — i18n setup

### Task 9: next-intl wiring (locale routing + messages)

**Files:**
- Create: `lib/i18n/routing.ts`, `lib/i18n/messages/en.json`, `lib/i18n/messages/th.json`
- Create: `i18n.ts` (next-intl request config)
- Create: `middleware.ts`
- Modify: `next.config.ts`

- [ ] **Step 1: Create `lib/i18n/routing.ts`**

```ts
import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "th"],
  defaultLocale: "en",
  localePrefix: "always",
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
```

- [ ] **Step 2: Create `lib/i18n/messages/en.json`**

```json
{
  "app": {
    "title": "Hairstyle Studio",
    "tagline": "Try a new hairstyle, free."
  },
  "wizard": {
    "step": "Step {current} of {total}",
    "step1": {
      "headline": "Bring your face.",
      "sub": "Upload a clear photo — front-facing works best. We don't store anything.",
      "uploadCta": "Tap to upload",
      "uploadHint": "or drop a photo here",
      "fileNote": "JPG, PNG · max 10MB",
      "continue": "Continue"
    },
    "step2": {
      "headline": "Choose your look.",
      "back": "Back",
      "generate": "Generate",
      "gender": { "female": "Female", "male": "Male" },
      "labels": { "style": "Style", "color": "Color", "custom": "Custom (optional)" },
      "customPlaceholder": "e.g. with side bangs"
    },
    "step3": {
      "headline": "Here you are.",
      "compareHint": "Drag the handle to compare",
      "save": "Save",
      "share": "Share",
      "tryAgain": "Try again",
      "startOver": "Start over"
    }
  },
  "quota": {
    "remaining": "{remaining} / {total} left",
    "exhausted": "Daily limit reached. Come back tomorrow.",
    "resetsIn": "Resets in {hours}h {minutes}m"
  },
  "errors": {
    "imageTooLarge": "Image must be under 10MB",
    "fileType": "JPG or PNG only",
    "noFace": "No face detected — try another photo",
    "aiFailure": "Generation failed. Please try again.",
    "network": "Network error. Please retry.",
    "rateLimited": "You've reached today's limit."
  },
  "history": {
    "title": "Recent looks",
    "empty": "Your past tries will appear here",
    "open": "Recent"
  }
}
```

- [ ] **Step 3: Create `lib/i18n/messages/th.json`**

```json
{
  "app": {
    "title": "Hairstyle Studio",
    "tagline": "ลองทรงผมใหม่ ฟรี"
  },
  "wizard": {
    "step": "ขั้นที่ {current} จาก {total}",
    "step1": {
      "headline": "ส่งหน้ามาก่อน",
      "sub": "อัพโหลดรูปชัด ๆ หันหน้าตรงจะดีที่สุด เราไม่เก็บรูปไว้ที่ไหนเลย",
      "uploadCta": "แตะเพื่ออัพโหลด",
      "uploadHint": "หรือลากรูปมาวางตรงนี้",
      "fileNote": "JPG, PNG · ไม่เกิน 10MB",
      "continue": "ถัดไป"
    },
    "step2": {
      "headline": "เลือกลุคที่อยาก",
      "back": "ย้อนกลับ",
      "generate": "สร้างเลย",
      "gender": { "female": "หญิง", "male": "ชาย" },
      "labels": { "style": "ทรงผม", "color": "สี", "custom": "ปรับเอง (ไม่จำเป็น)" },
      "customPlaceholder": "เช่น มีหน้าม้าซีทรู"
    },
    "step3": {
      "headline": "นี่คือคุณ",
      "compareHint": "ลากตัวจับเพื่อเปรียบเทียบ",
      "save": "บันทึก",
      "share": "แชร์",
      "tryAgain": "ลองใหม่",
      "startOver": "เริ่มใหม่"
    }
  },
  "quota": {
    "remaining": "เหลือ {remaining} / {total} ครั้ง",
    "exhausted": "วันนี้เต็มแล้ว กลับมาพรุ่งนี้นะ",
    "resetsIn": "รีเซ็ตใน {hours} ชม. {minutes} นาที"
  },
  "errors": {
    "imageTooLarge": "รูปต้องไม่เกิน 10MB",
    "fileType": "JPG หรือ PNG เท่านั้น",
    "noFace": "ไม่เจอใบหน้าในรูป ลองรูปอื่นนะ",
    "aiFailure": "สร้างไม่สำเร็จ ลองใหม่อีกครั้ง",
    "network": "เน็ตมีปัญหา ลองใหม่",
    "rateLimited": "วันนี้ใช้ครบโควต้าแล้ว"
  },
  "history": {
    "title": "ลุคที่เคยลอง",
    "empty": "ลุคที่คุณเคยลองจะมาอยู่ตรงนี้",
    "open": "ดูล่าสุด"
  }
}
```

- [ ] **Step 4: Create `i18n.ts` at project root**

```ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./lib/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = (routing.locales as readonly string[]).includes(requested ?? "")
    ? (requested as "en" | "th")
    : routing.defaultLocale;
  return {
    locale,
    messages: (await import(`./lib/i18n/messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 5: Create `middleware.ts` at project root**

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all paths except: api, _next, static files
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
```

- [ ] **Step 6: Update `next.config.ts` to register the next-intl plugin**

Replace contents of `next.config.ts`:

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 7: Move `app/layout.tsx` and `app/page.tsx` under `app/[locale]/`**

```bash
mkdir -p "app/[locale]"
git mv app/layout.tsx "app/[locale]/layout.tsx"
git mv app/page.tsx "app/[locale]/page.tsx"
```

- [ ] **Step 8: Update `app/[locale]/layout.tsx` to use NextIntlClientProvider**

Replace contents of `app/[locale]/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/lib/i18n/routing";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const serif = Source_Serif_4({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Hairstyle Studio",
  description: "Try a new hairstyle on your photo — free, private, AI-powered.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "en" | "th")) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <html lang={locale} className={`${inter.variable} ${serif.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 9: Replace `app/[locale]/page.tsx` with a temporary i18n smoke page**

```tsx
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("app");
  return (
    <main className="p-8">
      <h1 className="font-display italic text-3xl">{t("title")}</h1>
      <p className="text-faded">{t("tagline")}</p>
    </main>
  );
}
```

- [ ] **Step 10: Verify build + manual smoke test**

```bash
npm run build
```

Expected: PASS. Then `npm run dev` and confirm `/en` and `/th` render their respective tagline; `/` redirects to one of them based on `Accept-Language`.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat(i18n): wire next-intl with [locale] routes (en, th)"
```

---

## Phase 4 — Server-side AI plumbing

### Task 10: Upstash rate limiter + IP extraction helper

**Files:**
- Create: `lib/ratelimit.ts`, `lib/ipFromRequest.ts`

- [ ] **Step 1: Create `lib/ipFromRequest.ts`**

```ts
export function ipFromRequest(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "anonymous";
}
```

- [ ] **Step 2: Create `lib/ratelimit.ts`**

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const DAILY_LIMIT = 5;

let ratelimit: Ratelimit;

if (url && token) {
  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.fixedWindow(DAILY_LIMIT, "24 h"),
    analytics: false,
    prefix: "hairstyle",
  });
} else {
  // Test/dev fallback: in-memory limiter so tests can run without Upstash creds.
  const counts = new Map<string, { count: number; resetAt: number }>();
  ratelimit = {
    limit: async (key: string) => {
      const now = Date.now();
      const entry = counts.get(key);
      if (!entry || entry.resetAt < now) {
        counts.set(key, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
        return { success: true, remaining: DAILY_LIMIT - 1, reset: now + 24 * 60 * 60 * 1000, limit: DAILY_LIMIT, pending: Promise.resolve() };
      }
      if (entry.count >= DAILY_LIMIT) {
        return { success: false, remaining: 0, reset: entry.resetAt, limit: DAILY_LIMIT, pending: Promise.resolve() };
      }
      entry.count += 1;
      return { success: true, remaining: DAILY_LIMIT - entry.count, reset: entry.resetAt, limit: DAILY_LIMIT, pending: Promise.resolve() };
    },
  } as unknown as Ratelimit;
}

export { ratelimit };
```

- [ ] **Step 3: Verify import compiles**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/ratelimit.ts lib/ipFromRequest.ts
git commit -m "feat(ratelimit): per-IP fixed-window via Upstash with in-memory fallback"
```

---

### Task 11: Gemini client wrapper

**Files:**
- Create: `lib/gemini.ts`

- [ ] **Step 1: Implement `lib/gemini.ts`**

```ts
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export class NoFaceDetectedError extends Error {
  code = "no_face_detected" as const;
}

export class GeminiFailureError extends Error {
  code = "ai_failure" as const;
}

const MODEL_ID = "gemini-2.5-flash-image";

export type GenerateArgs = {
  /** data URL: data:image/jpeg;base64,... */
  image: string;
  prompt: string;
};

export async function generateHairstyle({ image, prompt }: GenerateArgs): Promise<string> {
  if (!apiKey) throw new GeminiFailureError("GEMINI_API_KEY not set");

  const { mimeType, data } = parseDataUrl(image);
  const ai = new GoogleGenAI({ apiKey });

  let response;
  try {
    response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: [
        { inlineData: { mimeType, data } },
        { text: prompt },
      ],
    });
  } catch (err) {
    throw new GeminiFailureError((err as Error).message);
  }

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inline = (part as { inlineData?: { data?: string; mimeType?: string } }).inlineData;
    if (inline?.data) {
      return `data:${inline.mimeType ?? "image/png"};base64,${inline.data}`;
    }
  }
  // Heuristic: if text returned mentions face, treat as no-face
  const text = parts.map((p) => (p as { text?: string }).text ?? "").join(" ").toLowerCase();
  if (text.includes("no face") || text.includes("face not")) {
    throw new NoFaceDetectedError(text);
  }
  throw new GeminiFailureError("no image part in response");
}

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } {
  const m = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!m) throw new GeminiFailureError("invalid data URL");
  return { mimeType: m[1]!, data: m[2]! };
}
```

- [ ] **Step 2: Verify typecheck**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/gemini.ts
git commit -m "feat(gemini): wrapper for 2.5 Flash Image with typed errors"
```

---

### Task 12: `/api/quota` route (TDD)

**Files:**
- Create: `app/api/quota/route.ts`
- Create: `tests/api/quota.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/api/quota.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { GET } from "@/app/api/quota/route";

function reqWithIp(ip: string): Request {
  return new Request("http://localhost/api/quota", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("GET /api/quota", () => {
  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("returns full quota for a fresh IP", async () => {
    const res = await GET(reqWithIp("9.9.9.9"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.remaining).toBe(5);
    expect(typeof body.resetAt).toBe("number");
  });
});
```

- [ ] **Step 2: Run test**

```bash
npm test -- quota
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `app/api/quota/route.ts`**

```ts
import { NextResponse } from "next/server";
import { ratelimit, DAILY_LIMIT } from "@/lib/ratelimit";
import { ipFromRequest } from "@/lib/ipFromRequest";

export async function GET(req: Request) {
  const ip = ipFromRequest(req);
  // Probe limiter without consuming: use a separate read (Upstash returns remaining via .limit, but consumes).
  // Strategy: report DAILY_LIMIT initially; the real "remaining" is propagated by /api/generate responses.
  // For first paint we approximate from a peek using a no-op key suffix.
  const peek = await ratelimit.limit(`peek:${ip}`);
  // Roll back the peek: we used a separate key so it doesn't affect the real counter.
  return NextResponse.json({
    remaining: peek.remaining + 1, // +1 because the peek itself consumed 1 of its own counter
    resetAt: peek.reset,
    limit: DAILY_LIMIT,
  });
}
```

> **Note for executor:** the "peek" pattern uses a separate key namespace so quota probing doesn't count against real usage. The real `remaining` is always returned in `/api/generate` responses and that value is what TanStack Query caches authoritatively.

- [ ] **Step 4: Run test**

```bash
npm test -- quota
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/quota/route.ts tests/api/quota.test.ts
git commit -m "feat(api): GET /api/quota returns remaining + resetAt"
```

---

### Task 13: `/api/generate` route (TDD)

**Files:**
- Create: `app/api/generate/route.ts`
- Create: `tests/api/generate.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/api/generate.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/gemini", () => ({
  generateHairstyle: vi.fn(async () => "data:image/png;base64,RESULT"),
  NoFaceDetectedError: class extends Error { code = "no_face_detected" as const; },
  GeminiFailureError: class extends Error { code = "ai_failure" as const; },
}));

import { POST } from "@/app/api/generate/route";

function buildReq(body: unknown, ip = "1.2.3.4") {
  return new Request("http://localhost/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

const validBody = {
  image: "data:image/jpeg;base64,/9j/AAA",
  presetId: "female-bob",
  colorId: "blonde",
  locale: "en" as const,
};

describe("POST /api/generate", () => {
  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("returns generated image and remaining quota on happy path", async () => {
    const res = await POST(buildReq(validBody, "10.0.0.1"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.generatedImage).toBe("data:image/png;base64,RESULT");
    expect(body.remaining).toBe(4);
  });

  it("rejects invalid body with 400", async () => {
    const res = await POST(buildReq({ image: "not-a-dataurl" }, "10.0.0.2"));
    expect(res.status).toBe(400);
  });

  it("rejects unknown presetId with 400", async () => {
    const res = await POST(buildReq({ ...validBody, presetId: "nope" }, "10.0.0.3"));
    expect(res.status).toBe(400);
  });

  it("rejects oversize image with 400 image_too_large", async () => {
    const huge = "data:image/jpeg;base64," + "A".repeat(15 * 1024 * 1024);
    const res = await POST(buildReq({ ...validBody, image: huge }, "10.0.0.4"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("image_too_large");
  });

  it("returns 429 after 5 requests from the same IP", async () => {
    const ip = "10.0.0.5";
    for (let i = 0; i < 5; i++) {
      const ok = await POST(buildReq(validBody, ip));
      expect(ok.status).toBe(200);
    }
    const blocked = await POST(buildReq(validBody, ip));
    expect(blocked.status).toBe(429);
    const body = await blocked.json();
    expect(body.error).toBe("rate_limited");
    expect(typeof body.retryAfter).toBe("number");
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- generate
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `app/api/generate/route.ts`**

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { ratelimit } from "@/lib/ratelimit";
import { ipFromRequest } from "@/lib/ipFromRequest";
import { getPreset } from "@/lib/presets";
import { getColor } from "@/lib/colors";
import { buildPrompt } from "@/lib/prompt";
import { generateHairstyle, NoFaceDetectedError } from "@/lib/gemini";

export const runtime = "nodejs";

const RequestSchema = z.object({
  image: z.string().regex(/^data:image\/(jpeg|jpg|png|webp);base64,/),
  presetId: z.string().min(1),
  colorId: z.string().min(1),
  customText: z.string().max(200).optional(),
  locale: z.enum(["en", "th"]),
});

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: Request) {
  const ip = ipFromRequest(req);

  const limited = await ratelimit.limit(ip);
  if (!limited.success) {
    return NextResponse.json(
      {
        error: "rate_limited",
        retryAfter: Math.max(1, Math.ceil((limited.reset - Date.now()) / 1000)),
        remaining: 0,
      },
      { status: 429 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = RequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: "Invalid request" },
      { status: 400 },
    );
  }
  const { image, presetId, colorId, customText, locale } = parsed.data;

  const commaIdx = image.indexOf(",");
  const approxBytes = ((image.length - commaIdx - 1) * 3) / 4;
  if (approxBytes > MAX_BYTES) {
    return NextResponse.json(
      { error: "image_too_large", message: "Image must be under 10MB" },
      { status: 400 },
    );
  }

  const preset = getPreset(presetId);
  const color = getColor(colorId);
  if (!preset || !color) {
    return NextResponse.json(
      { error: "invalid_input", message: "Unknown preset or color" },
      { status: 400 },
    );
  }

  const prompt = buildPrompt({ preset, color, customText, locale });

  try {
    const generatedImage = await generateHairstyle({ image, prompt });
    return NextResponse.json({ generatedImage, remaining: limited.remaining });
  } catch (err) {
    if (err instanceof NoFaceDetectedError) {
      return NextResponse.json(
        { error: "no_face_detected", message: "No face detected" },
        { status: 422 },
      );
    }
    return NextResponse.json(
      { error: "ai_failure", message: "Generation failed" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- generate
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/api/generate/route.ts tests/api/generate.test.ts
git commit -m "feat(api): POST /api/generate with rate limit, validation, Gemini call"
```

---

## Phase 5 — TanStack Query

### Task 14: Query client + persistence + Providers wrapper

**Files:**
- Create: `lib/queryClient.ts`, `components/Providers.tsx`

- [ ] **Step 1: Create `lib/queryClient.ts`**

```ts
import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 2,
        refetchOnWindowFocus: true,
      },
      mutations: { retry: 0 },
    },
  });
}
```

- [ ] **Step 2: Create `components/Providers.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { makeQueryClient } from "@/lib/queryClient";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => makeQueryClient());
  const [persister, setPersister] = useState<ReturnType<typeof createSyncStoragePersister> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPersister(createSyncStoragePersister({ storage: window.localStorage, key: "hairstyle-rq-v1" }));
  }, []);

  if (!persister) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return (
    <PersistQueryClientProvider client={client} persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 }}>
      {children}
    </PersistQueryClientProvider>
  );
}
```

- [ ] **Step 3: Wire `Providers` into `app/[locale]/layout.tsx`**

In `app/[locale]/layout.tsx`, import `Providers` and wrap the body:

```tsx
import { Providers } from "@/components/Providers";
// ...
<body>
  <Providers>
    <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
  </Providers>
</body>
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/queryClient.ts components/Providers.tsx app/[locale]/layout.tsx
git commit -m "feat(query): TanStack QueryClient with localStorage persistence"
```

---

### Task 15: Query hooks (`useQuotaQuery`, `useGenerateMutation`)

**Files:**
- Create: `lib/queries/useQuotaQuery.ts`, `lib/queries/useGenerateMutation.ts`

- [ ] **Step 1: Create `lib/queries/useQuotaQuery.ts`**

```ts
"use client";

import { useQuery } from "@tanstack/react-query";

export type QuotaResponse = { remaining: number; resetAt: number; limit: number };

export function useQuotaQuery() {
  return useQuery<QuotaResponse>({
    queryKey: ["quota"],
    queryFn: async () => {
      const res = await fetch("/api/quota", { cache: "no-store" });
      if (!res.ok) throw new Error("quota_fetch_failed");
      return res.json();
    },
    staleTime: 30_000,
  });
}
```

- [ ] **Step 2: Create `lib/queries/useGenerateMutation.ts`**

```ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Locale } from "@/lib/prompt";

export type GenerateInput = {
  image: string;
  presetId: string;
  colorId: string;
  customText?: string;
  locale: Locale;
};

export type GenerateSuccess = { generatedImage: string; remaining: number };

export type GenerateError = {
  status: number;
  code: "rate_limited" | "invalid_input" | "image_too_large" | "no_face_detected" | "ai_failure" | "network";
  retryAfter?: number;
};

export function useGenerateMutation() {
  const qc = useQueryClient();
  return useMutation<GenerateSuccess, GenerateError, GenerateInput>({
    mutationFn: async (input) => {
      let res: Response;
      try {
        res = await fetch("/api/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
        });
      } catch {
        throw { status: 0, code: "network" } as GenerateError;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw { status: res.status, code: body.error ?? "ai_failure", retryAfter: body.retryAfter } as GenerateError;
      }
      return res.json();
    },
    onSuccess: (data) => {
      qc.setQueryData(["quota"], (prev: { remaining: number; resetAt: number; limit: number } | undefined) =>
        prev ? { ...prev, remaining: data.remaining } : prev,
      );
    },
  });
}
```

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/queries
git commit -m "feat(queries): useQuotaQuery + useGenerateMutation"
```

---

## Phase 6 — UI components

### Task 16: Shell components (LangToggle, QuotaCounter) + layout integration

**Files:**
- Create: `components/LangToggle.tsx`, `components/QuotaCounter.tsx`
- Modify: `app/[locale]/layout.tsx`

- [ ] **Step 1: Create `components/LangToggle.tsx`**

```tsx
"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/routing";

export function LangToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const next = locale === "en" ? "th" : "en";
  return (
    <button
      onClick={() => router.replace(pathname, { locale: next })}
      className="text-xs uppercase tracking-[0.2em] text-faded hover:text-ink transition"
      aria-label={`Switch to ${next}`}
    >
      {locale === "en" ? "TH" : "EN"}
    </button>
  );
}
```

- [ ] **Step 2: Create `components/QuotaCounter.tsx`**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { useQuotaQuery } from "@/lib/queries/useQuotaQuery";

export function QuotaCounter() {
  const t = useTranslations("quota");
  const { data, isLoading } = useQuotaQuery();
  if (isLoading || !data) return <span className="text-xs text-faded">···</span>;
  return (
    <span className="text-xs text-faded tabular-nums">
      {t("remaining", { remaining: data.remaining, total: data.limit })}
    </span>
  );
}
```

- [ ] **Step 3: Add a top bar to `app/[locale]/layout.tsx`**

Update the JSX inside `LocaleLayout` body:

```tsx
import { LangToggle } from "@/components/LangToggle";
import { QuotaCounter } from "@/components/QuotaCounter";
// ...
<body>
  <Providers>
    <NextIntlClientProvider messages={messages}>
      <header className="flex items-center justify-between px-5 py-3 border-b border-paper">
        <span className="font-display italic text-sm">Hairstyle Studio</span>
        <div className="flex items-center gap-3">
          <QuotaCounter />
          <LangToggle />
        </div>
      </header>
      {children}
    </NextIntlClientProvider>
  </Providers>
</body>
```

- [ ] **Step 4: Verify build + dev smoke**

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/LangToggle.tsx components/QuotaCounter.tsx app/[locale]/layout.tsx
git commit -m "feat(shell): top bar with quota counter and language toggle"
```

---

### Task 17: Wizard host (state machine in `page.tsx`)

**Files:**
- Replace: `app/[locale]/page.tsx`

- [ ] **Step 1: Replace `app/[locale]/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Step1Upload } from "@/components/wizard/Step1Upload";
import { Step2Customize } from "@/components/wizard/Step2Customize";
import { Step3Result } from "@/components/wizard/Step3Result";
import type { Gender } from "@/lib/presets";

export type WizardState = {
  step: 1 | 2 | 3;
  image?: string;
  gender: Gender;
  presetId?: string;
  colorId?: string;
  customText?: string;
  generatedImage?: string;
};

export default function Wizard() {
  const locale = useLocale() as "en" | "th";
  const [state, setState] = useState<WizardState>({ step: 1, gender: "female" });

  const goTo = (step: 1 | 2 | 3) => setState((s) => ({ ...s, step }));
  const reset = () => setState({ step: 1, gender: "female" });

  return (
    <main className="mx-auto max-w-md px-5 py-8">
      <Progress step={state.step} />
      {state.step === 1 && (
        <Step1Upload
          image={state.image}
          onPick={(image) => setState((s) => ({ ...s, image }))}
          onNext={() => goTo(2)}
        />
      )}
      {state.step === 2 && state.image && (
        <Step2Customize
          locale={locale}
          state={state}
          setState={setState}
          onBack={() => goTo(1)}
          onResult={(generatedImage) => setState((s) => ({ ...s, generatedImage, step: 3 }))}
        />
      )}
      {state.step === 3 && state.generatedImage && state.image && (
        <Step3Result
          original={state.image}
          generated={state.generatedImage}
          presetId={state.presetId!}
          colorId={state.colorId!}
          onTryAgain={() => goTo(2)}
          onStartOver={reset}
        />
      )}
    </main>
  );
}

function Progress({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-1.5 mb-6" aria-label={`Step ${step} of 3`}>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={
            "h-[3px] w-8 rounded-full " + (n <= step ? "bg-coral" : "bg-paper")
          }
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

(Will fail until Steps 18, 20, 22 land — that's fine, we ship the host first as a stub-importer and build will fail; commit anyway with a `// @ts-expect-error pending children` directive? Cleaner: implement Steps 18-22 next without committing the host import compile-failure. **Defer Step 3 commit until Task 22 is done — see below.**)

- [ ] **Step 3: Stage but do not commit yet**

```bash
git add app/[locale]/page.tsx
```

(Commit happens at end of Task 22.)

---

### Task 18: Step1 — Upload component

**Files:**
- Create: `components/wizard/Step1Upload.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";

const MAX_BYTES = 10 * 1024 * 1024;

export function Step1Upload({
  image,
  onPick,
  onNext,
}: {
  image?: string;
  onPick: (dataUrl: string) => void;
  onNext: () => void;
}) {
  const t = useTranslations("wizard.step1");
  const tErr = useTranslations("errors");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      alert(tErr("fileType"));
      return;
    }
    if (file.size > MAX_BYTES) {
      alert(tErr("imageTooLarge"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onPick(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <section>
      <p className="text-[10px] uppercase tracking-[0.2em] text-faded mb-2">Step 1 of 3</p>
      <h1 className="font-display italic text-3xl mb-2">{t("headline")}</h1>
      <p className="text-sm text-faded mb-8">{t("sub")}</p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files?.[0] ?? null);
        }}
        className="w-full border-[1.5px] border-dashed border-coral rounded-2xl p-9 text-center"
      >
        {image ? (
          <img src={image} alt="" className="mx-auto max-h-48 rounded-lg" />
        ) : (
          <>
            <div className="text-4xl mb-2">⌒</div>
            <div className="text-coral text-sm font-medium">{t("uploadCta")}</div>
            <div className="text-xs text-faded mt-1">{t("uploadHint")}</div>
          </>
        )}
      </button>
      <p className="text-[10px] italic text-faded text-center mt-4">{t("fileNote")}</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        disabled={!image}
        onClick={onNext}
        className="mt-8 w-full rounded-xl bg-coral text-cream py-3 text-sm disabled:opacity-40"
      >
        {t("continue")} →
      </button>
    </section>
  );
}
```

- [ ] **Step 2: Stage**

```bash
git add components/wizard/Step1Upload.tsx
```

(Commit happens at end of Task 22.)

---

### Task 19: PresetGrid + ColorSwatches components

**Files:**
- Create: `components/PresetGrid.tsx`, `components/ColorSwatches.tsx`

- [ ] **Step 1: Implement `components/PresetGrid.tsx`**

```tsx
"use client";

import { getPresetsByGender, type Gender } from "@/lib/presets";
import { useLocale } from "next-intl";

export function PresetGrid({
  gender,
  selectedId,
  onSelect,
}: {
  gender: Gender;
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const locale = useLocale() as "en" | "th";
  const presets = getPresetsByGender(gender);
  return (
    <div className="grid grid-cols-3 gap-2">
      {presets.map((p) => {
        const active = selectedId === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={
              "aspect-square rounded-lg bg-paper relative overflow-hidden text-left " +
              (active ? "outline outline-2 outline-coral outline-offset-2" : "")
            }
            aria-pressed={active}
          >
            <span className="absolute bottom-1 left-1.5 text-[10px] text-cream drop-shadow">
              {p.label[locale]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

> **Note:** Preset thumbnails are placeholder backgrounds for MVP. Replace with curated 1:1 images in `/public/presets/<id>.webp` later.

- [ ] **Step 2: Implement `components/ColorSwatches.tsx`**

```tsx
"use client";

import { COLORS } from "@/lib/colors";
import { useLocale } from "next-intl";

export function ColorSwatches({
  selectedId,
  onSelect,
}: {
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const locale = useLocale() as "en" | "th";
  return (
    <div className="flex flex-wrap gap-2">
      {COLORS.map((c) => {
        const active = selectedId === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            aria-label={c.label[locale]}
            aria-pressed={active}
            style={{ background: c.swatch }}
            className={
              "h-7 w-7 rounded-full border-2 border-cream " +
              (active ? "ring-2 ring-coral" : "ring-1 ring-paper")
            }
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Stage**

```bash
git add components/PresetGrid.tsx components/ColorSwatches.tsx
```

(Commit at end of Task 22.)

---

### Task 20: Step2 — Customize component

**Files:**
- Create: `components/wizard/Step2Customize.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PresetGrid } from "@/components/PresetGrid";
import { ColorSwatches } from "@/components/ColorSwatches";
import { useGenerateMutation } from "@/lib/queries/useGenerateMutation";
import { useQuotaQuery } from "@/lib/queries/useQuotaQuery";
import type { Gender } from "@/lib/presets";
import type { WizardState } from "@/app/[locale]/page";

export function Step2Customize({
  locale,
  state,
  setState,
  onBack,
  onResult,
}: {
  locale: "en" | "th";
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
  onBack: () => void;
  onResult: (generatedImage: string) => void;
}) {
  const t = useTranslations("wizard.step2");
  const tErr = useTranslations("errors");
  const [openCustom, setOpenCustom] = useState(false);
  const generate = useGenerateMutation();
  const quota = useQuotaQuery();
  const noQuota = quota.data?.remaining === 0;

  const setGender = (gender: Gender) =>
    setState((s) => ({ ...s, gender, presetId: undefined }));
  const setPreset = (presetId: string) => setState((s) => ({ ...s, presetId }));
  const setColor = (colorId: string) => setState((s) => ({ ...s, colorId }));
  const setCustom = (customText: string) => setState((s) => ({ ...s, customText }));

  const canSubmit = !!state.image && !!state.presetId && !!state.colorId && !noQuota && !generate.isPending;

  const onGenerate = () => {
    if (!state.image || !state.presetId || !state.colorId) return;
    generate.mutate(
      {
        image: state.image,
        presetId: state.presetId,
        colorId: state.colorId,
        customText: state.customText,
        locale,
      },
      {
        onSuccess: (data) => onResult(data.generatedImage),
      },
    );
  };

  return (
    <section>
      <p className="text-[10px] uppercase tracking-[0.2em] text-faded mb-2">Step 2 of 3</p>
      <h1 className="font-display italic text-3xl mb-6">{t("headline")}</h1>

      <div className="flex gap-2 mb-5">
        {(["female", "male"] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGender(g)}
            className={
              "px-4 py-1.5 rounded-full text-xs " +
              (state.gender === g ? "bg-ink text-cream" : "border border-paper text-ink")
            }
          >
            {t(`gender.${g}`)}
          </button>
        ))}
      </div>

      <p className="text-[10px] uppercase tracking-[0.2em] text-faded mb-2">{t("labels.style")}</p>
      <PresetGrid gender={state.gender} selectedId={state.presetId} onSelect={setPreset} />

      <p className="text-[10px] uppercase tracking-[0.2em] text-faded mt-5 mb-2">{t("labels.color")}</p>
      <ColorSwatches selectedId={state.colorId} onSelect={setColor} />

      <button
        onClick={() => setOpenCustom((o) => !o)}
        className="mt-5 text-xs text-faded underline underline-offset-2"
      >
        {t("labels.custom")}
      </button>
      {openCustom && (
        <textarea
          value={state.customText ?? ""}
          onChange={(e) => setCustom(e.target.value)}
          placeholder={t("customPlaceholder")}
          maxLength={200}
          className="mt-2 w-full rounded-lg border border-paper bg-cream p-3 text-sm"
          rows={2}
        />
      )}

      {generate.isError && (
        <p className="mt-4 text-sm text-coral-dk">
          {generate.error.code === "rate_limited" && tErr("rateLimited")}
          {generate.error.code === "no_face_detected" && tErr("noFace")}
          {generate.error.code === "ai_failure" && tErr("aiFailure")}
          {generate.error.code === "network" && tErr("network")}
          {generate.error.code === "image_too_large" && tErr("imageTooLarge")}
          {generate.error.code === "invalid_input" && tErr("aiFailure")}
        </p>
      )}

      <div className="flex gap-2 mt-7">
        <button onClick={onBack} className="rounded-xl border border-paper px-4 py-3 text-sm">
          ← {t("back")}
        </button>
        <button
          onClick={onGenerate}
          disabled={!canSubmit}
          className="flex-1 rounded-xl bg-coral text-cream py-3 text-sm disabled:opacity-40"
        >
          {generate.isPending ? "···" : `${t("generate")} ✨`}
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Stage**

```bash
git add components/wizard/Step2Customize.tsx
```

(Commit at end of Task 22.)

---

### Task 21: BeforeAfterSlider component

**Files:**
- Create: `components/BeforeAfterSlider.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useRef, useState } from "react";

export function BeforeAfterSlider({
  before,
  after,
}: {
  before: string;
  after: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(50);

  const setFromClientX = (clientX: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    setPct((x / rect.width) * 100);
  };

  return (
    <div
      ref={wrapRef}
      className="relative aspect-[3/4] rounded-xl overflow-hidden bg-paper select-none touch-none"
      onPointerDown={(e) => {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        setFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 0) return;
        setFromClientX(e.clientX);
      }}
    >
      <img src={after} alt="after" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <img src={before} alt="before" className="absolute inset-0 w-full h-full object-cover" style={{ width: `${100 / (pct || 1) * 100}%` }} />
      </div>
      <div className="absolute inset-y-0" style={{ left: `${pct}%` }}>
        <div className="h-full w-[2px] bg-cream" />
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-cream shadow-md" />
      </div>
      <span className="absolute top-2 left-2 text-[9px] uppercase tracking-[0.2em] bg-cream/80 text-ink rounded px-1.5 py-0.5">
        Before
      </span>
      <span className="absolute top-2 right-2 text-[9px] uppercase tracking-[0.2em] bg-coral/90 text-cream rounded px-1.5 py-0.5">
        After
      </span>
    </div>
  );
}
```

> **Implementation note:** The `before` image is shown via a clipped overlay. The trick of scaling its width to `100/(pct)*100%` keeps it aligned. If this causes alignment artifacts during testing, swap the overlay to use `clip-path: inset(0 ${100-pct}% 0 0)` on the after layer with the before layer underneath.

- [ ] **Step 2: Stage**

```bash
git add components/BeforeAfterSlider.tsx
```

(Commit at end of Task 22.)

---

### Task 22: Step3 — Result component (with Save / Share / history persist)

**Files:**
- Create: `components/wizard/Step3Result.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ulid } from "ulid";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { addEntry } from "@/lib/history";
import { makeThumbnail } from "@/lib/thumbnail";

export function Step3Result({
  original,
  generated,
  presetId,
  colorId,
  onTryAgain,
  onStartOver,
}: {
  original: string;
  generated: string;
  presetId: string;
  colorId: string;
  onTryAgain: () => void;
  onStartOver: () => void;
}) {
  const t = useTranslations("wizard.step3");
  const [savedToHistory, setSavedToHistory] = useState(false);

  useEffect(() => {
    if (savedToHistory) return;
    let cancelled = false;
    (async () => {
      const thumb = await makeThumbnail(generated, 256, 0.85);
      if (cancelled) return;
      addEntry({
        id: ulid(),
        createdAt: Date.now(),
        thumbnailBase64: thumb,
        presetId,
        colorId,
      });
      setSavedToHistory(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [generated, presetId, colorId, savedToHistory]);

  const onSave = () => {
    const a = document.createElement("a");
    a.href = generated;
    a.download = `hairstyle-${Date.now()}.png`;
    a.click();
  };

  const onShare = async () => {
    if (!navigator.share) return onSave();
    try {
      const blob = await fetch(generated).then((r) => r.blob());
      const file = new File([blob], "hairstyle.png", { type: blob.type });
      await navigator.share({ files: [file] });
    } catch {
      // user cancelled or share unsupported
    }
  };

  return (
    <section>
      <p className="text-[10px] uppercase tracking-[0.2em] text-faded mb-2">Step 3 of 3</p>
      <h1 className="font-display italic text-3xl mb-1">{t("headline")}</h1>
      <p className="text-[11px] italic text-faded mb-4">{t("compareHint")}</p>

      <BeforeAfterSlider before={original} after={generated} />

      <div className="flex gap-2 mt-4 justify-center">
        <button onClick={onSave} className="rounded-full border border-paper px-3 py-1.5 text-xs">
          ⬇ {t("save")}
        </button>
        <button onClick={onShare} className="rounded-full border border-paper px-3 py-1.5 text-xs">
          ↗ {t("share")}
        </button>
        <button onClick={onTryAgain} className="rounded-full border border-paper px-3 py-1.5 text-xs">
          ↻ {t("tryAgain")}
        </button>
      </div>

      <button onClick={onStartOver} className="mt-7 w-full rounded-xl border border-paper py-3 text-sm">
        {t("startOver")}
      </button>
    </section>
  );
}
```

- [ ] **Step 2: Run typecheck and build**

```bash
npm run typecheck && npm run build
```

Expected: PASS for both.

- [ ] **Step 3: Run all unit + API tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit the entire wizard at once**

```bash
git add app/[locale]/page.tsx components/wizard components/BeforeAfterSlider.tsx components/PresetGrid.tsx components/ColorSwatches.tsx
git commit -m "feat(wizard): 3-step upload → customize → result with before/after slider"
```

---

### Task 23: HistoryDrawer component

**Files:**
- Create: `components/HistoryDrawer.tsx`
- Modify: `app/[locale]/page.tsx` (add open trigger)

- [ ] **Step 1: Implement `components/HistoryDrawer.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { readHistory, type HistoryEntry } from "@/lib/history";

export function HistoryDrawer() {
  const t = useTranslations("history");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (open) setItems(readHistory());
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-faded underline underline-offset-2"
      >
        {t("open")}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setOpen(false)}>
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 inset-x-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-cream p-5"
          >
            <div className="mx-auto h-1 w-12 rounded-full bg-paper mb-4" />
            <h2 className="font-display italic text-xl mb-3">{t("title")}</h2>
            {items.length === 0 ? (
              <p className="text-sm text-faded">{t("empty")}</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {items.map((e) => (
                  <a
                    key={e.id}
                    href={e.thumbnailBase64}
                    download={`hairstyle-${e.id}.webp`}
                    className="block aspect-square rounded-md overflow-hidden bg-paper"
                  >
                    <img src={e.thumbnailBase64} alt="" className="h-full w-full object-cover" />
                  </a>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Add the trigger to Step 1's screen**

In `components/wizard/Step1Upload.tsx`, near the top of the return JSX, add `<HistoryDrawer />` as a small link above the upload zone:

```tsx
import { HistoryDrawer } from "@/components/HistoryDrawer";
// ...
<section>
  <div className="flex justify-end mb-4">
    <HistoryDrawer />
  </div>
  <p className="text-[10px] uppercase tracking-[0.2em] text-faded mb-2">Step 1 of 3</p>
  ...
```

- [ ] **Step 3: Build + smoke**

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/HistoryDrawer.tsx components/wizard/Step1Upload.tsx
git commit -m "feat(history): drawer UI for past generations"
```

---

## Phase 7 — E2E + polish

### Task 24: Playwright config + happy path E2E

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/happy-path.spec.ts`

- [ ] **Step 1: Run `npx playwright install` (browsers)**

```bash
npx playwright install --with-deps chromium webkit
```

- [ ] **Step 2: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: "iphone-13", use: { ...devices["iPhone 13"] } },
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

- [ ] **Step 3: Create `tests/e2e/happy-path.spec.ts`**

This test mocks `/api/generate` to return a fixed image so we exercise the UI without burning Gemini quota.

```ts
import { test, expect } from "@playwright/test";
import path from "node:path";

const FIXTURE_IMAGE = path.resolve(__dirname, "../fixtures/face.jpg");

test("happy path: upload → customize → result", async ({ page, context }) => {
  await context.route("**/api/generate", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        generatedImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        remaining: 4,
      }),
    });
  });

  await page.goto("/en");
  await expect(page.getByText("Bring your face.")).toBeVisible();

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByText("Tap to upload").click();
  const chooser = await fileChooserPromise;
  await chooser.setFiles(FIXTURE_IMAGE);

  await page.getByRole("button", { name: /Continue/ }).click();

  await expect(page.getByText("Choose your look.")).toBeVisible();
  await page.getByRole("button", { name: "Bob" }).click();
  await page.getByRole("button", { name: "Blonde" }).click();
  await page.getByRole("button", { name: /Generate/ }).click();

  await expect(page.getByText("Here you are.")).toBeVisible();
  await expect(page.getByRole("button", { name: /Save/ })).toBeVisible();
});
```

- [ ] **Step 4: Add a fixture image**

```bash
mkdir -p tests/fixtures
# Use any small image as a stand-in face
curl -sL "https://picsum.photos/512/512.jpg" -o tests/fixtures/face.jpg
ls -la tests/fixtures/face.jpg
```

Expected: file exists, ~30-80 KB.

- [ ] **Step 5: Run E2E**

```bash
npm run test:e2e -- --project iphone-13
```

Expected: 1 test passes. (Dev server starts automatically via `webServer` config.)

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts tests/e2e/happy-path.spec.ts tests/fixtures
git commit -m "test(e2e): happy-path with mobile viewport"
```

---

### Task 25: Quota / i18n / LRU E2E specs

**Files:**
- Create: `tests/e2e/quota.spec.ts`, `tests/e2e/i18n.spec.ts`, `tests/e2e/history-lru.spec.ts`

- [ ] **Step 1: `tests/e2e/quota.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("shows rate-limited error when API returns 429", async ({ page, context }) => {
  await context.route("**/api/generate", async (route) => {
    await route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({ error: "rate_limited", retryAfter: 3600, remaining: 0 }),
    });
  });

  await page.goto("/en");
  // Skip steps 1-2 by directly setting state via a smoke path: upload + select
  // (this test relies on the happy path above being passing; here we simulate)
  // For brevity, we just check the UI handles 429 from a fresh attempt:
  // The test asserts the error text appears after the user pushes Generate.
  // Implementation detail: we can't easily reach Step 2 without uploading; load a fixture too.
  // ... use the same upload steps as happy-path.spec.ts ...
});
```

> **Note:** the 429 spec requires the same upload flow as happy-path. Either factor out a helper into `tests/e2e/_helpers.ts` or duplicate the steps. Below the helper version.

Create `tests/e2e/_helpers.ts`:

```ts
import path from "node:path";
import type { Page } from "@playwright/test";

export const FIXTURE_IMAGE = path.resolve(__dirname, "../fixtures/face.jpg");

export async function uploadAndPick(page: Page) {
  const chooserPromise = page.waitForEvent("filechooser");
  await page.getByText(/Tap to upload|แตะเพื่ออัพโหลด/).click();
  const chooser = await chooserPromise;
  await chooser.setFiles(FIXTURE_IMAGE);
  await page.getByRole("button", { name: /Continue|ถัดไป/ }).click();
  await page.getByRole("button", { name: /Bob|บ๊อบ/ }).click();
  await page.getByRole("button", { name: /Blonde|บลอนด์/ }).click();
}
```

Replace the `quota.spec.ts` body with:

```ts
import { test, expect } from "@playwright/test";
import { uploadAndPick } from "./_helpers";

test("shows rate-limited error when API returns 429", async ({ page, context }) => {
  await context.route("**/api/generate", async (route) => {
    await route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({ error: "rate_limited", retryAfter: 3600, remaining: 0 }),
    });
  });

  await page.goto("/en");
  await uploadAndPick(page);
  await page.getByRole("button", { name: /Generate/ }).click();
  await expect(page.getByText(/Daily limit|today's limit/)).toBeVisible();
});
```

- [ ] **Step 2: `tests/e2e/i18n.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("Thai → English language toggle swaps every visible string", async ({ page }) => {
  await page.goto("/th");
  await expect(page.getByText("ส่งหน้ามาก่อน")).toBeVisible();

  await page.getByRole("button", { name: /EN/ }).click();
  await expect(page).toHaveURL(/\/en/);
  await expect(page.getByText("Bring your face.")).toBeVisible();
});
```

- [ ] **Step 3: `tests/e2e/history-lru.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("history drawer shows entries and persists across reloads", async ({ page }) => {
  await page.goto("/en");
  await page.evaluate(() => {
    const big = "data:image/webp;base64," + "A".repeat(50_000);
    const list = Array.from({ length: 5 }, (_, i) => ({
      id: `e${i}`,
      createdAt: Date.now() - i * 1000,
      thumbnailBase64: big,
      presetId: "female-bob",
      colorId: "blonde",
    }));
    localStorage.setItem("hairstyle-history-v1", JSON.stringify(list));
  });
  await page.reload();
  await page.getByText("Recent").click();
  await expect(page.locator("aside img")).toHaveCount(5);
});
```

- [ ] **Step 4: Run all E2E**

```bash
npm run test:e2e -- --project iphone-13
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e
git commit -m "test(e2e): quota error, i18n toggle, history drawer"
```

---

### Task 26: README, env example, deployment notes

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
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
```

- [ ] **Step 2: Final full test run**

```bash
npm run typecheck && npm test && npm run test:e2e -- --project iphone-13
```

Expected: all green.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add README with setup, tests, deploy"
```

---

## Self-review checklist

After implementing, the executor should verify the following before declaring done:

| Spec requirement | Implemented in |
| --- | --- |
| 3-step wizard (Upload → Customize → Result) | Tasks 17, 18, 20, 22 |
| Both genders supported | Task 4 (presets), Task 20 (gender pill) |
| Hair color change (7 swatches) | Tasks 5, 19 |
| Custom text prompt (optional) | Task 20 |
| Gemini 2.5 Flash Image | Task 11 |
| Per-IP rate limit, 5/day, Upstash | Task 10, 13 |
| Anonymous, no login | (entire stack — no auth code anywhere) |
| Thai + English, auto-detect, toggle | Tasks 9, 16 |
| Claude aesthetic (cream/coral/serif) | Task 2 |
| Mobile-first | All UI tasks; Playwright tests target iPhone 13 |
| TanStack Query for quota + generate | Tasks 14, 15 |
| localStorage history with LRU | Task 7, 22, 23 |
| Save = download, Share = Web Share API | Task 22 |
| Privacy: no server-side image storage | API routes hold base64 in scope only |
| Error states (429, 400, 422, 500) | Tasks 13, 20 |
| Vercel deployment | Task 26 |

## Notes for the executor

- Commit after each task; don't batch unrelated changes.
- The wizard host (Task 17) imports child components that don't exist until Tasks 18-22; that's why those tasks `git add` but defer the commit until Task 22 completes a buildable wizard.
- If `npx create-next-app` produces a `tailwind.config.ts` (older flow) instead of CSS-first config, port the tokens into that file's `theme.extend` object and keep `globals.css` minimal. The end result must still expose `bg-cream`, `text-ink`, `bg-coral`, `border-paper`, `text-faded`, `text-coral-dk`, and `font-display` utilities — every UI task assumes those exist.
- Gemini's response shape can vary slightly across SDK versions. If the executor finds `inlineData` is named `inline_data` or nested differently, adjust `lib/gemini.ts` Step 1 accordingly — keep the public `generateHairstyle` signature unchanged.
- For Playwright on macOS, `npx playwright install --with-deps` may need `sudo` for system libraries; the `--with-deps` flag is optional on dev machines.
