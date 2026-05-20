import { List, ListOrdered } from "lucide-react";

import * as React from "react";

interface TextAreaToolbarProps {
  disabled?: boolean;
  onInsertBullet: () => void;
  onInsertNumbered: () => void;
}

export function TextAreaToolbar({
  disabled,
  onInsertBullet,
  onInsertNumbered,
}: TextAreaToolbarProps) {
  return (
    <div className="flex items-center gap-1 rounded-t-(--radius-md) border border-(--input-border) border-b-0 bg-(--bg-surface) px-2 py-1">
      <button
        type="button"
        className="rounded-(--radius-sm) p-1.5 text-(--text-muted) transition-all duration-(--duration-fast) ease-(--ease-snappy) hover:bg-(--bg-hover) hover:text-(--text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-main) focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onInsertBullet}
        disabled={disabled}
        aria-label="Insert bullet list item"
      >
        <List size={16} />
      </button>
      <button
        type="button"
        className="rounded-(--radius-sm) p-1.5 text-(--text-muted) transition-all duration-(--duration-fast) ease-(--ease-snappy) hover:bg-(--bg-hover) hover:text-(--text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-main) focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onInsertNumbered}
        disabled={disabled}
        aria-label="Insert numbered list item"
      >
        <ListOrdered size={16} />
      </button>
    </div>
  );
}
