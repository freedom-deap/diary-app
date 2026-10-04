import Link from "next/link";
import { LabelForm } from "@/components/label-form";
import { prisma } from "@/lib/prisma";
import { createLabel, deleteLabel, updateLabel } from "./actions";
import { requireOwnerId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LabelsPage() {
  const ownerId = await requireOwnerId();
  const labels = await prisma.label.findMany({ where: { ownerId }, orderBy: { name: "asc" }, include: { _count: { select: { spots: true } } } });
  return <main className="narrow-page">
    <Link className="back-link" href="/">← 一覧へ戻る</Link>
    <header className="page-header"><div><p className="eyebrow">LABELS</p><h1>ラベル管理</h1><p className="lead">記録を分類し、あとから探しやすくします。</p></div></header>
    <section className="detail-card"><h2>新しいラベル</h2><LabelForm action={createLabel} submitLabel="作成" /></section>
    <section className="label-list" aria-label="ラベル一覧">{labels.map((label) =>
      <article className="detail-card label-row" key={label.id}>
        <div><span className="label-dot" style={{ backgroundColor: label.color ?? "#b4522d" }} /><strong>{label.name}</strong><small>{label._count.spots}件のスポット</small></div>
        <LabelForm action={updateLabel.bind(null, label.id)} submitLabel="更新" initialName={label.name} initialColor={label.color ?? "#b4522d"} />
        <form action={deleteLabel.bind(null, label.id)}><button className="button danger compact" type="submit">関連を解除して削除</button></form>
      </article>)}
      {!labels.length ? <div className="empty-state">ラベルはまだありません。</div> : null}
    </section>
  </main>;
}
