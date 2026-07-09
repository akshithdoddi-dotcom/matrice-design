import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Sigma } from "lucide-react";
import {
  APPLICATION_OPTIONS,
  FREQUENCY_OPTIONS,
  FormField,
  MetricDef,
  ToggleGroup,
  formatToday,
  textInputClass,
} from "./metricsRulesShared";

interface CreateMetricDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (metric: MetricDef) => void;
  editingMetric?: MetricDef | null;
}

export const CreateMetricDialog = ({ open, onOpenChange, onSave, editingMetric }: CreateMetricDialogProps) => {
  const [name, setName] = useState("");
  const [application, setApplication] = useState(APPLICATION_OPTIONS[0]);
  const [camera, setCamera] = useState("");
  const [location, setLocation] = useState("");
  const [formula, setFormula] = useState("");
  const [frequency, setFrequency] = useState<MetricDef["frequency"]>("Hourly");

  const reset = () => {
    setName("");
    setApplication(APPLICATION_OPTIONS[0]);
    setCamera("");
    setLocation("");
    setFormula("");
    setFrequency("Hourly");
  };

  useEffect(() => {
    if (!open) return;
    if (editingMetric) {
      setName(editingMetric.name);
      setApplication(editingMetric.application);
      setCamera(editingMetric.camera);
      setLocation(editingMetric.location);
      setFormula(editingMetric.formula);
      setFrequency(editingMetric.frequency);
    } else {
      reset();
    }
  }, [open, editingMetric]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !formula.trim()) return;

    onSave({
      id: editingMetric?.id ?? crypto.randomUUID(),
      name: name.trim(),
      application,
      camera: camera.trim() || "Unassigned",
      location: location.trim() || "Unknown Location",
      formula: formula.trim(),
      frequency,
      createdDate: editingMetric?.createdDate ?? formatToday(),
      active: editingMetric?.active ?? true,
    });
    reset();
    onOpenChange(false);
  };

  const isEditing = Boolean(editingMetric);

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-150" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[480px] max-h-[85vh] overflow-y-auto bg-white rounded-md shadow-xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#E5FFF9] rounded-sm text-[#00775B]">
                <Sigma className="w-4 h-4" />
              </div>
              <Dialog.Title className="text-sm font-bold text-neutral-800 uppercase tracking-wide">
                {isEditing ? "Edit Metric" : "Create Metric"}
              </Dialog.Title>
            </div>
            <Dialog.Close className="text-neutral-400 hover:text-neutral-700 transition-colors">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Define a custom metric from a camera data source to track on your dashboard.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
            <FormField label="Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pedestrian Crowd 1"
                className={textInputClass}
                autoFocus
              />
            </FormField>

            <FormField label="Application">
              <ToggleGroup options={APPLICATION_OPTIONS} value={application} onChange={setApplication} />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Camera">
                <input
                  value={camera}
                  onChange={(e) => setCamera(e.target.value)}
                  placeholder="e.g. Cam-P01"
                  className={textInputClass}
                />
              </FormField>
              <FormField label="Location">
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Parking Level B"
                  className={textInputClass}
                />
              </FormField>
            </div>

            <FormField label="Formula">
              <input
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="e.g. playback_cam_1_total_new_count"
                className={`${textInputClass} font-mono`}
              />
            </FormField>

            <FormField label="Frequency">
              <ToggleGroup options={FREQUENCY_OPTIONS} value={frequency} onChange={setFrequency} />
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
                disabled={!name.trim() || !formula.trim()}
                className="px-4 py-2 bg-[#00775B] text-white rounded text-xs font-bold hover:bg-[#005f48] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isEditing ? "Save Changes" : "Create Metric"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
