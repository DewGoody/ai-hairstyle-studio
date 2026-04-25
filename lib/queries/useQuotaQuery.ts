"use client";

import { useQuery } from "@tanstack/react-query";

export type QuotaResponse = { remaining: number; resetAt: number; limit: number };

export function useQuotaQuery() {
  return useQuery<QuotaResponse>({
    queryKey: ["quota"],
    queryFn: async () => {
      const res = await fetch("/api/quota", { cache: "no-store" });
      if (!res.ok) throw new Error("quota_fetch_failed");
      return res.json();
    },
    staleTime: 30_000,
  });
}
