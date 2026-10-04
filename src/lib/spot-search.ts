import type { Prisma } from "@prisma/client";

export function buildSpotWhere(query: string, labelId: string, ownerId: string): Prisma.SpotWhereInput {
  return {
    ownerId,
    AND: [
      ...(query ? [{ OR: ["name", "impression", "description"].map((field) => ({ [field]: { contains: query, mode: "insensitive" as const } })) }] : []),
      ...(labelId ? [{ labels: { some: { labelId } } }] : []),
    ],
  };
}
