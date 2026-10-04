import { describe, expect, it } from "vitest";
import { validateSpot, type SpotFormValues } from "./spot-validation";

const validValues: SpotFormValues = {
  name: "兼六園", latitude: "36.5621", longitude: "136.6627", address: "石川県金沢市",
  description: "日本庭園", impression: "雪景色が印象的だった。", visitedAt: "2026-01-15",
};

describe("validateSpot", () => {
  it("converts valid values", () => {
    const result = validateSpot(validValues);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.latitude).toBe(36.5621);
      expect(result.data.visitedAt?.toISOString()).toBe("2026-01-15T00:00:00.000Z");
    }
  });
  it("requires a name and coordinates", () => {
    const result = validateSpot({ ...validValues, name: "", latitude: "", longitude: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(Object.keys(result.errors)).toEqual(expect.arrayContaining(["name", "latitude", "longitude"]));
  });
  it("rejects coordinates outside the valid range", () => {
    const result = validateSpot({ ...validValues, latitude: "91", longitude: "-181" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.latitude).toContain("-90");
      expect(result.errors.longitude).toContain("-180");
    }
  });
  it("rejects a nonexistent calendar date", () => {
    const result = validateSpot({ ...validValues, visitedAt: "2026-02-31" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.visitedAt).toBeDefined();
  });
});
