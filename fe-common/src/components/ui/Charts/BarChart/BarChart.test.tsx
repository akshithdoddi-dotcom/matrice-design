import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";

import { BarChart } from "./BarChart";

// Mock recharts to avoid SVG rendering issues in happy-dom
vi.mock("recharts", () => {
  const OriginalModule = vi.importActual("recharts");
  return {
    ...OriginalModule,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ResponsiveContainer: ({ children }: any) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    BarChart: ({ children, ...props }: any) => (
      <div data-testid="recharts-bar-chart" {...props}>
        {children}
      </div>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Bar: (props: any) => <div data-testid={`bar-${props.dataKey}`} />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    ReferenceLine: () => <div data-testid="reference-line" />,
    ReferenceArea: () => <div data-testid="reference-area" />,
    Cell: () => null,
  };
});

const sampleData = [
  { model: "A", accuracy: 0.9, loss: 0.1 },
  { model: "B", accuracy: 0.85, loss: 0.15 },
];

describe("BarChart", () => {
  it("renders with minimal props", () => {
    render(
      <BarChart
        data={sampleData}
        bars={[{ dataKey: "accuracy", color: "#000" }]}
        categoryKey="model"
        height={300}
      />,
    );
    expect(screen.getByTestId("recharts-bar-chart")).toBeInTheDocument();
  });

  it("renders a Bar for each series", () => {
    render(
      <BarChart
        data={sampleData}
        bars={[
          { dataKey: "accuracy", color: "#000" },
          { dataKey: "loss", color: "#f00" },
        ]}
        categoryKey="model"
        height={300}
      />,
    );
    expect(screen.getByTestId("bar-accuracy")).toBeInTheDocument();
    expect(screen.getByTestId("bar-loss")).toBeInTheDocument();
  });

  it("renders grid by default", () => {
    render(
      <BarChart
        data={sampleData}
        bars={[{ dataKey: "accuracy", color: "#000" }]}
        categoryKey="model"
        height={300}
      />,
    );
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
  });

  it("hides grid when grid=false", () => {
    render(
      <BarChart
        data={sampleData}
        bars={[{ dataKey: "accuracy", color: "#000" }]}
        categoryKey="model"
        height={300}
        grid={false}
      />,
    );
    expect(screen.queryByTestId("cartesian-grid")).not.toBeInTheDocument();
  });

  it("renders legend when legend=true", () => {
    render(
      <BarChart
        data={sampleData}
        bars={[{ dataKey: "accuracy", color: "#000" }]}
        categoryKey="model"
        height={300}
        legend={true}
      />,
    );
    expect(screen.getByTestId("legend")).toBeInTheDocument();
  });

  it("does not render legend by default", () => {
    render(
      <BarChart
        data={sampleData}
        bars={[{ dataKey: "accuracy", color: "#000" }]}
        categoryKey="model"
        height={300}
      />,
    );
    expect(screen.queryByTestId("legend")).not.toBeInTheDocument();
  });

  it("renders tooltip by default", () => {
    render(
      <BarChart
        data={sampleData}
        bars={[{ dataKey: "accuracy", color: "#000" }]}
        categoryKey="model"
        height={300}
      />,
    );
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });

  it("hides tooltip when tooltip=false", () => {
    render(
      <BarChart
        data={sampleData}
        bars={[{ dataKey: "accuracy", color: "#000" }]}
        categoryKey="model"
        height={300}
        tooltip={false}
      />,
    );
    expect(screen.queryByTestId("tooltip")).not.toBeInTheDocument();
  });

  it("applies ariaLabel to container", () => {
    render(
      <BarChart
        data={sampleData}
        bars={[{ dataKey: "accuracy", color: "#000" }]}
        categoryKey="model"
        height={300}
        ariaLabel="Model accuracy chart"
      />,
    );
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      "Model accuracy chart",
    );
  });
});
