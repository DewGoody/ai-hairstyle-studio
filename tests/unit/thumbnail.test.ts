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
