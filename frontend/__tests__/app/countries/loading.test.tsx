import { render, screen } from "@testing-library/react";
import Loading from "@/app/countries/[code]/loading";

describe("CountryDetail Loading", () => {
  it("レンダリングできる", () => {
    render(<Loading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("パンくずのスケルトンが表示される", () => {
    render(<Loading />);
    expect(screen.getByLabelText("読み込み中")).toBeInTheDocument();
  });

  it("セクションアンカーのスケルトン（5タブ）が表示される", () => {
    const { container } = render(<Loading />);
    const anchorArea = container.querySelector("[data-testid='skeleton-anchor']");
    expect(anchorArea).toBeInTheDocument();
    const tabs = anchorArea!.querySelectorAll(".shimmer");
    expect(tabs.length).toBe(5);
  });

  it("ヘッダーカードのスケルトンが表示される", () => {
    const { container } = render(<Loading />);
    expect(container.querySelector("[data-testid='skeleton-header']")).toBeInTheDocument();
  });

  it("セクション区切り線が表示される", () => {
    const { container } = render(<Loading />);
    const dividers = container.querySelectorAll(".section-divider");
    expect(dividers.length).toBeGreaterThanOrEqual(3);
  });

  it("shimmerクラスを持つ要素が存在する", () => {
    const { container } = render(<Loading />);
    const shimmers = container.querySelectorAll(".shimmer");
    expect(shimmers.length).toBeGreaterThan(5);
  });
});
