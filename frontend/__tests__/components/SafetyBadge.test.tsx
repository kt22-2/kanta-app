import { render, screen } from "@testing-library/react";
import SafetyBadge from "@/components/SafetyBadge";
import type { SafetyLevel } from "@/lib/types";

describe("SafetyBadge", () => {
  it("レベル0で「安全」を表示する", () => {
    render(<SafetyBadge level={0 as SafetyLevel} />);
    expect(screen.getByText("安全")).toBeInTheDocument();
  });

  it("レベル1で「注意」を表示する", () => {
    render(<SafetyBadge level={1 as SafetyLevel} />);
    expect(screen.getByText("注意")).toBeInTheDocument();
  });

  it("レベル2で「危険」を表示する", () => {
    render(<SafetyBadge level={2 as SafetyLevel} />);
    expect(screen.getByText("危険")).toBeInTheDocument();
  });

  it("レベル3で「渡航中止」を表示する", () => {
    render(<SafetyBadge level={3 as SafetyLevel} />);
    expect(screen.getByText("渡航中止")).toBeInTheDocument();
  });

  it("レベル4で「退避勧告」を表示する", () => {
    render(<SafetyBadge level={4 as SafetyLevel} />);
    expect(screen.getByText("退避勧告")).toBeInTheDocument();
  });

  it("labelをカスタム指定できる", () => {
    render(<SafetyBadge level={0 as SafetyLevel} label="Custom Label" />);
    expect(screen.getByText("Custom Label")).toBeInTheDocument();
  });
});
