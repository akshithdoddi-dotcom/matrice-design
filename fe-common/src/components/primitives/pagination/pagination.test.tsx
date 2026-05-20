import { describe, expect, it, vi } from "vitest";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationRoot,
} from "./index";

describe("Primitives/Pagination (config-driven)", () => {
  it("renders nothing when totalPages is 0", () => {
    const { container } = render(
      <Pagination page={1} totalPages={0} onPageChange={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders all numbered pages when totalPages is small", () => {
    render(<Pagination page={1} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByLabelText("Page 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Page 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Page 3")).toBeInTheDocument();
  });

  it("marks the active page with aria-current", () => {
    render(<Pagination page={2} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByLabelText("Page 2")).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByLabelText("Page 1")).not.toHaveAttribute("aria-current");
  });

  it("calls onPageChange when a page link is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination page={1} totalPages={5} onPageChange={onChange} />);
    await user.click(screen.getByLabelText("Page 3"));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("does not call onPageChange when the active page is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={onChange} />);
    await user.click(screen.getByLabelText("Page 2"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders ellipses when totalPages exceeds the visible window", () => {
    render(
      <Pagination
        page={5}
        totalPages={10}
        onPageChange={() => {}}
        siblingCount={1}
      />,
    );
    expect(
      document.querySelectorAll('[data-slot="pagination-ellipsis"]'),
    ).toHaveLength(2);
  });

  it("disables Previous on first page and Next on last page", () => {
    const { rerender } = render(
      <Pagination page={1} totalPages={3} onPageChange={() => {}} />,
    );
    const prev = screen.getByLabelText("Previous");
    expect(prev).toHaveAttribute("aria-disabled", "true");
    rerender(<Pagination page={3} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByLabelText("Next")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("respects custom labels", () => {
    render(
      <Pagination
        page={2}
        totalPages={3}
        onPageChange={() => {}}
        labels={{
          previous: "Anterior",
          next: "Siguiente",
          page: (n) => `Página ${n}`,
        }}
      />,
    );
    expect(screen.getByLabelText("Anterior")).toBeInTheDocument();
    expect(screen.getByLabelText("Siguiente")).toBeInTheDocument();
    expect(screen.getByLabelText("Página 1")).toBeInTheDocument();
  });

  it("uses hrefBuilder to populate href attributes", () => {
    render(
      <Pagination
        page={1}
        totalPages={3}
        onPageChange={() => {}}
        hrefBuilder={(n) => `/list?page=${n}`}
      />,
    );
    expect(screen.getByLabelText("Page 2")).toHaveAttribute(
      "href",
      "/list?page=2",
    );
  });

  it("hides edge buttons when showEdges=false", () => {
    render(
      <Pagination
        page={1}
        totalPages={3}
        onPageChange={() => {}}
        showEdges={false}
      />,
    );
    expect(screen.queryByLabelText("Previous")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Next")).not.toBeInTheDocument();
  });
});

describe("Primitives/Pagination (composable parts)", () => {
  it("composable parts render and forward props", () => {
    render(
      <PaginationRoot data-testid="root">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#prev" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#1" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#2">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#next" />
          </PaginationItem>
        </PaginationContent>
      </PaginationRoot>,
    );
    const root = screen.getByTestId("root");
    expect(root).toHaveAttribute("aria-label", "pagination");
    expect(within(root).getByText("1")).toHaveAttribute("aria-current", "page");
    expect(
      document.querySelector('[data-slot="pagination-ellipsis"]'),
    ).toBeInTheDocument();
  });
});
