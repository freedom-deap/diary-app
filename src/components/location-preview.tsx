"use client";

import { useEffect, useMemo, useState } from "react";
import { isCoordinate } from "@/lib/map";
import { SpotMap } from "./spot-map";

export function LocationPreview({ initialLatitude, initialLongitude }: { initialLatitude: string; initialLongitude: string }) {
  const [coordinate, setCoordinate] = useState({ latitude: initialLatitude, longitude: initialLongitude });

  useEffect(() => {
    const latitude = document.getElementById("latitude") as HTMLInputElement | null;
    const longitude = document.getElementById("longitude") as HTMLInputElement | null;
    const update = () => setCoordinate({ latitude: latitude?.value ?? "", longitude: longitude?.value ?? "" });
    latitude?.addEventListener("input", update);
    longitude?.addEventListener("input", update);
    return () => { latitude?.removeEventListener("input", update); longitude?.removeEventListener("input", update); };
  }, []);

  const latitude = Number(coordinate.latitude);
  const longitude = Number(coordinate.longitude);
  const spots = useMemo(() => [{ id: "preview", name: "選択位置", latitude, longitude }], [latitude, longitude]);
  const valid = coordinate.latitude !== "" && coordinate.longitude !== "" && isCoordinate(latitude, longitude);

  return <div className="location-preview">
    <h2>位置の確認</h2>
    {valid ? <SpotMap spots={spots} interactive={false} /> : <div className="map-placeholder">名称検索で候補を選ぶか、緯度・経度を入力すると地図を表示します。</div>}
    {valid ? <p className="field-hint">この地図は確認専用です。位置を変更する場合は検索候補または座標入力を使用してください。</p> : null}
  </div>;
}
