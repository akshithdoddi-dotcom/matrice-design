import { describe, expect, it } from "vitest";

import { render, screen } from "@testing-library/react";

import { Badge } from "./index";

describe("Badge", () => {
  it("renders badge content", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies variant classes", () => {
    render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText("Success")).toHaveClass("mui-badge-success");
  });

  it("renders icon when provided", () => {
    render(
      <Badge icon={<span data-testid="mui-badge-icon">i</span>}>Info</Badge>,
    );
    expect(screen.getByTestId("mui-badge-icon")).toBeInTheDocument();
  });
});
