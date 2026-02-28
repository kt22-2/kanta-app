"use client";

import type { LivestreamPoint } from "@/lib/livestream-data";
import LivestreamMap from "./LivestreamMap";
import XFeed from "./XFeed";

interface Props {
  points: LivestreamPoint[];
}

export default function JourneyMapSection({ points }: Props) {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 min-w-0">
        <LivestreamMap points={points} />
      </div>
      <div className="lg:w-[350px] lg:sticky lg:top-20 lg:self-start">
        <XFeed />
      </div>
    </div>
  );
}
