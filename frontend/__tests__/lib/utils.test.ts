import { formatPopulation, getSafetyColor, getSafetyLabel, getRegionLabel } from "@/lib/utils";
import type { SafetyLevel } from "@/lib/types";

describe("formatPopulation", () => {
  it("10億以上をB表記にする", () => {
    expect(formatPopulation(1_400_000_000)).toBe("1.4B");
  });

  it("100万以上をM表記にする", () => {
    expect(formatPopulation(1_000_000)).toBe("1.0M");
    expect(formatPopulation(125_700_000)).toBe("125.7M");
  });

  it("1000以上をK表記にする", () => {
    expect(formatPopulation(50_000)).toBe("50K");
  });

  it("1000未満をそのまま返す", () => {
    expect(formatPopulation(500)).toBe("500");
  });
});

describe("getSafetyColor", () => {
  it("レベル0はgreenクラスを返す", () => {
    expect(getSafetyColor(0 as SafetyLevel)).toContain("green");
  });

  it("レベル1はyellowクラスを返す", () => {
    expect(getSafetyColor(1 as SafetyLevel)).toContain("yellow");
  });

  it("レベル2はorangeクラスを返す", () => {
    expect(getSafetyColor(2 as SafetyLevel)).toContain("orange");
  });

  it("レベル3はredクラスを返す", () => {
    expect(getSafetyColor(3 as SafetyLevel)).toContain("red");
  });

  it("レベル4はredクラスを返す", () => {
    expect(getSafetyColor(4 as SafetyLevel)).toContain("red");
  });
});

describe("getSafetyLabel", () => {
  it("レベル0は「安全」を返す", () => {
    expect(getSafetyLabel(0 as SafetyLevel)).toBe("安全");
  });

  it("レベル3は「渡航中止」を返す", () => {
    expect(getSafetyLabel(3 as SafetyLevel)).toBe("渡航中止");
  });

  it("レベル4は「退避勧告」を返す", () => {
    expect(getSafetyLabel(4 as SafetyLevel)).toBe("退避勧告");
  });
});

describe("getRegionLabel", () => {
  it("Asiaはアジアを返す", () => {
    expect(getRegionLabel("Asia")).toBe("アジア");
  });

  it("Europeはヨーロッパを返す", () => {
    expect(getRegionLabel("Europe")).toBe("ヨーロッパ");
  });

  it("未知の地域はそのまま返す", () => {
    expect(getRegionLabel("Unknown")).toBe("Unknown");
  });
});
