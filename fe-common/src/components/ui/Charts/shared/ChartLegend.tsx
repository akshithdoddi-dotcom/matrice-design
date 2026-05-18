import * as React from "react";

import { cn } from "@/lib/utils";

export interface ChartLegendItem {
  label: string;
  color: string;
  shape?: "circle" | "square" | "line" | "dashed";
}

interface ChartLegendProps {
  items: ChartLegendItem[];
  orientation?: "horizontal" | "vertical";
  alignment?: "start" | "center" | "end";
  className?: string;
  onItemClick?: (item: ChartLegendItem, index: number) => void;
  inactiveItems?: string[];
}

const alignmentMap = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
} as const;

function ShapeIndicator({
  shape,
  color,
}: {
  shape: ChartLegendItem["shape"];
  color: string;
}) {
  if (shape === "line" || shape === "dashed") {
    return (
      <span
        className="inline-block h-0.5 w-3 shrink-0"
        style={{
          backgroundColor: color,
          ...(shape === "dashed"
            ? {
                backgroundImage: `repeating-linear-gradient(90deg, ${color} 0px, ${color} 3px, transparent 3px, transparent 6px)`,
                backgroundColor: "transparent",
              }
            : {}),
        }}
      />
    );
  }

  if (shape === "square") {
    return (
      <span
        className="h-2 w-2 shrink-0 rounded-sm"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
    );
  }

  return (
    <span
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}

export function ChartLegend({
  items,
  orientation = "horizontal",
  alignment = "center",
  className,
  onItemClick,
  inactiveItems,
}: ChartLegendProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1.5",
        orientation === "vertical" && "flex-col items-start",
        alignmentMap[alignment],
        className,
      )}
    >
      {items.map((item, index) => {
        const isInactive = inactiveItems?.includes(item.label);
        return (
          <button
            key={item.label}
            type="button"
            className={cn(
              "inline-flex items-center gap-1.5 text-xs transition-opacity",
              isInactive && "opacity-40",
              onItemClick
                ? "cursor-pointer hover:opacity-80"
                : "cursor-default",
            )}
            style={{ color: "var(--chart-text)" }}
            onClick={onItemClick ? () => onItemClick(item, index) : undefined}
            tabIndex={onItemClick ? 0 : -1}
          >
            <ShapeIndicator
              shape={item.shape}
              color={isInactive ? "var(--chart-muted)" : item.color}
            />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
