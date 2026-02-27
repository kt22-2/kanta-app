import { ExternalLink, Heart, Repeat2 } from "lucide-react";
import Image from "next/image";
import type { XPost } from "@/lib/types";

interface Props {
  post: XPost;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function XPostCard({ post }: Props) {
  const date = formatDate(post.created_at);

  return (
    <div className="rounded-xl glass-card-interactive p-4 flex flex-col gap-3">
      {/* テキスト */}
      <a
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-2"
      >
        <p className="flex-1 text-sm text-foreground group-hover:text-accent transition-colors leading-relaxed line-clamp-4">
          {post.text}
        </p>
        <ExternalLink className="h-4 w-4 shrink-0 text-muted group-hover:text-accent mt-0.5" />
      </a>

      {/* 画像 */}
      {post.media_url && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <Image
            src={post.media_url}
            alt="投稿画像"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}

      {/* フッター */}
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{date}</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {post.like_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Repeat2 className="h-3.5 w-3.5" />
            {post.retweet_count.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
