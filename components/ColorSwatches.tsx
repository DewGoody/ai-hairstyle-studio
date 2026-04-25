"use client";

import { COLORS } from "@/lib/colors";
import { useLocale } from "next-intl";

export function ColorSwatches({
  selectedId,
  onSelect,
}: {
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const locale = useLocale() as "en" | "th";
  return (
    <div className="flex flex-wrap gap-2">
      {COLORS.map((c) => {
        const active = selectedId === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            aria-label={c.label[locale]}
            aria-pressed={active}
            style={{ background: c.swatch }}
            className={
              "h-7 w-7 rounded-full border-2 border-cream " +
              (active ? "ring-2 ring-coral" : "ring-1 ring-paper")
            }
          />
        );
      })}
    </div>
  );
}
