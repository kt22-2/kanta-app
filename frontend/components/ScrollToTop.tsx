"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-accent/90 text-background shadow-lg shadow-accent/20 backdrop-blur-sm transition-all duration-300 hover:bg-accent hover:shadow-accent/30 hover:scale-110 animate-fade-in"
      aria-label="ページトップへ戻る"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
