import { render, screen } from "@testing-library/react";
import CountryCard from "@/components/CountryCard";
import type { Country } from "@/lib/types";

const mockCountry: Country = {
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
};

describe("CountryCard", () => {
  it("日本語名をメインに表示する", () => {
    render(<CountryCard country={mockCountry} />);
    expect(screen.getByText("日本")).toBeInTheDocument();
  });

  it("英語名をサブテキストに表示する", () => {
    render(<CountryCard country={mockCountry} />);
    expect(screen.getByText("Japan")).toBeInTheDocument();
  });

  it("地域を表示する（日本語）", () => {
    render(<CountryCard country={mockCountry} />);
    expect(screen.getByText("アジア")).toBeInTheDocument();
  });

  it("国旗の絵文字を表示する", () => {
    render(<CountryCard country={mockCountry} />);
    expect(screen.getByText("🇯🇵")).toBeInTheDocument();
  });

  it("安全レベルが渡されたときにバッジを表示する", () => {
    render(<CountryCard country={mockCountry} safetyLevel={0} />);
    expect(screen.getByText("安全")).toBeInTheDocument();
  });
});
