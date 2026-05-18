import { describe, expect, it, vi } from "vitest";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ManagedDialog } from "./index";

describe("Dialog — General", () => {
  it("renders dialog with title and description when open", async () => {
    render(
      <ManagedDialog open={true} onClose={vi.fn()} title="My Dialog">
        <p>Dialog body content</p>
      </ManagedDialog>,
    );
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByText("My Dialog")).toBeInTheDocument();
    expect(screen.getByText("Dialog body content")).toBeInTheDocument();
  });

  it("does not render dialog content when closed", () => {
    render(
      <ManagedDialog open={false} onClose={vi.fn()} title="Hidden Dialog">
        <p>Should not appear</p>
      </ManagedDialog>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <ManagedDialog open={true} onClose={handleClose} title="Closeable">
        <p>Content</p>
      </ManagedDialog>,
    );
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(handleClose).toHaveBeenCalled();
  });
});

describe("Dialog — Confirmation", () => {
  const confirmationProps = {
    message: "This action is irreversible.",
    confirmText: "DELETE",
    onConfirm: vi.fn(),
  };

  it("confirm button is disabled until user types matching text", async () => {
    const user = userEvent.setup();
    render(
      <ManagedDialog
        open={true}
        onClose={vi.fn()}
        title="Confirm Delete"
        confirmation={{ ...confirmationProps, onConfirm: vi.fn() }}
      />,
    );
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Confirm button should be disabled initially
    const confirmBtn = screen.getByRole("button", { name: "Confirm" });
    expect(confirmBtn).toBeDisabled();

    // Type the matching text
    const input = screen.getByPlaceholderText("DELETE");
    await user.type(input, "DELETE");

    // Now confirm button should be enabled
    expect(confirmBtn).not.toBeDisabled();
  });

  it("calls onConfirm when confirm button is clicked after typing match text", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ManagedDialog
        open={true}
        onClose={vi.fn()}
        title="Confirm Delete"
        confirmation={{ ...confirmationProps, onConfirm }}
      />,
    );
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("DELETE");
    await user.type(input, "DELETE");

    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
