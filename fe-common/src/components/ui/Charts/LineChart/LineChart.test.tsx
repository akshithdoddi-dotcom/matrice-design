import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";

import { LineChart } from "./LineChart";

vi.mock("recharts", () => {
  const OriginalModule = vi.importActual("recharts");
  return {
    ...OriginalModule,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ResponsiveContainer: ({ children }: any) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ComposedChart: ({ children, ...props }: any) => (
      <div data-testid="recharts-line-chart" {...props}>
        {children}
      </div>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Line: (props: any) => <div data-testid={`line-${props.dataKey}`} />,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Area: (props: any) => <div data-testid={`area-${props.dataKey}`} />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    ReferenceLine: () => <div data-testid="reference-line" />,
    ReferenceArea: () => <div data-testid="reference-area" />,
  };
});

const sampleData = [
  { epoch: 1, trainLoss: 0.5, valLoss: 0.6 },
  { epoch: 2, trainLoss: 0.3, valLoss: 0.4 },
  { epoch: 3, trainLoss: 0.2, valLoss: 0.3 },
];

describe("LineChart", () => {
  it("renders with minimal props", () => {
    render(
      <LineChart
        data={sampleData}
        lines={[{ dataKey: "trainLoss", color: "#000" }]}
        xKey="epoch"
        height={300}
      />,
    );
    expect(screen.getByTestId("recharts-line-chart")).toBeInTheDocument();
  });

  it("renders a Line for each series", () => {
    render(
      <LineChart
        data={sampleData}
        lines={[
          { dataKey: "trainLoss", color: "#000" },
          { dataKey: "valLoss", color: "#f00" },
        ]}
        xKey="epoch"
        height={300}
      />,
    );
    expect(screen.getByTestId("line-trainLoss")).toBeInTheDocument();
    expect(screen.getByTestId("line-valLoss")).toBeInTheDocument();
  });

  it("renders Area when area=true", () => {
    render(
      <LineChart
        data={sampleData}
        lines={[{ dataKey: "trainLoss", color: "#000", area: true }]}
        xKey="epoch"
        height={300}
      />,
    );
    expect(screen.getByTestId("area-trainLoss")).toBeInTheDocument();
  });

  it("renders legend when enabled", () => {
    render(
      <LineChart
        data={sampleData}
        lines={[{ dataKey: "trainLoss", color: "#000" }]}
        xKey="epoch"
        height={300}
        legend={true}
      />,
    );
    expect(screen.getByTestId("legend")).toBeInTheDocument();
  });

  it("renders reference lines", () => {
    render(
      <LineChart
        data={sampleData}
        lines={[{ dataKey: "trainLoss", color: "#000" }]}
        xKey="epoch"
        height={300}
        referenceLines={[{ axis: "y", value: 0.3, label: "Target" }]}
      />,
    );
    expect(screen.getByTestId("reference-line")).toBeInTheDocument();
  });

  it("applies ariaLabel", () => {
    render(
      <LineChart
        data={sampleData}
        lines={[{ dataKey: "trainLoss", color: "#000" }]}
        xKey="epoch"
        height={300}
        ariaLabel="Training progress"
      />,
    );
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      "Training progress",
    );
  });
});
