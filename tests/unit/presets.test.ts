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
