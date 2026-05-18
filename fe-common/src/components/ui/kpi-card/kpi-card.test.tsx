import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@testing-library/react";

import {
  KpiBadge,
  KpiCapacityBar,
  KpiCard,
  KpiGrid,
  KpiLabel,
  KpiValue,
} from "./index";

describe("KpiBadge", () => {
  it("renders the badge text", () => {
    render(<KpiBadge text="REAL-TIME" variant="realtime" />);
    expect(screen.getByText("REAL-TIME")).toBeInTheDocument();
  });
});

describe("KpiLabel", () => {
  it("renders label text and the badge when provided", () => {
    render(
      <KpiLabel
        text="Violations"
        badge={{ text: "REAL-TIME", variant: "realtime" }}
      />,
    );
    expect(screen.getByText("Violations")).toBeInTheDocument();
    expect(screen.getByText("REAL-TIME")).toBeInTheDocument();
  });

  it("omits the badge when not provided", () => {
    render(<KpiLabel text="Violations" />);
    expect(screen.queryByText("REAL-TIME")).not.toBeInTheDocument();
  });
});

describe("KpiValue", () => {
  it("renders numeric and string values", () => {
    const { rerender } = render(<KpiValue value={42} />);
    expect(screen.getByText("42")).toBeInTheDocument();
    rerender(<KpiValue value="78%" />);
    expect(screen.getByText("78%")).toBeInTheDocument();
  });
});

describe("KpiCapacityBar", () => {
  it("clamps percent into the [0, 100] range and exposes ARIA attributes", () => {
    const { rerender } = render(
      <KpiCapacityBar percent={150} ariaLabel="Dock" />,
    );
    const bar = screen.getByRole("progressbar", { name: "Dock" });
    expect(bar).toHaveAttribute("aria-valuenow", "100");

    rerender(<KpiCapacityBar percent={-10} ariaLabel="Dock" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });
});

describe("KpiCard — Type A (stat)", () => {
  it("renders label, value, subtitle, badge, and definition", () => {
    render(
      <KpiCard
        type="stat"
        label="Violations"
        value="02"
        subtitle="Assembly Line · Active"
        badge={{ text: "REAL-TIME", variant: "realtime" }}
        definition="Last 2 days ago"
        colorTheme="red"
      />,
    );

    expect(screen.getByText("Violations")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("Assembly Line · Active")).toBeInTheDocument();
    expect(screen.getByText("REAL-TIME")).toBeInTheDocument();
    expect(screen.getByText("Last 2 days ago")).toBeInTheDocument();
  });
});

describe("KpiCard — Type B (spark)", () => {
  it("renders sparkline alongside the value", () => {
    render(
      <KpiCard
        type="spark"
        label="Active Employees"
        value="14"
        chartData={[1, 2, 3, 4, 5]}
        chartType="line"
        colorTheme="orange"
      />,
    );
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /trend/i })).toBeInTheDocument();
  });
});

describe("KpiCard — Type E (capacity)", () => {
  it("derives the percent from the value string when capacityPercent is omitted", () => {
    render(
      <KpiCard
        type="capacity"
        label="Zone Capacity"
        value="78%"
        colorTheme="orange"
      />,
    );
    const bar = screen.getByRole("progressbar", { name: /capacity/i });
    expect(bar).toHaveAttribute("aria-valuenow", "78");
  });

  it("prefers an explicit capacityPercent prop over the value string", () => {
    render(
      <KpiCard
        type="capacity"
        label="Zone Capacity"
        value="78%"
        capacityPercent={42}
        colorTheme="orange"
      />,
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "42",
    );
  });
});

describe("KpiCard — Type F (grid)", () => {
  it("renders one block per item", () => {
    render(
      <KpiCard
        type="grid"
        label="Shift Summary"
        items={[
          { label: "Shifts", value: "08" },
          { label: "Workers", value: "142" },
          { label: "Breaks", value: "12" },
        ]}
      />,
    );
    expect(screen.getByText("Shifts")).toBeInTheDocument();
    expect(screen.getByText("Workers")).toBeInTheDocument();
    expect(screen.getByText("Breaks")).toBeInTheDocument();
    expect(screen.getByText("08")).toBeInTheDocument();
    expect(screen.getByText("142")).toBeInTheDocument();
  });
});

describe("KpiCard — interactive", () => {
  it("invokes onClick when activated by mouse and by keyboard", () => {
    const onClick = vi.fn();
    render(
      <KpiCard
        type="stat"
        label="Click me"
        value="01"
        interactive
        onClick={onClick}
      />,
    );

    const card = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(card, { key: "Enter" });
    expect(onClick).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(card, { key: " " });
    expect(onClick).toHaveBeenCalledTimes(3);
  });
});

describe("KpiGrid", () => {
  it("renders its children", () => {
    render(
      <KpiGrid>
        <div>one</div>
        <div>two</div>
      </KpiGrid>,
    );
    expect(screen.getByText("one")).toBeInTheDocument();
    expect(screen.getByText("two")).toBeInTheDocument();
  });
});
