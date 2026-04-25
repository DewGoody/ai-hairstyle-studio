import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("app");
  return (
    <main className="p-8">
      <h1 className="font-display italic text-3xl">{t("title")}</h1>
      <p className="text-faded">{t("tagline")}</p>
    </main>
  );
}
