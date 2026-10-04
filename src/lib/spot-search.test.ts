import { describe, expect, it } from "vitest";
import { buildSpotWhere } from "./spot-search";

describe("buildSpotWhere", () => {
  it("builds keyword conditions for name, impression and description", () => {
    const where = buildSpotWhere("庭園", "", "owner");
    expect(where.ownerId).toBe("owner");
    expect(where.AND).toEqual([{
      OR: [
        { name: { contains: "庭園", mode: "insensitive" } },
        { impression: { contains: "庭園", mode: "insensitive" } },
        { description: { contains: "庭園", mode: "insensitive" } },
      ],
    }]);
  });
  it("combines a label filter with keyword conditions", () => {
    const where = buildSpotWhere("駅", "label-id", "owner");
    expect(where.AND).toHaveLength(2);
    expect((where.AND as object[])[1]).toEqual({ labels: { some: { labelId: "label-id" } } });
  });
  it("returns no restrictions for empty conditions", () => {
    expect(buildSpotWhere("", "", "owner")).toEqual({ ownerId: "owner", AND: [] });
  });
});
