import { describe, expect, it, vi } from "vitest";

import { render } from "@testing-library/react";

import {
  buildAxisProps,
  renderGrid,
  renderLegend,
  renderReferenceAreas,
  renderReferenceLines,
  renderTooltip,
} from "./chartElements";

// Mock recharts components
vi.mock("recharts", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CartesianGrid: (props: any) => (
    <div
      data-testid="cartesian-grid"
      data-horizontal={props.horizontal}
      data-vertical={props.vertical}
      data-stroke={props.stroke}
      data-stroke-dasharray={props.strokeDasharray}
    />
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Tooltip: (props: any) => (
    <div data-testid="tooltip" data-cursor={JSON.stringify(props.cursor)} />
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Legend: (props: any) => (
    <div
      data-testid="legend"
      data-vertical-align={props.verticalAlign}
      data-align={props.align}
    />
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ReferenceLine: (props: any) => (
    <div
      data-testid="reference-line"
      data-x={props.x}
      data-y={props.y}
      data-stroke={props.stroke}
    />
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ReferenceArea: (props: any) => (
    <div
      data-testid="reference-area"
      data-x1={props.x1}
      data-x2={props.x2}
      data-y1={props.y1}
      data-y2={props.y2}
      data-fill={props.fill}
    />
  ),
}));

describe("renderGrid", () => {
  it("renders default grid when grid is undefined", () => {
    const result = renderGrid(undefined);
    const { container } = render(<svg>{result}</svg>);
    const grid = container.querySelector('[data-testid="cartesian-grid"]');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveAttribute("data-horizontal", "true");
    expect(grid).toHaveAttribute("data-vertical", "false");
  });

  it("returns null when grid is false", () => {
    const result = renderGrid(false);
    expect(result).toBeNull();
  });

  it("renders CartesianGrid when grid is true", () => {
    const result = renderGrid(true);
    const { container } = render(<svg>{result}</svg>);
    expect(
      container.querySelector('[data-testid="cartesian-grid"]'),
    ).toBeInTheDocument();
  });

  it("renders CartesianGrid with config options", () => {
    const result = renderGrid({
      horizontal: true,
      vertical: false,
      strokeDasharray: "5 5",
    });
    const { container } = render(<svg>{result}</svg>);
    const grid = container.querySelector('[data-testid="cartesian-grid"]');
    expect(grid).toHaveAttribute("data-horizontal", "true");
    expect(grid).toHaveAttribute("data-vertical", "false");
    expect(grid).toHaveAttribute("data-stroke-dasharray", "5 5");
  });

  it("renders CartesianGrid with vertical lines enabled", () => {
    const result = renderGrid({
      horizontal: false,
      vertical: true,
    });
    const { container } = render(<svg>{result}</svg>);
    const grid = container.querySelector('[data-testid="cartesian-grid"]');
    expect(grid).toHaveAttribute("data-horizontal", "false");
    expect(grid).toHaveAttribute("data-vertical", "true");
  });
});

describe("renderTooltip", () => {
  it("returns null when tooltip is false", () => {
    const result = renderTooltip(false);
    expect(result).toBeNull();
  });

  it("renders Tooltip with default cursor when tooltip is undefined", () => {
    const result = renderTooltip(undefined);
    const { container } = render(<div>{result}</div>);
    expect(
      container.querySelector('[data-testid="tooltip"]'),
    ).toBeInTheDocument();
  });

  it("renders Tooltip with config", () => {
    const result = renderTooltip({
      labelFormatter: (label) => `Label: ${label}`,
    });
    const { container } = render(<div>{result}</div>);
    expect(
      container.querySelector('[data-testid="tooltip"]'),
    ).toBeInTheDocument();
  });

  it("renders Tooltip with custom cursor", () => {
    const result = renderTooltip(undefined, {
      stroke: "#ff0000",
      opacity: 0.5,
    });
    const { container } = render(<div>{result}</div>);
    const tooltip = container.querySelector('[data-testid="tooltip"]');
    expect(tooltip?.getAttribute("data-cursor")).toContain("#ff0000");
  });

  it("renders Tooltip with cursor disabled", () => {
    const result = renderTooltip(undefined, false);
    const { container } = render(<div>{result}</div>);
    const tooltip = container.querySelector('[data-testid="tooltip"]');
    expect(tooltip?.getAttribute("data-cursor")).toBe("false");
  });
});

describe("renderLegend", () => {
  it("returns null when legend is undefined", () => {
    const result = renderLegend(undefined);
    expect(result).toBeNull();
  });

  it("returns null when legend is false", () => {
    const result = renderLegend(false);
    expect(result).toBeNull();
  });

  it("renders Legend when legend is true", () => {
    const result = renderLegend(true);
    const { container } = render(<div>{result}</div>);
    expect(
      container.querySelector('[data-testid="legend"]'),
    ).toBeInTheDocument();
  });

  it("renders Legend with top position", () => {
    const result = renderLegend({ position: "top" });
    const { container } = render(<div>{result}</div>);
    const legend = container.querySelector('[data-testid="legend"]');
    expect(legend).toHaveAttribute("data-vertical-align", "top");
  });

  it("renders Legend with bottom position and start alignment", () => {
    const result = renderLegend({ position: "bottom", alignment: "start" });
    const { container } = render(<div>{result}</div>);
    const legend = container.querySelector('[data-testid="legend"]');
    expect(legend).toHaveAttribute("data-vertical-align", "bottom");
    expect(legend).toHaveAttribute("data-align", "start");
  });
});

describe("renderReferenceLines", () => {
  it("returns null when lines is undefined", () => {
    const result = renderReferenceLines(undefined);
    expect(result).toBeNull();
  });

  it("returns null when lines is empty array", () => {
    const result = renderReferenceLines([]);
    expect(result).toBeNull();
  });

  it("renders reference lines for x axis", () => {
    const result = renderReferenceLines([
      { axis: "x", value: 100, color: "#ff0000" },
    ]);
    const { container } = render(<svg>{result}</svg>);
    const line = container.querySelector('[data-testid="reference-line"]');
    expect(line).toHaveAttribute("data-x", "100");
    expect(line).toHaveAttribute("data-stroke", "#ff0000");
  });

  it("renders reference lines for y axis", () => {
    const result = renderReferenceLines([{ axis: "y", value: 50 }]);
    const { container } = render(<svg>{result}</svg>);
    const line = container.querySelector('[data-testid="reference-line"]');
    expect(line).toHaveAttribute("data-y", "50");
  });

  it("renders multiple reference lines", () => {
    const result = renderReferenceLines([
      { axis: "x", value: 10 },
      { axis: "y", value: 20 },
    ]);
    const { container } = render(<svg>{result}</svg>);
    const lines = container.querySelectorAll('[data-testid="reference-line"]');
    expect(lines).toHaveLength(2);
  });
});

describe("renderReferenceAreas", () => {
  it("returns null when areas is undefined", () => {
    const result = renderReferenceAreas(undefined);
    expect(result).toBeNull();
  });

  it("returns null when areas is empty array", () => {
    const result = renderReferenceAreas([]);
    expect(result).toBeNull();
  });

  it("renders reference area with coordinates", () => {
    const result = renderReferenceAreas([
      { x1: 0, x2: 100, y1: 0, y2: 50, color: "#00ff00" },
    ]);
    const { container } = render(<svg>{result}</svg>);
    const area = container.querySelector('[data-testid="reference-area"]');
    expect(area).toHaveAttribute("data-x1", "0");
    expect(area).toHaveAttribute("data-x2", "100");
    expect(area).toHaveAttribute("data-y1", "0");
    expect(area).toHaveAttribute("data-y2", "50");
    expect(area).toHaveAttribute("data-fill", "#00ff00");
  });

  it("renders multiple reference areas", () => {
    const result = renderReferenceAreas([
      { x1: 0, x2: 50, y1: 0, y2: 100 },
      { x1: 50, x2: 100, y1: 0, y2: 100 },
    ]);
    const { container } = render(<svg>{result}</svg>);
    const areas = container.querySelectorAll('[data-testid="reference-area"]');
    expect(areas).toHaveLength(2);
  });
});

describe("buildAxisProps", () => {
  it("returns empty object when axis is null", () => {
    const result = buildAxisProps(null, { orientation: "x" });
    expect(result).toEqual({});
  });

  it("returns empty object when axis is undefined", () => {
    const result = buildAxisProps(undefined, { orientation: "y" });
    expect(result).toEqual({});
  });

  it("builds props with tickAngle for x axis", () => {
    const result = buildAxisProps({ tickAngle: -45 }, { orientation: "x" });
    expect(result.angle).toBe(-45);
    expect(result.textAnchor).toBe("end");
    expect(result.dy).toBe(8);
    expect(result.height).toBe(60);
  });

  it("builds props with tickAngle for y axis without x-specific props", () => {
    const result = buildAxisProps({ tickAngle: -45 }, { orientation: "y" });
    expect(result.angle).toBe(-45);
    expect(result.textAnchor).toBeUndefined();
    expect(result.dy).toBeUndefined();
  });

  it("builds props with label for x axis", () => {
    const result = buildAxisProps({ label: "X Axis" }, { orientation: "x" });
    expect(result.label.value).toBe("X Axis");
    expect(result.label.position).toBe("insideBottom");
  });

  it("builds props with label for y axis", () => {
    const result = buildAxisProps({ label: "Y Axis" }, { orientation: "y" });
    expect(result.label.value).toBe("Y Axis");
    expect(result.label.angle).toBe(-90);
    expect(result.label.position).toBe("insideLeft");
  });

  it("suppresses label when x axis has tickAngle", () => {
    const result = buildAxisProps(
      { label: "X Axis", tickAngle: -45 },
      { orientation: "x" },
    );
    expect(result.label).toBeUndefined();
  });

  it("includes label when y axis has tickAngle", () => {
    const result = buildAxisProps(
      { label: "Y Axis", tickAngle: -45 },
      { orientation: "y" },
    );
    expect(result.label).toBeDefined();
  });

  it("builds props with tickFormatter", () => {
    const formatter = vi.fn();
    const result = buildAxisProps(
      { tickFormatter: formatter },
      { orientation: "x" },
    );
    expect(result.tickFormatter).toBe(formatter);
  });

  it("builds props with scale when allowed", () => {
    const result = buildAxisProps(
      { scale: "log" },
      { orientation: "y", allowScale: true },
    );
    expect(result.scale).toBe("log");
  });

  it("does not include scale when not allowed", () => {
    const result = buildAxisProps(
      { scale: "log" },
      { orientation: "y", allowScale: false },
    );
    expect(result.scale).toBeUndefined();
  });

  it("builds props with domain", () => {
    const result = buildAxisProps({ domain: [0, 100] }, { orientation: "y" });
    expect(result.domain).toEqual([0, 100]);
  });

  it("builds props with hide", () => {
    const result = buildAxisProps({ hide: true }, { orientation: "x" });
    expect(result.hide).toBe(true);
  });

  it("builds props with ticks", () => {
    const result = buildAxisProps(
      { ticks: [0, 25, 50, 75, 100] },
      { orientation: "y" },
    );
    expect(result.ticks).toEqual([0, 25, 50, 75, 100]);
  });

  it("builds props with unit", () => {
    const result = buildAxisProps({ unit: "%" }, { orientation: "y" });
    expect(result.unit).toBe("%");
  });

  it("calculates interval for x axis with tickCount and autoInterval", () => {
    const result = buildAxisProps(
      { tickCount: 5 },
      { orientation: "x", autoInterval: true, dataLength: 20 },
    );
    expect(result.interval).toBe(3); // Math.ceil(20/5) - 1 = 3
  });

  it("uses tickCount for y axis", () => {
    const result = buildAxisProps({ tickCount: 5 }, { orientation: "y" });
    expect(result.tickCount).toBe(5);
  });

  it("calculates auto-interval for large datasets", () => {
    const result = buildAxisProps(
      {},
      { orientation: "x", autoInterval: true, dataLength: 30 },
    );
    expect(result.interval).toBe(2); // Math.ceil(30/10) - 1 = 2
  });

  it("does not calculate auto-interval for small datasets", () => {
    const result = buildAxisProps(
      {},
      { orientation: "x", autoInterval: true, dataLength: 10 },
    );
    expect(result.interval).toBeUndefined();
  });

  it("does not calculate interval when ticks are provided", () => {
    const result = buildAxisProps(
      { ticks: [0, 10, 20] },
      { orientation: "x", autoInterval: true, dataLength: 30 },
    );
    expect(result.interval).toBeUndefined();
  });
});
