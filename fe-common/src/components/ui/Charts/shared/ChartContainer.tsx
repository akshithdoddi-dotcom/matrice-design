import * as React from "react";
import { ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";

interface ChartContainerProps {
  height: number;
  width?: number | string;
  ariaLabel?: string;
  className?: string;
  emptyState?: React.ReactNode;
  children: React.ReactNode;
}

export function ChartContainer({
  height,
  width = "100%",
  ariaLabel,
  className,
  emptyState,
  children,
}: ChartContainerProps) {
  return (
    <div
      className={cn("w-full", className)}
      role="img"
      aria-label={ariaLabel}
      style={{ width: typeof width === "number" ? `${width}px` : width }}
    >
      {emptyState ?? (
        <ResponsiveContainer width="100%" height={height}>
          {children as React.ReactElement}
        </ResponsiveContainer>
      )}
    </div>
  );
}
