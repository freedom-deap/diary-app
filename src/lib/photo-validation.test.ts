import { describe, expect, it } from "vitest";
import { MAX_PHOTO_BYTES, MAX_UPLOAD_BYTES, validatePhotoSelection } from "./photo-validation";

const photo = (overrides: Partial<{ name: string; size: number; type: string }> = {}) => ({
  name: "outing.jpg", size: 1024, type: "image/jpeg", ...overrides,
});

describe("validatePhotoSelection", () => {
  it("accepts supported photos within the limits", () => {
    expect(validatePhotoSelection([photo(), photo({ type: "image/png" })], 2)).toEqual([]);
  });

  it("rejects unsupported and oversized files", () => {
    const errors = validatePhotoSelection([photo({ name: "note.txt", type: "text/plain", size: MAX_PHOTO_BYTES + 1 })], 0);
    expect(errors.join(" ")).toContain("13MB");
    expect(errors.join(" ")).toContain("JPEG");
  });

  it("limits the total number of photos", () => {
    expect(validatePhotoSelection([photo(), photo()], 19).join(" ")).toContain("20枚");
  });

  it("limits the total upload size to 50MB", () => {
    const files = Array.from({ length: 4 }, (_, index) => photo({ name: `${index}.jpg`, size: MAX_PHOTO_BYTES }));
    expect(files.every((file) => file.size <= MAX_PHOTO_BYTES)).toBe(true);
    expect(files.reduce((total, file) => total + file.size, 0)).toBeGreaterThan(MAX_UPLOAD_BYTES);
    expect(validatePhotoSelection(files, 0).join(" ")).toContain("合計サイズは50MB");
  });
});
