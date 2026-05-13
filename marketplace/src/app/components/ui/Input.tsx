import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  validationStatus?: "success" | "warning" | "error" | "info";
  validationMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, validationStatus, validationMessage, ...props }, ref) => {
    
    const getStatusIcon = () => {
      switch (validationStatus) {
        case "success": return <CheckCircle className="h-4 w-4 text-success" />;
        case "warning": return <AlertTriangle className="h-4 w-4 text-warning" />;
        case "error": return <XCircle className="h-4 w-4 text-error" />;
        case "info": return <Info className="h-4 w-4 text-info" />;
        default: return null;
      }
    };

    const getBorderColor = () => {
      switch (validationStatus) {
        case "success": return "border-success focus-visible:ring-success/30";
        case "warning": return "border-warning focus-visible:ring-warning/30";
        case "error": return "border-error focus-visible:ring-error/30";
        case "info": return "border-info focus-visible:ring-info/30";
        default: return "border-neutral-300 focus-visible:border-primary focus-visible:ring-primary/30";
      }
    };

    return (
      <div className="w-full space-y-1">
        <div className="relative">
          <input
            type={type}
            className={cn(
              "flex h-[40px] w-full rounded-[var(--radius-sm)] border bg-transparent px-4 py-2 text-sm shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50",
              getBorderColor(),
              validationStatus && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {getStatusIcon()}
          </div>
        </div>
        <AnimatePresence>
          {validationMessage && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={cn(
                "text-xs font-medium ml-1",
                validationStatus === "error" ? "text-error" :
                validationStatus === "warning" ? "text-warning" :
                validationStatus === "success" ? "text-success" :
                "text-neutral-500"
              )}
            >
              {validationMessage}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
