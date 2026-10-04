import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";
import sharp from "sharp";

function setting(name: string, fallback: string) {
  try {
    const line = readFileSync(".env", "utf8").split(/\r?\n/).find((entry) => entry.startsWith(`${name}=`));
    return line ? line.slice(name.length + 1).trim().replace(/^(["'])(.*)\1$/, "$2") : fallback;
  } catch { return fallback; }
}

test("login, label, spot, photo, search, edit and delete", async ({ page }) => {
  const suffix = Date.now().toString(36);
  const labelName = `E2Eラベル-${suffix}`;
  const originalName = `E2Eスポット-${suffix}`;
  const updatedName = `${originalName}-更新`;
  const photoBuffer = await sharp(randomBytes(768 * 1365 * 3), {
    raw: { width: 768, height: 1365, channels: 3 },
  }).png({ compressionLevel: 0 }).toBuffer();
  expect(photoBuffer.byteLength).toBeGreaterThan(1024 * 1024);

  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel("ユーザー名").fill(setting("AUTH_USERNAME", "diary"));
  await page.getByLabel("パスワード").fill(setting("AUTH_PASSWORD", "local-development-password"));
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/labels");
  const createLabel = page.locator(".detail-card").filter({ has: page.getByRole("heading", { name: "新しいラベル" }) });
  await createLabel.getByLabel("ラベル名").fill(labelName);
  await createLabel.getByRole("button", { name: "作成" }).click();
  await expect(page.locator(".label-row").filter({ hasText: labelName })).toBeVisible();

  await page.goto("/spots/new");
  await page.getByLabel("スポット名必須").fill(originalName);
  await page.getByLabel("緯度必須").fill("35.681236");
  await page.getByLabel("経度必須").fill("139.767125");
  await page.getByLabel(labelName).check();
  await page.getByRole("button", { name: "スポットを保存" }).click();
  await expect(page.getByRole("heading", { name: originalName })).toBeVisible();

  await page.getByLabel(/写真を追加/).setInputFiles({
    name: "e2e.png",
    mimeType: "image/png",
    buffer: photoBuffer,
  });
  await page.getByRole("button", { name: "写真をアップロード" }).click();
  const uploadedImage = page.getByRole("img", { name: /e2e\.png/ });
  await expect(uploadedImage).toBeVisible();
  const imageRatios = await uploadedImage.evaluate((image: HTMLImageElement) => ({
    natural: image.naturalWidth / image.naturalHeight,
    rendered: image.getBoundingClientRect().width / image.getBoundingClientRect().height,
  }));
  expect(Math.abs(imageRatios.natural - imageRatios.rendered)).toBeLessThan(0.01);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

  await page.getByRole("link", { name: "編集" }).click();
  await page.getByLabel("スポット名必須").fill(updatedName);
  await page.getByLabel("自分の感想").fill("E2E検索対象の感想");
  await page.getByRole("button", { name: "変更を保存" }).click();
  await expect(page.getByRole("heading", { name: updatedName })).toBeVisible();

  await page.getByRole("link", { name: "一覧へ戻る" }).click();
  await page.getByLabel("キーワード").fill("E2E検索対象");
  await page.getByLabel("ラベル").selectOption({ label: labelName });
  await page.getByRole("button", { name: "検索" }).click();
  await expect(page.getByRole("heading", { name: updatedName })).toBeVisible();
  await page.getByRole("heading", { name: updatedName }).click();

  await page.locator(".photo-item").getByRole("button", { name: "削除" }).click();
  await expect(page.getByRole("img", { name: /e2e\.png/ })).toHaveCount(0);
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator(".header-actions").getByRole("button", { name: "削除" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/labels");
  const labelRow = page.locator(".label-row").filter({ hasText: labelName });
  await labelRow.getByRole("button", { name: "関連を解除して削除" }).click();
  await expect(labelRow).toHaveCount(0);
});
