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
