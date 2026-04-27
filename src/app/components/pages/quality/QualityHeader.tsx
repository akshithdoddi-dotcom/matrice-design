import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Settings, X, Plus, Pencil, Trash2, Check } from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { Persona } from "@/app/components/dashboard/PersonaSwitcher";
import type { QualityAppId, QualityTerminology } from "./data/mockData";
import { AnalyticsPageHeader, type AppOption } from "@/app/components/layout/AnalyticsPageHeader";
import type { GroupConfig } from "../IdentityAnalytics";

// ── App list ──────────────────────────────────────────────────────────────────

const APP_OPTIONS: AppOption[] = [
  { id: "bottle",        label: "Bottle Defect"            },
  { id: "pcb",           label: "PCB Defect"               },
  { id: "welding",       label: "Welding Defect"           },
  { id: "car-damage",    label: "Car Damage"               },
  { id: "corrosion",     label: "Corrosion Detection"      },
  { id: "road-damage",   label: "Road Damage"              },
  { id: "pothole",       label: "Pothole Detection"        },
  { id: "phone-screen",  label: "Screen Defect"            },
  { id: "assembly",      label: "Assembly Line QC"         },
  { id: "food-quality",  label: "Food Quality"             },
  { id: "textile",       label: "Textile Defect"           },
  { id: "solar-panel",   label: "Solar Panel QC"           },
  { id: "semiconductor", label: "Semiconductor Inspection" },
  { id: "metal-surface", label: "Metal Surface"            },
  { id: "glass",         label: "Glass Defect"             },
  { id: "paint",         label: "Paint Defect"             },
  { id: "wire-harness",  label: "Wire Harness QC"          },
  { id: "packaging",     label: "Packaging Inspection"     },
  { id: "wood",          label: "Wood Defect"              },
];

const TIME_RANGES: Record<Persona, string[]> = {
  monitoring: ["5m", "1h", "1d", "1w"],
  manager:    ["Today", "This Week"],
  director:   ["This Month", "This Quarter"],
};

// ── Group Email Editor ────────────────────────────────────────────────────────

