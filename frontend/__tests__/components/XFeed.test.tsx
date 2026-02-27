import { render, screen } from "@testing-library/react";
import XFeed from "@/components/XFeed";

describe("XFeed", () => {
  it("X埋め込みタイムラインのリンクを表示する", () => {
    render(<XFeed />);
    const timeline = screen.getByTestId("x-timeline");
    expect(timeline).toBeInTheDocument();
  });

  it("タイムラインリンクが正しいURLを持つ", () => {
    render(<XFeed />);
    const link = screen.getByRole("link", { name: /タイムライン/i });
    expect(link).toHaveAttribute("href", "https://x.com/anta_kaoi");
  });

  it("ダークテーマが設定されている", () => {
    render(<XFeed />);
    const link = screen.getByRole("link", { name: /タイムライン/i });
    expect(link).toHaveAttribute("data-theme", "dark");
  });
});
