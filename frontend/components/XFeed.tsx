"use client";

import { useEffect, useRef } from "react";
import { KANTA_SOCIAL } from "@/lib/livestream-data";

export default function XFeed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // X widgets.js を一度だけ読み込む
    if (!scriptLoaded.current) {
      const existing = document.getElementById("x-widgets-js");
      if (!existing) {
        const script = document.createElement("script");
        script.id = "x-widgets-js";
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        document.body.appendChild(script);
      }
      scriptLoaded.current = true;
    }

    // widgets.js が既に読み込まれている場合はタイムラインを再レンダリング
    const win = window as unknown as { twttr?: { widgets?: { load?: (el: HTMLElement) => void } } };
    if (win.twttr?.widgets?.load) {
      win.twttr.widgets.load(containerRef.current);
    }
  }, []);

  return (
    <div ref={containerRef} data-testid="x-timeline">
      <a
        className="twitter-timeline"
        data-theme="dark"
        data-chrome="noheader nofooter noborders transparent"
        data-height="600"
        href={KANTA_SOCIAL.x}
        aria-label="X タイムライン"
      >
        読み込み中...
      </a>
    </div>
  );
}
