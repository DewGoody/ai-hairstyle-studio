"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PresetGrid } from "@/components/PresetGrid";
import { ColorSwatches } from "@/components/ColorSwatches";
import { useGenerateMutation } from "@/lib/queries/useGenerateMutation";
import { useQuotaQuery } from "@/lib/queries/useQuotaQuery";
import type { Gender } from "@/lib/presets";
import type { WizardState } from "@/app/[locale]/page";

export function Step2Customize({
  locale,
  state,
  setState,
  onBack,
  onResult,
}: {
  locale: "en" | "th";
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
  onBack: () => void;
  onResult: (generatedImage: string) => void;
}) {
  const t = useTranslations("wizard.step2");
  const tErr = useTranslations("errors");
  const [openCustom, setOpenCustom] = useState(false);
  const generate = useGenerateMutation();
  const quota = useQuotaQuery();
  const noQuota = quota.data?.remaining === 0;

  const setGender = (gender: Gender) =>
    setState((s) => ({ ...s, gender, presetId: undefined }));
  const setPreset = (presetId: string) => setState((s) => ({ ...s, presetId }));
  const setColor = (colorId: string) => setState((s) => ({ ...s, colorId }));
  const setCustom = (customText: string) => setState((s) => ({ ...s, customText }));

  const canSubmit = !!state.image && !!state.presetId && !!state.colorId && !noQuota && !generate.isPending;

  const onGenerate = () => {
    if (!state.image || !state.presetId || !state.colorId) return;
    generate.mutate(
      {
        image: state.image,
        presetId: state.presetId,
        colorId: state.colorId,
        customText: state.customText,
        locale,
      },
      {
        onSuccess: (data) => onResult(data.generatedImage),
      },
    );
  };

  return (
    <section>
      <p className="text-[10px] uppercase tracking-[0.2em] text-faded mb-2">Step 2 of 3</p>
      <h1 className="font-display italic text-3xl mb-6">{t("headline")}</h1>

      <div className="flex gap-2 mb-5">
        {(["female", "male"] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGender(g)}
            className={
              "px-4 py-1.5 rounded-full text-xs " +
              (state.gender === g ? "bg-ink text-cream" : "border border-paper text-ink")
            }
          >
            {t(`gender.${g}`)}
          </button>
        ))}
      </div>

      <p className="text-[10px] uppercase tracking-[0.2em] text-faded mb-2">{t("labels.style")}</p>
      <PresetGrid gender={state.gender} selectedId={state.presetId} onSelect={setPreset} />

      <p className="text-[10px] uppercase tracking-[0.2em] text-faded mt-5 mb-2">{t("labels.color")}</p>
      <ColorSwatches selectedId={state.colorId} onSelect={setColor} />

      <button
        onClick={() => setOpenCustom((o) => !o)}
        className="mt-5 text-xs text-faded underline underline-offset-2"
      >
        {t("labels.custom")}
      </button>
      {openCustom && (
        <textarea
          value={state.customText ?? ""}
          onChange={(e) => setCustom(e.target.value)}
          placeholder={t("customPlaceholder")}
          maxLength={200}
          className="mt-2 w-full rounded-lg border border-paper bg-cream p-3 text-sm"
          rows={2}
        />
      )}

      {generate.isError && (
        <p className="mt-4 text-sm text-coral-dk">
          {generate.error.code === "rate_limited" && tErr("rateLimited")}
          {generate.error.code === "no_face_detected" && tErr("noFace")}
          {generate.error.code === "ai_failure" && tErr("aiFailure")}
          {generate.error.code === "network" && tErr("network")}
          {generate.error.code === "image_too_large" && tErr("imageTooLarge")}
          {generate.error.code === "invalid_input" && tErr("aiFailure")}
        </p>
      )}

      <div className="flex gap-2 mt-7">
        <button onClick={onBack} className="rounded-xl border border-paper px-4 py-3 text-sm">
          ← {t("back")}
        </button>
        <button
          onClick={onGenerate}
          disabled={!canSubmit}
          className="flex-1 rounded-xl bg-coral text-cream py-3 text-sm disabled:opacity-40"
        >
          {generate.isPending ? "···" : `${t("generate")} ✨`}
        </button>
      </div>
    </section>
  );
}
