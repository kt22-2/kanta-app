"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Section {
  id: string;
  label: string;
}

interface Props {
  sections: Section[];
}

export default function SectionAnchor({ sections }: Props) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const navRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  const updateIndicator = useCallback((id: string) => {
    const btn = buttonRefs.current.get(id);
    const container = containerRef.current;
    const nav = navRef.current;
    if (btn && container && nav) {
      // indicator は container(div.relative) の子なので container 基準で計算
      const containerRect = container.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      // px-3 (12px) 分オフセットしてテキスト幅に合わせる
      const paddingX = 12;
      setIndicatorStyle({
        left: btnRect.left - containerRect.left + nav.scrollLeft + paddingX,
        width: btnRect.width - paddingX * 2,
      });
    }
  }, []);

  useEffect(() => {
    updateIndicator(activeId);
  }, [activeId, updateIndicator]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(section.id);
            }
          });
        },
        { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((o) => o.disconnect());
    };
  }, [sections]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      ref={navRef}
      className="sticky top-14 z-40 -mx-4 mb-6 overflow-x-auto border-b border-white/6 bg-background/80 px-4 backdrop-blur-xl shadow-[0_1px_0_rgba(200,169,110,0.06)]"
      role="tablist"
      aria-label="セクションナビゲーション"
    >
      <div ref={containerRef} className="relative flex gap-1 py-2">
        {/* スライディングインジケーター */}
        <span
          className="absolute bottom-2 h-0.5 rounded-full transition-all duration-300 ease-out"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            background: "linear-gradient(90deg, #C8A96E, #E8C980)",
          }}
        />
        {sections.map((section) => (
          <button
            key={section.id}
            ref={(el) => { if (el) buttonRefs.current.set(section.id, el); }}
            role="tab"
            aria-selected={activeId === section.id}
            onClick={() => handleClick(section.id)}
            className={`relative shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
              activeId === section.id
                ? "text-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
