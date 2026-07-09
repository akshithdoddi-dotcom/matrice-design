import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmDeleteDialogProps {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteDialog = ({ open, title, description, onCancel, onConfirm }: ConfirmDeleteDialogProps) => (
  <AlertDialog.Root open={open} onOpenChange={(next) => { if (!next) onCancel(); }}>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-150" />
      <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[400px] bg-white rounded-md shadow-xl border border-neutral-200 p-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[#FFE5E7] text-[#E7000B] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <AlertDialog.Title className="text-sm font-bold text-neutral-800">{title}</AlertDialog.Title>
            <AlertDialog.Description className="text-xs text-neutral-500 mt-1">
              {description}
            </AlertDialog.Description>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-5">
          <AlertDialog.Cancel asChild>
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-neutral-200 rounded text-xs font-semibold text-neutral-600 hover:border-neutral-400 transition-colors"
            >
              Cancel
            </button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-[#E7000B] text-white rounded text-xs font-bold hover:bg-[#B91C1C] transition-colors"
            >
              Delete
            </button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);
