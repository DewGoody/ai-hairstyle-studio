"use client";

import { getPresetsByGender, type Gender } from "@/lib/presets";
import { useLocale } from "next-intl";

export function PresetGrid({
  gender,
  selectedId,
  onSelect,
}: {
  gender: Gender;
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const locale = useLocale() as "en" | "th";
  const presets = getPresetsByGender(gender);
  return (
    <div className="grid grid-cols-3 gap-2">
      {presets.map((p) => {
        const active = selectedId === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={
              "aspect-square rounded-lg bg-paper relative overflow-hidden text-left " +
              (active ? "outline outline-2 outline-coral outline-offset-2" : "")
            }
            aria-pressed={active}
          >
            <span className="absolute bottom-1 left-1.5 text-[10px] text-cream drop-shadow">
              {p.label[locale]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
