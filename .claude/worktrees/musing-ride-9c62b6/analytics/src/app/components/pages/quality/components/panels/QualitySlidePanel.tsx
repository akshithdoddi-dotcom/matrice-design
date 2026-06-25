import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  headerRight?: ReactNode;
  width?: string;
}

export const QualitySlidePanel = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  headerRight,
  width = "w-[640px]",
}: Props) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return createPortal(
    <>
      <div
        className={cn(
          "fixed inset-0 z-[998] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed right-0 top-0 bottom-0 z-[999] flex flex-col bg-white shadow-2xl border-l border-neutral-200",
          "transition-transform duration-300 ease-out",
          width, "max-w-[95vw]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-neutral-100 bg-white shrink-0">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-neutral-900 leading-tight">{title}</h3>
            {subtitle && <p className="text-xs text-neutral-500 mt-0.5 leading-tight">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {headerRight}
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>

        {/* Sticky footer */}
        {footer && (
          <div className="shrink-0 border-t border-neutral-100">
            {footer}
          </div>
        )}
      </div>
    </>,
    document.body
  );
};
