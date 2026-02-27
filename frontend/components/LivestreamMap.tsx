"use client";

import { useEffect, useRef } from "react";
import type { LivestreamPoint } from "@/lib/livestream-data";
import {
  groupPointsByLocation,
  buildPopupHtml,
} from "@/lib/livestream-data";

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

      // CartoDB Positron タイル
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        { subdomains: "abcd", noWrap: true }
      ).addTo(map);

      // グループ化
      const groups = groupPointsByLocation(points);

      // ポリライン（グループ座標を結ぶ）
      const coords = groups.map(
        (g) => [g.lat, g.lng] as [number, number]
      );
      L.polyline(coords, {
        color: "#C8A96E",
        weight: 2,
        opacity: 0.7,
        dashArray: "8,12",
      }).addTo(map);

      // マーカー
      groups.forEach((group) => {
        const isMultiple = group.videos.length > 1;
        const size = isMultiple ? 28 : 20;
        const fontSize = isMultiple ? 11 : 0;

        const icon = L.divIcon({
          html: `<div style="
            width: ${size}px; height: ${size}px;
            background: #C8A96E;
            border-radius: 50%;
            border: 2px solid #fff;
            box-shadow: 0 0 8px rgba(200,169,110,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${fontSize}px;
            font-weight: bold;
            color: #0F1923;
          ">${isMultiple ? group.videos.length : ""}</div>`,
          className: "",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L.marker([group.lat, group.lng], { icon }).addTo(map);
        marker.bindPopup(buildPopupHtml(group), {
          className: "yt-popup-wrapper",
          maxWidth: 340,
          minWidth: 280,
        });
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
