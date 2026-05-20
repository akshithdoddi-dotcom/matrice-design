import { type SortingState } from "@tanstack/react-table";

export function getAlignClass(
  align: "left" | "center" | "right" | undefined,
): string {
  if (align === "center") {
    return "text-center";
  }
  if (align === "right") {
    return "text-right";
  }
  return "text-left";
}

export function toSortingState(
  model: { id: string; direction: "asc" | "desc" }[] | undefined,
): SortingState {
  if (!model) {
    return [];
  }
  return model.map((item) => ({
    id: item.id,
    desc: item.direction === "desc",
  }));
}

export function toSortModel(
  sorting: SortingState,
): { id: string; direction: "asc" | "desc" }[] {
  return sorting.map((item) => ({
    id: item.id,
    direction: item.desc ? "desc" : "asc",
  }));
}

export function getPageWindow(
  pageCount: number,
  currentPage: number,
): number[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(pageCount, currentPage + 2);
  const pages = new Set<number>([1, pageCount]);

  for (let value = start; value <= end; value += 1) {
    pages.add(value);
  }

  return Array.from(pages).sort((a, b) => a - b);
}
