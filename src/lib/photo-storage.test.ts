import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, describe, expect, it, vi } from "vitest";

const directories: string[] = [];

afterEach(async () => {
  vi.resetModules();
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("photo storage", () => {
  it("creates uncropped WebP variants that preserve the original aspect ratio", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "outing-photo-"));
    directories.push(directory);
    process.env.PHOTO_STORAGE_PATH = directory;
    const storage = await import("./photo-storage");
    const source = await sharp({ create: { width: 4000, height: 3000, channels: 3, background: "#b4522d" } }).png().toBuffer();
    const saved = await storage.storePhoto(source);
    expect(saved).toMatchObject({ width: 2560, height: 1920, mimeType: "image/webp" });
    await expect(sharp(await storage.readStoredPhoto(saved.storageKey, false)).metadata()).resolves.toMatchObject({ format: "webp", width: 2560, height: 1920 });
    await expect(sharp(await storage.readStoredPhoto(saved.storageKey, true)).metadata()).resolves.toMatchObject({ format: "webp", width: 640, height: 480 });
    await storage.removeStoredPhoto(saved.storageKey);
    await expect(readFile(path.join(directory, `${saved.storageKey}.webp`))).rejects.toThrow();
  });
});
