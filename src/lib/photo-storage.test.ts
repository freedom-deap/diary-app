import sharp from "sharp";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockR2 = vi.hoisted(() => ({ objects: new Map<string, Buffer>(), failPutSuffix: "" }));

vi.mock("@aws-sdk/client-s3", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@aws-sdk/client-s3")>();
  return {
    ...actual,
    S3Client: class {
      async send(command: InstanceType<typeof actual.PutObjectCommand> | InstanceType<typeof actual.GetObjectCommand> | InstanceType<typeof actual.DeleteObjectCommand>) {
        if (command instanceof actual.PutObjectCommand) {
          const key = command.input.Key!;
          if (mockR2.failPutSuffix && key.endsWith(mockR2.failPutSuffix)) throw new Error("R2 upload failed");
          mockR2.objects.set(key, Buffer.from(command.input.Body as Buffer));
          return {};
        }
        if (command instanceof actual.GetObjectCommand) {
          const data = mockR2.objects.get(command.input.Key!);
          if (!data) throw new Error("NoSuchKey");
          return { Body: { transformToByteArray: async () => new Uint8Array(data) } };
        }
        if (command instanceof actual.DeleteObjectCommand) {
          mockR2.objects.delete(command.input.Key!);
          return {};
        }
        throw new Error("unexpected command");
      }
    },
  };
});

afterEach(async () => {
  vi.resetModules();
  mockR2.objects.clear();
  mockR2.failPutSuffix = "";
});

describe("photo storage", () => {
  function configureR2() {
    process.env.R2_ACCOUNT_ID = "test-account";
    process.env.R2_BUCKET_NAME = "test-photos";
    process.env.R2_ACCESS_KEY_ID = "test-access-key";
    process.env.R2_SECRET_ACCESS_KEY = "test-secret-key";
  }

  it("stores, reads and removes uncropped WebP variants in R2", async () => {
    configureR2();
    const storage = await import("./photo-storage");
    const source = await sharp({ create: { width: 4000, height: 3000, channels: 3, background: "#b4522d" } }).png().toBuffer();
    const saved = await storage.storePhoto(source);
    expect(saved).toMatchObject({ width: 2560, height: 1920, mimeType: "image/webp" });
    expect([...mockR2.objects.keys()].sort()).toEqual([`${saved.storageKey}-thumb.webp`, `${saved.storageKey}.webp`].sort());
    await expect(sharp(await storage.readStoredPhoto(saved.storageKey, false)).metadata()).resolves.toMatchObject({ format: "webp", width: 2560, height: 1920 });
    await expect(sharp(await storage.readStoredPhoto(saved.storageKey, true)).metadata()).resolves.toMatchObject({ format: "webp", width: 640, height: 480 });
    await storage.removeStoredPhoto(saved.storageKey);
    expect(mockR2.objects.size).toBe(0);
  });

  it("removes both objects if either upload fails", async () => {
    configureR2();
    mockR2.failPutSuffix = "-thumb.webp";
    const storage = await import("./photo-storage");
    const source = await sharp({ create: { width: 100, height: 100, channels: 3, background: "#b4522d" } }).png().toBuffer();
    await expect(storage.storePhoto(source)).rejects.toThrow("R2 upload failed");
    expect(mockR2.objects.size).toBe(0);
  });
});
