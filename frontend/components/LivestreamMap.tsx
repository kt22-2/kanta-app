"use client";

import { useEffect, useRef } from "react";
import type { LivestreamPoint } from "@/lib/livestream-data";

interface Props {
  points: LivestreamPoint[];
}

export default function LivestreamMap({ points }: Props) {
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
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: true,
        worldCopyJump: false,
        maxBounds: [[-90, -180], [90, 180]],
        maxBoundsViscosity: 1.0,
        minZoom: 2,
      }).setView([20, 0], 2);

      // CartoDB Positron タイル（明るいマップ）
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        { subdomains: "abcd", noWrap: true }
      ).addTo(map);

      // ポリライン（金色破線で全ポイントを結ぶ）
      const coords = points.map(
        (p) => [p.lat, p.lng] as [number, number]
      );
      L.polyline(coords, {
        color: "#C8A96E",
        weight: 2,
        opacity: 0.7,
        dashArray: "8,12",
      }).addTo(map);

      // マーカー
      points.forEach((point) => {
        const icon = L.divIcon({
          html: `<div style="
            width: 24px; height: 24px;
            background: #C8A96E;
            border-radius: 50%;
            border: 2px solid #fff;
            box-shadow: 0 0 8px rgba(200,169,110,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
            color: #0F1923;
          ">${point.id}</div>`,
          className: "",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([point.lat, point.lng], { icon }).addTo(
          map
        );

        marker.bindPopup(`
          <div style="min-width: 200px;">
            <div style="font-weight: bold; margin-bottom: 4px;">${point.title}</div>
            <div style="font-size: 12px; opacity: 0.8; margin-bottom: 8px;">
              ${point.city}, ${point.country} — ${point.date}
            </div>
            <a href="${point.youtubeUrl}" target="_blank" rel="noopener noreferrer"
               style="color: #C8A96E; text-decoration: underline; font-size: 13px;">
              YouTubeで見る ▶
            </a>
          </div>
        `);
      });

      // 全マーカーが収まるようにズーム調整
      if (coords.length > 0) {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [40, 40] });
      }

      mapRef.current = map;
    });

    return () => {
      isMounted = false;
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove();
        mapRef.current = null;
      }
    };
  }, [points]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden"
      aria-label="ライブ配信地図"
    />
  );
}
