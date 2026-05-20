import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";

import { ScatterChart } from "./ScatterChart";

vi.mock("recharts", () => {
  const OriginalModule = vi.importActual("recharts");
  return {
    ...OriginalModule,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ResponsiveContainer: ({ children }: any) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ScatterChart: ({ children, ...props }: any) => (
      <div data-testid="recharts-scatter-chart" {...props}>
        {children}
      </div>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Scatter: (props: any) => <div data-testid={`scatter-${props.name}`} />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    ZAxis: () => <div data-testid="z-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    ReferenceLine: () => <div data-testid="reference-line" />,
    ReferenceArea: () => <div data-testid="reference-area" />,
  };
});

const sampleSeries = [
  {
    name: "Group A",
    data: [
      { x: 10, y: 20 },
      { x: 30, y: 40 },
    ],
    color: "#ff0000",
  },
];

describe("ScatterChart", () => {
  it("renders with minimal props", () => {
    render(
      <ScatterChart series={sampleSeries} xKey="x" yKey="y" height={300} />,
    );
    expect(screen.getByTestId("recharts-scatter-chart")).toBeInTheDocument();
  });

  it("renders a Scatter for each series", () => {
    render(
      <ScatterChart
        series={[
          ...sampleSeries,
          { name: "Group B", data: [{ x: 50, y: 60 }], color: "#00ff00" },
        ]}
        xKey="x"
        yKey="y"
        height={300}
      />,
    );
    expect(screen.getByTestId("scatter-Group A")).toBeInTheDocument();
    expect(screen.getByTestId("scatter-Group B")).toBeInTheDocument();
  });

  it("renders grid by default", () => {
    render(
      <ScatterChart series={sampleSeries} xKey="x" yKey="y" height={300} />,
    );
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
  });

  it("renders ZAxis for dynamic node size", () => {
    render(
      <ScatterChart
        series={sampleSeries}
        xKey="x"
        yKey="y"
        height={300}
        nodeSize={{ dataKey: "size", range: [40, 400] }}
      />,
    );
    expect(screen.getByTestId("z-axis")).toBeInTheDocument();
  });

  it("renders legend when enabled", () => {
    render(
      <ScatterChart
        series={sampleSeries}
        xKey="x"
        yKey="y"
        height={300}
        legend={true}
      />,
    );
    expect(screen.getByTestId("legend")).toBeInTheDocument();
  });

  it("renders reference lines", () => {
    render(
      <ScatterChart
        series={sampleSeries}
        xKey="x"
        yKey="y"
        height={300}
        referenceLines={[{ axis: "x", value: 50 }]}
      />,
    );
    expect(screen.getByTestId("reference-line")).toBeInTheDocument();
  });

  it("applies ariaLabel", () => {
    render(
      <ScatterChart
        series={sampleSeries}
        xKey="x"
        yKey="y"
        height={300}
        ariaLabel="Scatter plot"
      />,
    );
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      "Scatter plot",
    );
  });
});
