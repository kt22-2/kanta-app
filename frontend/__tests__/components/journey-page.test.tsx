import { render, screen } from "@testing-library/react";
import {
  KANTA_SOCIAL,
  parseLivestreamCsv,
  groupPointsByLocation,
  buildPopupHtml,
} from "@/lib/livestream-data";

// Leaflet地図コンポーネントをモック
jest.mock("@/components/LivestreamMap", () => {
  return function MockLivestreamMap() {
    return <div data-testid="livestream-map">Map</div>;
  };
});

// XFeedコンポーネントをモック（useSWRを使うClient Component）
jest.mock("@/components/XFeed", () => {
  return function MockXFeed() {
    return <div data-testid="x-feed">X Feed</div>;
  };
});

// fs/pathモジュールをモック（Server Component内でのCSV読み込み）
jest.mock("fs", () => ({
  existsSync: () => true,
  readFileSync: () =>
    `id,city,country,lat,lng,date,youtubeUrl,title
1,東京,日本,35.6762,139.6503,2024-01-01,https://youtube.com/watch?v=example1,世界一周出発！
2,バンコク,タイ,13.7563,100.5018,2024-01-15,https://youtube.com/watch?v=example2,バンコク散策
3,パリ,フランス,48.8566,2.3522,2024-03-25,https://youtube.com/watch?v=example3,パリ到着`,
}));
jest.mock("path", () => ({
  join: (...args: string[]) => args.join("/"),
}));

describe("parseLivestreamCsv", () => {
  it("CSV文字列をLivestreamPoint配列にパースする", () => {
    const csv = `id,city,country,lat,lng,date,youtubeUrl,title
1,東京,日本,35.6762,139.6503,2024-01-01,https://youtube.com/watch?v=example1,世界一周出発！`;
    const result = parseLivestreamCsv(csv);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 1,
      city: "東京",
      country: "日本",
      lat: 35.6762,
      lng: 139.6503,
      date: "2024-01-01",
      youtubeUrl: "https://youtube.com/watch?v=example1",
      title: "世界一周出発！",
    });
  });

  it("複数行のCSVをパースする", () => {
    const csv = `id,city,country,lat,lng,date,youtubeUrl,title
1,東京,日本,35.6762,139.6503,2024-01-01,https://youtube.com/watch?v=example1,出発
2,バンコク,タイ,13.7563,100.5018,2024-01-15,https://youtube.com/watch?v=example2,到着`;
    const result = parseLivestreamCsv(csv);
    expect(result).toHaveLength(2);
    expect(result[1].city).toBe("バンコク");
  });
});

describe("JourneyPage", () => {
  beforeEach(async () => {
    const { default: JourneyPage } = await import("@/app/journey/page");
    render(<JourneyPage />);
  });

  it("ページタイトル「KANTAの軌跡」を表示する", () => {
    expect(screen.getByText("KANTAの軌跡")).toBeInTheDocument();
  });

  it("配信回数を表示する", () => {
    // モックCSVは3行
    const stats = screen.getAllByText("3");
    expect(stats.length).toBeGreaterThanOrEqual(1);
  });

  it("訪問国数を表示する", () => {
    // モックCSV: 日本、タイ、フランス = 3カ国
    const countEl = screen.getByTestId("country-count");
    expect(countEl).toHaveTextContent("3");
  });

  it("地図コンポーネントを表示する", () => {
    expect(screen.getByTestId("livestream-map")).toBeInTheDocument();
  });

  it("YouTubeリンクが正しいURLで表示される", () => {
    const youtubeLink = screen.getByRole("link", { name: /youtube/i });
    expect(youtubeLink).toHaveAttribute("href", KANTA_SOCIAL.youtube);
    expect(youtubeLink).toHaveAttribute("target", "_blank");
    expect(youtubeLink).toHaveAttribute(
      "rel",
      expect.stringContaining("noopener")
    );
  });

  it("Instagramリンクが正しいURLで表示される", () => {
    const instaLink = screen.getByRole("link", { name: /instagram/i });
    expect(instaLink).toHaveAttribute("href", KANTA_SOCIAL.instagram);
    expect(instaLink).toHaveAttribute("target", "_blank");
  });

  it("Xリンクが正しいURLで表示される", () => {
    const xLink = screen.getByRole("link", { name: /^x$/i });
    expect(xLink).toHaveAttribute("href", KANTA_SOCIAL.x);
    expect(xLink).toHaveAttribute("target", "_blank");
  });
});

