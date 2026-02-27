import { render, screen } from "@testing-library/react";
import {
  KANTA_SOCIAL,
  parseLivestreamCsv,
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
2,東京,日本,35.6762,139.6503,2024-01-03,https://youtube.com/watch?v=example2,東京グルメ旅
3,バンコク,タイ,13.7563,100.5018,2024-01-15,https://youtube.com/watch?v=example3,バンコク散策
4,パリ,フランス,48.8566,2.3522,2024-03-25,https://youtube.com/watch?v=example4,パリ到着`,
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
    // モックCSVは4行
    const stats = screen.getAllByText("4");
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
