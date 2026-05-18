import { describe, expect, it } from "vitest";

import { render } from "@testing-library/react";

import { PatternDefs, getPatternFill } from "./PatternDefs";

describe("PatternDefs", () => {
  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------
  it("returns null when patterns array is empty", () => {
    const { container } = render(
      <svg>
        <PatternDefs patterns={[]} />
      </svg>,
    );
    expect(container.querySelector("defs")).toBeNull();
  });

  it("renders defs element when patterns are provided", () => {
    const { container } = render(
      <svg>
        <PatternDefs patterns={[{ id: "crosshatch", color: "#ff0000" }]} />
      </svg>,
    );
    expect(container.querySelector("defs")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Pattern types
  // -------------------------------------------------------------------------
  it("renders crosshatch pattern", () => {
    const { container } = render(
      <svg>
        <PatternDefs patterns={[{ id: "crosshatch", color: "#ff0000" }]} />
      </svg>,
    );
    const pattern = container.querySelector("pattern");
    expect(pattern).toHaveAttribute("id", "pattern-crosshatch-#ff0000");
    expect(pattern).toHaveAttribute("width", "8");
    expect(pattern).toHaveAttribute("height", "8");
    const path = pattern?.querySelector("path");
    expect(path).toHaveAttribute("stroke", "#ff0000");
    expect(path).toHaveAttribute("d", "M0 0L8 8M8 0L0 8");
  });

  it("renders diagonal pattern", () => {
    const { container } = render(
      <svg>
        <PatternDefs patterns={[{ id: "diagonal", color: "#00ff00" }]} />
      </svg>,
    );
    const pattern = container.querySelector("pattern");
    expect(pattern).toHaveAttribute("id", "pattern-diagonal-#00ff00");
    expect(pattern).toHaveAttribute("width", "6");
    expect(pattern).toHaveAttribute("height", "6");
    const path = pattern?.querySelector("path");
    expect(path).toHaveAttribute("stroke", "#00ff00");
    expect(path).toHaveAttribute("d", "M0 6L6 0");
  });

  it("renders dots pattern", () => {
    const { container } = render(
      <svg>
        <PatternDefs patterns={[{ id: "dots", color: "#0000ff" }]} />
      </svg>,
    );
    const pattern = container.querySelector("pattern");
    expect(pattern).toHaveAttribute("id", "pattern-dots-#0000ff");
    const circle = pattern?.querySelector("circle");
    expect(circle).toHaveAttribute("fill", "#0000ff");
    expect(circle).toHaveAttribute("cx", "3");
    expect(circle).toHaveAttribute("cy", "3");
    expect(circle).toHaveAttribute("r", "1.5");
  });

  it("renders horizontal-lines pattern", () => {
    const { container } = render(
      <svg>
        <PatternDefs
          patterns={[{ id: "horizontal-lines", color: "#ffff00" }]}
        />
      </svg>,
    );
    const pattern = container.querySelector("pattern");
    expect(pattern).toHaveAttribute("id", "pattern-horizontal-lines-#ffff00");
    const path = pattern?.querySelector("path");
    expect(path).toHaveAttribute("stroke", "#ffff00");
    expect(path).toHaveAttribute("d", "M0 3H6");
  });

  it("returns null for unknown pattern id", () => {
    const { container } = render(
      <svg>
        <PatternDefs patterns={[{ id: "unknown", color: "#000000" }]} />
      </svg>,
    );
    const defs = container.querySelector("defs");
    expect(defs).toBeInTheDocument();
    // Should have defs but no pattern inside
    expect(defs?.querySelector("pattern")).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Multiple patterns
  // -------------------------------------------------------------------------
  it("renders multiple patterns", () => {
    const patterns = [
      { id: "crosshatch", color: "#ff0000" },
      { id: "dots", color: "#00ff00" },
      { id: "diagonal", color: "#0000ff" },
    ];
    const { container } = render(
      <svg>
        <PatternDefs patterns={patterns} />
      </svg>,
    );
    const patternElements = container.querySelectorAll("pattern");
    expect(patternElements).toHaveLength(3);
    expect(patternElements[0]).toHaveAttribute(
      "id",
      "pattern-crosshatch-#ff0000",
    );
    expect(patternElements[1]).toHaveAttribute("id", "pattern-dots-#00ff00");
    expect(patternElements[2]).toHaveAttribute(
      "id",
      "pattern-diagonal-#0000ff",
    );
  });
});

describe("getPatternFill", () => {
  it("returns correct url format", () => {
    expect(getPatternFill("crosshatch", "#ff0000")).toBe(
      "url(#pattern-crosshatch-#ff0000)",
    );
  });

  it("handles different pattern and color combinations", () => {
    expect(getPatternFill("dots", "#00ff00")).toBe(
      "url(#pattern-dots-#00ff00)",
    );
    expect(getPatternFill("diagonal", "blue")).toBe(
      "url(#pattern-diagonal-blue)",
    );
  });
});
