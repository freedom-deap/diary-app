import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PHOTO_DIRECTORY = process.env.PHOTO_STORAGE_PATH ?? path.join(process.cwd(), "storage", "photos");
const SUPPORTED_FORMATS = new Set(["jpeg", "png", "webp"]);

export type StoredPhoto = { storageKey: string; width: number; height: number; mimeType: "image/webp" };

export async function storePhoto(input: Buffer): Promise<StoredPhoto> {
  const metadata = await sharp(input, { failOn: "error" }).metadata();
  if (!metadata.format || !SUPPORTED_FORMATS.has(metadata.format)) throw new Error("unsupported image format");

  const storageKey = randomUUID();
  await mkdir(PHOTO_DIRECTORY, { recursive: true });
  const image = sharp(input, { failOn: "error" }).rotate().resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true });
  const [main, thumbnail] = await Promise.all([
    image.clone().webp({ quality: 82 }).toBuffer({ resolveWithObject: true }),
    image.clone().resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true }).webp({ quality: 76 }).toBuffer(),
  ]);

  const mainPath = storagePath(storageKey, false);
  const thumbnailPath = storagePath(storageKey, true);
  try {
    await writeFile(mainPath, main.data, { flag: "wx" });
    await writeFile(thumbnailPath, thumbnail, { flag: "wx" });
  } catch (error) {
    await Promise.allSettled([unlink(mainPath), unlink(thumbnailPath)]);
    throw error;
  }
  return { storageKey, width: main.info.width, height: main.info.height, mimeType: "image/webp" };
}

export function readStoredPhoto(storageKey: string, thumbnail: boolean) {
  return readFile(storagePath(storageKey, thumbnail));
}

export async function removeStoredPhoto(storageKey: string) {
  await Promise.allSettled([unlink(storagePath(storageKey, false)), unlink(storagePath(storageKey, true))]);
}

function storagePath(storageKey: string, thumbnail: boolean) {
  if (!/^[0-9a-f-]{36}$/.test(storageKey)) throw new Error("invalid storage key");
  return path.join(PHOTO_DIRECTORY, `${storageKey}${thumbnail ? "-thumb" : ""}.webp`);
}
