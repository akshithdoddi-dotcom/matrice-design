import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TablePagination } from "./index";

describe("TablePagination", () => {
  it("renders prev/next labels and page numbers", () => {
    render(
      <TablePagination
        currentPage={1}
        pageCount={2}
        onPageChange={vi.fn()}
        showSummary={false}
      />,
    );
    expect(
      screen.getByRole("navigation", { name: "Table pagination" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /PREV/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /NEXT/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
  });

  it("disables PREV on the first page", () => {
    render(
      <TablePagination
        currentPage={1}
        pageCount={3}
        onPageChange={vi.fn()}
        showSummary={false}
      />,
    );
    expect(screen.getByRole("button", { name: /PREV/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /NEXT/i })).not.toBeDisabled();
  });

  it("disables NEXT on the last page", () => {
    render(
      <TablePagination
        currentPage={3}
        pageCount={3}
        onPageChange={vi.fn()}
        showSummary={false}
      />,
    );
    expect(screen.getByRole("button", { name: /PREV/i })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /NEXT/i })).toBeDisabled();
  });

  it("marks the active page with aria-current", () => {
    render(
      <TablePagination
        currentPage={2}
        pageCount={4}
        onPageChange={vi.fn()}
        showSummary={false}
      />,
    );
    expect(screen.getByRole("button", { name: "2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("button", { name: "1" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("calls onPageChange when a page number is clicked", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <TablePagination
        currentPage={1}
        pageCount={3}
        onPageChange={onPageChange}
        showSummary={false}
      />,
    );
    await user.click(screen.getByRole("button", { name: "3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("calls onPageChange for NEXT and PREV", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <TablePagination
        currentPage={2}
        pageCount={4}
        onPageChange={onPageChange}
        showSummary={false}
      />,
    );
    await user.click(screen.getByRole("button", { name: /NEXT/i }));
    expect(onPageChange).toHaveBeenCalledWith(3);
    onPageChange.mockClear();
    await user.click(screen.getByRole("button", { name: /PREV/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("shows default summary from totalItems and pageSize", () => {
    const { container } = render(
      <TablePagination
        currentPage={1}
        pageCount={2}
        onPageChange={vi.fn()}
        totalItems={12}
        pageSize={10}
      />,
    );
    expect(
      container.querySelector(".mui-table-pagination-summary"),
    ).toHaveTextContent("Showing 1-10 of 12");
  });

  it("clamps summary range when currentPage exceeds pages implied by totalItems", () => {
    const { container } = render(
      <TablePagination
        currentPage={5}
        pageCount={5}
        onPageChange={vi.fn()}
        totalItems={12}
        pageSize={10}
      />,
    );
    expect(
      container.querySelector(".mui-table-pagination-summary"),
    ).toHaveTextContent("Showing 11-12 of 12");
  });

  it("uses custom summary when provided", () => {
    render(
      <TablePagination
        currentPage={1}
        pageCount={2}
        onPageChange={vi.fn()}
        summary="Custom footer"
        totalItems={12}
        pageSize={10}
      />,
    );
    expect(screen.getByText("Custom footer")).toBeInTheDocument();
    expect(screen.queryByText("Showing 1-10 of 12")).not.toBeInTheDocument();
  });

  it("hides summary when showSummary is false", () => {
    const { container } = render(
      <TablePagination
        currentPage={1}
        pageCount={2}
        onPageChange={vi.fn()}
        totalItems={12}
        pageSize={10}
        showSummary={false}
      />,
    );
    expect(
      container.querySelector(".mui-table-pagination-summary"),
    ).not.toBeInTheDocument();
  });

  it("renders custom prev/next labels", () => {
    render(
      <TablePagination
        currentPage={1}
        pageCount={2}
        onPageChange={vi.fn()}
        previousLabel="Back"
        nextLabel="Forward"
        showSummary={false}
      />,
    );
    expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Forward/i }),
    ).toBeInTheDocument();
  });
});
