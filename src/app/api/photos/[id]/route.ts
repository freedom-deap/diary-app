import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readStoredPhoto } from "@/lib/photo-storage";
import { getAuthenticatedUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const username = await getAuthenticatedUser();
  if (!username) return new NextResponse("Unauthorized", { status: 401 });
  const ownerId = process.env.AUTH_OWNER_ID ?? "owner";
  const photo = await prisma.photo.findFirst({ where: { id, spot: { ownerId } }, select: { storageKey: true } });
  if (!photo) return new NextResponse("Not found", { status: 404 });
  try {
    const image = await readStoredPhoto(photo.storageKey, request.nextUrl.searchParams.get("variant") === "thumbnail");
    return new NextResponse(new Uint8Array(image), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "private, max-age=86400" },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
