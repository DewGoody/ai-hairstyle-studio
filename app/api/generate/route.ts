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
    console.error("[/api/generate] gemini failure:", err);
    return NextResponse.json(
      { error: "ai_failure", message: "Generation failed" },
      { status: 500 },
    );
  }
}
