import path from "node:path";
import type { Page } from "@playwright/test";

export const FIXTURE_IMAGE = path.resolve(__dirname, "../fixtures/face.jpg");

export async function uploadAndPick(page: Page) {
  const chooserPromise = page.waitForEvent("filechooser");
  await page.getByText(/Tap to upload|แตะเพื่ออัพโหลด/).click();
  const chooser = await chooserPromise;
  await chooser.setFiles(FIXTURE_IMAGE);
  await page.getByRole("button", { name: /Continue|ถัดไป/ }).click();
  await page.getByRole("button", { name: /Bob|บ๊อบ/ }).click();
  await page.getByRole("button", { name: /Blonde|บลอนด์/ }).click();
}
