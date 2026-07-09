import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Pencil, X } from "lucide-react";
import { FormField, textInputClass } from "./metricsRulesShared";

interface RenameDialogProps {
  open: boolean;
  title: string;
  initialName: string;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => void;
}

export const RenameDialog = ({ open, title, initialName, onOpenChange, onSave }: RenameDialogProps) => {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (open) setName(initialName);
  }, [open, initialName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim());
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-150" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[360px] bg-white rounded-md shadow-xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#E5FFF9] rounded-sm text-[#00775B]">
                <Pencil className="w-4 h-4" />
              </div>
              <Dialog.Title className="text-sm font-bold text-neutral-800 uppercase tracking-wide">
                {title}
              </Dialog.Title>
            </div>
            <Dialog.Close className="text-neutral-400 hover:text-neutral-700 transition-colors">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Rename this item.</Dialog.Description>

          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
            <FormField label="Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={textInputClass}
                autoFocus
              />
            </FormField>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 border border-neutral-200 rounded text-xs font-semibold text-neutral-600 hover:border-neutral-400 transition-colors"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-4 py-2 bg-[#00775B] text-white rounded text-xs font-bold hover:bg-[#005f48] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
