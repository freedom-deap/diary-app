"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { SpotMap, type MapSpot } from "./spot-map";

type SpotSummary = MapSpot & { visitedAt: string | null; impression: string | null; thumbnailUrl: string | null; labels: Array<{ id: string; name: string; color: string | null }> };

export function SpotExplorer({ spots }: { spots: SpotSummary[] }) {
  const [view, setView] = useState<"list" | "map">("list");
  return <section className="list-section" aria-labelledby="spot-list-title">
    <div className="section-heading">
      <div><h2 id="spot-list-title">スポット一覧</h2><span>{spots.length}件</span></div>
      {spots.length ? <div className="view-switch" aria-label="表示方法">
        <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>一覧</button>
        <button type="button" aria-pressed={view === "map"} onClick={() => setView("map")}>地図</button>
      </div> : null}
    </div>
    {!spots.length ? <div className="empty-state"><p>まだスポットがありません。</p><Link href="/spots/new">最初の場所を記録する</Link></div> : null}
    {spots.length && view === "list" ? <div className="spot-grid">{spots.map((spot) =>
      <Link className="spot-card" href={`/spots/${spot.id}`} key={spot.id}>
        {spot.thumbnailUrl ? <Image className="spot-thumbnail" src={spot.thumbnailUrl} alt="" width={640} height={480} unoptimized /> : null}
        <div className="spot-card-content">
        <p className="spot-date">{spot.visitedAt ?? "訪問日未設定"}</p><h3>{spot.name}</h3>
        <p>{spot.address || `${spot.latitude}, ${spot.longitude}`}</p>
        {spot.labels.length ? <div className="label-chips">{spot.labels.map((label) => <span className="label-chip" key={label.id}><span className="label-dot" style={{ backgroundColor: label.color ?? "#b4522d" }} />{label.name}</span>)}</div> : null}
        {spot.impression ? <p className="spot-excerpt">{spot.impression}</p> : null}
        </div>
      </Link>)}</div> : null}
    {spots.length && view === "map" ? <SpotMap spots={spots} /> : null}
  </section>;
}
