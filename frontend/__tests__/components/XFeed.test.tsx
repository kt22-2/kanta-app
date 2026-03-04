import { render, screen, act } from "@testing-library/react";
import XFeed from "@/components/XFeed";

// widgets.js スクリプト追加をモック
let appendedScripts: HTMLScriptElement[] = [];
const originalAppendChild = document.body.appendChild.bind(document.body);

beforeEach(() => {
  appendedScripts = [];
  jest.useFakeTimers();
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
  jest.useRealTimers();
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
      screen.getByText(/タイムラインを表示できません/)
    ).toBeInTheDocument();
  });

  it("タイムアウト後にiframeが無い場合フォールバックUIを表示する", () => {
    render(<XFeed />);

    // タイムアウト前はタイムラインリンクが表示されている
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();

    // 8秒経過（iframeは生成されていない）
    act(() => {
      jest.advanceTimersByTime(8000);
    });

    expect(
      screen.getByText(/タイムラインを表示できません/)
    ).toBeInTheDocument();
    expect(screen.getByText("Xで見る")).toBeInTheDocument();
  });

  it("タイムアウト前にiframeが存在する場合はフォールバックしない", () => {
    render(<XFeed />);

    const container = screen.getByTestId("x-timeline");
    // ウィジェットがiframeを生成した状態を模擬
    const iframe = document.createElement("iframe");
    container.appendChild(iframe);

    act(() => {
      jest.advanceTimersByTime(8000);
    });

    // フォールバックは表示されない
    expect(
      screen.queryByText(/タイムラインを表示できません/)
    ).not.toBeInTheDocument();
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("フォールバックUIにXプロフィールへのリンクがある", () => {
    render(<XFeed />);

    act(() => {
      jest.advanceTimersByTime(8000);
    });

    const link = screen.getByText("Xで見る");
    expect(link).toHaveAttribute("href", "https://x.com/anta_kaoi");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
