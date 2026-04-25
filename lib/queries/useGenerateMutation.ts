"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Locale } from "@/lib/prompt";

export type GenerateInput = {
  image: string;
  presetId: string;
  colorId: string;
  customText?: string;
  locale: Locale;
};

export type GenerateSuccess = { generatedImage: string; remaining: number };

export type GenerateError = {
  status: number;
  code: "rate_limited" | "invalid_input" | "image_too_large" | "no_face_detected" | "ai_failure" | "network";
  retryAfter?: number;
};

export function useGenerateMutation() {
  const qc = useQueryClient();
  return useMutation<GenerateSuccess, GenerateError, GenerateInput>({
    mutationFn: async (input) => {
      let res: Response;
      try {
        res = await fetch("/api/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
        });
      } catch {
        throw { status: 0, code: "network" } as GenerateError;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw { status: res.status, code: body.error ?? "ai_failure", retryAfter: body.retryAfter } as GenerateError;
      }
      return res.json();
    },
    onSuccess: (data) => {
      qc.setQueryData(["quota"], (prev: { remaining: number; resetAt: number; limit: number } | undefined) =>
        prev ? { ...prev, remaining: data.remaining } : prev,
      );
    },
  });
}
