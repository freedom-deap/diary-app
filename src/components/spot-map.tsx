"use client";

import { useEffect, useRef } from "react";
import { LngLatBounds, Map, Marker, NavigationControl, Popup } from "maplibre-gl";
import { baseMapStyle, JAPAN_CENTER } from "@/lib/map";

export type MapSpot = { id: string; name: string; latitude: number; longitude: number; address?: string | null };

export function SpotMap({ spots, interactive = true }: { spots: MapSpot[]; interactive?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const first = spots[0];
    const map = new Map({
      container: containerRef.current,
      style: baseMapStyle,
      center: first ? [first.longitude, first.latitude] : JAPAN_CENTER,
      zoom: spots.length === 1 ? 14 : 4,
      interactive,
    });
    if (interactive) map.addControl(new NavigationControl(), "top-right");
    const bounds = new LngLatBounds();
    for (const spot of spots) {
      const marker = new Marker({ color: "#b4522d" }).setLngLat([spot.longitude, spot.latitude]);
      if (interactive) {
        const content = document.createElement("div");
        const link = document.createElement("a");
        link.href = `/spots/${spot.id}`;
        link.textContent = spot.name;
        link.className = "map-popup-link";
        content.append(link);
        if (spot.address) { const address = document.createElement("p"); address.textContent = spot.address; content.append(address); }
        marker.setPopup(new Popup({ offset: 24 }).setDOMContent(content));
      }
      marker.addTo(map);
      bounds.extend([spot.longitude, spot.latitude]);
    }
    if (spots.length > 1) map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
    return () => map.remove();
  }, [interactive, spots]);
  return <div className="map-canvas overview-map" ref={containerRef} aria-label="登録済みスポットの地図" />;
}
