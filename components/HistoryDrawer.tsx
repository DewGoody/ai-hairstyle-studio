"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { readHistory, type HistoryEntry } from "@/lib/history";

export function HistoryDrawer() {
  const t = useTranslations("history");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (open) setItems(readHistory());
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-faded underline underline-offset-2"
      >
        {t("open")}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setOpen(false)}>
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 inset-x-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-cream p-5"
          >
            <div className="mx-auto h-1 w-12 rounded-full bg-paper mb-4" />
            <h2 className="font-display italic text-xl mb-3">{t("title")}</h2>
            {items.length === 0 ? (
              <p className="text-sm text-faded">{t("empty")}</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {items.map((e) => (
                  <a
                    key={e.id}
                    href={e.thumbnailBase64}
                    download={`hairstyle-${e.id}.webp`}
                    className="block aspect-square rounded-md overflow-hidden bg-paper"
                  >
                    <img src={e.thumbnailBase64} alt="" className="h-full w-full object-cover" />
                  </a>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
