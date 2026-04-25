import type { LocaleString } from "./presets";

export type ColorOption = {
  id: string;
  swatch: string;
  label: LocaleString;
  promptFragment: LocaleString;
};

export const COLORS: ColorOption[] = [
  { id: "black", swatch: "#1A1A1A", label: { en: "Black", th: "ดำ" },
    promptFragment: { en: "color it natural black", th: "ทำสีผมเป็นสีดำธรรมชาติ" } },
  { id: "dark-brown", swatch: "#3E2A1F", label: { en: "Dark Brown", th: "น้ำตาลเข้ม" },
    promptFragment: { en: "color it dark chocolate brown", th: "ทำสีผมเป็นสีน้ำตาลช็อกโกแลตเข้ม" } },
  { id: "brown", swatch: "#7A4A2B", label: { en: "Brown", th: "น้ำตาล" },
    promptFragment: { en: "color it medium warm brown", th: "ทำสีผมเป็นสีน้ำตาลโทนอุ่น" } },
  { id: "blonde", swatch: "#D4AF6E", label: { en: "Blonde", th: "บลอนด์" },
    promptFragment: { en: "color it warm honey blonde", th: "ทำสีผมเป็นสีบลอนด์โทนน้ำผึ้ง" } },
  { id: "ginger", swatch: "#B5562B", label: { en: "Ginger", th: "ส้มอบเชย" },
    promptFragment: { en: "color it natural ginger / copper red", th: "ทำสีผมเป็นสีส้มทองแดงธรรมชาติ" } },
  { id: "burgundy", swatch: "#7A2A35", label: { en: "Burgundy", th: "ไวน์แดง" },
    promptFragment: { en: "color it deep burgundy red", th: "ทำสีผมเป็นสีไวน์แดงเข้ม" } },
  { id: "pastel", swatch: "#C9A0C7", label: { en: "Pastel", th: "พาสเทล" },
    promptFragment: { en: "color it soft pastel lavender-pink", th: "ทำสีผมเป็นสีพาสเทลม่วง-ชมพูนุ่มๆ" } },
];

export function getColor(id: string): ColorOption | undefined {
  return COLORS.find((c) => c.id === id);
}
