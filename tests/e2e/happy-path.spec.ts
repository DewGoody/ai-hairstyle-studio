import { test, expect } from "@playwright/test";
import path from "node:path";

const FIXTURE_IMAGE = path.resolve(__dirname, "../fixtures/face.jpg");

test("happy path: upload → customize → result", async ({ page, context }) => {
  await context.route("**/api/generate", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        generatedImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        remaining: 4,
      }),
    });
  });

  await page.goto("/en");
  await expect(page.getByText("Bring your face.")).toBeVisible();

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByText("Tap to upload").click();
  const chooser = await fileChooserPromise;
  await chooser.setFiles(FIXTURE_IMAGE);

  await page.getByRole("button", { name: /Continue/ }).click();

  await expect(page.getByText("Choose your look.")).toBeVisible();
  await page.getByRole("button", { name: "Bob" }).click();
  await page.getByRole("button", { name: "Blonde" }).click();
  await page.getByRole("button", { name: /Generate/ }).click();

  await expect(page.getByText("Here you are.")).toBeVisible();
  await expect(page.getByRole("button", { name: /Save/ })).toBeVisible();
});
