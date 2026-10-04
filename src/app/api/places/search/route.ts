import { NextRequest, NextResponse } from "next/server";

type NominatimPlace = {
  place_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  type?: string;
};

type SearchResult = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string | null;
};

const cache = new Map<string, { expiresAt: number; results: SearchResult[] }>();
let requestQueue = Promise.resolve();
let lastRequestAt = 0;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2 || query.length > 120) {
    return NextResponse.json({ error: "スポット名は2文字以上120文字以内で入力してください。" }, { status: 400 });
  }

  const cacheKey = query.toLocaleLowerCase("ja-JP");
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return NextResponse.json({ results: cached.results });

  const userAgent = process.env.NOMINATIM_USER_AGENT;
  if (!userAgent) {
    return NextResponse.json({ error: "NOMINATIM_USER_AGENTが未設定です。config.mdを確認してください。" }, { status: 503 });
  }

  try {
    const results = await enqueueRequest(async () => {
      const endpoint = new URL("/search", process.env.NOMINATIM_BASE_URL ?? "https://nominatim.openstreetmap.org");
      endpoint.search = new URLSearchParams({ q: query, format: "jsonv2", addressdetails: "1", limit: "6", "accept-language": "ja" }).toString();
      const response = await fetch(endpoint, {
        headers: { "User-Agent": userAgent, Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`Nominatim returned ${response.status}`);
      const places = await response.json() as NominatimPlace[];
      return places.flatMap((place): SearchResult[] => {
        const latitude = Number(place.lat);
        const longitude = Number(place.lon);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];
        return [{
          id: String(place.place_id),
          name: place.name?.trim() || place.display_name.split(",")[0].trim(),
          address: place.display_name,
          latitude,
          longitude,
          type: place.type ?? null,
        }];
      });
    });
    cache.set(cacheKey, { expiresAt: Date.now() + 24 * 60 * 60 * 1000, results });
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Place search failed", error);
    return NextResponse.json({ error: "場所を検索できませんでした。時間をおいて再度お試しください。" }, { status: 502 });
  }
}

function enqueueRequest<T>(operation: () => Promise<T>): Promise<T> {
  const next = requestQueue.then(async () => {
    const waitMs = Math.max(0, 1000 - (Date.now() - lastRequestAt));
    if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
    lastRequestAt = Date.now();
    return operation();
  });
  requestQueue = next.then(() => undefined, () => undefined);
  return next;
}
