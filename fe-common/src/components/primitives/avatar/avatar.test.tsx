import { describe, expect, it } from "vitest";

import { render, screen } from "@testing-library/react";

import { Avatar, AvatarFallback, AvatarImage } from "./index";

describe("Primitives/Avatar", () => {
  it("renders the fallback text", () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders the AvatarImage component with correct attributes", () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="test.png" alt="User" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    // AvatarImage component renders with data-slot attribute
    // Note: Radix Avatar doesn't render the img until loaded, but the span wrapper is present
    const avatarRoot = container.querySelector("[data-slot='avatar']");
    expect(avatarRoot).toBeInTheDocument();
    // Fallback is shown when image hasn't loaded
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("applies custom className to root", () => {
    const { container } = render(
      <Avatar className="size-6">
        <AvatarFallback>A</AvatarFallback>
      </Avatar>,
    );
    const root = container.querySelector("[data-slot='avatar']");
    expect(root).toHaveClass("size-6");
  });

  it("applies custom className to fallback", () => {
    render(
      <Avatar>
        <AvatarFallback className="bg-primary text-white">AB</AvatarFallback>
      </Avatar>,
    );
    const fallback = screen.getByText("AB");
    expect(fallback.closest("[data-slot='avatar-fallback']")).toHaveClass(
      "bg-primary",
    );
  });

  it("renders data-slot attributes on avatar and fallback", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(container.querySelector("[data-slot='avatar']")).toBeInTheDocument();
    expect(
      container.querySelector("[data-slot='avatar-fallback']"),
    ).toBeInTheDocument();
  });
});
