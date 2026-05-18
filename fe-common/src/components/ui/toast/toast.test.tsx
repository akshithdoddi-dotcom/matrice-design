import { beforeEach, describe, expect, it } from "vitest";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Toaster } from "./toaster";
import { clearToasts, toast } from "./use-toast";

describe("Toast", () => {
  beforeEach(() => {
    clearToasts();
  });

  it("renders a toast with title and description", async () => {
    toast({
      title: "Saved",
      description: "Data saved successfully",
    });

    render(<Toaster />);

    expect(await screen.findByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Data saved successfully")).toBeInTheDocument();
  });

  it("closes toast when close button is clicked", async () => {
    const user = userEvent.setup();

    toast({
      title: "Closable",
      description: "Can be dismissed",
    });

    render(<Toaster />);
    await screen.findByText("Closable");

    await user.click(
      screen.getByRole("button", { name: "Close notification" }),
    );
    await waitFor(() => {
      expect(screen.queryByText("Closable")).not.toBeInTheDocument();
    });
  });

  it("applies variant class", async () => {
    toast({
      variant: "success",
      title: "Success",
      description: "Variant class check",
    });

    render(<Toaster />);

    const title = await screen.findByText("Success");
    const root = title.closest(".mui-toast");
    expect(root).toHaveClass("mui-toast-success");
  });
});
