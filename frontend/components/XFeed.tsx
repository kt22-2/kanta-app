"use client";

import useSWR from "swr";
import { getXPosts } from "@/lib/api";
import XPostCard from "./XPostCard";

function Skeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-32 shimmer rounded-xl"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

export default function XFeed() {
  const { data, error, isLoading } = useSWR(
    "/api/x/posts",
    () => getXPosts()
  );

  if (isLoading) return <Skeleton />;

  if (error || !data || data.length === 0) {
    return (
      <p className="text-sm text-muted">
        現在X（Twitter）の投稿を取得できません
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {data.slice(0, 10).map((post) => (
        <XPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
