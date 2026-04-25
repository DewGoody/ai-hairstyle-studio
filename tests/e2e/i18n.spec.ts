import { test, expect } from "@playwright/test";

test("Thai → English language toggle swaps every visible string", async ({ page }) => {
  await page.goto("/th");
  await expect(page.getByRole("heading", { name: "ส่งหน้ามาก่อน" })).toBeVisible();

  await page.getByRole("button", { name: /Switch to English/i }).click();
  await expect(page).toHaveURL(/\/en/);
  await expect(page.getByRole("heading", { name: "Bring your face." })).toBeVisible();
});
