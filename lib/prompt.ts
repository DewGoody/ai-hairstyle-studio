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
