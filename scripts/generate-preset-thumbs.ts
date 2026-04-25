/**
 * One-off script: generate 20 preset thumbnail images via Gemini 2.5 Flash Image.
 *
 * Usage:
 *   npm run presets:thumbs
 *
 * Behaviour:
 *   - Reads GEMINI_API_KEY from .env.local (loaded manually, no dep needed).
 *   - Iterates lib/presets.ts; for each preset that does NOT already have a
 *     public/presets/<id>.png file, generates one.
 *   - Throttles to ~6 requests/minute (10 s between calls) to stay under the
 *     Gemini free-tier rate limit of 10 RPM.
 *   - On 429 / quota errors, sleeps 60 s × attempt and retries up to 3 times.
 *   - Idempotent: re-running picks up where it left off.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";
import { PRESETS, type Preset } from "../lib/presets.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "public", "presets");
const ENV_FILE = path.join(ROOT, ".env.local");

const DELAY_BETWEEN_CALLS_MS = 10_000;
const MAX_RETRIES = 3;

loadEnvLocal();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("✗ GEMINI_API_KEY not found. Add it to .env.local and re-run.");
  process.exit(1);
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const ai = new GoogleGenAI({ apiKey });

await main();

// ------------------------------------------------------------ main

async function main(): Promise<void> {
  const todo = PRESETS.filter((p) => !fs.existsSync(outputPathFor(p)));
  const skipped = PRESETS.length - todo.length;

  console.log(`Preset thumbnail generator`);
  console.log(`  output:    ${OUTPUT_DIR}`);
  console.log(`  total:     ${PRESETS.length}`);
  console.log(`  skipped:   ${skipped} (already exist)`);
  console.log(`  to-do:     ${todo.length}`);
  console.log(`  throttle:  ${DELAY_BETWEEN_CALLS_MS / 1000}s between calls`);
  console.log("");

  if (todo.length === 0) {
    console.log("Nothing to do. Delete files in public/presets/ to regenerate.");
    return;
  }

  let succeeded = 0;
  let failed: string[] = [];

  for (const [i, preset] of todo.entries()) {
    const ok = await generateOne(preset);
    if (ok) succeeded++;
    else failed.push(preset.id);

    if (i < todo.length - 1) {
      await sleep(DELAY_BETWEEN_CALLS_MS);
    }
  }

  console.log("");
  console.log(`Done: ${succeeded}/${todo.length} generated, ${failed.length} failed`);
  if (failed.length > 0) {
    console.log(`Failed IDs: ${failed.join(", ")}`);
    console.log(`Re-run "npm run presets:thumbs" to retry failed entries.`);
    process.exit(2);
  }
}

// ------------------------------------------------------------ generate

async function generateOne(preset: Preset): Promise<boolean> {
  const outPath = outputPathFor(preset);
  const prompt = buildPrompt(preset);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [{ text: prompt }],
      });

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        const inline = (part as { inlineData?: { data?: string } }).inlineData;
        if (inline?.data) {
          fs.writeFileSync(outPath, Buffer.from(inline.data, "base64"));
          console.log(`✓ ${preset.id}`);
          return true;
        }
      }

      console.error(`✗ ${preset.id} — no image part in response (attempt ${attempt}/${MAX_RETRIES})`);
    } catch (err) {
      const message = (err as Error).message ?? String(err);
      const isRateLimit = /429|rate|quota|RESOURCE_EXHAUSTED/i.test(message);
      console.error(`✗ ${preset.id} — ${message} (attempt ${attempt}/${MAX_RETRIES})`);

      if (attempt < MAX_RETRIES) {
        const wait = isRateLimit ? 60_000 * attempt : 5_000;
        console.log(`  retrying in ${wait / 1000}s${isRateLimit ? " (rate limited)" : ""}...`);
        await sleep(wait);
        continue;
      }
    }
  }
  return false;
}

// ------------------------------------------------------------ prompt

function buildPrompt(preset: Preset): string {
  const subject = preset.gender === "female" ? "young Asian woman" : "young Asian man";
  return [
    `A clean editorial portrait photograph of a ${subject} showing ${preset.promptFragment.en}.`,
    "Hair color: natural medium brown.",
    "Background: soft warm cream or beige plain studio backdrop, no patterns.",
    "Lighting: even, soft, diffused — no dramatic shadows.",
    "Composition: head and shoulders centered, looking slightly off-camera, square 1:1 aspect ratio.",
    "Style: professional fashion photography, minimal aesthetic, calm mood.",
    "Avoid: text, watermarks, logos, party scene, multiple people.",
  ].join(" ");
}

// ------------------------------------------------------------ helpers

function outputPathFor(preset: Preset): string {
  return path.join(OUTPUT_DIR, `${preset.id}.png`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadEnvLocal(): void {
  if (!fs.existsSync(ENV_FILE)) return;
  for (const raw of fs.readFileSync(ENV_FILE, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const match = /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(line);
    if (!match) continue;
    const [, key, rawValue] = match;
    const value = rawValue.replace(/^["']|["']$/g, "");
    process.env[key] ??= value;
  }
}
