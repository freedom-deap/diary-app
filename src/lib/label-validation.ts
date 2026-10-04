export type LabelInput = { name: string; color: string | null };

export function validateLabel(formData: FormData): { data?: LabelInput; error?: string } {
  const nameValue = formData.get("name");
  const colorValue = formData.get("color");
  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  const color = typeof colorValue === "string" ? colorValue.trim() : "";
  if (!name) return { error: "ラベル名を入力してください。" };
  if (name.length > 50) return { error: "ラベル名は50文字以内で入力してください。" };
  if (color && !/^#[0-9a-fA-F]{6}$/.test(color)) return { error: "色は#から始まる6桁の16進数で指定してください。" };
  return { data: { name, color: color || null } };
}

export function readLabelIds(formData: FormData) {
  return [...new Set(formData.getAll("labelIds").filter((value): value is string => typeof value === "string" && /^[0-9a-f-]{36}$/.test(value)))];
}
