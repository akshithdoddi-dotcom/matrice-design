import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ShieldCheck, ChevronDown, Download, Clock, Check, Settings, X, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { Persona } from "@/app/components/dashboard/PersonaSwitcher";
import type { QualityAppId, QualityTerminology } from "./data/mockData";

const APP_OPTIONS: { id: QualityAppId; label: string }[] = [
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
  monitoring: ["15m", "1h", "6h", "24h"],
  manager:    ["Today", "This Week"],
  director:   ["This Month", "This Quarter"],
};

// ── Settings Modal ────────────────────────────────────────────────────────────

function SettingsModal({
  isOpen,
  groups,
  onUpdateGroups,
  onClose,
}: {
  isOpen: boolean;
  groups: string[];
  onUpdateGroups: (groups: string[]) => void;
  onClose: () => void;
}) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue]   = useState("");
  const [newValue, setNewValue]     = useState("");

  useEffect(() => { if (isOpen) { setEditingIdx(null); setNewValue(""); } }, [isOpen]);

  if (!isOpen) return null;

  const startEdit = (i: number) => { setEditingIdx(i); setEditValue(groups[i]); };
  const saveEdit  = () => {
    const v = editValue.trim();
    if (!v) return;
    onUpdateGroups(groups.map((g, i) => i === editingIdx ? v : g));
    setEditingIdx(null);
  };
  const remove    = (i: number) => { if (editingIdx === i) setEditingIdx(null); onUpdateGroups(groups.filter((_, idx) => idx !== i)); };
  const create    = () => {
    const v = newValue.trim();
    if (!v) return;
    onUpdateGroups([...groups, v]);
    setNewValue("");
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl border border-neutral-200 w-[420px] max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
          <h2 className="text-sm font-bold text-neutral-900">Configure Notification Groups</h2>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded hover:bg-neutral-100 transition-colors">
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Create */}
          <div className="rounded-lg border border-neutral-200 p-3 space-y-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Add Group</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Group name (e.g. QA Lead)"
                value={newValue}
                onChange={e => setNewValue(e.target.value)}
                onKeyDown={e => e.key === "Enter" && create()}
                className="flex-1 h-8 px-3 rounded-[6px] border border-neutral-200 text-[12px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-[#00775B] transition-colors"
              />
              <button
                onClick={create}
                disabled={!newValue.trim()}
                className={cn(
                  "h-8 px-3 rounded-[6px] text-[11px] font-bold transition-colors flex items-center gap-1",
                  newValue.trim() ? "bg-[#00775B] text-white hover:bg-[#006349]" : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                )}
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
          </div>

          {/* Existing */}
          {groups.length > 0 && (
            <div className="space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Current Groups</p>
              {groups.map((g, i) => (
                <div key={i} className={cn("rounded-lg border overflow-hidden transition-colors", editingIdx === i ? "border-[#00775B]/40 bg-[#E5FFF9]/30" : "border-neutral-200 bg-neutral-50")}>
                  {editingIdx === i ? (
                    <div className="p-2.5 flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingIdx(null); }}
                        className="flex-1 h-7 px-2.5 rounded-[5px] border border-[#00775B]/40 text-[12px] font-bold focus:outline-none focus:border-[#00775B]"
                      />
                      <button onClick={() => setEditingIdx(null)} className="h-7 px-2 rounded-[5px] border border-neutral-200 text-[11px] font-bold text-neutral-500 hover:bg-neutral-100">Cancel</button>
                      <button onClick={saveEdit} disabled={!editValue.trim()} className={cn("h-7 px-2 rounded-[5px] text-[11px] font-bold flex items-center gap-1 transition-colors", editValue.trim() ? "bg-[#00775B] text-white hover:bg-[#006349]" : "bg-neutral-100 text-neutral-400 cursor-not-allowed")}>
                        <Check className="w-3 h-3" /> Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <p className="flex-1 text-[12px] font-bold text-neutral-800">{g}</p>
                      <button onClick={() => startEdit(i)} className="text-neutral-400 hover:text-[#00775B] transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => remove(i)} className="text-neutral-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
  groups: string[];
  onUpdateGroups: (groups: string[]) => void;
}

export const QualityHeader = ({
  persona,
  terminology,
  activeApp,
  onAppChange,
  timeRange,
  onTimeRangeChange,
  groups,
  onUpdateGroups,
}: QualityHeaderProps) => {
  const [isAppOpen, setIsAppOpen]         = useState(false);
  const [isExportOpen, setIsExportOpen]   = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [secondsAgo, setSecondsAgo]       = useState(2);
  const appRef    = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (persona !== "monitoring") return;
    const id = setInterval(() => setSecondsAgo((s) => (s >= 30 ? 2 : s + 1)), 1000);
    return () => clearInterval(id);
  }, [persona]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (appRef.current && !appRef.current.contains(e.target as Node)) setIsAppOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setIsExportOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const ranges = TIME_RANGES[persona];

  return (
    <>
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 bg-white border border-neutral-200 rounded-md px-4 py-3 shadow-sm">
      {/* Left: App Selector */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#E5FFF9] text-[#00775B] rounded-sm shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="relative" ref={appRef}>
          <button
            onClick={() => setIsAppOpen(!isAppOpen)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-sm border text-sm font-bold transition-all bg-white text-neutral-800 hover:border-neutral-300",
              isAppOpen ? "border-[#00775B]" : "border-neutral-200"
            )}
          >
            <span>{terminology.appLabel}</span>
            <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isAppOpen && "rotate-180")} />
          </button>
          {isAppOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 rounded-sm border border-neutral-200 bg-white shadow-lg z-50 overflow-hidden max-h-[360px] overflow-y-auto">
              <div className="py-1">
                {APP_OPTIONS.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => { onAppChange(opt.id); setIsAppOpen(false); }}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium cursor-pointer flex items-center justify-between text-neutral-600 hover:bg-neutral-50",
                      activeApp === opt.id && "text-[#00775B] bg-[#E5FFF9]"
                    )}
                  >
                    <span>{opt.label}</span>
                    {activeApp === opt.id && <Check className="w-3 h-3" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Time Range Pills */}
        <div className="flex items-center rounded-sm border border-neutral-200 bg-white p-0.5 shadow-sm">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => onTimeRangeChange(r)}
              className={cn(
                "px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-sm transition-all",
                timeRange === r
                  ? "bg-[#00775B] text-white shadow-sm"
                  : "text-neutral-500 hover:bg-neutral-50"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Export */}
        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-neutral-200 bg-white text-xs font-bold text-neutral-600 hover:border-neutral-300 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
            <ChevronDown className={cn("w-3 h-3 transition-transform", isExportOpen && "rotate-180")} />
          </button>
          {isExportOpen && (
            <div className="absolute top-full right-0 mt-1 w-40 rounded-sm border border-neutral-200 bg-white shadow-lg z-50 overflow-hidden">
              {["PDF Report", "CSV Data", "PNG Image"].map((opt) => (
                <div
                  key={opt}
                  onClick={() => setIsExportOpen(false)}
                  className="px-3 py-2 text-xs font-medium cursor-pointer text-neutral-600 hover:bg-neutral-50"
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Last Updated */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border border-neutral-200 bg-neutral-50 text-[10px] font-mono text-neutral-500">
          {persona === "monitoring" ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#00775B] animate-pulse" />
              <span>Updated {secondsAgo}s ago</span>
            </>
          ) : (
            <>
              <Clock className="w-3 h-3" />
              <span>{persona === "manager" ? "As of today" : "Mar 2026"}</span>
            </>
          )}
        </div>

        {/* Settings */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          title="Settings"
          className="flex items-center justify-center w-7 h-7 rounded-sm border border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <SettingsModal
      isOpen={isSettingsOpen}
      groups={groups}
      onUpdateGroups={onUpdateGroups}
      onClose={() => setIsSettingsOpen(false)}
    />
    </>
  );
};
