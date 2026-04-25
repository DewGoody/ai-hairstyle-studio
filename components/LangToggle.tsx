"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/routing";

export function LangToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const next = locale === "en" ? "th" : "en";
  return (
    <button
      onClick={() => router.replace(pathname, { locale: next })}
      className="text-xs uppercase tracking-[0.2em] text-faded hover:text-ink transition"
      aria-label={`Switch to ${next}`}
    >
      {locale === "en" ? "TH" : "EN"}
    </button>
  );
}
