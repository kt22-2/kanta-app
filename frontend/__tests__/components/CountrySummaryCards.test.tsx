import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CountrySummaryCards from "@/components/CountrySummaryCards";
import type { CountryGroup } from "@/lib/livestream-data";

const makeCountryGroup = (overrides: Partial<CountryGroup>): CountryGroup => ({
  country: "日本",
  flag: "🇯🇵",
  cities: ["東京"],
  totalVideos: 2,
  dateRange: "2024-01-01 ~ 2024-01-02",
  lat: 35.6762,
  lng: 139.6503,
  ...overrides,
});

describe("CountrySummaryCards", () => {
  it("各国のカードを表示する", () => {
    const groups: CountryGroup[] = [
      makeCountryGroup({ country: "日本", flag: "🇯🇵" }),
      makeCountryGroup({ country: "タイ", flag: "🇹🇭", lat: 13.7, lng: 100.5 }),
    ];
    render(<CountrySummaryCards groups={groups} onCountryClick={() => {}} />);
    expect(screen.getByText("日本")).toBeInTheDocument();
    expect(screen.getByText("タイ")).toBeInTheDocument();
  });

  it("国旗絵文字を表示する", () => {
    const groups: CountryGroup[] = [
      makeCountryGroup({ flag: "🇯🇵" }),
    ];
    render(<CountrySummaryCards groups={groups} onCountryClick={() => {}} />);
    expect(screen.getByText("🇯🇵")).toBeInTheDocument();
  });

  it("動画本数を表示する", () => {
    const groups: CountryGroup[] = [
      makeCountryGroup({ totalVideos: 41 }),
    ];
    render(<CountrySummaryCards groups={groups} onCountryClick={() => {}} />);
    expect(screen.getByText(/41本/)).toBeInTheDocument();
  });

  it("カードクリック時に onCountryClick を呼び出す", () => {
    const handleClick = jest.fn();
    const groups: CountryGroup[] = [
      makeCountryGroup({ lat: 35.6762, lng: 139.6503, country: "日本" }),
    ];
    render(<CountrySummaryCards groups={groups} onCountryClick={handleClick} />);
    fireEvent.click(screen.getByText("日本").closest("button")!);
    expect(handleClick).toHaveBeenCalledWith(35.6762, 139.6503, "日本");
  });

  it("最後の国カードに「現在地」バッジを表示する", () => {
    const groups: CountryGroup[] = [
      makeCountryGroup({ country: "日本", flag: "🇯🇵" }),
      makeCountryGroup({ country: "タイ", flag: "🇹🇭", lat: 13.7, lng: 100.5 }),
    ];
    render(<CountrySummaryCards groups={groups} onCountryClick={() => {}} />);
    expect(screen.getByText("現在地")).toBeInTheDocument();
  });

  it("都市名を表示する", () => {
    const groups: CountryGroup[] = [
      makeCountryGroup({ cities: ["ムンバイ", "ジョードプル"] }),
    ];
    render(<CountrySummaryCards groups={groups} onCountryClick={() => {}} />);
    expect(screen.getByText(/ムンバイ/)).toBeInTheDocument();
  });
});
