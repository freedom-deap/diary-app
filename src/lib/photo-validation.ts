export const MAX_PHOTOS_PER_SPOT = 20;
export const MAX_PHOTO_BYTES = 13 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
export const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type UploadLike = Pick<File, "name" | "size" | "type">;

export function validatePhotoSelection(files: UploadLike[], existingCount: number): string[] {
  const errors: string[] = [];
  if (!files.length) errors.push("写真を1枚以上選択してください。");
  if (existingCount + files.length > MAX_PHOTOS_PER_SPOT) {
    errors.push(`写真は1スポットにつき${MAX_PHOTOS_PER_SPOT}枚までです。`);
  }
  const totalBytes = files.reduce((total, file) => total + file.size, 0);
  if (totalBytes > MAX_UPLOAD_BYTES) errors.push("一度にアップロードできるファイルの合計サイズは50MBまでです。");
  for (const file of files) {
    if (file.size <= 0) errors.push(`${file.name}: 空のファイルはアップロードできません。`);
    if (file.size > MAX_PHOTO_BYTES) errors.push(`${file.name}: ファイルサイズは13MB以下にしてください。`);
    if (!(ACCEPTED_PHOTO_TYPES as readonly string[]).includes(file.type)) {
      errors.push(`${file.name}: JPEG、PNG、WebPのみアップロードできます。`);
    }
  }
  return errors;
}
