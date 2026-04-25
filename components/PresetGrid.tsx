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
            style={{ background: p.tint }}
            className={
              "aspect-square rounded-lg relative overflow-hidden text-left transition " +
              (active ? "outline outline-2 outline-coral outline-offset-2" : "")
            }
            aria-pressed={active}
          >
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
            <span className="absolute bottom-1.5 left-2 right-2 text-[11px] text-cream font-medium leading-tight">
              {p.label[locale]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
