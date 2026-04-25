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
  return JSON.stringify(list).length;
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
