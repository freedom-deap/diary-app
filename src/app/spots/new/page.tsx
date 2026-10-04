import Link from "next/link";
import { SpotForm } from "@/components/spot-form";
import { createSpot } from "../actions";
import { prisma } from "@/lib/prisma";
import { requireOwnerId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewSpotPage() {
  const ownerId = await requireOwnerId();
  const labels = await prisma.label.findMany({ where: { ownerId }, orderBy: { name: "asc" } });
  return <main className="narrow-page">
    <Link className="back-link" href="/">← 一覧へ戻る</Link>
    <header className="page-header"><div><p className="eyebrow">NEW SPOT</p><h1>スポットを記録する</h1><p className="lead">場所と、その場所で感じたことを残しましょう。</p></div></header>
    <SpotForm action={createSpot} submitLabel="スポットを保存" cancelHref="/" labels={labels} />
  </main>;
}
