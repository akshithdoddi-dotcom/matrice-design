import { describe, expect, it } from "vitest";

import { render, screen } from "@testing-library/react";

import { ChartTooltip } from "./ChartTooltip";

describe("ChartTooltip", () => {
  const defaultPayload = [
    { name: "Series A", value: 100, color: "#ff0000", dataKey: "seriesA" },
    { name: "Series B", value: 200, color: "#00ff00", dataKey: "seriesB" },
  ];

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------
  it("returns null when active is false", () => {
    const { container } = render(
      <ChartTooltip active={false} payload={defaultPayload} label="January" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("returns null when payload is empty", () => {
    const { container } = render(
      <ChartTooltip active={true} payload={[]} label="January" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("returns null when payload is undefined", () => {
    const { container } = render(
      <ChartTooltip active={true} payload={undefined} label="January" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders tooltip content when active with payload", () => {
    render(
      <ChartTooltip active={true} payload={defaultPayload} label="January" />,
    );
    expect(screen.getByText("January")).toBeInTheDocument();
    expect(screen.getByText("Series A:")).toBeInTheDocument();
    expect(screen.getByText("Series B:")).toBeInTheDocument();
  });

  it("renders all payload entries with their values", () => {
    render(
      <ChartTooltip active={true} payload={defaultPayload} label="January" />,
    );
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Label formatting
  // -------------------------------------------------------------------------
  it("renders label without formatter", () => {
    render(
      <ChartTooltip active={true} payload={defaultPayload} label="Q1 2025" />,
    );
    expect(screen.getByText("Q1 2025")).toBeInTheDocument();
  });

  it("applies labelFormatter from config", () => {
    const config = {
      labelFormatter: (label: string | number | undefined) =>
        `Period: ${label}`,
    };
    render(
      <ChartTooltip
        active={true}
        payload={defaultPayload}
        label="January"
        config={config}
      />,
    );
    expect(screen.getByText("Period: January")).toBeInTheDocument();
  });

  it("does not render label when label is null", () => {
    render(
      <ChartTooltip active={true} payload={defaultPayload} label={undefined} />,
    );
    expect(screen.queryByText("undefined")).not.toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Value formatting
  // -------------------------------------------------------------------------
  it("formats decimal values to 2 decimal places by default", () => {
    const payload = [
      { name: "Value", value: 123.456789, color: "#ff0000", dataKey: "value" },
    ];
    render(<ChartTooltip active={true} payload={payload} label="Test" />);
    expect(screen.getByText("123.46")).toBeInTheDocument();
  });

  it("displays integer values without decimal formatting", () => {
    const payload = [
      { name: "Value", value: 100, color: "#ff0000", dataKey: "value" },
    ];
    render(<ChartTooltip active={true} payload={payload} label="Test" />);
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("applies valueFormatter from config", () => {
    const config = {
      valueFormatter: (value: number) => `$${value.toLocaleString()}`,
    };
    const payload = [
      { name: "Revenue", value: 1000, color: "#ff0000", dataKey: "revenue" },
    ];
    render(
      <ChartTooltip
        active={true}
        payload={payload}
        label="Sales"
        config={config}
      />,
    );
    expect(screen.getByText("$1,000")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------
  it("handles numeric label", () => {
    render(
      <ChartTooltip active={true} payload={defaultPayload} label={2025} />,
    );
    expect(screen.getByText("2025")).toBeInTheDocument();
  });

  it("uses entry.name as fallback key when dataKey is undefined", () => {
    const payload = [
      { name: "Fallback", value: 50, color: "#0000ff", dataKey: "" },
    ];
    render(<ChartTooltip active={true} payload={payload} label="Test" />);
    expect(screen.getByText("Fallback:")).toBeInTheDocument();
  });
});
