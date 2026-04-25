"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { HistoryDrawer } from "@/components/HistoryDrawer";

const MAX_BYTES = 10 * 1024 * 1024;

export function Step1Upload({
  image,
  onPick,
  onNext,
}: {
  image?: string;
  onPick: (dataUrl: string) => void;
  onNext: () => void;
}) {
  const t = useTranslations("wizard.step1");
  const tErr = useTranslations("errors");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      alert(tErr("fileType"));
      return;
    }
    if (file.size > MAX_BYTES) {
      alert(tErr("imageTooLarge"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onPick(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <section>
      <div className="flex justify-end mb-4">
        <HistoryDrawer />
      </div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-faded mb-2">Step 1 of 3</p>
      <h1 className="font-display italic text-3xl mb-2">{t("headline")}</h1>
      <p className="text-sm text-faded mb-8">{t("sub")}</p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files?.[0] ?? null);
        }}
        className="w-full border-[1.5px] border-dashed border-coral rounded-2xl p-9 text-center"
      >
        {image ? (
          <img src={image} alt="" className="mx-auto max-h-48 rounded-lg" />
        ) : (
          <>
            <div className="text-4xl mb-2">⌒</div>
            <div className="text-coral text-sm font-medium">{t("uploadCta")}</div>
            <div className="text-xs text-faded mt-1">{t("uploadHint")}</div>
          </>
        )}
      </button>
      <p className="text-[10px] italic text-faded text-center mt-4">{t("fileNote")}</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        disabled={!image}
        onClick={onNext}
        className="mt-8 w-full rounded-xl bg-coral text-cream py-3 text-sm disabled:opacity-40"
      >
        {t("continue")} →
      </button>
    </section>
  );
}
