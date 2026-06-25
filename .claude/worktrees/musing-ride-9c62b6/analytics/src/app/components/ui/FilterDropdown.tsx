import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/app/lib/utils";

// ─── FilterDropdown ───────────────────────────────────────────────────────────
// Shared component matching the dashboard filter dropdown design language.
// Supports single-select (value/onValueChange) and multi-select (selectedItems/onToggleItem).
//
// Usage — single-select:
//   <FilterDropdown label="Zone" options={zones} value={selectedZone} onValueChange={setZone} />
//
// Usage — multi-select:
//   <FilterDropdown label="Apps" options={apps} selectedItems={selected} onToggleItem={toggle} />

export interface FilterDropdownOption {
  value: string;
  label: string;
  sublabel?: string;  // Optional sub-label shown below label in the dropdown
}

interface FilterDropdownProps {
  /** Short noun shown in "All {label}" placeholder */
  label: string;
  /** Option values/labels. Pass strings OR FilterDropdownOption objects. */
  options: (string | FilterDropdownOption)[];
  // Single-select
  value?: string;
  onValueChange?: (val: string) => void;
  // Multi-select
  selectedItems?: string[];
  onToggleItem?: (item: string) => void;
  /** Optional extra className for the root container */
  className?: string;
  /** Override the "All {label}" placeholder text */
  placeholder?: string;
}

function toOption(o: string | FilterDropdownOption): FilterDropdownOption {
  if (typeof o === "string") return { value: o, label: o };
  return o;
}

export const FilterDropdown = ({
  label,
  options: rawOptions,
  value,
  onValueChange,
  selectedItems,
  onToggleItem,
  className,
  placeholder,
}: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isMulti = selectedItems !== undefined;
  const options = rawOptions.map(toOption);

  // Click-outside close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Derive display text shown on the button
  const displayText = () => {
    if (isMulti) {
      const active = (selectedItems ?? []).filter((s) => s !== "all");
      if (active.length === 0) return placeholder ?? `All ${label}`;
      if (active.length === 1) {
        const found = options.find((o) => o.value === active[0]);
        return found?.label ?? active[0];
      }
      return `${active.length} ${label}`;
    }
    if (!value || value === "all") return placeholder ?? `All ${label}`;
    const found = options.find((o) => o.value === value);
    return found?.label ?? value;
  };

  // Whether any non-default filter is active (affects button colour)
  const isActive = isMulti
    ? (selectedItems ?? []).filter((s) => s !== "all").length > 0
    : !!(value && value !== "all");

  const handleSelect = (optVal: string) => {
    if (isMulti) {
      onToggleItem?.(optVal);
    } else {
      onValueChange?.(optVal);
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("relative", className)} ref={ref}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={cn(
          "flex items-center justify-between gap-2 h-8 px-3 w-full rounded-[4px] border text-[11px] font-medium transition-all bg-white shadow-sm select-none",
          isActive
            ? "border-[#00775B] text-[#00775B] bg-[#00775B]/5"
            : "border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:text-neutral-900"
        )}
      >
        <span className="truncate uppercase tracking-wide">{displayText()}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 opacity-50 shrink-0 transition-transform duration-150",
            isOpen && "rotate-180"
          )}
          strokeWidth={2.5}
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-full min-w-[180px] z-50 bg-white border border-neutral-200 rounded-[4px] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {options.map((opt) => {
              const isSelected = isMulti
                ? (selectedItems ?? []).includes(opt.value)
                : (opt.value === value || (opt.value === "all" && (!value || value === "all")));

              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    "flex items-center justify-between gap-2 px-3 py-2 cursor-pointer text-xs transition-colors",
                    isSelected ? "bg-[#00775B]/5" : "hover:bg-neutral-50"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        "font-medium uppercase tracking-wide truncate",
                        isSelected ? "text-[#00775B] font-bold" : "text-neutral-700"
                      )}
                    >
                      {opt.value === "all" ? placeholder ?? `All ${label}` : opt.label}
                    </div>
                    {opt.sublabel && (
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wide truncate mt-0.5">
                        {opt.sublabel}
                      </div>
                    )}
                  </div>

                  {/* Indicator */}
                  {isMulti ? (
                    <div
                      className={cn(
                        "w-3.5 h-3.5 rounded-[2px] border flex items-center justify-center flex-shrink-0 transition-colors",
                        isSelected ? "bg-[#00775B] border-[#00775B]" : "border-neutral-300"
                      )}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                  ) : (
                    isSelected && <Check className="w-3 h-3 text-[#00775B] flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
