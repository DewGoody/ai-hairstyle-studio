"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ulid } from "ulid";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { addEntry } from "@/lib/history";
import { makeThumbnail } from "@/lib/thumbnail";

export function Step3Result({
  original,
  generated,
  presetId,
  colorId,
  onTryAgain,
  onStartOver,
}: {
  original: string;
  generated: string;
  presetId: string;
  colorId: string;
  onTryAgain: () => void;
  onStartOver: () => void;
}) {
  const t = useTranslations("wizard.step3");
  const [savedToHistory, setSavedToHistory] = useState(false);

  useEffect(() => {
    if (savedToHistory) return;
    let cancelled = false;
    (async () => {
      const thumb = await makeThumbnail(generated, 256, 0.85);
      if (cancelled) return;
      addEntry({
        id: ulid(),
        createdAt: Date.now(),
        thumbnailBase64: thumb,
        presetId,
        colorId,
      });
      setSavedToHistory(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [generated, presetId, colorId, savedToHistory]);

  const onSave = () => {
    const a = document.createElement("a");
    a.href = generated;
    a.download = `hairstyle-${Date.now()}.png`;
    a.click();
  };

  const onShare = async () => {
    if (!navigator.share) return onSave();
    try {
      const blob = await fetch(generated).then((r) => r.blob());
      const file = new File([blob], "hairstyle.png", { type: blob.type });
      await navigator.share({ files: [file] });
    } catch {
      // user cancelled or share unsupported
    }
  };

  return (
    <section>
      <p className="text-[10px] uppercase tracking-[0.2em] text-faded mb-2">Step 3 of 3</p>
      <h1 className="font-display italic text-3xl mb-1">{t("headline")}</h1>
      <p className="text-[11px] italic text-faded mb-4">{t("compareHint")}</p>

      <BeforeAfterSlider before={original} after={generated} />

      <div className="flex gap-2 mt-4 justify-center">
        <button onClick={onSave} className="rounded-full border border-paper px-3 py-1.5 text-xs">
          ⬇ {t("save")}
        </button>
        <button onClick={onShare} className="rounded-full border border-paper px-3 py-1.5 text-xs">
          ↗ {t("share")}
        </button>
        <button onClick={onTryAgain} className="rounded-full border border-paper px-3 py-1.5 text-xs">
          ↻ {t("tryAgain")}
        </button>
      </div>

      <button onClick={onStartOver} className="mt-7 w-full rounded-xl border border-paper py-3 text-sm">
        {t("startOver")}
      </button>
    </section>
  );
}
