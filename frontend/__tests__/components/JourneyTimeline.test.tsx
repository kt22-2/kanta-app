import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import JourneyTimeline from "@/components/JourneyTimeline";
import type { LivestreamPoint } from "@/lib/livestream-data";

const makePoint = (overrides: Partial<LivestreamPoint>): LivestreamPoint => ({
  id: 1,
  city: "東京",
  country: "日本",
  lat: 35.6762,
  lng: 139.6503,
  date: "2024-01-01",
  youtubeUrl: "https://youtube.com/watch?v=abc123",
  title: "テスト動画",
  ...overrides,
});

describe("JourneyTimeline", () => {
  it("国名を表示する", () => {
    const points = [makePoint({ country: "日本", city: "東京" })];
    render(<JourneyTimeline points={points} />);
    expect(screen.getByText("日本")).toBeInTheDocument();
  });

  it("都市名を表示する", () => {
    const points = [makePoint({ city: "バンコク", country: "タイ" })];
    render(<JourneyTimeline points={points} />);
    expect(screen.getByText("バンコク")).toBeInTheDocument();
  });

  it("動画タイトルを表示する（最新国はデフォルト展開）", () => {
    const points = [
      makePoint({
        country: "インド",
        city: "ムンバイ",
        title: "インド#1",
        date: "2024-02-01",
      }),
    ];
    render(<JourneyTimeline points={points} />);
    expect(screen.getByText("インド#1")).toBeInTheDocument();
  });

  it("動画カードにYouTubeリンクが含まれる", () => {
    const points = [
      makePoint({
        youtubeUrl: "https://youtube.com/watch?v=testId",
        country: "インド",
        city: "ムンバイ",
      }),
    ];
    render(<JourneyTimeline points={points} />);
    const links = screen.getAllByRole("link");
    const youtubeLink = links.find(
      (l) => l.getAttribute("href") === "https://youtube.com/watch?v=testId"
    );
    expect(youtubeLink).toBeDefined();
  });

  it("国旗絵文字を表示する", () => {
    const points = [makePoint({ country: "タイ" })];
    render(<JourneyTimeline points={points} />);
    expect(screen.getByText("🇹🇭")).toBeInTheDocument();
  });

  it("「もっと見る」ボタンクリックで全動画を展開する", () => {
    const points = Array.from({ length: 7 }, (_, i) =>
      makePoint({
        id: i + 1,
        title: `動画${i + 1}`,
        country: "タイ",
        city: "バンコク",
        date: `2024-01-0${i + 1}`,
      })
    );
    render(<JourneyTimeline points={points} />);
    // 初期は5本表示
    const showMoreBtn = screen.queryByRole("button", { name: /もっと見る/ });
    expect(showMoreBtn).toBeInTheDocument();
    fireEvent.click(showMoreBtn!);
    // クリック後は全7本表示
    expect(screen.getByText("動画7")).toBeInTheDocument();
  });

  it("空配列では何も表示しない", () => {
    render(<JourneyTimeline points={[]} />);
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
