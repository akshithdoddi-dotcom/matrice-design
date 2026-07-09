import { useEffect, useRef, useState } from "react";
import { LayoutGrid, List, MoreVertical, Pencil, SquarePen, Trash2 } from "lucide-react";
import { cn } from "@/app/lib/utils";

export type ViewMode = "grid" | "table";

export const ViewToggle = ({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) => (
  <div className="flex items-center bg-white border border-neutral-200 rounded-[3px] p-0.5 shadow-sm shrink-0">
    {(["grid", "table"] as const).map((v) => (
      <button
        key={v}
        type="button"
        title={v === "grid" ? "Grid view" : "Table view"}
        onClick={() => onChange(v)}
        className={cn(
          "h-6 w-6 p-0 rounded-[2px] flex items-center justify-center transition-all",
          view === v ? "bg-neutral-100 text-[#00775B]" : "text-neutral-400 hover:text-neutral-600"
        )}
      >
        {v === "grid" ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
      </button>
    ))}
  </div>
);

export type Severity = "critical" | "high" | "medium" | "low";

export interface MetricDef {
  id: string;
  name: string;
  application: string;
  camera: string;
  location: string;
  formula: string;
  frequency: "Hourly" | "Daily" | "Weekly" | "Monthly";
  createdDate: string;
  active: boolean;
}

export interface RuleDef {
  id: string;
  name: string;
  targetMetricId: string;
  operator: ">" | ">=" | "<" | "<=" | "==";
  threshold: number;
  unit: string;
  severity: Severity;
  cooldownMinutes: number;
  triggeredCount: number;
  notifyEmails: string[];
  createdDate: string;
  active: boolean;
}

export const APPLICATION_OPTIONS = [
  "People Counting",
  "PPE Detection",
  "Intrusion Detection",
  "Crowd Analytics",
  "License Plate Recognition",
  "Face Recognition",
];

export const FREQUENCY_OPTIONS: MetricDef["frequency"][] = ["Hourly", "Daily", "Weekly", "Monthly"];

export const OPERATOR_OPTIONS: RuleDef["operator"][] = [">", ">=", "<", "<=", "=="];

export const SEVERITY_OPTIONS: Severity[] = ["critical", "high", "medium", "low"];

export const getSeverityConfig = (severity: Severity) => {
  const config: Record<Severity, { bright: string; light: string; dark: string }> = {
    critical: { bright: "#E7000B", light: "#FFE5E7", dark: "#B91C1C" },
    high: { bright: "#EA580C", light: "#FEEFE7", dark: "#C2410C" },
    medium: { bright: "#E19A04", light: "#FFF7E6", dark: "#CA8A04" },
    low: { bright: "#2B7FFF", light: "#E5F0FF", dark: "#1D4ED8" },
  };
  return config[severity];
};

export const formatToday = () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const CardMenu = ({
  onRename,
  onEdit,
  onDelete,
}: {
  onRename: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative h-8 w-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 border border-neutral-200 transition-colors"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-1 w-36 rounded-sm border border-neutral-200 bg-white shadow-lg z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onRename();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
          >
            <Pencil className="w-3.5 h-3.5" /> Rename
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
          >
            <SquarePen className="w-3.5 h-3.5" /> Edit
          </button>
          <div className="border-t border-neutral-100 my-1" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#E7000B] hover:bg-[#FFE5E7]"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-100">
      <div className="flex items-center rounded-[4px] border border-neutral-200 bg-white overflow-hidden shadow-sm divide-x divide-neutral-200">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={cn(
            "px-3 py-1.5 text-[11px] font-medium transition-colors",
            currentPage === 1 ? "text-neutral-300 cursor-not-allowed" : "text-neutral-600 hover:bg-neutral-50"
          )}
        >
          Previous
        </button>
        {Array.from({ length: totalPages })
          .map((_, idx) => {
            const page = idx + 1;
            if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={cn(
                    "px-3 py-1.5 text-[11px] font-medium transition-colors min-w-[32px]",
                    currentPage === page ? "bg-[#00775B] text-white font-bold" : "text-neutral-600 hover:bg-neutral-50"
                  )}
                >
                  {page}
                </button>
              );
            }
            if (page === currentPage - 2 || page === currentPage + 2) {
              return (
                <span key={`ellipsis-${page}`} className="px-2 py-1.5 text-[11px] text-neutral-400 select-none">
                  …
                </span>
              );
            }
            return null;
          })
          .filter(Boolean)}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={cn(
            "px-3 py-1.5 text-[11px] font-medium transition-colors",
            currentPage === totalPages ? "text-neutral-300 cursor-not-allowed" : "text-neutral-600 hover:bg-neutral-50"
          )}
        >
          Next
        </button>
      </div>

      <span className="text-[11px] text-neutral-500 tabular-nums">
        Showing <span className="font-semibold text-neutral-700">{startIndex + 1}–{endIndex}</span> of{" "}
        <span className="font-semibold text-neutral-700">{totalItems}</span>
      </span>
    </div>
  );
};

export const StatusToggle = ({ active, onChange }: { active: boolean; onChange: () => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={active}
    onClick={onChange}
    className={cn(
      "relative w-9 h-5 rounded-full transition-colors shrink-0",
      active ? "bg-[#00775B]" : "bg-neutral-300"
    )}
  >
    <span
      className={cn(
        "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
        active && "translate-x-4"
      )}
    />
  </button>
);

export const ToggleGroup = <T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (value: T) => void;
}) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map((opt) => (
      <button
        key={opt}
        type="button"
        onClick={() => onChange(opt)}
        className={cn(
          "px-2.5 py-1 text-[10px] font-bold rounded border transition-colors",
          value === opt
            ? "bg-[#00775B] text-white border-[#00775B]"
            : "bg-white text-neutral-500 border-neutral-200 hover:border-[#00775B]"
        )}
      >
        {opt}
      </button>
    ))}
  </div>
);

export const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2 block">{label}</label>
    {children}
  </div>
);

export const textInputClass =
  "w-full border border-neutral-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00775B]";
