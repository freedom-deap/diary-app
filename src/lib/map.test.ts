import { describe, expect, it } from "vitest";
import { isCoordinate } from "./map";

describe("isCoordinate", () => {
  it("accepts valid coordinates", () => expect(isCoordinate(35.6812, 139.7671)).toBe(true));
  it("rejects out-of-range coordinates", () => {
    expect(isCoordinate(91, 139)).toBe(false);
    expect(isCoordinate(35, 181)).toBe(false);
  });
});
