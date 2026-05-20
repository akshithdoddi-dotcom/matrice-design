import { describe, expect, it } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ManagedTabs } from "./index";

const tabs = [
  { label: "Tab One", content: <p>Content One</p> },
  { label: "Tab Two", content: <p>Content Two</p> },
  { label: "Tab Three", content: <p>Content Three</p>, disabled: true },
];

describe("Tabs", () => {
  it("renders all tab triggers", () => {
    render(<ManagedTabs tabs={tabs} />);
    expect(screen.getByRole("tab", { name: "Tab One" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Tab Two" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Tab Three" })).toBeInTheDocument();
  });

  it("shows the correct panel when a tab is clicked", async () => {
    const user = userEvent.setup();
    render(<ManagedTabs tabs={tabs} />);
    // Initially first tab content is shown
    expect(screen.getByText("Content One")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Tab Two" }));
    expect(screen.getByText("Content Two")).toBeInTheDocument();
  });

  it("first tab is active by default (or controlled defaultValue)", () => {
    render(<ManagedTabs tabs={tabs} />);
    const firstTab = screen.getByRole("tab", { name: "Tab One" });
    expect(firstTab).toHaveAttribute("data-state", "active");
    expect(screen.getByText("Content One")).toBeInTheDocument();
  });

  it("disabled tab cannot be clicked", async () => {
    const user = userEvent.setup();
    render(<ManagedTabs tabs={tabs} />);
    const disabledTab = screen.getByRole("tab", { name: "Tab Three" });
    expect(disabledTab).toBeDisabled();

    await user.click(disabledTab);
    // First tab should still be active
    expect(screen.getByRole("tab", { name: "Tab One" })).toHaveAttribute(
      "data-state",
      "active",
    );
  });
});
