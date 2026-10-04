"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { removeStoredPhoto, storePhoto } from "@/lib/photo-storage";
import { validatePhotoSelection } from "@/lib/photo-validation";
import { readLabelIds } from "@/lib/label-validation";
import { requireOwnerId } from "@/lib/auth";
import { readSpotForm, validateSpot, type SpotFormErrors, type SpotFormValues } from "@/lib/spot-validation";

export type SpotFormState = { errors: SpotFormErrors; values?: SpotFormValues; selectedLabelIds?: string[] };
export type PhotoUploadState = { error?: string; success?: string };

export async function createSpot(_state: SpotFormState, formData: FormData): Promise<SpotFormState> {
  const ownerId = await requireOwnerId();
  const result = validateSpot(readSpotForm(formData));
  const labelIds = await ownedLabelIds(ownerId, readLabelIds(formData));
  if (!result.success) return { errors: result.errors, values: result.values, selectedLabelIds: labelIds };
  let spot;
  try { spot = await prisma.spot.create({ data: { ...result.data, ownerId, labels: { create: labelIds.map((labelId) => ({ labelId })) } } }); }
  catch { return { errors: { form: "スポットを保存できませんでした。時間をおいて再度お試しください。" }, values: result.values, selectedLabelIds: labelIds }; }
  revalidatePath("/");
  redirect(`/spots/${spot.id}`);
}

export async function updateSpot(id: string, _state: SpotFormState, formData: FormData): Promise<SpotFormState> {
  const ownerId = await requireOwnerId();
  const result = validateSpot(readSpotForm(formData));
  const labelIds = await ownedLabelIds(ownerId, readLabelIds(formData));
  if (!result.success) return { errors: result.errors, values: result.values, selectedLabelIds: labelIds };
  try {
    const owned = await prisma.spot.count({ where: { id, ownerId } });
    if (!owned) throw new Error("not found");
    await prisma.spot.update({ where: { id }, data: { ...result.data, labels: { deleteMany: {}, create: labelIds.map((labelId) => ({ labelId })) } } });
  }
  catch { return { errors: { form: "スポットを更新できませんでした。対象が存在するか確認してください。" }, values: result.values, selectedLabelIds: labelIds }; }
  revalidatePath("/");
  revalidatePath(`/spots/${id}`);
  redirect(`/spots/${id}`);
}

export async function deleteSpot(id: string): Promise<void> {
  const ownerId = await requireOwnerId();
  const photos = await prisma.photo.findMany({ where: { spotId: id, spot: { ownerId } }, select: { storageKey: true } });
  const owned = await prisma.spot.count({ where: { id, ownerId } });
  if (!owned) return;
  await prisma.spot.delete({ where: { id } });
  await Promise.all(photos.map((photo) => removeStoredPhoto(photo.storageKey)));
  revalidatePath("/");
  redirect("/");
}

export async function uploadPhotos(id: string, _state: PhotoUploadState, formData: FormData): Promise<PhotoUploadState> {
  const ownerId = await requireOwnerId();
  const files = formData.getAll("photos").filter((value): value is File => value instanceof File && value.size > 0);
  const spot = await prisma.spot.findFirst({
    where: { id, ownerId },
    select: { _count: { select: { photos: true } }, photos: { orderBy: { sortOrder: "desc" }, take: 1, select: { sortOrder: true } } },
  });
  if (!spot) return { error: "対象のスポットが見つかりません。" };
  const errors = validatePhotoSelection(files, spot._count.photos);
  if (errors.length) return { error: errors.join("\n") };

  const stored: Array<{ storageKey: string; width: number; height: number; mimeType: string; originalName: string; sortOrder: number }> = [];
  try {
    let sortOrder = (spot.photos[0]?.sortOrder ?? -1) + 1;
    for (const file of files) {
      const saved = await storePhoto(Buffer.from(await file.arrayBuffer()));
      stored.push({ ...saved, originalName: file.name.slice(0, 255), sortOrder: sortOrder++ });
    }
    await prisma.photo.createMany({ data: stored.map((photo) => ({ ...photo, spotId: id })) });
  } catch (error) {
    console.error("Photo upload failed", error);
    await Promise.all(stored.map((photo) => removeStoredPhoto(photo.storageKey)));
    return { error: "写真を処理できませんでした。JPEG、PNG、WebPの正常な画像か確認してください。" };
  }
  revalidatePath("/");
  revalidatePath(`/spots/${id}`);
  return { success: `${stored.length}枚の写真を追加しました。` };
}

export async function deletePhoto(id: string, photoId: string): Promise<void> {
  const ownerId = await requireOwnerId();
  const photo = await prisma.photo.findFirst({ where: { id: photoId, spotId: id, spot: { ownerId } }, select: { storageKey: true } });
  if (!photo) return;
  await prisma.photo.delete({ where: { id: photoId } });
  await removeStoredPhoto(photo.storageKey);
  revalidatePath("/");
  revalidatePath(`/spots/${id}`);
}

async function ownedLabelIds(ownerId: string, labelIds: string[]) {
  if (!labelIds.length) return [];
  const labels = await prisma.label.findMany({ where: { id: { in: labelIds }, ownerId }, select: { id: true } });
  return labels.map((label) => label.id);
}
