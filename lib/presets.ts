export type Gender = "female" | "male";
export type LocaleString = { en: string; th: string };

export type Preset = {
  id: string;
  gender: Gender;
  label: LocaleString;
  promptFragment: LocaleString;
  tint: string;
};

export const PRESETS: Preset[] = [
  // Female
  { id: "female-bob", gender: "female", label: { en: "Bob", th: "บ๊อบ" },
    promptFragment: { en: "a chin-length classic bob with clean blunt ends", th: "ทรงบ๊อบยาวระดับคาง ปลายตัดตรง" },
    tint: "linear-gradient(135deg, #8B6F47, #4A3622)" },
  { id: "female-long-wavy", gender: "female", label: { en: "Long Wavy", th: "ยาวลอน" },
    promptFragment: { en: "long loose wavy hair past the shoulders", th: "ผมยาวเป็นลอนสบายๆ ยาวเลยไหล่" },
    tint: "linear-gradient(135deg, #6B4423, #3A2716)" },
  { id: "female-pixie", gender: "female", label: { en: "Pixie", th: "พิกซี่" },
    promptFragment: { en: "a short cropped pixie cut with textured top", th: "ทรงพิกซี่สั้น ด้านบนซอยเป็นเลเยอร์" },
    tint: "linear-gradient(135deg, #4A3826, #2A1D13)" },
  { id: "female-curly-long", gender: "female", label: { en: "Curly Long", th: "หยิกยาว" },
    promptFragment: { en: "long voluminous tight curls", th: "ผมหยิกแน่นยาว มีวอลลุ่ม" },
    tint: "linear-gradient(135deg, #6B3520, #3A1F12)" },
  { id: "female-korean-layered", gender: "female", label: { en: "Korean Layered", th: "เกาหลีเลเยอร์" },
    promptFragment: { en: "Korean-style layered haircut with face-framing curtain bangs", th: "ทรงเลเยอร์สไตล์เกาหลี มีหน้าม้าซีทรู" },
    tint: "linear-gradient(135deg, #A07A4A, #5A3F25)" },
  { id: "female-beach-waves", gender: "female", label: { en: "Beach Waves", th: "บีชเวฟ" },
    promptFragment: { en: "shoulder-length tousled beach waves", th: "ผมยาวประบ่า ลอนนุ่มแบบบีชเวฟ" },
    tint: "linear-gradient(135deg, #C4A06E, #8B6B43)" },
  { id: "female-high-ponytail", gender: "female", label: { en: "High Ponytail", th: "หางม้าสูง" },
    promptFragment: { en: "a sleek high ponytail with smooth crown", th: "หางม้ามัดสูง ผมด้านบนเรียบ" },
    tint: "linear-gradient(135deg, #2A2520, #0F0E0C)" },
  { id: "female-blunt-shoulder", gender: "female", label: { en: "Blunt Shoulder", th: "ตรงประบ่า" },
    promptFragment: { en: "shoulder-length straight hair with blunt ends", th: "ผมตรงยาวประบ่า ปลายตัดตรง" },
    tint: "linear-gradient(135deg, #6E5337, #3F2E1E)" },
  { id: "female-side-swept", gender: "female", label: { en: "Side-swept", th: "ปาดข้าง" },
    promptFragment: { en: "long hair with a deep side part swept across the forehead", th: "ผมยาวแสกข้างลึก ปาดเฉียงผ่านหน้าผาก" },
    tint: "linear-gradient(135deg, #8B6F47, #5A4530)" },
  { id: "female-asymmetric", gender: "female", label: { en: "Asymmetric Cut", th: "ตัดอสมมาตร" },
    promptFragment: { en: "an asymmetric bob, longer on one side", th: "ทรงบ๊อบไม่เท่ากัน ด้านหนึ่งยาวกว่า" },
    tint: "linear-gradient(135deg, #8B4536, #4A2818)" },
  // Male
  { id: "male-two-block", gender: "male", label: { en: "Two-block", th: "ทูบล็อก" },
    promptFragment: { en: "Korean two-block haircut, longer on top with shaved sides", th: "ทรงทูบล็อกสไตล์เกาหลี ด้านบนยาว ด้านข้างไถสั้น" },
    tint: "linear-gradient(135deg, #2A2520, #0F0E0C)" },
  { id: "male-buzz", gender: "male", label: { en: "Buzz Cut", th: "เกรียน" },
    promptFragment: { en: "an even buzz cut, very short all around", th: "ทรงเกรียนทั้งหัว ความยาวเท่ากัน" },
    tint: "linear-gradient(135deg, #3A2D22, #1F1813)" },
  { id: "male-undercut-fade", gender: "male", label: { en: "Undercut Fade", th: "อันเดอร์คัทเฟด" },
    promptFragment: { en: "an undercut with a skin fade and longer textured top", th: "ทรงอันเดอร์คัท ด้านข้างเฟดสั้นมาก ด้านบนซอย" },
    tint: "linear-gradient(135deg, #5A4D43, #2A2520)" },
  { id: "male-comb-over", gender: "male", label: { en: "Comb-over", th: "หวีข้าง" },
    promptFragment: { en: "a side-parted comb-over with neat tapered sides", th: "ทรงหวีแสกข้างเรียบ ข้างเทเปอร์" },
    tint: "linear-gradient(135deg, #6E5337, #4A3520)" },
  { id: "male-pompadour", gender: "male", label: { en: "Pompadour", th: "ปอมปาดัวร์" },
    promptFragment: { en: "a pompadour with volume swept up and back", th: "ทรงปอมปาดัวร์ ด้านบนเป่าฟูปัดไปด้านหลัง" },
    tint: "linear-gradient(135deg, #4F3522, #2D1F14)" },
  { id: "male-shoulder-length", gender: "male", label: { en: "Shoulder-length", th: "ยาวประบ่า" },
    promptFragment: { en: "shoulder-length hair with a soft middle part", th: "ผมยาวประบ่า แสกกลางนุ่มๆ" },
    tint: "linear-gradient(135deg, #7A5934, #4A3520)" },
  { id: "male-slicked-back", gender: "male", label: { en: "Slicked-back", th: "หวีเรียบไปข้างหลัง" },
    promptFragment: { en: "slicked-back glossy hair", th: "ทรงหวีเรียบไปด้านหลัง ดูเงา" },
    tint: "linear-gradient(135deg, #1A1614, #3A2A1F)" },
  { id: "male-crew-cut", gender: "male", label: { en: "Crew Cut", th: "ครูว์คัท" },
    promptFragment: { en: "a classic short crew cut", th: "ทรงครูว์คัทคลาสสิก" },
    tint: "linear-gradient(135deg, #4F3925, #2D1F14)" },
  { id: "male-curly-top", gender: "male", label: { en: "Curly Top", th: "ด้านบนหยิก" },
    promptFragment: { en: "short tapered sides with curly volume on top", th: "ด้านข้างเทเปอร์สั้น ด้านบนหยิกฟู" },
    tint: "linear-gradient(135deg, #5A4530, #2D2014)" },
  { id: "male-modern-mullet", gender: "male", label: { en: "Modern Mullet", th: "มัลเล็ตสมัยใหม่" },
    promptFragment: { en: "a modern mullet — short on top, longer at the back", th: "ทรงมัลเล็ตสมัยใหม่ ด้านบนสั้น ด้านหลังยาว" },
    tint: "linear-gradient(135deg, #6E4A35, #2A1D13)" },
];

export function getPresetsByGender(gender: Gender): Preset[] {
  return PRESETS.filter((p) => p.gender === gender);
}

export function getPreset(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}
