export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8" role="status" aria-label="読み込み中">
      {/* パンくずスケルトン */}
      <nav className="mb-4 flex items-center gap-1">
        <div className="shimmer h-3 w-10 rounded" />
        <div className="h-3 w-3" />
        <div className="shimmer h-3 w-12 rounded" />
        <div className="h-3 w-3" />
        <div className="shimmer h-3 w-20 rounded" />
      </nav>

      {/* ヘッダーカードスケルトン */}
      <div className="glass-card mb-6 h-56 p-6" data-testid="skeleton-header">
        <div className="flex h-full gap-6">
          {/* 国旗エリア */}
          <div className="shimmer h-full w-1/3 rounded-lg" />
          {/* 情報エリア */}
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <div className="shimmer mb-2 h-8 w-48 rounded" />
              <div className="shimmer mb-1 h-4 w-32 rounded" />
              <div className="shimmer h-4 w-24 rounded" />
            </div>
            <div className="flex gap-3">
              <div className="shimmer h-8 w-20 rounded-full" />
              <div className="shimmer h-8 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* セクションアンカースケルトン */}
      <div
        className="glass-card mb-6 flex items-center gap-2 p-2"
        data-testid="skeleton-anchor"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="shimmer h-8 flex-1 rounded" />
        ))}
      </div>

      {/* 基本情報セクションスケルトン */}
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <div className="shimmer h-8 w-8 rounded-full" />
          <div className="shimmer h-5 w-24 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-4">
              <div className="shimmer mb-2 h-3 w-16 rounded" />
              <div className="shimmer h-5 w-24 rounded" />
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* 安全情報セクションスケルトン */}
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <div className="shimmer h-8 w-8 rounded-full" />
          <div className="shimmer h-5 w-24 rounded" />
        </div>
        <div className="glass-card p-6">
          <div className="shimmer mb-3 h-10 w-32 rounded-lg" />
          <div className="shimmer mb-2 h-4 w-full rounded" />
          <div className="shimmer mb-2 h-4 w-3/4 rounded" />
          <div className="shimmer h-4 w-1/2 rounded" />
        </div>
      </section>

      <div className="section-divider" />

      {/* 入国要件セクションスケルトン */}
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <div className="shimmer h-8 w-8 rounded-full" />
          <div className="shimmer h-5 w-24 rounded" />
        </div>
        <div className="glass-card p-6">
          <div className="shimmer mb-3 h-6 w-40 rounded" />
          <div className="shimmer mb-2 h-4 w-full rounded" />
          <div className="shimmer mb-2 h-4 w-5/6 rounded" />
          <div className="shimmer h-4 w-2/3 rounded" />
        </div>
      </section>

      <div className="section-divider" />

      {/* 観光スポットセクションスケルトン */}
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <div className="shimmer h-8 w-8 rounded-full" />
          <div className="shimmer h-5 w-28 rounded" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card overflow-hidden">
              <div className="shimmer h-40 w-full" />
              <div className="p-4">
                <div className="shimmer mb-2 h-5 w-3/4 rounded" />
                <div className="shimmer h-3 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* 現地ニュースセクションスケルトン */}
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <div className="shimmer h-8 w-8 rounded-full" />
          <div className="shimmer h-5 w-28 rounded" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="glass-card p-4">
              <div className="shimmer mb-2 h-5 w-3/4 rounded" />
              <div className="shimmer mb-1 h-3 w-full rounded" />
              <div className="shimmer h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
