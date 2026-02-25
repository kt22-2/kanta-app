import { render, screen, fireEvent } from "@testing-library/react";
import SectionAnchor from "@/components/SectionAnchor";

// IntersectionObserver のモック
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
}

beforeAll(() => {
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
});

const SECTIONS = [
  { id: "info", label: "基本情報" },
  { id: "safety", label: "安全情報" },
  { id: "entry", label: "入国要件" },
  { id: "spots", label: "観光スポット" },
  { id: "news", label: "現地ニュース" },
];

describe("SectionAnchor", () => {
  it("全てのセクションラベルが表示される", () => {
    render(<SectionAnchor sections={SECTIONS} />);
    expect(screen.getByText("基本情報")).toBeInTheDocument();
    expect(screen.getByText("安全情報")).toBeInTheDocument();
    expect(screen.getByText("入国要件")).toBeInTheDocument();
    expect(screen.getByText("観光スポット")).toBeInTheDocument();
    expect(screen.getByText("現地ニュース")).toBeInTheDocument();
  });

  it("クリックすると scrollIntoView が呼ばれる", () => {
    // 対象要素を DOM に追加
    const infoEl = document.createElement("section");
    infoEl.id = "info";
    const scrollIntoViewMock = jest.fn();
    infoEl.scrollIntoView = scrollIntoViewMock;
    document.body.appendChild(infoEl);

    render(<SectionAnchor sections={SECTIONS} />);
    fireEvent.click(screen.getByText("基本情報"));
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });

    document.body.removeChild(infoEl);
  });

  it("空のセクションでもクラッシュしない", () => {
    render(<SectionAnchor sections={[]} />);
    // 何も表示されないがエラーは発生しない
    const nav = document.querySelector("nav");
    expect(nav).toBeInTheDocument();
  });
});