function GroupEmailEditor({
  emails,
  onChange,
}: {
  emails: string[];
  onChange: (emails: string[]) => void;
}) {
  const inputs = emails.length > 0 ? emails : [""];
  const update = (i: number, val: string) => {
    const next = inputs.map((e, idx) => (idx === i ? val : e));
    onChange(next);
  };
  const remove = (i: number) => onChange(inputs.filter((_, idx) => idx !== i));
  const add = () => onChange([...inputs, ""]);

  return (
    <div className="space-y-2">
      <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
        Member Emails
      </p>
      {inputs.map((email, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="email"
            placeholder={`member${i + 1}@example.com`}
            value={email}
            onChange={(e) => update(i, e.target.value)}
            className="flex-1 h-8 px-3 rounded-[6px] border border-neutral-200 text-[12px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-[#00775B] transition-colors"
          />
          {inputs.length > 1 && (
            <button
              onClick={() => remove(i)}
              className="text-neutral-400 hover:text-red-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 text-[10px] font-bold text-[#00775B] hover:text-[#006349] transition-colors"
      >
        <Plus className="w-3 h-3" />
        Add another email
      </button>
    </div>
  );
}

// ── Settings Modal ────────────────────────────────────────────────────────────

function SettingsModal({
  isOpen,
  groups,
  onUpdateGroups,
  onClose,
}: {
  isOpen: boolean;
  groups: GroupConfig[];
  onUpdateGroups: (groups: GroupConfig[]) => void;
  onClose: () => void;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmails, setEditEmails] = useState<string[]>([""]);
  const [newName, setNewName] = useState("");
  const [newEmailInputs, setNewEmailInputs] = useState<string[]>([""]);
  const nameRef = useRef<HTMLInputElement>(null);

  // Reset on open
  const prevOpen = useRef(false);
  if (isOpen !== prevOpen.current) {
    prevOpen.current = isOpen;
    if (isOpen) {
      setNewName("");
      setNewEmailInputs([""]);
      setEditingIndex(null);
    }
  }

  if (!isOpen) return null;

  const startEdit = (i: number) => {
    setEditingIndex(i);
    setEditName(groups[i].name);
    setEditEmails(groups[i].emails.length ? [...groups[i].emails] : [""]);
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    const name = editName.trim();
    if (!name) return;
    const emails = editEmails.map((e) => e.trim()).filter(Boolean);
    onUpdateGroups(groups.map((g, i) => (i === editingIndex ? { name, emails } : g)));
    setEditingIndex(null);
  };

  const handleRemove = (i: number) => {
    if (editingIndex === i) setEditingIndex(null);
    onUpdateGroups(groups.filter((_, idx) => idx !== i));
  };

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const emails = newEmailInputs.map((e) => e.trim()).filter(Boolean);
    onUpdateGroups([...groups, { name, emails }]);
    setNewName("");
    setNewEmailInputs([""]);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl border border-neutral-200 w-[70vw] h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
          <h2 className="text-sm font-bold text-neutral-900">Settings</h2>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        {/* Tab label */}
        <div className="flex border-b border-neutral-100 px-5 shrink-0">
          <div className="py-2.5 px-1 text-[11px] font-bold border-b-2 border-[#00775B] text-[#00775B] -mb-px mr-4">
            Configure Groups
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Create new group */}
          <div className="rounded-lg border border-neutral-200 p-4 space-y-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
              Create Group
            </p>
            <input
              ref={nameRef}
              type="text"
              placeholder="Group name (e.g. QA Lead)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full h-8 px-3 rounded-[6px] border border-neutral-200 text-[12px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-[#00775B] transition-colors"
            />
            <GroupEmailEditor emails={newEmailInputs} onChange={setNewEmailInputs} />
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className={cn(
                "w-full h-8 rounded-[6px] text-[11px] font-bold transition-colors",
                newName.trim()
                  ? "bg-[#00775B] text-white hover:bg-[#006349]"
                  : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              )}
            >
              Create Group
            </button>
          </div>

          {/* Existing groups */}
          {groups.length > 0 && (
            <div className="space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                Current Groups
              </p>
              {groups.map((g, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-lg border overflow-hidden transition-colors",
                    editingIndex === i
                      ? "border-[#00775B]/40 bg-[#E5FFF9]/30"
                      : "border-neutral-200 bg-neutral-50"
                  )}
                >
                  {editingIndex === i ? (
                    <div className="p-3 space-y-3">
                      <input
                        autoFocus
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full h-8 px-3 rounded-[6px] border border-[#00775B]/40 text-[12px] font-bold text-neutral-800 focus:outline-none focus:border-[#00775B] transition-colors"
                      />
                      <GroupEmailEditor emails={editEmails} onChange={setEditEmails} />
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="flex-1 h-7 rounded-[6px] border border-neutral-200 text-[11px] font-bold text-neutral-500 hover:bg-neutral-100 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEdit}
                          disabled={!editName.trim()}
                          className={cn(
                            "flex-1 h-7 rounded-[6px] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors",
                            editName.trim()
                              ? "bg-[#00775B] text-white hover:bg-[#006349]"
                              : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                          )}
                        >
                          <Check className="w-3 h-3" /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 px-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-neutral-800">{g.name}</p>
                        {g.emails.length > 0 ? (
                          <p className="text-[10px] text-neutral-500 mt-0.5 truncate">
                            {g.emails.join(", ")}
                          </p>
                        ) : (
                          <p className="text-[10px] text-neutral-400 mt-0.5 italic">
                            No emails configured
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <button
                          onClick={() => startEdit(i)}
                          className="text-neutral-400 hover:text-[#00775B] transition-colors"
                          title="Edit group"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemove(i)}
                          className="text-neutral-400 hover:text-red-500 transition-colors"
                          title="Delete group"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Header ────────────────────────────────────────────────────────────────────

interface QualityHeaderProps {
  persona: Persona;
  terminology: QualityTerminology;
  activeApp: QualityAppId;
  onAppChange: (app: QualityAppId) => void;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  groups: GroupConfig[];
  onUpdateGroups: (groups: GroupConfig[]) => void;
}

export const QualityHeader = ({
  persona,
  activeApp,
  onAppChange,
  timeRange,
  onTimeRangeChange,
  groups,
  onUpdateGroups,
}: QualityHeaderProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <AnalyticsPageHeader
        persona={persona}
        timeRanges={TIME_RANGES[persona]}
        timeRange={timeRange}
        onTimeRangeChange={onTimeRangeChange}
        apps={APP_OPTIONS}
        activeAppId={activeApp}
        onAppChange={(id) => onAppChange(id as QualityAppId)}
        wrapperClassName="mb-4"
        actions={
          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
            className="flex items-center justify-center w-7 h-7 rounded-sm border border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        }
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        groups={groups}
        onUpdateGroups={onUpdateGroups}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};
