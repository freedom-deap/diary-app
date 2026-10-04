import Link from "next/link";
import { notFound } from "next/navigation";
import { SpotForm } from "@/components/spot-form";
import { prisma } from "@/lib/prisma";
import type { SpotFormValues } from "@/lib/spot-validation";
import { updateSpot } from "../../actions";
import { requireOwnerId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EditSpotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ownerId = await requireOwnerId();
  const [spot, labels] = await Promise.all([
    prisma.spot.findFirst({ where: { id, ownerId }, include: { labels: { select: { labelId: true } } } }),
    prisma.label.findMany({ where: { ownerId }, orderBy: { name: "asc" } }),
  ]);
  if (!spot) notFound();
  const values: SpotFormValues = {
    name: spot.name, latitude: String(spot.latitude), longitude: String(spot.longitude), address: spot.address ?? "",
    description: spot.description ?? "", impression: spot.impression ?? "", visitedAt: spot.visitedAt?.toISOString().slice(0, 10) ?? "",
  };
  return <main className="narrow-page">
    <Link className="back-link" href={`/spots/${spot.id}`}>← 詳細へ戻る</Link>
    <header className="page-header"><div><p className="eyebrow">EDIT SPOT</p><h1>{spot.name}を編集</h1></div></header>
    <SpotForm action={updateSpot.bind(null, spot.id)} initialValues={values} submitLabel="変更を保存" cancelHref={`/spots/${spot.id}`} labels={labels} initialLabelIds={spot.labels.map((item) => item.labelId)} />
  </main>;
}
