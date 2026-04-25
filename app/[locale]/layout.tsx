import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/lib/i18n/routing";
import { Providers } from "@/components/Providers";
import { LangToggle } from "@/components/LangToggle";
import { QuotaCounter } from "@/components/QuotaCounter";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const serif = Source_Serif_4({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Hairstyle Studio",
  description: "Try a new hairstyle on your photo — free, private, AI-powered.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "en" | "th")) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <html lang={locale} className={`${inter.variable} ${serif.variable}`}>
      <body>
        <Providers>
          <NextIntlClientProvider messages={messages}>
            <header className="flex items-center justify-between px-5 py-3 border-b border-paper">
              <span className="font-display italic text-sm">Hairstyle Studio</span>
              <div className="flex items-center gap-3">
                <QuotaCounter />
                <LangToggle />
              </div>
            </header>
            {children}
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