describe("groupPointsByLocation", () => {
  it("同じ都市の動画を1グループにまとめる", () => {
    const points = [
      { id: 1, city: "東京", country: "日本", lat: 35.67, lng: 139.65, date: "2024-01-01", youtubeUrl: "https://youtube.com/watch?v=a1", title: "動画1" },
      { id: 2, city: "東京", country: "日本", lat: 35.67, lng: 139.65, date: "2024-01-03", youtubeUrl: "https://youtube.com/watch?v=a2", title: "動画2" },
      { id: 3, city: "パリ", country: "フランス", lat: 48.85, lng: 2.35, date: "2024-02-01", youtubeUrl: "https://youtube.com/watch?v=b1", title: "動画3" },
    ];
    const groups = groupPointsByLocation(points);
    expect(groups).toHaveLength(2);

    const tokyo = groups.find((g) => g.city === "東京")!;
    expect(tokyo.videos).toHaveLength(2);
    expect(tokyo.lat).toBe(35.67);
    expect(tokyo.lng).toBe(139.65);
    expect(tokyo.dateRange).toEqual({ start: "2024-01-01", end: "2024-01-03" });
  });

  it("最新グループにisLatestフラグを立てる", () => {
    const points = [
      { id: 1, city: "東京", country: "日本", lat: 35.67, lng: 139.65, date: "2024-01-01", youtubeUrl: "https://youtube.com/watch?v=a1", title: "動画1" },
      { id: 2, city: "パリ", country: "フランス", lat: 48.85, lng: 2.35, date: "2024-03-01", youtubeUrl: "https://youtube.com/watch?v=b1", title: "動画2" },
    ];
    const groups = groupPointsByLocation(points);
    const paris = groups.find((g) => g.city === "パリ")!;
    expect(paris.isLatest).toBe(true);
    const tokyo = groups.find((g) => g.city === "東京")!;
    expect(tokyo.isLatest).toBe(false);
  });

  it("動画が1本の場合はdateRangeのstartとendが同じになる", () => {
    const points = [
      { id: 1, city: "パリ", country: "フランス", lat: 48.85, lng: 2.35, date: "2024-02-01", youtubeUrl: "https://youtube.com/watch?v=b1", title: "動画1" },
    ];
    const groups = groupPointsByLocation(points);
    expect(groups[0].dateRange).toEqual({ start: "2024-02-01", end: "2024-02-01" });
  });
});

describe("buildPopupHtml", () => {
  it("ロケーション名と動画数を含むHTMLを生成する", () => {
    const group = {
      city: "東京",
      country: "日本",
      lat: 35.67,
      lng: 139.65,
      dateRange: { start: "2024-01-01", end: "2024-01-03" },
      videos: [
        { id: 1, youtubeUrl: "https://youtube.com/watch?v=abc123", title: "動画1", date: "2024-01-01" },
        { id: 2, youtubeUrl: "https://youtube.com/watch?v=def456", title: "動画2", date: "2024-01-03" },
      ],
      isLatest: false,
    };
    const html = buildPopupHtml(group);
    expect(html).toContain("東京, 日本");
    expect(html).toContain("2本の動画");
    expect(html).toContain("2024-01-01 〜 2024-01-03");
    expect(html).toContain('src="https://img.youtube.com/vi/abc123/mqdefault.jpg"');
    expect(html).toContain('href="https://youtube.com/watch?v=abc123"');
    expect(html).toContain('target="_blank"');
  });

  it("動画が1本の場合は日付範囲ではなく単一日付を表示する", () => {
    const group = {
      city: "パリ",
      country: "フランス",
      lat: 48.85,
      lng: 2.35,
      dateRange: { start: "2024-03-01", end: "2024-03-01" },
      videos: [
        { id: 1, youtubeUrl: "https://youtube.com/watch?v=xyz789", title: "パリ動画", date: "2024-03-01" },
      ],
      isLatest: false,
    };
    const html = buildPopupHtml(group);
    expect(html).toContain("2024-03-01");
    expect(html).not.toContain("〜");
    expect(html).toContain("1本の動画");
  });

  it("チャンネルリンクを含む", () => {
    const group = {
      city: "東京",
      country: "日本",
      lat: 35.67,
      lng: 139.65,
      dateRange: { start: "2024-01-01", end: "2024-01-01" },
      videos: [
        { id: 1, youtubeUrl: "https://youtube.com/watch?v=abc", title: "動画", date: "2024-01-01" },
      ],
      isLatest: false,
    };
    const html = buildPopupHtml(group);
    expect(html).toContain("https://www.youtube.com/@KANTA_worldwide");
    expect(html).toContain("チャンネルを見る");
  });
});

describe("SocialLinks", () => {
  it("3つのSNSリンクを表示する", async () => {
    const { default: SocialLinks } = await import(
      "@/components/SocialLinks"
    );
    render(<SocialLinks />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
  });
});
