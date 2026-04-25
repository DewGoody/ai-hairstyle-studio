import { getRequestConfig } from "next-intl/server";
import { routing } from "./lib/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = (routing.locales as readonly string[]).includes(requested ?? "")
    ? (requested as "en" | "th")
    : routing.defaultLocale;
  return {
    locale,
    messages: (await import(`./lib/i18n/messages/${locale}.json`)).default,
  };
});
