export type SpotField = "name" | "latitude" | "longitude" | "address" | "description" | "impression" | "visitedAt";
export type SpotFormValues = Record<SpotField, string>;
export type SpotFormErrors = Partial<Record<SpotField | "form", string>>;
export type SpotInput = {
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  description: string | null;
  impression: string | null;
  visitedAt: Date | null;
};
export type SpotValidationResult =
  | { success: true; data: SpotInput; values: SpotFormValues }
  | { success: false; errors: SpotFormErrors; values: SpotFormValues };

const fields: SpotField[] = ["name", "latitude", "longitude", "address", "description", "impression", "visitedAt"];

export function readSpotForm(formData: FormData): SpotFormValues {
  return Object.fromEntries(fields.map((field) => {
    const value = formData.get(field);
    return [field, typeof value === "string" ? value.trim() : ""];
  })) as SpotFormValues;
}

export function validateSpot(values: SpotFormValues): SpotValidationResult {
  const errors: SpotFormErrors = {};
  const latitude = Number(values.latitude);
  const longitude = Number(values.longitude);

  if (!values.name) errors.name = "スポット名を入力してください。";
  else if (values.name.length > 120) errors.name = "スポット名は120文字以内で入力してください。";
  if (!values.latitude) errors.latitude = "緯度を入力してください。";
  else if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) errors.latitude = "緯度は-90から90の数値で入力してください。";
  if (!values.longitude) errors.longitude = "経度を入力してください。";
  else if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) errors.longitude = "経度は-180から180の数値で入力してください。";
  if (values.address.length > 300) errors.address = "住所は300文字以内で入力してください。";

  let visitedAt: Date | null = null;
  if (values.visitedAt) {
    const candidate = new Date(`${values.visitedAt}T00:00:00.000Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(values.visitedAt) ||
      Number.isNaN(candidate.getTime()) ||
      candidate.toISOString().slice(0, 10) !== values.visitedAt
    ) errors.visitedAt = "訪問日を正しく入力してください。";
    else visitedAt = candidate;
  }

  if (Object.keys(errors).length) return { success: false, errors, values };
  return { success: true, values, data: {
    name: values.name, latitude, longitude, address: values.address || null,
    description: values.description || null, impression: values.impression || null, visitedAt,
  } };
}
