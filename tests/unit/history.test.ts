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
