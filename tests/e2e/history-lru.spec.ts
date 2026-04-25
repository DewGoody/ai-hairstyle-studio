import { test, expect } from "@playwright/test";

test("history drawer shows entries and persists across reloads", async ({ page }) => {
  await page.goto("/en");
  await page.evaluate(() => {
    const big = "data:image/webp;base64," + "A".repeat(50_000);
    const list = Array.from({ length: 5 }, (_, i) => ({
      id: `e${i}`,
      createdAt: Date.now() - i * 1000,
      thumbnailBase64: big,
      presetId: "female-bob",
      colorId: "blonde",
    }));
    localStorage.setItem("hairstyle-history-v1", JSON.stringify(list));
  });
  await page.reload();
  await page.getByText("Recent").click();
  await expect(page.locator("aside img")).toHaveCount(5);
});
