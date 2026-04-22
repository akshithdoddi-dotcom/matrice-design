import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2, Pencil, Check } from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { Persona } from "@/app/components/dashboard/PersonaSwitcher";
import { IdentityHeader } from "./identity/IdentityHeader";
import { IdentityMonitoringView, ManageModal, WatchlistForm, type WatchlistEntry } from "./identity/IdentityMonitoringView";
import { IdentityManagerView } from "./identity/IdentityManagerView";
import { IdentityDirectorView } from "./identity/IdentityDirectorView";
import { EntityDetailPanel } from "./identity/components/panels/EntityDetailPanel";
import { CameraFeedPanel } from "./identity/components/panels/CameraFeedPanel";

export type IdentityType = "FACE" | "PLATE";

export interface IdentityAppOption {
  id: string;
  identityType: IdentityType;
  label: string;
  shortLabel: string;
  siteLabel: string;
}

export interface IdentityTerminology {
  identityType: IdentityType;
  appLabel: string;
  entityLabel: string;
  identLabel: string;
  authorizedLabel: string;
  blacklistLabel: string;
  unknownLabel: string;
  unknownShortLabel: string;
  matchScoreLabel: string;
  eventLabel: string;
  watchlistPositiveLabel: string;
  enrollmentLabel: string;
  vipEnabled: boolean;
  isLPR: boolean;
}

export const IDENTITY_APP_OPTIONS: IdentityAppOption[] = [
  {
    id: "facial-hq",
    identityType: "FACE",
    label: "Facial Recognition – HQ Main Entrance",
    shortLabel: "HQ Main Entrance",
    siteLabel: "HQ Main Campus",
  },
  {
    id: "facial-gate-b",
    identityType: "FACE",
    label: "Facial Recognition – Gate B",
    shortLabel: "Gate B",
    siteLabel: "HQ Main Campus",
  },
  {
    id: "lpr-gate-a",
    identityType: "PLATE",
    label: "License Plate Recognition – Gate A",
    shortLabel: "Gate A",
    siteLabel: "HQ Parking Garage",
  },
  {
    id: "lpr-parking",
    identityType: "PLATE",
    label: "License Plate Recognition – Parking Lot",
    shortLabel: "Parking Lot",
    siteLabel: "HQ Parking Garage",
  },
];

function getTerminology(identityType: IdentityType): IdentityTerminology {
  if (identityType === "PLATE") {
    return {
      identityType,
      appLabel: "License Plate Recognition",
      entityLabel: "Vehicle",
      identLabel: "Plate Read",
      authorizedLabel: "Authorized",
      blacklistLabel: "Stolen / Unauthorized",
      unknownLabel: "Unregistered Plate",
      unknownShortLabel: "Unregistered",
      matchScoreLabel: "OCR Confidence",
      eventLabel: "Plate Event",
      watchlistPositiveLabel: "BOLO Match",
      enrollmentLabel: "Registered Vehicles",
      vipEnabled: false,
      isLPR: true,
    };
  }

  return {
    identityType,
    appLabel: "Facial Recognition",
    entityLabel: "Individual",
    identLabel: "Identification",
    authorizedLabel: "Whitelist",
    blacklistLabel: "Blacklist",
    unknownLabel: "Unrecognized Face",
    unknownShortLabel: "Unknown",
    matchScoreLabel: "Face Similarity",
    eventLabel: "Identity Event",
    watchlistPositiveLabel: "VIP Match",
    enrollmentLabel: "Enrolled Individuals",
    vipEnabled: true,
    isLPR: false,
  };
}

const DEFAULT_TIME_RANGE: Record<Persona, string> = {
  monitoring: "1h",
  manager: "Today",
  director: "This Month",
};

