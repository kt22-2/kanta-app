import { render, screen } from "@testing-library/react";
import NewsSection from "@/components/NewsSection";

jest.mock("swr");
jest.mock("@/lib/api", () => ({
  getNews: jest.fn(),
}));

import useSWR from "swr";
const mockUseSWR = useSWR as jest.Mock;

describe("NewsSection", () => {
  it("ローディング中はスケルトンを表示する", () => {
    mockUseSWR.mockReturnValue({ data: undefined, error: undefined, isLoading: true });
    const { container } = render(<NewsSection code="JP" />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("エラー時は取得できないメッセージを表示する", () => {
    mockUseSWR.mockReturnValue({ data: undefined, error: new Error("fetch failed"), isLoading: false });
    render(<NewsSection code="JP" />);
    expect(screen.getByText("現在ニュースを取得できません")).toBeInTheDocument();
  });

  it("記事がある場合はタイトルを表示する", () => {
    mockUseSWR.mockReturnValue({
      data: {
        country_code: "JP",
        articles: [
          {
            title: "日本経済ニュース",
            description: "経済に関する記事",
            url: "https://example.com/news",
            source: "Example News",
            published_at: "2026-02-25T00:00:00Z",
          },
        ],
        total: 1,
      },
      error: undefined,
      isLoading: false,
    });
    render(<NewsSection code="JP" />);
    expect(screen.getByText("日本経済ニュース")).toBeInTheDocument();
  });

  it("記事が空の場合は取得できないメッセージを表示する", () => {
    mockUseSWR.mockReturnValue({
      data: { country_code: "JP", articles: [], total: 0 },
      error: undefined,
      isLoading: false,
    });
    render(<NewsSection code="JP" />);
    expect(screen.getByText("現在ニュースを取得できません")).toBeInTheDocument();
  });
});
