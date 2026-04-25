"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/routing";

const LOCALES = [
  { code: "en", short: "EN", full: "English" },
  { code: "th", short: "TH", full: "ภาษาไทย" },
] as const;

export function LangToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (next: "en" | "th") => {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center rounded-full border border-paper p-0.5"
    >
      {LOCALES.map((l) => {
        const active = locale === l.code;
        return (
          <button
            key={l.code}
            onClick={() => switchTo(l.code)}
            aria-pressed={active}
            aria-label={active ? `Currently ${l.full}` : `Switch to ${l.full}`}
            className={
              "px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wider transition " +
              (active
                ? "bg-ink text-cream"
                : "text-faded hover:text-ink")
            }
          >
            {l.short}
          </button>
        );
      })}
    </div>
  );
}
