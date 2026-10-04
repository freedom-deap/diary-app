import { describe, expect, it } from "vitest";
import { readLabelIds, validateLabel } from "./label-validation";

describe("label validation", () => {
  it("accepts a name and color", () => {
    const data = new FormData(); data.set("name", " 庭園 "); data.set("color", "#228855");
    expect(validateLabel(data)).toEqual({ data: { name: "庭園", color: "#228855" } });
  });
  it("rejects invalid colors", () => {
    const data = new FormData(); data.set("name", "庭園"); data.set("color", "green");
    expect(validateLabel(data).error).toBeDefined();
  });
  it("deduplicates valid label ids", () => {
    const id = "123e4567-e89b-12d3-a456-426614174000";
    const data = new FormData(); data.append("labelIds", id); data.append("labelIds", id); data.append("labelIds", "invalid");
    expect(readLabelIds(data)).toEqual([id]);
  });
});
