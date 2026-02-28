import { render, screen, act } from "@testing-library/react";
import XFeed from "@/components/XFeed";

// widgets.js スクリプト追加をモック
let appendedScripts: HTMLScriptElement[] = [];
const originalAppendChild = document.body.appendChild.bind(document.body);

beforeEach(() => {
  appendedScripts = [];
  jest.spyOn(document.body, "appendChild").mockImplementation((node: Node) => {
    if (node instanceof HTMLScriptElement && node.src.includes("twitter")) {
      appendedScripts.push(node);
      return node;
    }
    return originalAppendChild(node);
  });
  // window.twttr をリセット
  delete (window as Record<string, unknown>).twttr;
  // 既存スクリプトタグを削除
  document.getElementById("x-widgets-js")?.remove();
});

afterEach(() => {
  jest.restoreAllMocks();
});

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

  it("widgets.js スクリプトを追加する", () => {
    render(<XFeed />);
    expect(appendedScripts).toHaveLength(1);
    expect(appendedScripts[0].src).toBe(
      "https://platform.twitter.com/widgets.js"
    );
    expect(appendedScripts[0].async).toBe(true);
  });

  it("スクリプト読み込み完了後に twttr.widgets.load() を呼ぶ", () => {
    const mockLoad = jest.fn();
    render(<XFeed />);

    // スクリプトがまだ読み込み中なので load は呼ばれていない
    expect(mockLoad).not.toHaveBeenCalled();

    // window.twttr を設定してから onload を発火
    (window as Record<string, unknown>).twttr = {
      widgets: { load: mockLoad },
    };

    act(() => {
      appendedScripts[0].onload?.(new Event("load"));
    });

    expect(mockLoad).toHaveBeenCalledTimes(1);
  });

  it("既に twttr が読み込み済みの場合は即座に load() を呼ぶ", () => {
    const mockLoad = jest.fn();
    (window as Record<string, unknown>).twttr = {
      widgets: { load: mockLoad },
    };

    // 既存スクリプトタグを追加（2回目のレンダリングを模擬）
    const existing = document.createElement("script");
    existing.id = "x-widgets-js";
    originalAppendChild(existing);

    render(<XFeed />);

    expect(mockLoad).toHaveBeenCalledTimes(1);
    // 新しいスクリプトは追加されない
    expect(appendedScripts).toHaveLength(0);
  });

  it("スクリプト読み込みエラー時にエラーメッセージを表示する", () => {
    render(<XFeed />);

    act(() => {
      appendedScripts[0].onerror?.("load error");
    });

    expect(
      screen.getByText(/タイムラインの読み込みに失敗しました/)
    ).toBeInTheDocument();
  });
});
