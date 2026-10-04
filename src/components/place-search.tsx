"use client";

import { useState } from "react";

type SearchResult = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string | null;
};

export function PlaceSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [message, setMessage] = useState("スポット名を入力して検索してください。");
  const [searching, setSearching] = useState(false);

  async function search() {
    const nameInput = document.getElementById("name") as HTMLInputElement | null;
    const query = nameInput?.value.trim() ?? "";
    if (query.length < 2) { setMessage("2文字以上のスポット名を入力してください。"); return; }
    setSearching(true);
    setMessage("候補を検索しています…");
    setResults([]);
    try {
      const response = await fetch(`/api/places/search?q=${encodeURIComponent(query)}`);
      const body = await response.json() as { results?: SearchResult[]; error?: string };
      if (!response.ok) throw new Error(body.error);
      const candidates = body.results ?? [];
      setResults(candidates);
      setMessage(candidates.length ? "該当する場所を選択してください。" : "候補が見つかりませんでした。緯度・経度を直接入力できます。");
    } catch (error) {
      setMessage(error instanceof Error && error.message ? error.message : "場所を検索できませんでした。");
    } finally { setSearching(false); }
  }

  function selectPlace(place: SearchResult) {
    updateInput("name", place.name);
    updateInput("address", place.address);
    updateInput("latitude", place.latitude.toFixed(6));
    updateInput("longitude", place.longitude.toFixed(6));
    setMessage(`${place.name}を選択しました。座標と確認用地図を確認してください。`);
    setResults([]);
  }

  return <div className="place-search">
    <div className="place-search-heading">
      <div><h2>名称から位置を検索</h2><p>{message}</p></div>
      <button className="button secondary compact" type="button" onClick={search} disabled={searching}>{searching ? "検索中…" : "候補を検索"}</button>
    </div>
    {results.length ? <ul className="place-results">{results.map((place) =>
      <li key={place.id}><button type="button" onClick={() => selectPlace(place)}>
        <strong>{place.name}</strong><span>{place.address}</span>
      </button></li>)}</ul> : null}
    <p className="map-attribution">検索データ © OpenStreetMap contributors</p>
  </div>;
}

function updateInput(id: string, value: string) {
  const input = document.getElementById(id) as HTMLInputElement | null;
  if (!input) return;
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}
