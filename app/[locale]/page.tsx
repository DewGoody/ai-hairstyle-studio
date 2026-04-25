"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Step1Upload } from "@/components/wizard/Step1Upload";
import { Step2Customize } from "@/components/wizard/Step2Customize";
import { Step3Result } from "@/components/wizard/Step3Result";
import type { Gender } from "@/lib/presets";

export type WizardState = {
  step: 1 | 2 | 3;
  image?: string;
  gender: Gender;
  presetId?: string;
  colorId?: string;
  customText?: string;
  generatedImage?: string;
};

export default function Wizard() {
  const locale = useLocale() as "en" | "th";
  const [state, setState] = useState<WizardState>({ step: 1, gender: "female" });

  const goTo = (step: 1 | 2 | 3) => setState((s) => ({ ...s, step }));
  const reset = () => setState({ step: 1, gender: "female" });

  return (
    <main className="mx-auto max-w-md px-5 py-8">
      <Progress step={state.step} />
      {state.step === 1 && (
        <Step1Upload
          image={state.image}
          onPick={(image) => setState((s) => ({ ...s, image }))}
          onNext={() => goTo(2)}
        />
      )}
      {state.step === 2 && state.image && (
        <Step2Customize
          locale={locale}
          state={state}
          setState={setState}
          onBack={() => goTo(1)}
          onResult={(generatedImage) => setState((s) => ({ ...s, generatedImage, step: 3 }))}
        />
      )}
      {state.step === 3 && state.generatedImage && state.image && (
        <Step3Result
          original={state.image}
          generated={state.generatedImage}
          presetId={state.presetId!}
          colorId={state.colorId!}
          onTryAgain={() => goTo(2)}
          onStartOver={reset}
        />
      )}
    </main>
  );
}

function Progress({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-1.5 mb-6" aria-label={`Step ${step} of 3`}>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={
            "h-[3px] w-8 rounded-full " + (n <= step ? "bg-coral" : "bg-paper")
          }
        />
      ))}
    </div>
  );
}
