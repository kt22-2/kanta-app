"use client";

import useSWR from "swr";
import { getNews } from "@/lib/api";
import NewsCard from "./NewsCard";

interface Props {
  code: string;
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-24 shimmer rounded-xl"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

export default function NewsSection({ code }: Props) {
  const { data, error, isLoading } = useSWR(
    `/api/countries/${code}/news`,
    () => getNews(code)
  );

  if (isLoading) return <Skeleton />;

  if (error) {
    return (
      <p className="text-sm text-[#8899AA]">
        現在ニュースを取得できません
      </p>
    );
  }

  if (!data || data.articles.length === 0) {
    return (
      <p className="text-sm text-[#8899AA]">
        現在ニュースを取得できません
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {data.articles.slice(0, 10).map((article, i) => (
        <NewsCard key={i} article={article} />
      ))}
    </div>
  );
}
