import type { LivestreamPoint } from "@/lib/livestream-data";

// テスト対象関数をインポート（まだ未実装）
import {
  getYouTubeVideoId,
  getYouTubeThumbnail,
  groupPointsByLocation,
  buildPopupHtml,
  getCountryFlag,
  groupByCountry,
} from "@/lib/livestream-data";

describe("getYouTubeVideoId", () => {
  it("youtube.com/watch?v=XXX からIDを抽出する", () => {
    expect(getYouTubeVideoId("https://youtube.com/watch?v=abc123")).toBe(
      "abc123"
    );
  });

  it("www.youtube.com/watch?v=XXX からIDを抽出する", () => {
    expect(getYouTubeVideoId("https://www.youtube.com/watch?v=abc123")).toBe(
      "abc123"
    );
  });

  it("youtu.be/XXX からIDを抽出する", () => {
    expect(getYouTubeVideoId("https://youtu.be/abc123")).toBe("abc123");
  });

  it("ハイフン・アンダースコア含むIDを抽出する", () => {
    expect(getYouTubeVideoId("https://youtube.com/watch?v=a-b_c123")).toBe(
      "a-b_c123"
    );
  });

  it("無効なURLはnullを返す", () => {
    expect(getYouTubeVideoId("https://example.com")).toBeNull();
  });

  it("空文字はnullを返す", () => {
    expect(getYouTubeVideoId("")).toBeNull();
  });
});

describe("getYouTubeThumbnail", () => {
  it("正しいサムネイルURLを返す", () => {
    expect(getYouTubeThumbnail("abc123")).toBe(
      "https://img.youtube.com/vi/abc123/mqdefault.jpg"
    );
  });
});

describe("groupPointsByLocation", () => {
  const makePoint = (
    overrides: Partial<LivestreamPoint>
  ): LivestreamPoint => ({
    id: 1,
    city: "東京",
    country: "日本",
    lat: 35.6762,
    lng: 139.6503,
    date: "2024-01-01",
    youtubeUrl: "https://youtube.com/watch?v=example1",
    title: "テスト動画",
    ...overrides,
  });

  it("同一都市の動画をグループ化する", () => {
    const points = [
      makePoint({ id: 1, date: "2024-01-01", title: "動画1" }),
      makePoint({ id: 2, date: "2024-01-03", title: "動画2" }),
    ];
    const groups = groupPointsByLocation(points);
    expect(groups).toHaveLength(1);
    expect(groups[0].city).toBe("東京");
    expect(groups[0].videos).toHaveLength(2);
  });

  it("異なる都市は別グループになる", () => {
    const points = [
      makePoint({ id: 1 }),
      makePoint({
        id: 2,
        city: "バンコク",
        country: "タイ",
        lat: 13.7563,
        lng: 100.5018,
      }),
    ];
    const groups = groupPointsByLocation(points);
    expect(groups).toHaveLength(2);
  });

  it("グループ内の動画が日付順にソートされる", () => {
    const points = [
      makePoint({ id: 2, date: "2024-01-03", title: "後の動画" }),
      makePoint({ id: 1, date: "2024-01-01", title: "先の動画" }),
    ];
    const groups = groupPointsByLocation(points);
    expect(groups[0].videos[0].title).toBe("先の動画");
    expect(groups[0].videos[1].title).toBe("後の動画");
  });

  it("単一日のdateRangeは日付のみ", () => {
    const points = [makePoint({ date: "2024-01-01" })];
    const groups = groupPointsByLocation(points);
    expect(groups[0].dateRange).toBe("2024-01-01");
  });

  it("複数日のdateRangeは範囲表示", () => {
    const points = [
      makePoint({ id: 1, date: "2024-01-01" }),
      makePoint({ id: 2, date: "2024-01-03" }),
    ];
    const groups = groupPointsByLocation(points);
    expect(groups[0].dateRange).toBe("2024-01-01 ~ 2024-01-03");
  });

  it("空配列は空配列を返す", () => {
    expect(groupPointsByLocation([])).toEqual([]);
  });

  it("グループの座標は最初の動画の座標を使う", () => {
    const points = [
      makePoint({ id: 1, lat: 35.6762, lng: 139.6503 }),
      makePoint({ id: 2, lat: 35.6800, lng: 139.6550 }),
    ];
    const groups = groupPointsByLocation(points);
    expect(groups[0].lat).toBe(35.6762);
    expect(groups[0].lng).toBe(139.6503);
  });
});

