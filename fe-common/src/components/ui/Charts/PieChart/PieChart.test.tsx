import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@testing-library/react";

import { PieChart } from "./PieChart";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let capturedPieProps: any = {};

vi.mock("recharts", () => {
  const OriginalModule = vi.importActual("recharts");
  return {
    ...OriginalModule,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ResponsiveContainer: ({ children }: any) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PieChart: ({ children, ...props }: any) => (
      <div data-testid="recharts-pie-chart" {...props}>
        {children}
      </div>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Pie: ({ children, ...props }: any) => {
      capturedPieProps = props;
      return (
        <div
          data-testid="recharts-pie"
          data-inner-radius={props.innerRadius}
          data-has-label={props.label !== false ? "true" : "false"}
          data-label-line={props.labelLine ? "true" : "false"}
          data-cursor={props.cursor}
          onClick={
            props.onClick
              ? () => props.onClick({ name: "Test", value: 100 }, 0, {})
              : undefined
          }
        >
          {children}
        </div>
      );
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cell: (props: any) => <div data-testid={`cell-${props.fill}`} />,
    Tooltip: () => <div data-testid="tooltip" />,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Legend: (props: any) => (
      <div
        data-testid="legend"
        data-vertical-align={props.verticalAlign}
        data-align={props.align}
      />
    ),
  };
});

const sampleData = [
  { name: "Cats", value: 120, color: "#ff0000" },
  { name: "Dogs", value: 80, color: "#00ff00" },
  { name: "Birds", value: 35, color: "#0000ff" },
];

describe("PieChart", () => {
  beforeEach(() => {
    capturedPieProps = {};
  });

  it("renders with minimal props", () => {
    render(<PieChart data={sampleData} height={300} />);
    expect(screen.getByTestId("recharts-pie-chart")).toBeInTheDocument();
  });

  it("renders a Cell for each datum", () => {
    render(<PieChart data={sampleData} height={300} />);
    expect(screen.getByTestId("cell-#ff0000")).toBeInTheDocument();
    expect(screen.getByTestId("cell-#00ff00")).toBeInTheDocument();
    expect(screen.getByTestId("cell-#0000ff")).toBeInTheDocument();
  });

  it("renders as donut when variant=donut", () => {
    render(<PieChart data={sampleData} height={300} variant="donut" />);
    const pie = screen.getByTestId("recharts-pie");
    expect(pie.getAttribute("data-inner-radius")).toBe("60%");
  });

  it("renders legend when enabled", () => {
    render(<PieChart data={sampleData} height={300} legend={true} />);
    expect(screen.getByTestId("legend")).toBeInTheDocument();
  });

  it("does not render legend by default", () => {
    render(<PieChart data={sampleData} height={300} />);
    expect(screen.queryByTestId("legend")).not.toBeInTheDocument();
  });

  it("renders tooltip by default", () => {
    render(<PieChart data={sampleData} height={300} />);
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });

  it("hides tooltip when tooltip=false", () => {
    render(<PieChart data={sampleData} height={300} tooltip={false} />);
    expect(screen.queryByTestId("tooltip")).not.toBeInTheDocument();
  });

  it("renders center content when provided", () => {
    render(
      <PieChart
        data={sampleData}
        height={300}
        variant="donut"
        centerContent={<span data-testid="center">207</span>}
      />,
    );
    expect(screen.getByTestId("center")).toBeInTheDocument();
  });

  it("applies ariaLabel", () => {
    render(
      <PieChart
        data={sampleData}
        height={300}
        ariaLabel="Status distribution"
      />,
    );
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      "Status distribution",
    );
  });

  // -------------------------------------------------------------------------
  // Labels
  // -------------------------------------------------------------------------
  it("renders with labels when labels prop is true", () => {
    render(<PieChart data={sampleData} height={300} labels />);
    const pie = screen.getByTestId("recharts-pie");
    expect(pie.getAttribute("data-has-label")).toBe("true");
  });

  it("renders labels with percent type by default", () => {
    render(
      <PieChart
        data={sampleData}
        height={300}
        labels={{ position: "outside" }}
      />,
    );
    const pie = screen.getByTestId("recharts-pie");
    expect(pie.getAttribute("data-has-label")).toBe("true");
    expect(pie.getAttribute("data-label-line")).toBe("true");
  });

  it("renders inside labels without label lines", () => {
    render(
      <PieChart
        data={sampleData}
        height={300}
        labels={{ position: "inside", type: "value" }}
      />,
    );
    const pie = screen.getByTestId("recharts-pie");
    expect(pie.getAttribute("data-has-label")).toBe("true");
  });

  it("hides labels when labels is false", () => {
    render(<PieChart data={sampleData} height={300} labels={false} />);
    const pie = screen.getByTestId("recharts-pie");
    expect(pie.getAttribute("data-has-label")).toBe("false");
  });

  it("hides label lines when labelLines is false", () => {
    render(
      <PieChart data={sampleData} height={300} labels labelLines={false} />,
    );
    const pie = screen.getByTestId("recharts-pie");
    expect(pie.getAttribute("data-label-line")).toBe("false");
  });

  it("supports custom label formatter", () => {
    const formatter = vi.fn(({ name, value }) => `${name}: ${value}`);
    render(
      <PieChart
        data={sampleData}
        height={300}
        labels={{ position: "inside", formatter }}
      />,
    );
    // The formatter is passed to the label render function
    expect(capturedPieProps.label).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // Slice click
  // -------------------------------------------------------------------------
  it("calls onSliceClick when a slice is clicked", () => {
    const handleSliceClick = vi.fn();
    render(
      <PieChart
        data={sampleData}
        height={300}
        onSliceClick={handleSliceClick}
      />,
    );
    const pie = screen.getByTestId("recharts-pie");
    expect(pie.getAttribute("data-cursor")).toBe("pointer");
    fireEvent.click(pie);
    expect(handleSliceClick).toHaveBeenCalledWith(
      { name: "Test", value: 100 },
      0,
      {},
    );
  });

  it("does not set cursor when onSliceClick is not provided", () => {
    render(<PieChart data={sampleData} height={300} />);
    const pie = screen.getByTestId("recharts-pie");
    expect(pie.getAttribute("data-cursor")).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Custom radii
  // -------------------------------------------------------------------------
  it("uses custom innerRadius when provided", () => {
    render(<PieChart data={sampleData} height={300} innerRadius="40%" />);
    const pie = screen.getByTestId("recharts-pie");
    expect(pie.getAttribute("data-inner-radius")).toBe("40%");
  });

  it("uses custom outerRadius when provided", () => {
    render(<PieChart data={sampleData} height={300} outerRadius="90%" />);
    expect(capturedPieProps.outerRadius).toBe("90%");
  });

  // -------------------------------------------------------------------------
  // Legend configuration
  // -------------------------------------------------------------------------
  it("positions legend at top when configured", () => {
    render(
      <PieChart data={sampleData} height={300} legend={{ position: "top" }} />,
    );
    const legend = screen.getByTestId("legend");
    expect(legend.getAttribute("data-vertical-align")).toBe("top");
  });

  it("aligns legend correctly", () => {
    render(
      <PieChart
        data={sampleData}
        height={300}
        legend={{ position: "bottom", alignment: "start" }}
      />,
    );
    const legend = screen.getByTestId("legend");
    expect(legend.getAttribute("data-vertical-align")).toBe("bottom");
    expect(legend.getAttribute("data-align")).toBe("start");
  });

  // -------------------------------------------------------------------------
  // Animation and angles
  // -------------------------------------------------------------------------
  it("disables animation when animate is false", () => {
    render(<PieChart data={sampleData} height={300} animate={false} />);
    expect(capturedPieProps.isAnimationActive).toBe(false);
  });

  it("uses custom start and end angles", () => {
    render(
      <PieChart data={sampleData} height={300} startAngle={0} endAngle={360} />,
    );
    expect(capturedPieProps.startAngle).toBe(0);
    expect(capturedPieProps.endAngle).toBe(360);
  });

  it("uses custom padding angle", () => {
    render(<PieChart data={sampleData} height={300} paddingAngle={2} />);
    expect(capturedPieProps.paddingAngle).toBe(2);
  });

  // -------------------------------------------------------------------------
  // Tooltip configuration
  // -------------------------------------------------------------------------
  it("renders with custom tooltip config", () => {
    render(
      <PieChart
        data={sampleData}
        height={300}
        tooltip={{ labelFormatter: (label) => `Label: ${label}` }}
      />,
    );
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });
});
