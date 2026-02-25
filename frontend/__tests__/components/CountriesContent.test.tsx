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
    region: "Asia",
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
    region: "Europe",
    population: 67_391_582,
    languages: ["French"],
    currencies: [{ code: "EUR", name: "Euro", symbol: "€" }],
    flag_url: "https://flagcdn.com/fr.svg",
    flag_emoji: "🇫🇷",
  },
];

describe("CountriesContent", () => {
  it("ローディング中はスピナーを表示する", () => {
    mockUseSWR.mockReturnValue({ data: undefined, isLoading: true, error: undefined });
    render(<CountriesContent />);
    // LoadingSpinner が表示される
    expect(screen.getByText("国情報を読み込み中...")).toBeInTheDocument();
  });

  it("データ取得後に国名カードが表示される", () => {
    mockUseSWR.mockReturnValue({ data: mockCountries, isLoading: false, error: undefined });
    render(<CountriesContent />);
    expect(screen.getByText("Japan")).toBeInTheDocument();
    expect(screen.getByText("France")).toBeInTheDocument();
  });

  it("国数が表示される", () => {
    mockUseSWR.mockReturnValue({ data: mockCountries, isLoading: false, error: undefined });
    render(<CountriesContent />);
    expect(screen.getByText("2カ国")).toBeInTheDocument();
  });

  it("エラー時はエラーメッセージを表示する", () => {
    mockUseSWR.mockReturnValue({ data: undefined, isLoading: false, error: new Error("fetch error") });
    render(<CountriesContent />);
    expect(screen.getByText(/データの読み込みに失敗しました/)).toBeInTheDocument();
  });

  it("検索入力が可能", () => {
    mockUseSWR.mockReturnValue({ data: mockCountries, isLoading: false, error: undefined });
    render(<CountriesContent />);
    const input = screen.getByPlaceholderText("国名・国コードで検索...");
    fireEvent.change(input, { target: { value: "Japan" } });
    expect(input).toHaveValue("Japan");
  });

  it("リージョンボタンが表示される", () => {
    mockUseSWR.mockReturnValue({ data: mockCountries, isLoading: false, error: undefined });
    render(<CountriesContent />);
    // ボタン要素に絞って確認
    const buttons = screen.getAllByRole("button");
    const buttonTexts = buttons.map((b) => b.textContent);
    expect(buttonTexts).toContain("全て");
    expect(buttonTexts).toContain("アジア");
    expect(buttonTexts).toContain("ヨーロッパ");
  });

  it("リージョンボタンのクリックで state が更新される", () => {
    mockUseSWR.mockReturnValue({ data: mockCountries, isLoading: false, error: undefined });
    render(<CountriesContent />);
    // ボタン要素の中から「アジア」ボタンを取得
    const buttons = screen.getAllByRole("button");
    const asiaButton = buttons.find((b) => b.textContent === "アジア")!;
    fireEvent.click(asiaButton);
    // クリック後に active スタイル（bg-[#C8A96E]）が適用されることを確認
    expect(asiaButton).toHaveClass("bg-[#C8A96E]");
  });
});
