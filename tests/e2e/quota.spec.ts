import { test, expect } from "@playwright/test";
import { uploadAndPick } from "./_helpers";

test("shows rate-limited error when API returns 429", async ({ page, context }) => {
  await context.route("**/api/generate", async (route) => {
    await route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({ error: "rate_limited", retryAfter: 3600, remaining: 0 }),
    });
  });

  await page.goto("/en");
  await uploadAndPick(page);
  await page.getByRole("button", { name: /Generate/ }).click();
  await expect(page.getByText(/Daily limit|today's limit/)).toBeVisible();
});
