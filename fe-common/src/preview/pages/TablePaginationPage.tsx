import { useState } from "react";
import { TablePagination } from "../../components/ui/table-pagination";

export function TablePaginationPage() {
  const [page1, setPage1] = useState(1);
  const [page2, setPage2] = useState(3);
  const [page3, setPage3] = useState(1);

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary) mb-1">Table Pagination</h1>
        <p className="text-sm text-(--text-secondary)">
          Page navigation control for data tables with range summary, page window, and prev/next.
        </p>
      </div>

      {/* Basic */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Basic</h2>
        <div className="border border-(--border-color) rounded-xl p-4 bg-(--surface)">
          <TablePagination
            currentPage={page1}
            pageCount={10}
            onPageChange={setPage1}
            totalItems={100}
            pageSize={10}
          />
        </div>
        <p className="text-xs text-(--text-muted)">Page {page1} of 10</p>
      </section>

      {/* Many pages */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Many Pages (windowed)</h2>
        <div className="border border-(--border-color) rounded-xl p-4 bg-(--surface)">
          <TablePagination
            currentPage={page2}
            pageCount={50}
            onPageChange={setPage2}
            totalItems={500}
            pageSize={10}
          />
        </div>
        <p className="text-xs text-(--text-muted)">Page {page2} of 50</p>
      </section>

      {/* Custom labels */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Custom Labels</h2>
        <div className="border border-(--border-color) rounded-xl p-4 bg-(--surface)">
          <TablePagination
            currentPage={page3}
            pageCount={8}
            onPageChange={setPage3}
            totalItems={80}
            pageSize={10}
            previousLabel="← Prev"
            nextLabel="Next →"
          />
        </div>
      </section>

      {/* Custom summary */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Custom Summary</h2>
        <div className="border border-(--border-color) rounded-xl p-4 bg-(--surface)">
          <TablePagination
            currentPage={page1}
            pageCount={10}
            onPageChange={setPage1}
            summary={
              <span className="text-xs text-(--text-secondary)">
                Showing results 1–10 of <strong>100</strong> training runs
              </span>
            }
          />
        </div>
      </section>

      {/* Single page */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Single Page</h2>
        <div className="border border-(--border-color) rounded-xl p-4 bg-(--surface)">
          <TablePagination
            currentPage={1}
            pageCount={1}
            onPageChange={() => {}}
            totalItems={5}
            pageSize={10}
          />
        </div>
      </section>
    </div>
  );
}
