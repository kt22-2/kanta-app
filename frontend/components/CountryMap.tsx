"use client";

import { useEffect, useRef } from "react";

interface Props {
  latitude: number;
  longitude: number;
  name: string;
}

export default function CountryMap({ latitude, longitude, name }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !containerRef.current || mapRef.current) return;

      // Leaflet CSS を動的に注入
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        dragging: false,
        touchZoom: false,
        keyboard: false,
        boxZoom: false,
      }).setView([latitude, longitude], 3);

      // CartoDB Voyager タイル（ライト・カラフル）
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        { subdomains: "abcd" }
      ).addTo(map);

      // ゴールドのカスタムマーカー
      const icon = L.divIcon({
        html: `<div style="
          width: 14px; height: 14px;
          background: #C8A96E;
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 0 8px rgba(200,169,110,0.8);
        "></div>`,
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      L.marker([latitude, longitude], { icon }).addTo(map);

      mapRef.current = map;
    });

    return () => {
      isMounted = false;
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove();
        mapRef.current = null;
      }
    };
  }, [latitude, longitude]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      aria-label={`${name}の世界地図上の位置`}
    />
  );
}
