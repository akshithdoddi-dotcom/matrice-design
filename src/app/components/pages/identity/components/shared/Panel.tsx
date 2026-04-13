import { type ReactNode, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { InfoTooltip } from "./InfoTooltip";
import { type LucideIcon } from "lucide-react";

interface PanelProps {
  title: string;
  icon?: LucideIcon;
  info?: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  headerRight?: ReactNode;
  /** Makes the panel fill its container height; inner content becomes flex-1 */
  grow?: boolean;
}

export const Panel = ({
  title,
  icon: Icon,
  info,
  children,
  className,
  collapsible = false,
  defaultOpen = true,
  headerRight,
  grow = false,
}: PanelProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn(
      "bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden",
      grow && "flex flex-col h-full",
      className,
    )}>
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b border-neutral-50 shrink-0",
          collapsible && "cursor-pointer hover:bg-neutral-50/50"
        )}
        onClick={collapsible ? () => setOpen((o) => !o) : undefined}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-[#00775B]" />}
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {headerRight}
          {info && <InfoTooltip text={info} />}
          {collapsible && (
            open
              ? <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
              : <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          )}
        </div>
      </div>
      {open && <div className={cn("p-4", grow && "flex-1 flex flex-col min-h-0")}>{children}</div>}
    </div>
  );
};
