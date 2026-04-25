"use client";

import { useTranslations } from "next-intl";
import { useQuotaQuery } from "@/lib/queries/useQuotaQuery";

export function QuotaCounter() {
  const t = useTranslations("quota");
  const { data, isLoading } = useQuotaQuery();
  if (isLoading || !data) return <span className="text-xs text-faded">···</span>;
  return (
    <span className="text-xs text-faded tabular-nums">
      {t("remaining", { remaining: data.remaining, total: data.limit })}
    </span>
  );
}
