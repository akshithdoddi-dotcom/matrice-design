import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { type ColumnDef, DataTable } from "./index";

interface MockRow {
  [key: string]: unknown;
  id: string;
  name: string;
  status: string;
  count?: number;
}

const columns: ColumnDef<MockRow>[] = [
  { id: "name", header: "Name", accessorKey: "name" },
  { id: "status", header: "Status", accessorKey: "status" },
];

const data: MockRow[] = [
  { id: "1", name: "Project Alpha", status: "active" },
  { id: "2", name: "Project Beta", status: "paused" },
];

describe("DataTable", () => {
  // -------------------------------------------------------------------------
  // Basic rendering
  // -------------------------------------------------------------------------
  it("renders column headers", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
      />,
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("renders row data", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
      />,
    );
    expect(screen.getByText("Project Alpha")).toBeInTheDocument();
    expect(screen.getByText("Project Beta")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.getByText("paused")).toBeInTheDocument();
  });

  it("shows empty state when data is empty array", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
      />,
    );
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("shows custom empty state", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
        emptyState={{
          title: "No projects",
          description: "Create your first project",
        }}
      />,
    );
    expect(screen.getByText("No projects")).toBeInTheDocument();
    expect(screen.getByText("Create your first project")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Selection
  // -------------------------------------------------------------------------
  it("selects a row when selection checkbox is clicked", async () => {
    const user = userEvent.setup();
    const handleSelection = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
        selectable
        onSelectionChange={handleSelection}
      />,
    );
    const checkboxes = screen.getAllByRole("checkbox", { name: "Select row" });
    await user.click(checkboxes[0]);
    expect(handleSelection).toHaveBeenCalled();
  });

  it("selects all rows when header checkbox is clicked", async () => {
    const user = userEvent.setup();
    const handleSelection = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
        selectable
        onSelectionChange={handleSelection}
      />,
    );
    const selectAllCheckbox = screen.getByRole("checkbox", {
      name: "Select all rows",
    });
    await user.click(selectAllCheckbox);
    expect(handleSelection).toHaveBeenCalledWith(["1", "2"]);
  });

  it("supports single selection mode", async () => {
    const user = userEvent.setup();
    const handleSelection = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
        selectable
        selectionMode="single"
        onSelectionChange={handleSelection}
      />,
    );
    // In single mode, there should be no "Select all" checkbox
    expect(
      screen.queryByRole("checkbox", { name: "Select all rows" }),
    ).not.toBeInTheDocument();
    const checkboxes = screen.getAllByRole("checkbox", { name: "Select row" });
    await user.click(checkboxes[0]);
    expect(handleSelection).toHaveBeenCalledWith(["1"]);
  });

  it("supports controlled selection", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
        selectable
        selectedRows={["2"]}
      />,
    );
    const checkboxes = screen.getAllByRole("checkbox", { name: "Select row" });
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });

  // -------------------------------------------------------------------------
  // Sorting
  // -------------------------------------------------------------------------
  it("sorts column when header is clicked (if sorting enabled)", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
        sortable
      />,
    );
    // Click the "Name" header to sort
    const nameHeader = screen.getByText("Name").closest("th")!;
    await user.click(nameHeader);

    // After clicking, rows should still be present (sorting happened)
    const rows = screen.getAllByRole("row");
    // Header row + 2 data rows = at least 3 rows
    expect(rows.length).toBeGreaterThanOrEqual(3);
  });

  it("calls onSortChange when sorting changes", async () => {
    const user = userEvent.setup();
    const handleSortChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
        sortable
        onSortChange={handleSortChange}
      />,
    );
    const nameHeader = screen.getByText("Name").closest("th")!;
    await user.click(nameHeader);
    expect(handleSortChange).toHaveBeenCalled();
  });

  it("supports controlled sort model", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
        sortable
        sortModel={[{ id: "name", direction: "asc" }]}
      />,
    );
    // Table should render with the sort state
    expect(screen.getByText("Project Alpha")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Toolbar
  // -------------------------------------------------------------------------
  it("renders toolbar by default", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="none"
      />,
    );
    expect(screen.getByText("Columns")).toBeInTheDocument();
  });

  it("hides toolbar when toolbar=false", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
      />,
    );
    expect(screen.queryByText("Columns")).not.toBeInTheDocument();
  });

  it("shows column visibility popover when Columns button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="none"
      />,
    );
    await user.click(screen.getByText("Columns"));
    expect(screen.getByText("Toggle columns")).toBeInTheDocument();
  });

  it("toggles column visibility", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="none"
      />,
    );
    await user.click(screen.getByText("Columns"));

    const nameCheckbox = screen.getByRole("checkbox", { name: /name/i });
    await user.click(nameCheckbox);

    // Column should be hidden
    const headers = screen.getAllByRole("columnheader");
    expect(headers.some((h) => h.textContent?.includes("Name"))).toBe(false);
  });

  it("shows Filter button when columns are filterable", async () => {
    const filterableColumns: ColumnDef<MockRow>[] = [
      { id: "name", header: "Name", accessorKey: "name", filterable: true },
      { id: "status", header: "Status", accessorKey: "status" },
    ];
    render(
      <DataTable
        columns={filterableColumns}
        data={data}
        rowIdKey="id"
        pagination="none"
      />,
    );
    expect(screen.getByText("Filter")).toBeInTheDocument();
  });

  it("shows export button when exportable", async () => {
    const user = userEvent.setup();
    const handleExport = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="none"
        exportable
        onExport={handleExport}
      />,
    );
    const exportBtn = screen.getByText("Export");
    await user.click(exportBtn);
    expect(handleExport).toHaveBeenCalled();
  });

  it("renders custom toolbar actions", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="none"
        toolbarActions={<button>Custom Action</button>}
      />,
    );
    expect(screen.getByText("Custom Action")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Pagination
  // -------------------------------------------------------------------------
  it("renders pagination when pagination=client", () => {
    const manyRows = Array.from({ length: 25 }, (_, i) => ({
      id: String(i + 1),
      name: `Project ${i + 1}`,
      status: "active",
    }));
    const { container } = render(
      <DataTable
        columns={columns}
        data={manyRows}
        rowIdKey="id"
        pagination="client"
        pageSize={10}
        toolbar={false}
      />,
    );
    expect(
      container.querySelector(".mui-table-pagination-summary"),
    ).toHaveTextContent("Showing 1-10 of 25");
    expect(
      screen.getByRole("navigation", { name: "Table pagination" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /PREV/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /NEXT/i })).toBeInTheDocument();
  });

  it("navigates to next page", async () => {
    const user = userEvent.setup();
    const manyRows = Array.from({ length: 25 }, (_, i) => ({
      id: String(i + 1),
      name: `Project ${i + 1}`,
      status: "active",
    }));
    const { container } = render(
      <DataTable
        columns={columns}
        data={manyRows}
        rowIdKey="id"
        pagination="client"
        pageSize={10}
        toolbar={false}
      />,
    );
    await user.click(screen.getByRole("button", { name: /NEXT/i }));
    expect(
      container.querySelector(".mui-table-pagination-summary"),
    ).toHaveTextContent("Showing 11-20 of 25");
  });

  it("respects pageSize for the range summary", () => {
    const manyRows = Array.from({ length: 25 }, (_, i) => ({
      id: String(i + 1),
      name: `Project ${i + 1}`,
      status: "active",
    }));
    const { container } = render(
      <DataTable
        columns={columns}
        data={manyRows}
        rowIdKey="id"
        pagination="client"
        pageSize={5}
        toolbar={false}
      />,
    );
    expect(
      container.querySelector(".mui-table-pagination-summary"),
    ).toHaveTextContent("Showing 1-5 of 25");
  });

  it("calls onPageChange for server pagination", async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="server"
        pageSize={10}
        totalRows={50}
        currentPage={1}
        onPageChange={handlePageChange}
        toolbar={false}
      />,
    );
    await user.click(screen.getByRole("button", { name: /NEXT/i }));
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  // -------------------------------------------------------------------------
  // Row click
  // -------------------------------------------------------------------------
  it("calls onRowClick when row is clicked", async () => {
    const user = userEvent.setup();
    const handleRowClick = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
        onRowClick={handleRowClick}
      />,
    );
    const rows = screen.getAllByRole("row");
    // Click the first data row (index 1, since 0 is header)
    await user.click(rows[1]);
    expect(handleRowClick).toHaveBeenCalledWith(data[0]);
  });

  // -------------------------------------------------------------------------
  // Custom cell rendering
  // -------------------------------------------------------------------------
  it("renders custom cell content", () => {
    const customColumns: ColumnDef<MockRow>[] = [
      {
        id: "name",
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <span data-testid="custom-cell">{row.name.toUpperCase()}</span>
        ),
      },
    ];
    render(
      <DataTable
        columns={customColumns}
        data={data}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
      />,
    );
    const customCells = screen.getAllByTestId("custom-cell");
    expect(customCells).toHaveLength(2);
    expect(customCells[0]).toHaveTextContent("PROJECT ALPHA");
    expect(customCells[1]).toHaveTextContent("PROJECT BETA");
  });

  // -------------------------------------------------------------------------
  // Card wrapper
  // -------------------------------------------------------------------------
  it("renders inside ContentCard when cardTitle is provided", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
        cardTitle="Projects"
        cardSubTitle="All your projects"
      />,
    );
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("All your projects")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------
  it("shows loading overlay when loading=true", () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
        loading
      />,
    );
    expect(
      container.querySelector(".mui-datatable-loading"),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Striped rows
  // -------------------------------------------------------------------------
  it("applies striped row classes by default", () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
      />,
    );
    expect(
      container.querySelector(".mui-datatable-row-even"),
    ).toBeInTheDocument();
    expect(
      container.querySelector(".mui-datatable-row-odd"),
    ).toBeInTheDocument();
  });

  it("does not apply striped classes when striped=false", () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
        striped={false}
      />,
    );
    expect(
      container.querySelector(".mui-datatable-row-even"),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector(".mui-datatable-row-odd"),
    ).not.toBeInTheDocument();
  });

  it("omits the row cue column when showRowCue is false", () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
        showRowCue={false}
      />,
    );
    expect(
      container.querySelector(".mui-datatable-th-rowcue"),
    ).not.toBeInTheDocument();
  });

  it("keeps the row cue column for expand when showRowCue is false but expandable", () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={data}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
        expandable
        showRowCue={false}
        renderExpandedRow={(row) => <div data-testid="ex">{row.id}</div>}
      />,
    );
    expect(
      container.querySelector(".mui-datatable-th-rowcue"),
    ).toBeInTheDocument();
    expect(screen.getAllByLabelText("Expand row").length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // Column alignment
  // -------------------------------------------------------------------------
  it("applies column alignment classes", () => {
    const alignedColumns: ColumnDef<MockRow>[] = [
      { id: "name", header: "Name", accessorKey: "name", align: "left" },
      { id: "count", header: "Count", accessorKey: "count", align: "right" },
    ];
    const dataWithCount = [
      { id: "1", name: "Test", status: "active", count: 10 },
    ];
    const { container } = render(
      <DataTable
        columns={alignedColumns}
        data={dataWithCount}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
      />,
    );
    expect(container.querySelector(".text-right")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Expandable rows
  // -------------------------------------------------------------------------
  describe("expandable rows", () => {
    const renderExpandedRow = (row: MockRow) => (
      <div data-testid={`expanded-${row.id}`}>
        panel-content-for-row-{row.id}
      </div>
    );

    it("renders a chevron toggle for each data row when expandable", () => {
      render(
        <DataTable
          columns={columns}
          data={data}
          rowIdKey="id"
          pagination="none"
          toolbar={false}
          expandable
          renderExpandedRow={renderExpandedRow}
        />,
      );
      expect(screen.getAllByLabelText("Expand row")).toHaveLength(2);
    });

    it("renders no chevron when expandable is false", () => {
      render(
        <DataTable
          columns={columns}
          data={data}
          rowIdKey="id"
          pagination="none"
          toolbar={false}
          renderExpandedRow={renderExpandedRow}
        />,
      );
      expect(screen.queryByLabelText("Expand row")).not.toBeInTheDocument();
    });

    it("toggles expanded panel on chevron click", async () => {
      const user = userEvent.setup();
      render(
        <DataTable
          columns={columns}
          data={data}
          rowIdKey="id"
          pagination="none"
          toolbar={false}
          expandable
          renderExpandedRow={renderExpandedRow}
        />,
      );
      expect(screen.queryByTestId("expanded-1")).not.toBeInTheDocument();

      const chevrons = screen.getAllByLabelText("Expand row");
      await user.click(chevrons[0]);
      expect(screen.getByTestId("expanded-1")).toBeInTheDocument();

      await user.click(screen.getByLabelText("Collapse row"));
      expect(screen.queryByTestId("expanded-1")).not.toBeInTheDocument();
    });

    it("flips aria-expanded and aria-label on toggle", async () => {
      const user = userEvent.setup();
      render(
        <DataTable
          columns={columns}
          data={data}
          rowIdKey="id"
          pagination="none"
          toolbar={false}
          expandable
          renderExpandedRow={renderExpandedRow}
        />,
      );
      const button = screen.getAllByLabelText("Expand row")[0];
      expect(button).toHaveAttribute("aria-expanded", "false");
      await user.click(button);

      const collapseButton = screen.getByLabelText("Collapse row");
      expect(collapseButton).toHaveAttribute("aria-expanded", "true");
    });

    it("does not fire onRowClick when chevron is clicked", async () => {
      const user = userEvent.setup();
      const handleRowClick = vi.fn();
      render(
        <DataTable
          columns={columns}
          data={data}
          rowIdKey="id"
          pagination="none"
          toolbar={false}
          expandable
          renderExpandedRow={renderExpandedRow}
          onRowClick={handleRowClick}
        />,
      );
      await user.click(screen.getAllByLabelText("Expand row")[0]);
      expect(handleRowClick).not.toHaveBeenCalled();

      // Click on a data cell still fires the row handler.
      await user.click(screen.getByText("Project Alpha"));
      expect(handleRowClick).toHaveBeenCalledTimes(1);
      expect(handleRowClick).toHaveBeenCalledWith(data[0]);
    });

    it("respects controlled expandedRows", () => {
      const { rerender } = render(
        <DataTable
          columns={columns}
          data={data}
          rowIdKey="id"
          pagination="none"
          toolbar={false}
          expandable
          renderExpandedRow={renderExpandedRow}
          expandedRows={["1"]}
          onExpandedRowsChange={() => {}}
        />,
      );
      expect(screen.getByTestId("expanded-1")).toBeInTheDocument();
      expect(screen.queryByTestId("expanded-2")).not.toBeInTheDocument();

      rerender(
        <DataTable
          columns={columns}
          data={data}
          rowIdKey="id"
          pagination="none"
          toolbar={false}
          expandable
          renderExpandedRow={renderExpandedRow}
          expandedRows={["2"]}
          onExpandedRowsChange={() => {}}
        />,
      );
      expect(screen.queryByTestId("expanded-1")).not.toBeInTheDocument();
      expect(screen.getByTestId("expanded-2")).toBeInTheDocument();
    });

    it("opens defaultExpandedRows on initial render (uncontrolled)", () => {
      render(
        <DataTable
          columns={columns}
          data={data}
          rowIdKey="id"
          pagination="none"
          toolbar={false}
          expandable
          renderExpandedRow={renderExpandedRow}
          defaultExpandedRows={["2"]}
        />,
      );
      expect(screen.getByTestId("expanded-2")).toBeInTheDocument();
      expect(screen.queryByTestId("expanded-1")).not.toBeInTheDocument();
    });

    it("calls onExpandedRowsChange with the new id list", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <DataTable
          columns={columns}
          data={data}
          rowIdKey="id"
          pagination="none"
          toolbar={false}
          expandable
          renderExpandedRow={renderExpandedRow}
          onExpandedRowsChange={handleChange}
        />,
      );
      await user.click(screen.getAllByLabelText("Expand row")[0]);
      expect(handleChange).toHaveBeenLastCalledWith(["1"]);

      await user.click(screen.getByLabelText("Collapse row"));
      expect(handleChange).toHaveBeenLastCalledWith([]);
    });

    it("hides the chevron for rows where isRowExpandable returns false", () => {
      render(
        <DataTable
          columns={columns}
          data={data}
          rowIdKey="id"
          pagination="none"
          toolbar={false}
          expandable
          renderExpandedRow={renderExpandedRow}
          isRowExpandable={(row) => row.id === "1"}
        />,
      );
      expect(screen.getAllByLabelText("Expand row")).toHaveLength(1);
    });

    it("expansionMode='single' closes the previously open row", async () => {
      const user = userEvent.setup();
      render(
        <DataTable
          columns={columns}
          data={data}
          rowIdKey="id"
          pagination="none"
          toolbar={false}
          expandable
          expansionMode="single"
          renderExpandedRow={renderExpandedRow}
        />,
      );
      const chevrons = screen.getAllByLabelText("Expand row");
      await user.click(chevrons[0]);
      expect(screen.getByTestId("expanded-1")).toBeInTheDocument();

      await user.click(screen.getAllByLabelText("Expand row")[0]);
      expect(screen.queryByTestId("expanded-1")).not.toBeInTheDocument();
      expect(screen.getByTestId("expanded-2")).toBeInTheDocument();
    });

    it("passes the original row identity to renderExpandedRow", async () => {
      const user = userEvent.setup();
      const renderer = vi.fn((row: MockRow) => (
        <div data-testid={`expanded-${row.id}`}>x</div>
      ));
      render(
        <DataTable
          columns={columns}
          data={data}
          rowIdKey="id"
          pagination="none"
          toolbar={false}
          expandable
          renderExpandedRow={renderer}
        />,
      );
      await user.click(screen.getAllByLabelText("Expand row")[0]);
      expect(renderer).toHaveBeenCalled();
      expect(renderer.mock.calls[0][0]).toBe(data[0]);
    });

    it("striping is computed from data-row index, not DOM index", async () => {
      const user = userEvent.setup();
      const threeRows: MockRow[] = [
        { id: "1", name: "Alpha", status: "active" },
        { id: "2", name: "Beta", status: "active" },
        { id: "3", name: "Gamma", status: "active" },
      ];
      const { container } = render(
        <DataTable
          columns={columns}
          data={threeRows}
          rowIdKey="id"
          pagination="none"
          toolbar={false}
          striped
          expandable
          renderExpandedRow={renderExpandedRow}
        />,
      );
      await user.click(screen.getAllByLabelText("Expand row")[0]);

      const evenRows = container.querySelectorAll(".mui-datatable-row-even");
      const oddRows = container.querySelectorAll(".mui-datatable-row-odd");
      // Row 0 (Alpha) → even, Row 1 (Beta) → odd, Row 2 (Gamma) → even.
      // Expanded panel <tr> must NOT count toward striping.
      expect(evenRows).toHaveLength(2);
      expect(oddRows).toHaveLength(1);
    });

    it("CSV export omits the expand column", async () => {
      const user = userEvent.setup();
      const blobs: Blob[] = [];
      const originalCreate = URL.createObjectURL;
      const originalRevoke = URL.revokeObjectURL;
      URL.createObjectURL = vi.fn((blob: Blob) => {
        blobs.push(blob);
        return "blob:mock";
      });
      URL.revokeObjectURL = vi.fn();

      try {
        render(
          <DataTable
            columns={columns}
            data={data}
            rowIdKey="id"
            pagination="none"
            expandable
            renderExpandedRow={renderExpandedRow}
            exportable
          />,
        );
        await user.click(screen.getByText("Export"));
        expect(blobs).toHaveLength(1);
        const text = await blobs[0].text();
        const headerLine = text.split("\n")[0];
        expect(headerLine).toBe("Name,Status");
        expect(text).not.toContain("panel-content-for-row");
      } finally {
        URL.createObjectURL = originalCreate;
        URL.revokeObjectURL = originalRevoke;
      }
    });

    it("column visibility popover does not list the expand column", async () => {
      const user = userEvent.setup();
      render(
        <DataTable
          columns={columns}
          data={data}
          rowIdKey="id"
          pagination="none"
          expandable
          renderExpandedRow={renderExpandedRow}
        />,
      );
      await user.click(screen.getByText("Columns"));
      // Only the two real columns (name, status) — not __rowcue__.
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes).toHaveLength(2);
    });

    it("expanding a row does not trigger selection", async () => {
      const user = userEvent.setup();
      const handleSelectionChange = vi.fn();
      render(
        <DataTable
          columns={columns}
          data={data}
          rowIdKey="id"
          pagination="none"
          toolbar={false}
          selectable
          onSelectionChange={handleSelectionChange}
          expandable
          renderExpandedRow={renderExpandedRow}
        />,
      );
      await user.click(screen.getAllByLabelText("Expand row")[0]);
      expect(handleSelectionChange).not.toHaveBeenCalled();
    });
  });
});
