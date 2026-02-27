import { render, screen } from "@testing-library/react";
import XFeed from "@/components/XFeed";

jest.mock("swr");
jest.mock("@/lib/api", () => ({
  getXPosts: jest.fn(),
}));

import useSWR from "swr";
const mockUseSWR = useSWR as jest.Mock;

const MOCK_POSTS = [
  {
    id: "1234567890",
    text: "世界一周旅行中！タイのバンコクに到着しました🇹🇭 #世界一周 #旅行",
    created_at: "2026-02-20T10:00:00Z",
    url: "https://x.com/anta_kaoi/status/1234567890",
    media_url: null,
    like_count: 42,
    retweet_count: 5,
  },
  {
    id: "1234567891",
    text: "インドのムンバイは想像以上にカオスだった😂",
    created_at: "2026-02-15T08:30:00Z",
    url: "https://x.com/anta_kaoi/status/1234567891",
    media_url: "https://pbs.twimg.com/media/example.jpg",
    like_count: 128,
    retweet_count: 20,
  },
];

describe("XFeed", () => {
  it("ローディング中はスケルトンを表示する", () => {
    mockUseSWR.mockReturnValue({ data: undefined, error: undefined, isLoading: true });
    const { container } = render(<XFeed />);
    const skeletons = container.querySelectorAll(".shimmer");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("エラー時は取得できないメッセージを表示する", () => {
    mockUseSWR.mockReturnValue({ data: undefined, error: new Error("fetch failed"), isLoading: false });
    render(<XFeed />);
    expect(screen.getByText(/投稿を取得できません/)).toBeInTheDocument();
  });

  it("投稿がある場合はテキストを表示する", () => {
    mockUseSWR.mockReturnValue({
      data: MOCK_POSTS,
      error: undefined,
      isLoading: false,
    });
    render(<XFeed />);
    expect(screen.getByText(/タイのバンコクに到着しました/)).toBeInTheDocument();
  });

  it("投稿が空の場合は取得できないメッセージを表示する", () => {
    mockUseSWR.mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
    });
    render(<XFeed />);
    expect(screen.getByText(/投稿を取得できません/)).toBeInTheDocument();
  });

  it("いいね数とRT数を表示する", () => {
    mockUseSWR.mockReturnValue({
      data: MOCK_POSTS,
      error: undefined,
      isLoading: false,
    });
    render(<XFeed />);
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