describe("buildPopupHtml", () => {
  it("都市名と国名を含む", () => {
    const group = {
      city: "東京",
      country: "日本",
      lat: 35.6762,
      lng: 139.6503,
      dateRange: "2024-01-01",
      videos: [
        {
          id: 1,
          city: "東京",
          country: "日本",
          lat: 35.6762,
          lng: 139.6503,
          date: "2024-01-01",
          youtubeUrl: "https://youtube.com/watch?v=abc123",
          title: "テスト動画",
        },
      ],
    };
    const html = buildPopupHtml(group);
    expect(html).toContain("東京");
    expect(html).toContain("日本");
  });

  it("日付範囲を含む", () => {
    const group = {
      city: "東京",
      country: "日本",
      lat: 35.6762,
      lng: 139.6503,
      dateRange: "2024-01-01 ~ 2024-01-03",
      videos: [
        {
          id: 1,
          city: "東京",
          country: "日本",
          lat: 35.6762,
          lng: 139.6503,
          date: "2024-01-01",
          youtubeUrl: "https://youtube.com/watch?v=abc123",
          title: "動画1",
        },
        {
          id: 2,
          city: "東京",
          country: "日本",
          lat: 35.6762,
          lng: 139.6503,
          date: "2024-01-03",
          youtubeUrl: "https://youtube.com/watch?v=def456",
          title: "動画2",
        },
      ],
    };
    const html = buildPopupHtml(group);
    expect(html).toContain("2024-01-01 ~ 2024-01-03");
  });

  it("YouTubeリンクを含む", () => {
    const group = {
      city: "東京",
      country: "日本",
      lat: 35.6762,
      lng: 139.6503,
      dateRange: "2024-01-01",
      videos: [
        {
          id: 1,
          city: "東京",
          country: "日本",
          lat: 35.6762,
          lng: 139.6503,
          date: "2024-01-01",
          youtubeUrl: "https://youtube.com/watch?v=abc123",
          title: "テスト動画",
        },
      ],
    };
    const html = buildPopupHtml(group);
    expect(html).toContain("https://youtube.com/watch?v=abc123");
  });

  it("サムネイルURLを含む", () => {
    const group = {
      city: "東京",
      country: "日本",
      lat: 35.6762,
      lng: 139.6503,
      dateRange: "2024-01-01",
      videos: [
        {
          id: 1,
          city: "東京",
          country: "日本",
          lat: 35.6762,
          lng: 139.6503,
          date: "2024-01-01",
          youtubeUrl: "https://youtube.com/watch?v=abc123",
          title: "テスト動画",
        },
      ],
    };
    const html = buildPopupHtml(group);
    expect(html).toContain("https://img.youtube.com/vi/abc123/mqdefault.jpg");
  });

  it("動画数を含む", () => {
    const group = {
      city: "東京",
      country: "日本",
      lat: 35.6762,
      lng: 139.6503,
      dateRange: "2024-01-01 ~ 2024-01-03",
      videos: [
        {
          id: 1,
          city: "東京",
          country: "日本",
          lat: 35.6762,
          lng: 139.6503,
          date: "2024-01-01",
          youtubeUrl: "https://youtube.com/watch?v=abc123",
          title: "動画1",
        },
        {
          id: 2,
          city: "東京",
          country: "日本",
          lat: 35.6762,
          lng: 139.6503,
          date: "2024-01-03",
          youtubeUrl: "https://youtube.com/watch?v=def456",
          title: "動画2",
        },
      ],
    };
    const html = buildPopupHtml(group);
    expect(html).toContain("2本");
  });
});

describe("getCountryFlag", () => {
  it("日本の国旗絵文字を返す", () => {
    expect(getCountryFlag("日本")).toBe("🇯🇵");
  });

  it("タイの国旗絵文字を返す", () => {
    expect(getCountryFlag("タイ")).toBe("🇹🇭");
  });

  it("スリランカの国旗絵文字を返す", () => {
    expect(getCountryFlag("スリランカ")).toBe("🇱🇰");
  });

  it("インドの国旗絵文字を返す", () => {
    expect(getCountryFlag("インド")).toBe("🇮🇳");
  });

  it("未知の国はデフォルト地球絵文字を返す", () => {
    expect(getCountryFlag("未知の国")).toBe("🌍");
  });
});

describe("groupByCountry", () => {
  const makeGroup = (
    city: string,
    country: string,
    videos: Partial<LivestreamPoint>[]
  ) => ({
    city,
    country,
    lat: 35.0,
    lng: 135.0,
    dateRange: videos.length > 1 ? "2024-01-01 ~ 2024-01-10" : "2024-01-01",
    videos: videos.map((v, i) => ({
      id: i + 1,
      city,
      country,
      lat: 35.0,
      lng: 135.0,
      date: v.date ?? "2024-01-01",
      youtubeUrl: v.youtubeUrl ?? `https://youtube.com/watch?v=test${i}`,
      title: v.title ?? `動画${i + 1}`,
    })),
  });

  it("同一国の都市をまとめる", () => {
    const groups = [
      makeGroup("ムンバイ", "インド", [{ date: "2024-02-01" }]),
      makeGroup("ジョードプル", "インド", [{ date: "2024-02-05" }]),
    ];
    const result = groupByCountry(groups);
    expect(result).toHaveLength(1);
    expect(result[0].country).toBe("インド");
    expect(result[0].cities).toContain("ムンバイ");
    expect(result[0].cities).toContain("ジョードプル");
  });

  it("異なる国は別の CountryGroup になる", () => {
    const groups = [
      makeGroup("東京", "日本", [{ date: "2024-01-01" }]),
      makeGroup("バンコク", "タイ", [{ date: "2024-01-10" }]),
    ];
    const result = groupByCountry(groups);
    expect(result).toHaveLength(2);
  });

  it("totalVideos は該当国の全動画数を返す", () => {
    const groups = [
      makeGroup("ムンバイ", "インド", [
        { date: "2024-02-01" },
        { date: "2024-02-02" },
        { date: "2024-02-03" },
      ]),
      makeGroup("ジョードプル", "インド", [
        { date: "2024-02-05" },
        { date: "2024-02-06" },
      ]),
    ];
    const result = groupByCountry(groups);
    expect(result[0].totalVideos).toBe(5);
  });

  it("flag フィールドに国旗絵文字が入る", () => {
    const groups = [makeGroup("東京", "日本", [{ date: "2024-01-01" }])];
    const result = groupByCountry(groups);
    expect(result[0].flag).toBe("🇯🇵");
  });

  it("dateRange は国全体の最初と最後の日付を使う", () => {
    const groups = [
      makeGroup("ムンバイ", "インド", [{ date: "2024-02-01" }]),
      makeGroup("ジョードプル", "インド", [{ date: "2024-02-10" }]),
    ];
    const result = groupByCountry(groups);
    expect(result[0].dateRange).toBe("2024-02-01 ~ 2024-02-10");
  });

  it("空配列は空配列を返す", () => {
    expect(groupByCountry([])).toEqual([]);
  });
});
