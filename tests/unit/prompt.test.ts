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
