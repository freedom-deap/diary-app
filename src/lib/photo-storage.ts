import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

const SUPPORTED_FORMATS = new Set(["jpeg", "png", "webp"]);

export type StoredPhoto = { storageKey: string; width: number; height: number; mimeType: "image/webp" };

let storage: { client: S3Client; bucket: string } | undefined;

function getStorage() {
  if (storage) return storage;

  const accountId = required("R2_ACCOUNT_ID");
  const bucket = required("R2_BUCKET_NAME");
  const accessKeyId = required("R2_ACCESS_KEY_ID");
  const secretAccessKey = required("R2_SECRET_ACCESS_KEY");
  const endpoint = process.env.R2_ENDPOINT?.trim() || `https://${accountId}.r2.cloudflarestorage.com`;

  storage = {
    client: new S3Client({ region: "auto", endpoint, credentials: { accessKeyId, secretAccessKey } }),
    bucket,
  };
  return storage;
}

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function objectKey(storageKey: string, thumbnail: boolean) {
  if (!/^[0-9a-f-]{36}$/.test(storageKey)) throw new Error("invalid storage key");
  return `${storageKey}${thumbnail ? "-thumb" : ""}.webp`;
}

export async function storePhoto(input: Buffer): Promise<StoredPhoto> {
  const metadata = await sharp(input, { failOn: "error" }).metadata();
  if (!metadata.format || !SUPPORTED_FORMATS.has(metadata.format)) throw new Error("unsupported image format");

  const storageKey = randomUUID();
  const image = sharp(input, { failOn: "error" }).rotate().resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true });
  const [main, thumbnail] = await Promise.all([
    image.clone().webp({ quality: 82 }).toBuffer({ resolveWithObject: true }),
    image.clone().resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true }).webp({ quality: 76 }).toBuffer(),
  ]);

  const { client, bucket } = getStorage();
  const uploads = await Promise.allSettled([
    client.send(new PutObjectCommand({ Bucket: bucket, Key: objectKey(storageKey, false), Body: main.data, ContentType: "image/webp" })),
    client.send(new PutObjectCommand({ Bucket: bucket, Key: objectKey(storageKey, true), Body: thumbnail, ContentType: "image/webp" })),
  ]);
  const failure = uploads.find((result): result is PromiseRejectedResult => result.status === "rejected");
  if (failure) {
    await removeStoredPhoto(storageKey);
    throw failure.reason;
  }
  return { storageKey, width: main.info.width, height: main.info.height, mimeType: "image/webp" };
}

export async function readStoredPhoto(storageKey: string, thumbnail: boolean) {
  const { client, bucket } = getStorage();
  const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: objectKey(storageKey, thumbnail) }));
  if (!response.Body) throw new Error("photo object has no body");
  return Buffer.from(await response.Body.transformToByteArray());
}

export async function removeStoredPhoto(storageKey: string) {
  const { client, bucket } = getStorage();
  const results = await Promise.allSettled([
    client.send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey(storageKey, false) })),
    client.send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey(storageKey, true) })),
  ]);
  for (const result of results) {
    if (result.status === "rejected") console.error("Photo deletion failed", result.reason);
  }
}
