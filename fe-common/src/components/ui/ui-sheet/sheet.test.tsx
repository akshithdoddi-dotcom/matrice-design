import { describe, expect, it, vi } from "vitest";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ManagedSheet } from "./index";

describe("ManagedSheet", () => {
  it("renders title, description, footer, and children when all are provided", async () => {
    render(
      <ManagedSheet
        open={true}
        onClose={vi.fn()}
        title="Model Details"
        description="Per-model breakdown."
        footer={<button>Close</button>}
      >
        <p>Body content</p>
      </ManagedSheet>,
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    expect(screen.getByText("Model Details")).toBeInTheDocument();
    expect(screen.getByText("Per-model breakdown.")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
    const closeButtons = screen.getAllByRole("button", { name: "Close" });
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("does not render when closed", () => {
    render(
      <ManagedSheet open={false} onClose={vi.fn()} title="Hidden">
        <p>Should not appear</p>
      </ManagedSheet>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Should not appear")).not.toBeInTheDocument();
  });

  it("omits header when title and description are absent", async () => {
    render(
      <ManagedSheet open={true} onClose={vi.fn()}>
        <p>Body only</p>
      </ManagedSheet>,
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // No title-like heading should be present (Radix renders SheetTitle as h2)
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("omits footer slot when footer is absent", async () => {
    const { container } = render(
      <ManagedSheet open={true} onClose={vi.fn()} title="No footer">
        <p>Body</p>
      </ManagedSheet>,
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    expect(
      container.querySelector('[data-slot="sheet-footer"]'),
    ).not.toBeInTheDocument();
  });

  it("omits description when not provided", async () => {
    const { container } = render(
      <ManagedSheet open={true} onClose={vi.fn()} title="Only title">
        <p>Body</p>
      </ManagedSheet>,
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    expect(
      container.querySelector('[data-slot="sheet-description"]'),
    ).not.toBeInTheDocument();
  });

  it("calls onClose when the user presses Escape", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <ManagedSheet open={true} onClose={handleClose} title="Closeable">
        <p>Body</p>
      </ManagedSheet>,
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    await user.keyboard("{Escape}");
    expect(handleClose).toHaveBeenCalled();
  });

  it("calls onClose when the built-in close button is clicked", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <ManagedSheet open={true} onClose={handleClose} title="Closeable">
        <p>Body</p>
      </ManagedSheet>,
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(handleClose).toHaveBeenCalled();
  });

  it("applies the lg width class when side='right' and size='lg'", async () => {
    render(
      <ManagedSheet
        open={true}
        onClose={vi.fn()}
        title="Sized"
        side="right"
        size="lg"
      >
        <p>Body</p>
      </ManagedSheet>,
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const content = document.body.querySelector('[data-slot="sheet-content"]');
    expect(content).not.toBeNull();
    expect(content?.className).toContain("sm:max-w-2xl");
  });

  it("applies a height class when side='bottom'", async () => {
    render(
      <ManagedSheet
        open={true}
        onClose={vi.fn()}
        title="Sized"
        side="bottom"
        size="lg"
      >
        <p>Body</p>
      </ManagedSheet>,
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const content = document.body.querySelector('[data-slot="sheet-content"]');
    expect(content).not.toBeNull();
    // Vertical size lookup: lg → h-1/2
    expect(content?.className).toContain("h-1/2");
  });

  it("body region is scrollable (overflow-y-auto on body wrapper)", async () => {
    render(
      <ManagedSheet open={true} onClose={vi.fn()} title="Scroll">
        <p>Long body</p>
      </ManagedSheet>,
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const scrollable = document.body.querySelector(".overflow-y-auto");
    expect(scrollable).not.toBeNull();
    expect(scrollable?.textContent).toContain("Long body");
  });

  it("renders extraTitleNode inline next to the title", async () => {
    render(
      <ManagedSheet
        open={true}
        onClose={vi.fn()}
        title="With extra"
        extraTitleNode={<span data-testid="extra">★</span>}
      >
        <p>Body</p>
      </ManagedSheet>,
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    expect(screen.getByTestId("extra")).toBeInTheDocument();
  });
});