interface IdentityAnalyticsProps {
  persona: Persona;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface GroupConfig {
  name: string;
  emails: string[];
}

const DEFAULT_GROUPS: GroupConfig[] = [
  { name: "Security Team", emails: [] },
  { name: "Operations Manager", emails: [] },
  { name: "Site Supervisor", emails: [] },
  { name: "Executive Team", emails: [] },
  { name: "Dispatch Center", emails: [] },
];

// ─── Settings Modal ───────────────────────────────────────────────────────────
function GroupEmailEditor({
  emails,
  onChange,
}: {
  emails: string[];
  onChange: (emails: string[]) => void;
}) {
  const inputs = emails.length > 0 ? emails : [""];
  const update = (i: number, val: string) => {
    const next = inputs.map((e, idx) => idx === i ? val : e);
    onChange(next);
  };
  const remove = (i: number) => onChange(inputs.filter((_, idx) => idx !== i));
  const add = () => onChange([...inputs, ""]);

  return (
    <div className="space-y-2">
      <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Member Emails</p>
      {inputs.map((email, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="email"
            placeholder={`member${i + 1}@example.com`}
            value={email}
            onChange={e => update(i, e.target.value)}
            className="flex-1 h-8 px-3 rounded-[6px] border border-neutral-200 text-[12px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-[#00775B] transition-colors"
          />
          {inputs.length > 1 && (
            <button onClick={() => remove(i)} className="text-neutral-400 hover:text-red-500 transition-colors">
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

function SettingsModal({
  isOpen,
  groups,
  onUpdateGroups,
  watchlistEntries,
  onUpdateEntries,
  onClose,
}: {
  isOpen: boolean;
  groups: GroupConfig[];
  onUpdateGroups: (groups: GroupConfig[]) => void;
  watchlistEntries: WatchlistEntry[];
  onUpdateEntries: (entries: WatchlistEntry[]) => void;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"groups" | "watchlist">("groups");
  const [editingEntry, setEditingEntry] = useState<WatchlistEntry | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmails, setEditEmails] = useState<string[]>([""]);
  const [newName, setNewName] = useState("");
  const [newEmailInputs, setNewEmailInputs] = useState<string[]>([""]);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) { setNewName(""); setNewEmailInputs([""]); setEditingIndex(null); setEditingEntry(null); }
  }, [isOpen]);

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
    const emails = editEmails.map(e => e.trim()).filter(Boolean);
    const updated = groups.map((g, i) => i === editingIndex ? { name, emails } : g);
    onUpdateGroups(updated);
    setEditingIndex(null);
  };

  const handleRemove = (i: number) => {
    if (editingIndex === i) setEditingIndex(null);
    onUpdateGroups(groups.filter((_, idx) => idx !== i));
  };

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const emails = newEmailInputs.map(e => e.trim()).filter(Boolean);
    onUpdateGroups([...groups, { name, emails }]);
    setNewName("");
    setNewEmailInputs([""]);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" onClick={onClose} />
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

        {/* Tabs */}
        <div className="flex border-b border-neutral-100 px-5 shrink-0">
          {(["groups", "watchlist"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "py-2.5 px-1 text-[11px] font-bold border-b-2 transition-colors -mb-px mr-4",
                activeTab === tab
                  ? "border-[#00775B] text-[#00775B]"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              )}
            >
              {tab === "groups" ? "Configure Groups" : (
                <span className="flex items-center gap-1.5">
                  Watchlist Entries
                  {watchlistEntries.length > 0 && (
                    <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-[#00775B] text-white text-[9px] font-bold">
                      {watchlistEntries.length}
                    </span>
                  )}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Watchlist Entries tab ── */}
          {activeTab === "watchlist" && (
            editingEntry ? (
              /* ── Edit form ── */
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-neutral-100 shrink-0">
                  <button
                    onClick={() => setEditingEntry(null)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-[#00775B] hover:text-[#006349] transition-colors"
                  >
                    ← Back to list
                  </button>
                  <span className="text-neutral-300 text-xs">·</span>
                  <span className="text-[11px] text-neutral-500">Editing: <span className="font-bold text-neutral-700">{editingEntry.name}</span></span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <WatchlistForm
                    isLPR={editingEntry.type === "LPR"}
                    initialEntry={editingEntry}
                    onCancel={() => setEditingEntry(null)}
                    onSubmit={(updated) => {
                      onUpdateEntries(watchlistEntries.map(e => e.id === updated.id ? updated : e));
                      setEditingEntry(null);
                    }}
                  />
                </div>
              </div>
            ) : watchlistEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-8">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-neutral-400" />
                </div>
                <p className="text-[12px] font-bold text-neutral-600">No entries yet</p>
                <p className="text-[11px] text-neutral-400">Entries added via Manage People or Manage Vehicles will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#001E18]">
                    <tr className="border-b border-[#00775B]/20 text-[10px] uppercase tracking-wider font-bold text-white/90 h-10">
                      <th className="px-4 py-2 w-12 text-center">Type</th>
                      <th className="px-4 py-2">Name / Plate</th>
                      <th className="px-4 py-2">Reason</th>
                      <th className="px-4 py-2 text-center">Severity</th>
                      <th className="px-4 py-2">Cameras</th>
                      <th className="px-4 py-2 text-right">Added</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {watchlistEntries.map((entry, i) => (
                      <tr
                        key={entry.id}
                        onClick={() => setEditingEntry(entry)}
                        className={cn(
                          "group transition-colors hover:bg-[#E5FFF9] h-14 cursor-pointer",
                          i === 0 && "bg-[#00775B]/5"
                        )}
                      >
                        <td className="px-4 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center h-5 px-1.5 rounded-[3px] text-[9px] font-black uppercase tracking-wide",
                            entry.type === "FR"
                              ? "bg-[#001E18] text-[#00D68F]"
                              : "bg-blue-900 text-blue-200"
                          )}>
                            {entry.type}
                          </span>
                        </td>
                        <td className="px-4">
                          <p className="text-[11px] font-bold text-neutral-900 truncate max-w-[140px]">{entry.name}</p>
                          {entry.plates && entry.plates.includes(",") && (
                            <p className="text-[9px] text-neutral-400 mt-0.5">+multiple plates</p>
                          )}
                        </td>
                        <td className="px-4">
                          <p className="text-[11px] text-neutral-600 truncate max-w-[130px]">{entry.reason || "—"}</p>
                        </td>
                        <td className="px-4 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center h-5 px-2 rounded-[3px] text-[9px] font-bold uppercase",
                            entry.severity === "Critical" ? "bg-red-100 text-red-700" :
                            entry.severity === "High" ? "bg-amber-100 text-amber-700" :
                            "bg-neutral-100 text-neutral-600"
                          )}>
                            {entry.severity}
                          </span>
                        </td>
                        <td className="px-4">
                          <p className="text-[10px] text-neutral-500 truncate max-w-[120px]">
                            {entry.cameras.join(", ")}
                          </p>
                        </td>
                        <td className="px-4 text-right">
                          <span className="text-[10px] font-mono text-neutral-400">
                            {new Date(entry.addedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* ── Configure Groups tab ── */}
          {activeTab === "groups" && <div className="p-5 space-y-4">

          {/* Create new group */}
          <div className="rounded-lg border border-neutral-200 p-4 space-y-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Create Group</p>
            <input
              ref={nameRef}
              type="text"
              placeholder="Group name (e.g. Night Security)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
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
              <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Current Groups</p>
              {groups.map((g, i) => (
                <div key={i} className={cn(
                  "rounded-lg border overflow-hidden transition-colors",
                  editingIndex === i ? "border-[#00775B]/40 bg-[#E5FFF9]/30" : "border-neutral-200 bg-neutral-50"
                )}>
                  {editingIndex === i ? (
                    /* ── Edit mode ── */
                    <div className="p-3 space-y-3">
                      <input
                        autoFocus
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
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
                          <Check className="w-3 h-3" />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── View mode ── */
                    <div className="flex items-start gap-3 px-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-neutral-800">{g.name}</p>
                        {g.emails.length > 0
                          ? <p className="text-[10px] text-neutral-500 mt-0.5 truncate">{g.emails.join(", ")}</p>
                          : <p className="text-[10px] text-neutral-400 mt-0.5 italic">No emails configured</p>
                        }
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

          </div>}
        </div>
      </div>
    </div>,
    document.body
  );
}

export const IdentityAnalytics = ({ persona }: IdentityAnalyticsProps) => {
  const [identityType, setIdentityType] = useState<IdentityType>("FACE");
  const [activeAppId, setActiveAppId] = useState("facial-hq");
  const [timeRange, setTimeRange] = useState(DEFAULT_TIME_RANGE[persona]);

  // Manage modal state
  const [manageOpen, setManageOpen] = useState(false);

  // Settings modal + groups + watchlist state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [configuredGroups, setConfiguredGroups] = useState<GroupConfig[]>(DEFAULT_GROUPS);
  const [watchlistEntries, setWatchlistEntries] = useState<WatchlistEntry[]>([]);

  const handleWatchlistAdd = (entry: WatchlistEntry) =>
    setWatchlistEntries(prev => [entry, ...prev]);

  // Panel / modal state
  const [entityPanelOpen, setEntityPanelOpen] = useState(false);
  const [entityType, setEntityType] = useState<"matched" | "unknown" | "blacklist">("matched");
  const [selectedPersonId, setSelectedPersonId] = useState<string | undefined>(undefined);
  const [cameraFeedOpen, setCameraFeedOpen] = useState(false);
  const [cameraId, setCameraId] = useState<string | undefined>(undefined);

  useEffect(() => {
    setTimeRange(DEFAULT_TIME_RANGE[persona]);
  }, [persona]);

  useEffect(() => {
    const app = IDENTITY_APP_OPTIONS.find((option) => option.id === activeAppId);
    if (app && app.identityType !== identityType) {
      const fallback = IDENTITY_APP_OPTIONS.find(
        (option) => option.identityType === identityType
      );
      if (fallback) setActiveAppId(fallback.id);
    }
  }, [activeAppId, identityType]);

  const activeApp = useMemo(
    () =>
      IDENTITY_APP_OPTIONS.find((option) => option.id === activeAppId) ??
      IDENTITY_APP_OPTIONS[0],
    [activeAppId]
  );

  const terminology = useMemo(
    () => getTerminology(identityType),
    [identityType]
  );

  // Panel open helpers
  const openEntityPanel = (type: "matched" | "unknown" | "blacklist" = "matched", personId?: string) => {
    setEntityType(type);
    setSelectedPersonId(personId);
    setEntityPanelOpen(true);
  };
  const openCameraFeed = (id?: string) => {
    setCameraId(id);
    setCameraFeedOpen(true);
  };

  return (
    <div className="space-y-3">
      {/* ── Header card ───────────────────────────────────────────────── */}
      <IdentityHeader
        persona={persona}
        identityType={identityType}
        terminology={terminology}
        activeApp={activeApp}
        onIdentityTypeChange={setIdentityType}
        onAppChange={setActiveAppId}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onManage={() => setManageOpen(true)}
        onSettings={() => setSettingsOpen(true)}
      />

      {/* Manage People / Vehicles modal */}
      <ManageModal
        isOpen={manageOpen}
        isLPR={terminology.isLPR}
        onClose={() => setManageOpen(false)}
        onWatchlistAdd={handleWatchlistAdd}
      />

      {/* Settings modal */}
      <SettingsModal
        isOpen={settingsOpen}
        groups={configuredGroups}
        onUpdateGroups={setConfiguredGroups}
        watchlistEntries={watchlistEntries}
        onUpdateEntries={setWatchlistEntries}
        onClose={() => setSettingsOpen(false)}
      />

      {/* ── Persona views ─────────────────────────────────────────────── */}
      {persona === "monitoring" && (
        <IdentityMonitoringView
          terminology={terminology}
          groups={configuredGroups.map(g => g.name)}
          timeRange={timeRange}
          activeApp={activeApp}
          onEntityClick={openEntityPanel}
          onCameraClick={openCameraFeed}
        />
      )}

      {persona === "manager" && (
        <IdentityManagerView
          terminology={terminology}
          timeRange={timeRange}
          activeApp={activeApp}
        />
      )}

      {persona === "director" && (
        <IdentityDirectorView
          terminology={terminology}
          timeRange={timeRange}
          activeApp={activeApp}
        />
      )}

      {/* ── Slide panels & modal ──────────────────────────────────────── */}
      <EntityDetailPanel
        isOpen={entityPanelOpen}
        onClose={() => setEntityPanelOpen(false)}
        entityType={entityType}
        personId={selectedPersonId}
        groups={configuredGroups.map(g => g.name)}
        mode={terminology.isLPR ? "lpr" : "face"}
      />

      <CameraFeedPanel
        isOpen={cameraFeedOpen}
        onClose={() => setCameraFeedOpen(false)}
        cameraId={cameraId}
        onDetectionClick={() => {
          setCameraFeedOpen(false);
          openEntityPanel("matched");
        }}
      />

    </div>
  );
};
