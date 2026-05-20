import { describe, expect, it } from "vitest";

import { render, screen } from "@testing-library/react";

import { ChartLegend } from "./ChartLegend";

const items = [
  { label: "Revenue", color: "#ff0000" },
  { label: "Expenses", color: "#00ff00" },
];

describe("ChartLegend", () => {
  it("renders all legend items with labels", () => {
    render(<ChartLegend items={items} />);
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("Expenses")).toBeInTheDocument();
  });

  it("applies background color to color indicators", () => {
    const { container } = render(<ChartLegend items={items} />);
    const dots = container.querySelectorAll("[aria-hidden='true']");
    expect(dots).toHaveLength(2);
    expect(dots[0]).toHaveStyle({ backgroundColor: "#ff0000" });
    expect(dots[1]).toHaveStyle({ backgroundColor: "#00ff00" });
  });

  it("accepts a custom className", () => {
    const { container } = render(
      <ChartLegend items={items} className="my-custom" />,
    );
    expect(container.firstElementChild).toHaveClass("my-custom");
  });

  it("renders in vertical orientation", () => {
    const { container } = render(
      <ChartLegend items={items} orientation="vertical" />,
    );
    expect(container.firstElementChild).toHaveClass("flex-col");
  });

  it("grays out inactive items", () => {
    render(<ChartLegend items={items} inactiveItems={["Revenue"]} />);
    const revenueButton = screen.getByText("Revenue").closest("button");
    expect(revenueButton).toHaveClass("opacity-40");
  });
});
