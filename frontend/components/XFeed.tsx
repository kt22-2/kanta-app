"use client";

import { useEffect, useRef, useState } from "react";
import { KANTA_SOCIAL } from "@/lib/livestream-data";

type TwttrWindow = Window &
  typeof globalThis & {
    twttr?: {
      widgets?: {
        load?: (el: HTMLElement) => void;
      };
      ready?: (callback: () => void) => void;
    };
  };

export default function XFeed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const win = window as TwttrWindow;

    // 既にスクリプトが存在する場合
    const existing = document.getElementById("x-widgets-js");
    if (existing) {
      if (win.twttr?.widgets?.load) {
        win.twttr.widgets.load(container);
      } else if (win.twttr?.ready) {
        win.twttr.ready(() => {
          win.twttr?.widgets?.load?.(container);
        });
      }
      scriptLoaded.current = true;
      return;
    }

    // 新規スクリプトを追加
    if (!scriptLoaded.current) {
      const script = document.createElement("script");
      script.id = "x-widgets-js";
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;

      script.onload = () => {
        if (win.twttr?.widgets?.load) {
          win.twttr.widgets.load(container);
        }
      };

      script.onerror = () => {
        setError(true);
      };

      document.body.appendChild(script);
      scriptLoaded.current = true;
    }
  }, []);

  if (error) {
    return (
      <div data-testid="x-timeline" className="text-red-400 text-sm p-4">
        タイムラインの読み込みに失敗しました
      </div>
    );
  }

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
