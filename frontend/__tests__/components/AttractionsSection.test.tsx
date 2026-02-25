import { render, screen } from "@testing-library/react";
import AttractionsSection from "@/components/AttractionsSection";

jest.mock("swr");
jest.mock("@/lib/api", () => ({
  getAttractions: jest.fn(),
}));

import useSWR from "swr";
const mockUseSWR = useSWR as jest.Mock;

describe("AttractionsSection", () => {
  it("ローディング中はスケルトンを表示する", () => {
    mockUseSWR.mockReturnValue({ data: undefined, error: undefined, isLoading: true });
    const { container } = render(<AttractionsSection code="JP" />);
    // スケルトンの animate-pulse 要素が存在する
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("エラー時は失敗メッセージを表示する", () => {
    mockUseSWR.mockReturnValue({ data: undefined, error: new Error("fetch failed"), isLoading: false });
    render(<AttractionsSection code="JP" />);
    expect(screen.getByText("観光情報の読み込みに失敗しました")).toBeInTheDocument();
  });

  it("AIサマリーがある場合は観光スポット名を表示する", () => {
    mockUseSWR.mockReturnValue({
      data: {
        country_code: "JP",
        country_name: "Japan",
        otm_attractions: [],
        ai_summary: [
          {
            name: "富士山",
            description: "日本最高峰の山",
            category: "自然",
            highlights: ["絶景", "登山"],
          },
        ],
        best_season: "春",
        travel_tips: [],
      },
      error: undefined,
      isLoading: false,
    });
    render(<AttractionsSection code="JP" />);
    expect(screen.getByText("富士山")).toBeInTheDocument();
  });

  it("ベストシーズンがある場合は表示する", () => {
    mockUseSWR.mockReturnValue({
      data: {
        country_code: "JP",
        country_name: "Japan",
        otm_attractions: [],
        ai_summary: [],
        best_season: "春・秋",
        travel_tips: [],
      },
      error: undefined,
      isLoading: false,
    });
    render(<AttractionsSection code="JP" />);
    expect(screen.getByText("春・秋")).toBeInTheDocument();
  });

  it("データが空の場合は何も表示しない（nullを返す）", () => {
    mockUseSWR.mockReturnValue({ data: undefined, error: undefined, isLoading: false });
    const { container } = render(<AttractionsSection code="JP" />);
    expect(container.firstChild).toBeNull();
  });

  it("旅行のコツがある場合は表示する", () => {
    mockUseSWR.mockReturnValue({
      data: {
        country_code: "JP",
        country_name: "Japan",
        otm_attractions: [],
        ai_summary: [],
        best_season: null,
        travel_tips: ["交通ICカードが便利です"],
      },
      error: undefined,
      isLoading: false,
    });
    render(<AttractionsSection code="JP" />);
    expect(screen.getByText("交通ICカードが便利です")).toBeInTheDocument();
  });
});
