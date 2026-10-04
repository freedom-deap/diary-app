"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { validateLabel } from "@/lib/label-validation";
import { requireOwnerId } from "@/lib/auth";

export type LabelActionState = { error?: string; success?: string };

export async function createLabel(_state: LabelActionState, formData: FormData): Promise<LabelActionState> {
  const ownerId = await requireOwnerId();
  const result = validateLabel(formData);
  if (!result.data) return { error: result.error };
  try { await prisma.label.create({ data: { ...result.data, ownerId } }); }
  catch { return { error: "同じ名前のラベルが存在するか、保存に失敗しました。" }; }
  revalidatePath("/"); revalidatePath("/labels");
  return { success: "ラベルを作成しました。" };
}

export async function updateLabel(id: string, _state: LabelActionState, formData: FormData): Promise<LabelActionState> {
  const ownerId = await requireOwnerId();
  const result = validateLabel(formData);
  if (!result.data) return { error: result.error };
  try {
    const updated = await prisma.label.updateMany({ where: { id, ownerId }, data: result.data });
    if (!updated.count) throw new Error("not found");
  }
  catch { return { error: "同じ名前のラベルが存在するか、更新対象が見つかりません。" }; }
  revalidatePath("/"); revalidatePath("/labels");
  return { success: "ラベルを更新しました。" };
}

export async function deleteLabel(id: string) {
  const ownerId = await requireOwnerId();
  await prisma.label.deleteMany({ where: { id, ownerId } });
  revalidatePath("/"); revalidatePath("/labels");
}
