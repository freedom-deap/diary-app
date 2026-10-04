import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SpotExplorer } from "@/components/spot-explorer";
import { buildSpotWhere } from "@/lib/spot-search";
import { requireOwnerId } from "@/lib/auth";
import { LogoutForm } from "@/components/logout-form";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string; label?: string }> }) {
  const params = await searchParams;
  const ownerId = await requireOwnerId();
  const query = params.q?.trim() ?? "";
  const labelId = params.label?.trim() ?? "";
  const where = buildSpotWhere(query, labelId, ownerId);
  const [spots, labels] = await Promise.all([prisma.spot.findMany({
    where,
    orderBy: [{ visitedAt: "desc" }, { createdAt: "desc" }],
    include: {
      photos: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], take: 1, select: { id: true } },
      labels: { include: { label: true }, orderBy: { label: { name: "asc" } } },
    },
  }), prisma.label.findMany({ where: { ownerId }, orderBy: { name: "asc" } })]);
  return (
    <main>
      <header className="page-header home-header">
        <div><p className="eyebrow">OUTING DIARY</p><h1>出かけた場所を、あとから辿れる記録に。</h1><p className="lead">場所の情報と、その日に感じたことをひとつにまとめます。</p></div>
        <div className="header-actions"><LogoutForm /><Link className="button secondary" href="/labels">ラベル管理</Link><Link className="button primary" href="/spots/new">スポットを追加</Link></div>
      </header>
      <form className="search-form" action="/">
        <label>キーワード<input name="q" defaultValue={query} placeholder="スポット名・感想" /></label>
        <label>ラベル<select name="label" defaultValue={labelId}><option value="">すべて</option>{labels.map((label) => <option key={label.id} value={label.id}>{label.name}</option>)}</select></label>
        <button className="button primary compact" type="submit">検索</button>
        {(query || labelId) ? <Link className="button secondary compact" href="/">条件を解除</Link> : null}
      </form>
      <SpotExplorer spots={spots.map((spot) => ({
        id: spot.id, name: spot.name, latitude: spot.latitude, longitude: spot.longitude,
        address: spot.address, impression: spot.impression, visitedAt: formatDate(spot.visitedAt) ?? null,
        thumbnailUrl: spot.photos[0] ? `/api/photos/${spot.photos[0].id}?variant=thumbnail` : null,
        labels: spot.labels.map(({ label }) => label),
      }))} />
    </main>
  );
}

function formatDate(value: Date | null) { return value?.toLocaleDateString("ja-JP", { timeZone: "UTC" }); }
