import { render, screen, fireEvent } from "@testing-library/react";
import CountriesContent from "@/app/countries/CountriesContent";
import type { Country } from "@/lib/types";

jest.mock("swr");
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => null),
  })),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  usePathname: jest.fn(() => "/countries"),
}));
jest.mock("@/lib/api", () => ({
  getCountries: jest.fn(),
}));

import useSWR from "swr";
const mockUseSWR = useSWR as jest.Mock;

const mockCountries: Country[] = [
  {
    code: "JP",
    name: "Japan",
    name_ja: "日本",
    capital: "Tokyo",
    region: "アジア",
    population: 125_700_000,
    languages: ["Japanese"],
    currencies: [{ code: "JPY", name: "Japanese yen", symbol: "¥" }],
    flag_url: "https://flagcdn.com/jp.svg",
    flag_emoji: "🇯🇵",
  },
  {
    code: "FR",
    name: "France",
    name_ja: "フランス",
    capital: "Paris",
    region: "欧州",
    population: 67_391_582,
    languages: ["French"],
    currencies: [{ code: "EUR", name: "Euro", symbol: "€" }],
    flag_url: "https://flagcdn.com/fr.svg",
    flag_emoji: "🇫🇷",
  },
];

describe("CountriesContent", () => {
  it("ローディング中はスピナーを表示する", () => {
    mockUseSWR.mockReturnValue({ data: undefined, isLoading: true, error: undefined, mutate: jest.fn() });
    render(<CountriesContent />);
    expect(screen.getByText("国情報を読み込み中...")).toBeInTheDocument();
  });

  it("データ取得後に国名カードが表示される", () => {
    mockUseSWR.mockReturnValue({ data: mockCountries, isLoading: false, error: undefined, mutate: jest.fn() });
    render(<CountriesContent />);
    expect(screen.getByText("日本")).toBeInTheDocument();
    expect(screen.getByText("フランス")).toBeInTheDocument();
  });

  it("国数が表示される", () => {
    mockUseSWR.mockReturnValue({ data: mockCountries, isLoading: false, error: undefined, mutate: jest.fn() });
    render(<CountriesContent />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("カ国")).toBeInTheDocument();
  });

  it("エラー時はエラーメッセージを表示する", () => {
    mockUseSWR.mockReturnValue({ data: undefined, isLoading: false, error: new Error("fetch error"), mutate: jest.fn() });
    render(<CountriesContent />);
    expect(screen.getByText(/データの読み込みに失敗しました/)).toBeInTheDocument();
  });

  it("検索入力が可能", () => {
    mockUseSWR.mockReturnValue({ data: mockCountries, isLoading: false, error: undefined, mutate: jest.fn() });
    render(<CountriesContent />);
    const input = screen.getByPlaceholderText("国名・国コードで検索...");
    fireEvent.change(input, { target: { value: "Japan" } });
    expect(input).toHaveValue("Japan");
  });

  it("リージョンボタンが表示される", () => {
    mockUseSWR.mockReturnValue({ data: mockCountries, isLoading: false, error: undefined, mutate: jest.fn() });
    render(<CountriesContent />);
    const buttons = screen.getAllByRole("button");
    const buttonTexts = buttons.map((b) => b.textContent);
    expect(buttonTexts).toContain("全て");
    expect(buttonTexts).toContain("アジア");
    expect(buttonTexts).toContain("欧州");
  });

  it("リージョンボタンのクリックで state が更新される", () => {
    mockUseSWR.mockReturnValue({ data: mockCountries, isLoading: false, error: undefined, mutate: jest.fn() });
    render(<CountriesContent />);
    const buttons = screen.getAllByRole("button");
    const asiaButton = buttons.find((b) => b.textContent === "アジア")!;
    fireEvent.click(asiaButton);
    // クリック後に active スタイル（text-background）が適用されることを確認
    expect(asiaButton).toHaveClass("text-background");
  });

  it("危険度フィルタボタンが表示される", () => {
    mockUseSWR.mockReturnValue({ data: mockCountries, isLoading: false, error: undefined, mutate: jest.fn() });
    render(<CountriesContent />);
    const buttons = screen.getAllByRole("button");
    const buttonTexts = buttons.map((b) => b.textContent);
    expect(buttonTexts).toContain("安全");
    expect(buttonTexts).toContain("注意");
    expect(buttonTexts).toContain("危険");
    expect(buttonTexts).toContain("渡航中止");
    expect(buttonTexts).toContain("退避勧告");
  });

  it("ソートドロップダウンに世界遺産順が表示される", () => {
    mockUseSWR.mockReturnValue({ data: mockCountries, isLoading: false, error: undefined, mutate: jest.fn() });
    render(<CountriesContent />);
    expect(screen.getByRole("option", { name: "世界遺産順" })).toBeInTheDocument();
  });

  it("危険度フィルタで絞り込みができる", () => {
    // 初期状態: すべての国を表示
    const countriesWithSafety: Country[] = [
      { ...mockCountries[0], safety_level: 0 }, // 日本: 安全
      { ...mockCountries[1], safety_level: 2 }, // フランス: 危険
    ];
    mockUseSWR.mockReturnValue({ data: countriesWithSafety, isLoading: false, error: undefined, mutate: jest.fn() });
    const { rerender } = render(<CountriesContent />);

    // 両方の国が表示されている
    expect(screen.getByText("日本")).toBeInTheDocument();
    expect(screen.getByText("フランス")).toBeInTheDocument();

    // 危険度フィルタボタンをクリック（実際にはAPIが再呼び出しされ、フィルタされたデータが返る）
    const buttons = screen.getAllByRole("button");
    const dangerButton = buttons.find((b) => b.textContent === "危険")!;
    fireEvent.click(dangerButton);

    // APIからフィルタ済みのデータが返ってくることをシミュレート
    const filteredCountries: Country[] = [
      { ...mockCountries[1], safety_level: 2 }, // フランスのみ
    ];
    mockUseSWR.mockReturnValue({ data: filteredCountries, isLoading: false, error: undefined, mutate: jest.fn() });
    rerender(<CountriesContent />);

    // フランスのみが表示される
    expect(screen.getByText("フランス")).toBeInTheDocument();
    expect(screen.queryByText("日本")).not.toBeInTheDocument();
  });
});
