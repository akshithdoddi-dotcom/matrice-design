import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Bell } from "lucide-react";
import {
  FormField,
  MetricDef,
  OPERATOR_OPTIONS,
  RuleDef,
  SEVERITY_OPTIONS,
  Severity,
  StatusToggle,
  formatToday,
  getSeverityConfig,
  textInputClass,
} from "./metricsRulesShared";
import { cn } from "@/app/lib/utils";

interface CreateRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metrics: MetricDef[];
  onSave: (rule: RuleDef) => void;
  editingRule?: RuleDef | null;
}

export const CreateRuleDialog = ({ open, onOpenChange, metrics, onSave, editingRule }: CreateRuleDialogProps) => {
  const [name, setName] = useState("");
  const [targetMetricId, setTargetMetricId] = useState(metrics[0]?.id ?? "");
  const [operator, setOperator] = useState<RuleDef["operator"]>(">");
  const [threshold, setThreshold] = useState("");
  const [unit, setUnit] = useState("count");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [cooldownMinutes, setCooldownMinutes] = useState("5");
  const [notifyEmails, setNotifyEmails] = useState("");
  const [active, setActive] = useState(true);

  const reset = () => {
    setName("");
    setTargetMetricId(metrics[0]?.id ?? "");
    setOperator(">");
    setThreshold("");
    setUnit("count");
    setSeverity("medium");
    setCooldownMinutes("5");
    setNotifyEmails("");
    setActive(true);
  };

  useEffect(() => {
    if (!open) return;
    if (editingRule) {
      setName(editingRule.name);
      setTargetMetricId(editingRule.targetMetricId);
      setOperator(editingRule.operator);
      setThreshold(String(editingRule.threshold));
      setUnit(editingRule.unit);
      setSeverity(editingRule.severity);
      setCooldownMinutes(String(editingRule.cooldownMinutes));
      setNotifyEmails(editingRule.notifyEmails.join(", "));
      setActive(editingRule.active);
    } else {
      reset();
    }
  }, [open, editingRule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetMetricId || !threshold.trim()) return;

    onSave({
      id: editingRule?.id ?? crypto.randomUUID(),
      name: name.trim(),
      targetMetricId,
      operator,
      threshold: Number(threshold),
      unit: unit.trim() || "count",
      severity,
      cooldownMinutes: Number(cooldownMinutes) || 0,
      triggeredCount: editingRule?.triggeredCount ?? 0,
      notifyEmails: notifyEmails
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean),
      createdDate: editingRule?.createdDate ?? formatToday(),
      active,
    });
    reset();
    onOpenChange(false);
  };

  const isEditing = Boolean(editingRule);

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-150" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[480px] max-h-[85vh] overflow-y-auto bg-white rounded-md shadow-xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#E5FFF9] rounded-sm text-[#00775B]">
                <Bell className="w-4 h-4" />
              </div>
              <Dialog.Title className="text-sm font-bold text-neutral-800 uppercase tracking-wide">
                {isEditing ? "Edit Rule" : "Create Rule"}
              </Dialog.Title>
            </div>
            <Dialog.Close className="text-neutral-400 hover:text-neutral-700 transition-colors">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Configure a threshold condition on an existing metric to trigger alerts.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
            <FormField label="Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pedestrian Rule 1"
                className={textInputClass}
                autoFocus
              />
            </FormField>

            <FormField label="Target Metric">
              <div className="flex flex-wrap gap-1.5">
                {metrics.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setTargetMetricId(m.id)}
                    className={cn(
                      "px-2.5 py-1 text-[10px] font-bold rounded border transition-colors",
                      targetMetricId === m.id
                        ? "bg-[#00775B] text-white border-[#00775B]"
                        : "bg-white text-neutral-500 border-neutral-200 hover:border-[#00775B]"
                    )}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Condition">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {OPERATOR_OPTIONS.map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setOperator(op)}
                      className={cn(
                        "w-8 h-[26px] flex items-center justify-center text-[11px] font-bold rounded border transition-colors",
                        operator === op
                          ? "bg-[#00775B] text-white border-[#00775B]"
                          : "bg-white text-neutral-500 border-neutral-200 hover:border-[#00775B]"
                      )}
                    >
                      {op}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder="2"
                  className={`${textInputClass} w-20`}
                />
                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="count"
                  className={`${textInputClass} flex-1`}
                />
              </div>
            </FormField>

            <FormField label="Severity">
              <div className="flex flex-wrap gap-1.5">
                {SEVERITY_OPTIONS.map((sev) => {
                  const cfg = getSeverityConfig(sev);
                  const isSelected = severity === sev;
                  return (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className="px-2.5 py-1 text-[10px] font-bold uppercase rounded border transition-colors"
                      style={
                        isSelected
                          ? { backgroundColor: cfg.bright, borderColor: cfg.bright, color: "white" }
                          : { backgroundColor: "white", borderColor: "#E5E5E5", color: cfg.bright }
                      }
                    >
                      {sev}
                    </button>
                  );
                })}
              </div>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Cooldown (min)">
                <input
                  type="number"
                  value={cooldownMinutes}
                  onChange={(e) => setCooldownMinutes(e.target.value)}
                  placeholder="5"
                  className={textInputClass}
                />
              </FormField>
              <FormField label="Notify (emails)">
                <input
                  value={notifyEmails}
                  onChange={(e) => setNotifyEmails(e.target.value)}
                  placeholder="ops@matrice.ai, ..."
                  className={textInputClass}
                />
              </FormField>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                {isEditing ? "Active" : "Active on Create"}
              </span>
              <StatusToggle active={active} onChange={() => setActive((a) => !a)} />
            </div>

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
                disabled={!name.trim() || !targetMetricId || !threshold.trim()}
                className="px-4 py-2 bg-[#00775B] text-white rounded text-xs font-bold hover:bg-[#005f48] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isEditing ? "Save Changes" : "Create Rule"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
