"use client";

import { useState } from "react";
import { getPresetsByGender, type Gender, type Preset } from "@/lib/presets";
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
      {presets.map((p) => (
        <PresetCard
          key={p.id}
          preset={p}
          locale={locale}
          active={selectedId === p.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function PresetCard({
  preset,
  locale,
  active,
  onSelect,
}: {
  preset: Preset;
  locale: "en" | "th";
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <button
      onClick={() => onSelect(preset.id)}
      style={{ background: preset.tint }}
      className={
        "aspect-square rounded-lg relative overflow-hidden text-left transition " +
        (active ? "outline outline-2 outline-coral outline-offset-2" : "")
      }
      aria-pressed={active}
    >
      {!imgFailed && (
        <img
          src={`/presets/${preset.id}.png`}
          alt=""
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
      <span className="absolute bottom-1.5 left-2 right-2 text-[11px] text-cream font-medium leading-tight">
        {preset.label[locale]}
      </span>
    </button>
  );
}
