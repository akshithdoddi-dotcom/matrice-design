import { describe, expect, it } from "vitest";

import { render, screen } from "@testing-library/react";

import { PageHeader } from "./index";

describe("PageHeader", () => {
  it("renders the title as an h1 by default", () => {
    render(<PageHeader title="Models" />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Models");
  });

  it("renders subtitle when provided", () => {
    render(<PageHeader title="Models" subtitle="12 active" />);
    expect(screen.getByText("12 active")).toBeInTheDocument();
  });

  it("renders the action slot", () => {
    render(<PageHeader title="Models" action={<button>New</button>} />);
    expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument();
  });

  it("renders the eyebrow slot", () => {
    render(<PageHeader title="alpha-v2" eyebrow={<span>Back</span>} />);
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("renders the icon", () => {
    render(<PageHeader title="Models" icon={<svg data-testid="icon" />} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("omits the icon wrapper element entirely when no icon is supplied", () => {
    const { container } = render(<PageHeader title="Models" />);
    // No element with the primary-subtle backdrop class should exist
    expect(container.querySelector(".bg-primary-subtle")).toBeNull();
  });

  it("forwards extra props to the root <header>", () => {
    render(<PageHeader title="Models" data-testid="hdr" />);
    expect(screen.getByTestId("hdr").tagName).toBe("HEADER");
  });
});
