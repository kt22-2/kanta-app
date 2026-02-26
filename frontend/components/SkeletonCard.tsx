interface Props {
  lines?: number;
  height?: string;
}

export default function SkeletonCard({ lines = 3, height = "h-4" }: Props) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#1C2D3E]/80 p-5 space-y-3 overflow-hidden">
      <div className={`${height} w-1/3 shimmer rounded`} />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 shimmer rounded"
          style={{
            width: `${85 - i * 10}%`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}
