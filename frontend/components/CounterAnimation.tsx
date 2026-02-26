"use client";

import { useEffect, useRef, useState } from "react";

interface StatItem {
  value: number;
  label: string;
  suffix?: string;
}

const STATS: StatItem[] = [
  { value: 195, label: "カ国対応", suffix: "" },
  { value: 6, label: "時間で安全情報更新", suffix: "" },
  { value: 100, label: "% 無料", suffix: "" },
];

function useCountUp(target: number, duration = 1200, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, start]);
  return count;
}

function StatCounter({ item, start }: { item: StatItem; start: boolean }) {
  const count = useCountUp(item.value, 1200, start);
  return (
    <div className="text-center">
      <div
        className="text-4xl font-black"
        style={{
          background: "linear-gradient(135deg, #C8A96E 0%, #E8C980 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        } as React.CSSProperties}
      >
        {count}{item.suffix}
      </div>
      <div className="text-sm text-[#8899AA] mt-1">{item.label}</div>
    </div>
  );
}

export default function CounterAnimation() {
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative grid grid-cols-3 gap-6 rounded-2xl glass-card p-6 overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(200,169,110,0.05) 0%, transparent 70%)",
        }}
      />
      {STATS.map((item) => (
        <StatCounter key={item.label} item={item} start={started} />
      ))}
    </div>
  );
}
