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
