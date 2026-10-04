import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteSpotForm } from "@/components/delete-spot-form";
import { GoogleMapEmbed } from "@/components/google-map-embed";
import { PhotoGallery } from "@/components/photo-gallery";
import { PhotoUploadForm } from "@/components/photo-upload-form";
import { prisma } from "@/lib/prisma";
import { deletePhoto, deleteSpot, uploadPhotos } from "../actions";
import { requireOwnerId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SpotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ownerId = await requireOwnerId();
  const spot = await prisma.spot.findFirst({ where: { id, ownerId }, include: {
    photos: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    labels: { include: { label: true }, orderBy: { label: { name: "asc" } } },
  } });
  if (!spot) notFound();
  return <main className="narrow-page">
    <Link className="back-link" href="/">← 一覧へ戻る</Link>
    <header className="page-header detail-header">
      <div><p className="eyebrow">SPOT</p><h1>{spot.name}</h1><p className="lead">{formatDate(spot.visitedAt) ?? "訪問日未設定"}</p></div>
      <div className="header-actions"><Link className="button secondary" href={`/spots/${spot.id}/edit`}>編集</Link><DeleteSpotForm action={deleteSpot.bind(null, spot.id)} /></div>
    </header>
    <div className="detail-grid">
      <section className="detail-card full-width"><h2>ラベル</h2><div className="label-chips">
        {spot.labels.map(({ label }) => <span className="label-chip" key={label.id} style={{ borderColor: label.color ?? undefined }}><span className="label-dot" style={{ backgroundColor: label.color ?? "#b4522d" }} />{label.name}</span>)}
        {!spot.labels.length ? <p>ラベルはまだありません。</p> : null}
      </div></section>
      <section className="detail-card full-width"><h2>写真</h2>
        <PhotoGallery photos={spot.photos} deleteAction={deletePhoto.bind(null, spot.id)} />
        <PhotoUploadForm action={uploadPhotos.bind(null, spot.id)} remaining={20 - spot.photos.length} />
      </section>
      <section className="detail-card full-width map-detail-card"><h2>地図</h2><GoogleMapEmbed
        latitude={spot.latitude}
        longitude={spot.longitude}
        apiKey={process.env.GOOGLE_MAPS_EMBED_API_KEY}
      /></section>
      <section className="detail-card"><h2>場所</h2><p>{spot.address || "住所未設定"}</p><dl><div><dt>緯度</dt><dd>{spot.latitude}</dd></div><div><dt>経度</dt><dd>{spot.longitude}</dd></div></dl></section>
      <section className="detail-card"><h2>スポット情報</h2><p className="multiline">{spot.description || "情報はまだありません。"}</p></section>
      <section className="detail-card full-width"><h2>自分の感想</h2><p className="multiline">{spot.impression || "感想はまだありません。"}</p></section>
    </div>
  </main>;
}

function formatDate(value: Date | null) { return value?.toLocaleDateString("ja-JP", { dateStyle: "long", timeZone: "UTC" }); }
