import React, { useState, useRef, useEffect, useContext, createContext } from "react";
import {
  User, Lock, Users, Bell, Zap, Sun, Moon, Monitor, Mail, Phone, Key,
  Eye, EyeOff, Plus, Trash2, Edit2, Check, Shield, Info, Upload,
  Globe, AlertCircle, Hash, UserPlus, Building, RefreshCw,
  LogOut, Copy, ExternalLink, Clipboard, MoreVertical, Palette, Layers,
  Clock, ChevronRight, Activity, X, Search, ChevronDown
} from "lucide-react";
import { cn } from "@/app/lib/utils";

// ─── Theme Context ────────────────────────────────────────────────────────────
const ThemeCtx = createContext(false);
const useDark = () => useContext(ThemeCtx);

// ─── Types ────────────────────────────────────────────────────────────────────
type NavSection =
  | "profile" | "security"
  | "members" | "groups"
  | "channels"
  | "appearance";

type Role = "director" | "manager" | "monitoring";
type Status = "active" | "invited";

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  lastActive: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  channels: string[];
}

interface AuditEntry {
  ts: string;
  user: string;
  action: string;
  resource: string;
  ip: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_MEMBERS: Member[] = [
  { id: "u1", name: "Mohammed Usman", email: "mohammed.usman@matrice.ai", role: "director",   status: "active",  lastActive: "Now" },
  { id: "u2", name: "Akshith Doddi",  email: "akshith@matrice.ai",        role: "manager",    status: "active",  lastActive: "2h ago" },
  { id: "u3", name: "Riya Sharma",    email: "riya.s@matrice.ai",         role: "monitoring", status: "active",  lastActive: "5m ago" },
  { id: "u4", name: "James Wilson",   email: "james.w@matrice.ai",        role: "monitoring", status: "active",  lastActive: "18m ago" },
  { id: "u5", name: "Sarah Chen",     email: "sarah.c@matrice.ai",        role: "monitoring", status: "invited", lastActive: "—" },
  { id: "u6", name: "David Kumar",    email: "david.k@matrice.ai",        role: "monitoring", status: "active",  lastActive: "1h ago" },
];

const MOCK_GROUPS: Group[] = [
  { id: "g1", name: "Night Watch",   description: "Night shift surveillance team", members: ["u3", "u4"], channels: ["email", "sms"] },
  { id: "g2", name: "QA Inspectors", description: "Quality control monitoring",    members: ["u4", "u6"], channels: ["email", "slack"] },
  { id: "g3", name: "Security Lead", description: "Escalation point for threats",  members: ["u3"],       channels: ["email", "sms", "slack"] },
];

const MOCK_AUDIT: AuditEntry[] = [
  { ts: "2026-04-28 14:31", user: "Mohammed Usman", action: "Updated alert threshold",  resource: "Alert Rules",  ip: "192.168.1.10" },
  { ts: "2026-04-28 13:55", user: "Akshith Doddi",  action: "Invited user",             resource: "sarah.c@...",  ip: "192.168.1.11" },
  { ts: "2026-04-28 12:20", user: "Riya Sharma",    action: "Acknowledged alert",        resource: "Alert #4821",  ip: "10.0.0.34" },
  { ts: "2026-04-28 11:04", user: "Mohammed Usman", action: "Added to blacklist",        resource: "Marcus Webb",  ip: "192.168.1.10" },
  { ts: "2026-04-28 10:30", user: "James Wilson",   action: "Logged in",                resource: "Session",      ip: "10.0.0.41" },
  { ts: "2026-04-27 18:22", user: "Mohammed Usman", action: "Created user group",       resource: "Night Watch",  ip: "192.168.1.10" },
  { ts: "2026-04-27 16:10", user: "Akshith Doddi",  action: "Changed role",             resource: "David Kumar",  ip: "192.168.1.11" },
  { ts: "2026-04-27 14:45", user: "Mohammed Usman", action: "Updated Slack webhook",    resource: "Integrations", ip: "192.168.1.10" },
  { ts: "2026-04-27 09:30", user: "Riya Sharma",    action: "Logged in",                resource: "Session",      ip: "10.0.0.34" },
  { ts: "2026-04-26 17:00", user: "Mohammed Usman", action: "Exported audit log",       resource: "Audit Log",    ip: "192.168.1.10" },
];

// ─── Country Codes ────────────────────────────────────────────────────────────
const COUNTRY_CODES = [
  { code: "+91",  country: "India",          flag: "🇮🇳" },
  { code: "+1",   country: "United States",  flag: "🇺🇸" },
  { code: "+44",  country: "United Kingdom", flag: "🇬🇧" },
  { code: "+61",  country: "Australia",      flag: "🇦🇺" },
  { code: "+49",  country: "Germany",        flag: "🇩🇪" },
  { code: "+33",  country: "France",         flag: "🇫🇷" },
  { code: "+81",  country: "Japan",          flag: "🇯🇵" },
  { code: "+86",  country: "China",          flag: "🇨🇳" },
  { code: "+65",  country: "Singapore",      flag: "🇸🇬" },
  { code: "+971", country: "UAE",            flag: "🇦🇪" },
  { code: "+60",  country: "Malaysia",       flag: "🇲🇾" },
  { code: "+55",  country: "Brazil",         flag: "🇧🇷" },
  { code: "+27",  country: "South Africa",   flag: "🇿🇦" },
  { code: "+7",   country: "Russia",         flag: "🇷🇺" },
  { code: "+82",  country: "South Korea",    flag: "🇰🇷" },
  { code: "+34",  country: "Spain",          flag: "🇪🇸" },
  { code: "+39",  country: "Italy",          flag: "🇮🇹" },
  { code: "+31",  country: "Netherlands",    flag: "🇳🇱" },
  { code: "+46",  country: "Sweden",         flag: "🇸🇪" },
  { code: "+41",  country: "Switzerland",    flag: "🇨🇭" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function roleBadge(role: Role | "invited", isDark: boolean) {
  const map: Record<string, string> = isDark
    ? {
        director:   "bg-purple-900/30 text-purple-300 border border-purple-700/40",
        manager:    "bg-blue-900/30 text-blue-300 border border-blue-700/40",
        monitoring: "bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/30",
        invited:    "bg-[#334155] text-[#64748B] border border-[#334155]",
      }
    : {
        director:   "bg-purple-100 text-purple-700 border border-purple-200",
        manager:    "bg-blue-100 text-blue-700 border border-blue-200",
        monitoring: "bg-teal-100 text-teal-700 border border-teal-200",
        invited:    "bg-gray-100 text-gray-500 border border-gray-200",
      };
  return cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide", map[role] ?? map.invited);
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const dark = useDark();
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative w-10 h-5 rounded-full transition-colors shrink-0",
        on
          ? dark ? "bg-[#00D4AA]" : "bg-[#00775B]"
          : dark ? "bg-[#334155]" : "bg-gray-300"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200",
          on ? "left-[22px]" : "left-0.5"
        )}
      />
    </button>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
const SectionHeader = ({ children }: { children: React.ReactNode }) => {
  const dark = useDark();
  return (
    <p className={cn(
      "text-[11px] font-semibold uppercase tracking-widest mb-3",
      dark ? "text-[#00D4AA]" : "text-gray-400"
    )}>{children}</p>
  );
};

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const dark = useDark();
  return (
    <div className={cn(
      "rounded border p-4",
      dark ? "bg-[#1E293B] border-[#334155]" : "bg-white border-gray-200",
      className
    )}>{children}</div>
  );
};

const Label = ({ children }: { children: React.ReactNode }) => {
  const dark = useDark();
  return (
    <label className={cn(
      "block text-sm font-medium mb-1.5",
      dark ? "text-[#94A3B8]" : "text-gray-700"
    )}>{children}</label>
  );
};

const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
  const dark = useDark();
  return (
    <input
      className={cn(
        "h-9 w-full rounded border px-3 text-sm",
        dark
          ? "bg-[#0F172A] border-[#334155] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#00D4AA] focus:outline-none focus:ring-2 focus:ring-[#00D4AA]/15 disabled:bg-[#1E293B] disabled:text-[#475569]"
          : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00775B]/15 focus:border-[#00775B] disabled:bg-gray-50 disabled:text-gray-500",
        className
      )}
      {...props}
    />
  );
};

const Textarea = ({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const dark = useDark();
  return (
    <textarea
      className={cn(
        "w-full rounded border px-3 py-2 text-sm resize-none",
        dark
          ? "bg-[#0F172A] border-[#334155] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#00D4AA] focus:outline-none focus:ring-2 focus:ring-[#00D4AA]/15"
          : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00775B]/15 focus:border-[#00775B]",
        className
      )}
      {...props}
    />
  );
};

const PrimaryBtn = ({
  children, onClick, className, type = "button", disabled,
}: {
  children: React.ReactNode; onClick?: () => void; className?: string;
  type?: "button" | "submit"; disabled?: boolean;
}) => {
  const dark = useDark();
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-9 px-4 rounded text-sm font-medium transition-colors",
        dark
          ? "bg-[#00D4AA] text-[#020617] hover:bg-[#00F5C4] disabled:opacity-40 disabled:cursor-not-allowed"
          : "bg-[#00775B] text-white hover:bg-[#006649] disabled:opacity-40 disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
};

const SecondaryBtn = ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => {
  const dark = useDark();
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-9 px-4 rounded border text-sm font-medium transition-colors",
        dark
          ? "border-[#334155] bg-transparent text-[#94A3B8] hover:bg-[#1E293B]"
          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
        className
      )}
    >
      {children}
    </button>
  );
};

// ─── OTP Verification Modal ───────────────────────────────────────────────────
function OtpModal({ phoneDisplay, onVerify, onClose }: {
  phoneDisplay: string; onVerify: () => void; onClose: () => void;
}) {
  const dark = useDark();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resent, setResent] = useState(false);

  const handleDigit = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        "relative z-10 w-full max-w-sm rounded shadow-2xl",
        dark ? "bg-[#0F172A] border border-[#334155]" : "bg-white border border-gray-200"
      )}>
        <div className={cn("flex items-center justify-between px-5 py-4 border-b", dark ? "border-[#334155]" : "border-gray-100")}>
          <h3 className={cn("text-[15px] font-semibold", dark ? "text-[#F1F5F9]" : "text-gray-900")}>Verify Phone Number</h3>
          <button
            onClick={onClose}
            className={cn("p-1 rounded transition-colors", dark ? "text-[#64748B] hover:text-[#94A3B8] hover:bg-[#334155]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-5">
          <div className="text-center space-y-1.5">
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mx-auto", dark ? "bg-[#00D4AA]/10" : "bg-[#E5FFF9]")}>
              <Phone className={cn("w-5 h-5", dark ? "text-[#00D4AA]" : "text-[#00775B]")} />
            </div>
            <p className={cn("text-[13px]", dark ? "text-[#94A3B8]" : "text-gray-600")}>
              Enter the 6-digit code sent to
            </p>
            <p className={cn("text-[14px] font-semibold", dark ? "text-[#F1F5F9]" : "text-gray-900")}>{phoneDisplay}</p>
          </div>
          <div className="flex gap-2 justify-center">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                value={d}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                maxLength={1}
                inputMode="numeric"
                className={cn(
                  "w-10 h-12 text-center text-[20px] font-bold rounded border-2 outline-none transition-colors",
                  dark
                    ? "bg-[#1E293B] border-[#334155] text-[#F1F5F9] focus:border-[#00D4AA]"
                    : "bg-gray-50 border-gray-200 text-gray-900 focus:border-[#00775B]"
                )}
              />
            ))}
          </div>
          <PrimaryBtn
            className="w-full"
            onClick={onVerify}
            disabled={digits.some(d => d === "")}
          >
            Verify & Save
          </PrimaryBtn>
          <div className="text-center">
            {resent ? (
              <p className={cn("text-[12px]", dark ? "text-[#00D4AA]" : "text-[#00775B]")}>Code resent!</p>
            ) : (
              <button
                onClick={() => { setResent(true); setTimeout(() => setResent(false), 3000); }}
                className={cn("text-[12px] font-medium hover:underline", dark ? "text-[#64748B] hover:text-[#94A3B8]" : "text-gray-400 hover:text-gray-600")}
              >
                Didn't receive it? Resend code
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Group Modal (Create / Edit) ──────────────────────────────────────────────
interface GroupModalProps {
  mode: "create" | "edit";
  group?: Group;
  onSave: (data: Omit<Group, "id">) => void;
  onClose: () => void;
}

function GroupModal({ mode, group, onSave, onClose }: GroupModalProps) {
  const dark = useDark();
  const [name, setName] = useState(group?.name ?? "");
  const [desc, setDesc] = useState(group?.description ?? "");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set(group?.members ?? []));
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set(group?.channels ?? ["email"]));
  const [memberQuery, setMemberQuery] = useState("");
  const [memberDropOpen, setMemberDropOpen] = useState(false);
  const memberDropRef = useRef<HTMLDivElement>(null);

  const monitoringStaff = MOCK_MEMBERS.filter(m => m.role === "monitoring");
  const filteredStaff = monitoringStaff.filter(m =>
    m.name.toLowerCase().includes(memberQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(memberQuery.toLowerCase())
  );

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const removeChip = (id: string) => {
    setSelectedMembers(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (memberDropRef.current && !memberDropRef.current.contains(e.target as Node)) {
        setMemberDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const CHANNEL_ICONS: Record<string, React.ReactNode> = {
    email: <Mail className="w-3.5 h-3.5" />,
    sms:   <Phone className="w-3.5 h-3.5" />,
    slack: <Hash className="w-3.5 h-3.5" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        "relative z-10 w-full max-w-lg rounded shadow-2xl flex flex-col",
        dark ? "bg-[#0F172A] border border-[#334155]" : "bg-white border border-gray-200"
      )}>
        {/* Header */}
        <div className={cn("flex items-start justify-between px-5 py-4 border-b shrink-0", dark ? "border-[#334155]" : "border-gray-100")}>
          <div>
            <h3 className={cn("text-[15px] font-semibold", dark ? "text-[#F1F5F9]" : "text-gray-900")}>
              {mode === "create" ? "Create New Group" : `Edit "${group?.name}"`}
            </h3>
            <p className={cn("text-[11px] mt-0.5", dark ? "text-[#64748B]" : "text-gray-500")}>
              Groups can only contain Monitoring Staff members.
            </p>
          </div>
          <button
            onClick={onClose}
            className={cn("p-1.5 rounded transition-colors ml-4 shrink-0 mt-0.5", dark ? "text-[#64748B] hover:text-[#94A3B8] hover:bg-[#334155]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1 min-h-[420px]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Group Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Night Watch" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Short description" />
            </div>
          </div>

          {/* Multi-select member combobox */}
          <div>
            <Label>Members</Label>
            <div className="relative" ref={memberDropRef}>
              {/* Selected chips + search input */}
              <div
                onClick={() => setMemberDropOpen(true)}
                className={cn(
                  "min-h-9 w-full rounded border px-2 py-1.5 flex flex-wrap gap-1.5 cursor-text transition-colors",
                  memberDropOpen
                    ? dark ? "border-[#00D4AA] ring-2 ring-[#00D4AA]/15" : "border-[#00775B] ring-2 ring-[#00775B]/15"
                    : dark ? "border-[#334155] bg-[#0F172A]" : "border-gray-200 bg-white"
                )}
              >
                {Array.from(selectedMembers).map(id => {
                  const m = MOCK_MEMBERS.find(x => x.id === id);
                  if (!m) return null;
                  return (
                    <span
                      key={id}
                      className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full",
                        dark ? "bg-[#00D4AA]/15 text-[#00D4AA]" : "bg-[#E5FFF9] text-[#00775B]"
                      )}
                    >
                      {m.name}
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); removeChip(id); }}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  );
                })}
                <div className="relative flex-1 min-w-[120px] flex items-center">
                  <Search className={cn("absolute left-0 w-3 h-3 pointer-events-none shrink-0", dark ? "text-[#475569]" : "text-gray-400")} />
                  <input
                    value={memberQuery}
                    onChange={e => { setMemberQuery(e.target.value); setMemberDropOpen(true); }}
                    onFocus={() => setMemberDropOpen(true)}
                    placeholder={selectedMembers.size === 0 ? "Search by name or email..." : "Add more..."}
                    className={cn(
                      "w-full pl-5 text-[12px] bg-transparent outline-none",
                      dark ? "text-[#F1F5F9] placeholder:text-[#475569]" : "text-gray-900 placeholder:text-gray-400"
                    )}
                  />
                </div>
              </div>

              {/* Dropdown */}
              {memberDropOpen && (
                <div className={cn(
                  "absolute left-0 right-0 top-full mt-1 rounded border shadow-xl z-50 overflow-hidden",
                  dark ? "bg-[#0F172A] border-[#334155]" : "bg-white border-gray-200"
                )}>
                  <div className="max-h-52 overflow-y-auto">
                    {filteredStaff.length === 0 && memberQuery.includes("@") ? (
                      <div>
                        <div className={cn("py-3 px-3 text-center text-[12px]", dark ? "text-[#475569]" : "text-gray-400")}>
                          No matching member found.
                        </div>
                        <button
                          type="button"
                          onClick={() => { setMemberDropOpen(false); setMemberQuery(""); }}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors border-t",
                            dark ? "border-[#334155] hover:bg-[#1E293B] text-[#00D4AA]" : "border-gray-100 hover:bg-blue-50 text-blue-600"
                          )}
                        >
                          <UserPlus className="w-4 h-4 shrink-0" />
                          <div>
                            <p className="text-[12px] font-semibold">Send invite to "{memberQuery}"</p>
                            <p className={cn("text-[10px]", dark ? "text-[#475569]" : "text-gray-400")}>They'll be added once they accept</p>
                          </div>
                        </button>
                      </div>
                    ) : filteredStaff.length === 0 ? (
                      <div className={cn("py-6 text-center text-[12px]", dark ? "text-[#475569]" : "text-gray-400")}>
                        No members found
                      </div>
                    ) : filteredStaff.map((m, idx) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => { toggleMember(m.id); setMemberQuery(""); }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                          idx < filteredStaff.length - 1 && (dark ? "border-b border-[#334155]" : "border-b border-gray-100"),
                          selectedMembers.has(m.id)
                            ? dark ? "bg-[#00D4AA]/10" : "bg-[#F0FDF9]"
                            : dark ? "hover:bg-[#1E293B]" : "hover:bg-gray-50"
                        )}
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0",
                          dark ? "bg-[#00D4AA]/20 text-[#00D4AA]" : "bg-[#00775B]/10 text-[#00775B]"
                        )}>
                          {initials(m.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-[12px] font-semibold truncate", dark ? "text-[#CBD5E1]" : "text-gray-800")}>{m.name}</p>
                          <p className={cn("text-[11px] truncate", dark ? "text-[#475569]" : "text-gray-400")}>{m.email}</p>
                        </div>
                        {selectedMembers.has(m.id) && (
                          <Check className={cn("w-3.5 h-3.5 shrink-0", dark ? "text-[#00D4AA]" : "text-[#00775B]")} />
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedMembers.size > 0 && (
                    <div className={cn("px-3 py-2 border-t text-[11px] font-medium", dark ? "border-[#334155] text-[#00D4AA]" : "border-gray-100 text-[#00775B]")}>
                      {selectedMembers.size} member{selectedMembers.size !== 1 ? "s" : ""} selected
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Notification channels */}
          <div>
            <Label>Notification Channels</Label>
            <div className="flex gap-3 mt-1">
              {(["email", "sms", "slack"] as const).map(c => (
                <label
                  key={c}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition-all",
                    selectedChannels.has(c)
                      ? dark ? "border-[#00D4AA] bg-[#00D4AA]/10 text-[#00D4AA]" : "border-[#00775B] bg-[#E5FFF9] text-[#00775B]"
                      : dark ? "border-[#334155] text-[#64748B] hover:border-[#475569]" : "border-gray-200 text-gray-500 hover:border-gray-300"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedChannels.has(c)}
                    onChange={() => {
                      setSelectedChannels(prev => {
                        const s = new Set(prev);
                        if (s.has(c)) s.delete(c); else s.add(c);
                        return s;
                      });
                    }}
                    className="sr-only"
                  />
                  {CHANNEL_ICONS[c]}
                  <span className="text-[12px] font-medium capitalize">{c}</span>
                  {selectedChannels.has(c) && <Check className="w-3 h-3 ml-auto" />}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={cn("flex justify-end gap-3 px-5 py-4 border-t shrink-0", dark ? "border-[#334155]" : "border-gray-100")}>
          <SecondaryBtn onClick={onClose}>Cancel</SecondaryBtn>
          <PrimaryBtn onClick={() => {
            if (!name.trim()) return;
            onSave({ name, description: desc, members: Array.from(selectedMembers), channels: Array.from(selectedChannels) });
          }} disabled={!name.trim()}>
            {mode === "create" ? "Create Group" : "Save Changes"}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ─── Section: My Profile ──────────────────────────────────────────────────────
function ProfileSection() {
  const dark = useDark();
  const [hoverAvatar, setHoverAvatar] = useState(false);
  const [firstName, setFirstName]     = useState("Mohammed Usman");
  const [lastName,  setLastName]      = useState("F");
  const [jobTitle,  setJobTitle]      = useState("");
  const [company,   setCompany]       = useState("");
  const [phone,     setPhone]         = useState("");
  const [copied,    setCopied]        = useState(false);

  const [countryCode,   setCountryCode]   = useState("+91");
  const [countryName,   setCountryName]   = useState("India");
  const [showCountryDd, setShowCountryDd] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showOtpModal,  setShowOtpModal]  = useState(false);
  const countryDdRef = useRef<HTMLDivElement>(null);

  const ACCOUNT_NUMBER = "9782886768719887307619115";

  const filteredCountries = COUNTRY_CODES.filter(c =>
    c.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.includes(countrySearch)
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryDdRef.current && !countryDdRef.current.contains(e.target as Node)) {
        setShowCountryDd(false);
        setCountrySearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(ACCOUNT_NUMBER).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      <h2 className={cn("text-[16px] font-semibold", dark ? "text-[#F1F5F9]" : "text-gray-900")}>My Profile</h2>

      <div className="grid grid-cols-[280px_1fr] gap-4">
        {/* Left: Avatar + identity */}
        <div className="space-y-4">
          <Card className="flex flex-col items-center text-center gap-3">
            <div
              className="relative cursor-pointer"
              onMouseEnter={() => setHoverAvatar(true)}
              onMouseLeave={() => setHoverAvatar(false)}
            >
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-black select-none",
                dark ? "bg-[#00D4AA] text-[#020617]" : "bg-[#00775B]"
              )}>
                MU
              </div>
              {hoverAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center gap-0.5">
                  <Upload className="w-4 h-4 text-white" />
                  <span className="text-[9px] text-white font-bold">Change</span>
                </div>
              )}
            </div>
            <div>
              <p className={cn("text-sm font-semibold", dark ? "text-[#F1F5F9]" : "text-gray-900")}>{firstName} {lastName}</p>
              <p className={cn("text-xs mt-0.5", dark ? "text-[#64748B]" : "text-gray-500")}>Director</p>
            </div>
            <button className={cn("text-[12px] hover:underline font-medium flex items-center gap-1", dark ? "text-[#00D4AA]" : "text-[#00775B]")}>
              <Upload className="w-3 h-3" /> Change photo
            </button>
          </Card>

          <Card>
            <SectionHeader>Account Details</SectionHeader>
            <div className="space-y-3">
              <div>
                <Label>Account Type</Label>
                <div className={cn("h-9 px-3 rounded border flex items-center gap-2", dark ? "border-[#334155] bg-[#0F172A]" : "border-gray-200 bg-gray-50")}>
                  <span className={cn("text-sm font-medium", dark ? "text-[#CBD5E1]" : "text-gray-800")}>Enterprise</span>
                  <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Active</span>
                </div>
              </div>
              <div>
                <Label>Account Number</Label>
                <div className="relative">
                  <Input value={ACCOUNT_NUMBER} readOnly className={cn("font-mono text-[11px] tracking-tight pr-9", dark ? "bg-[#0F172A]" : "bg-gray-50")} />
                  <button onClick={handleCopy} title="Copy" className={cn("absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors", dark ? "text-[#475569] hover:text-[#94A3B8]" : "text-gray-400 hover:text-gray-700")}>
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Account information + Personal */}
        <div className="space-y-4">
          <Card>
            <SectionHeader>Account Information</SectionHeader>
            <div className="grid grid-cols-3 gap-x-4 gap-y-3">
              <div>
                <Label>First Name</Label>
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" />
              </div>
              <div>
                <Label>Job Title</Label>
                <Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Security Director" />
              </div>
              <div className="col-span-2">
                <Label>Company</Label>
                <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Matrice AI" />
              </div>
            </div>
          </Card>

          <Card>
            <SectionHeader>Personal Information</SectionHeader>
            <div className="grid grid-cols-3 gap-x-4 gap-y-3">
              <div className="col-span-2">
                <Label>Email</Label>
                <div className="relative">
                  <Input value="mohammed.usman@matrice.ai" readOnly className={cn("pr-20", dark ? "bg-[#0F172A] text-[#475569]" : "bg-gray-50 text-gray-500")} />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">Verified</span>
                </div>
              </div>

              {/* Phone: country code + number + verify */}
              <div className="col-span-3">
                <Label>Phone Number</Label>
                <div className="flex gap-2">
                  {/* Country code dropdown */}
                  <div className="relative" ref={countryDdRef}>
                    <button
                      type="button"
                      onClick={() => setShowCountryDd(v => !v)}
                      className={cn(
                        "h-9 px-2.5 rounded border flex items-center gap-1.5 min-w-[90px] transition-colors",
                        dark
                          ? "bg-[#0F172A] border-[#334155] text-[#F1F5F9] hover:border-[#475569]"
                          : "bg-white border-gray-200 text-gray-900 hover:border-gray-300"
                      )}
                    >
                      <span className="text-base leading-none shrink-0">
                        {COUNTRY_CODES.find(c => c.code === countryCode)?.flag}
                      </span>
                      <span className="text-[12px] font-medium">{countryCode}</span>
                      <ChevronDown className={cn("w-3 h-3 ml-auto shrink-0 transition-transform duration-150", showCountryDd ? "rotate-180" : "")} />
                    </button>
                    {showCountryDd && (
                      <div className={cn(
                        "absolute left-0 top-full mt-1 w-64 rounded border shadow-xl z-50 overflow-hidden",
                        dark ? "bg-[#0F172A] border-[#334155]" : "bg-white border-gray-200"
                      )}>
                        <div className={cn("p-2 border-b", dark ? "border-[#334155]" : "border-gray-100")}>
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                            <input
                              autoFocus
                              placeholder="Search country..."
                              value={countrySearch}
                              onChange={e => setCountrySearch(e.target.value)}
                              className={cn(
                                "w-full h-7 pl-6 pr-2 rounded text-[12px] outline-none border",
                                dark ? "bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#475569]" : "border-gray-200 text-gray-900 placeholder:text-gray-400 bg-gray-50"
                              )}
                            />
                          </div>
                        </div>
                        <div className="max-h-52 overflow-y-auto">
                          {filteredCountries.length === 0 ? (
                            <p className={cn("py-4 text-center text-[12px]", dark ? "text-[#475569]" : "text-gray-400")}>No countries found</p>
                          ) : filteredCountries.map(c => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setCountryCode(c.code);
                                setCountryName(c.country);
                                setShowCountryDd(false);
                                setCountrySearch("");
                              }}
                              className={cn(
                                "w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors",
                                dark ? "hover:bg-[#1E293B]" : "hover:bg-gray-50",
                                countryCode === c.code && (dark ? "bg-[#00D4AA]/10" : "bg-[#F0FDF9]")
                              )}
                            >
                              <span className="text-base leading-none shrink-0">{c.flag}</span>
                              <span className={cn("flex-1 truncate text-[12px]", dark ? "text-[#CBD5E1]" : "text-gray-700")}>{c.country}</span>
                              <span className={cn("text-[11px] shrink-0", dark ? "text-[#475569]" : "text-gray-400")}>{c.code}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phone input */}
                  <div className="flex-1 relative">
                    <Input
                      value={phone}
                      onChange={e => { setPhone(e.target.value); setPhoneVerified(false); }}
                      placeholder="e.g. 98765 43210"
                      type="tel"
                      className={phoneVerified ? "pr-20" : phone.length > 5 ? "pr-16" : ""}
                    />
                    {phoneVerified ? (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full pointer-events-none">
                        <Check className="w-2.5 h-2.5" /> Verified
                      </span>
                    ) : phone.length > 5 ? (
                      <button
                        type="button"
                        onClick={() => setShowOtpModal(true)}
                        className={cn(
                          "absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors",
                          dark ? "text-[#00D4AA] bg-[#00D4AA]/10 hover:bg-[#00D4AA]/20" : "text-[#00775B] bg-[#E5FFF9] hover:bg-[#CCFBEF]"
                        )}
                      >
                        Verify
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Country auto-filled from code */}
              <div>
                <Label>Country</Label>
                <Input
                  value={countryName}
                  onChange={e => setCountryName(e.target.value)}
                  placeholder="Select a country code above"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <PrimaryBtn>Save Changes</PrimaryBtn>
      </div>

      {showOtpModal && (
        <OtpModal
          phoneDisplay={`${countryCode} ${phone}`}
          onVerify={() => { setPhoneVerified(true); setShowOtpModal(false); }}
          onClose={() => setShowOtpModal(false)}
        />
      )}
    </div>
  );
}

// ─── Section: Password & Security ────────────────────────────────────────────
function SecuritySection() {
  const dark = useDark();
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const checks = {
    length: newPw.length >= 8,
    upper: /[A-Z]/.test(newPw),
    number: /[0-9]/.test(newPw),
    special: /[^A-Za-z0-9]/.test(newPw),
  };
  const strength = Object.values(checks).filter(Boolean).length;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"][strength];

  const SESSIONS = [
    { device: "MacBook Pro", browser: "Chrome 124", location: "Bangalore, IN", lastActive: "Now (current)" },
    { device: "iPhone 15",   browser: "Safari 17",  location: "Bangalore, IN", lastActive: "3h ago" },
    { device: "Windows PC",  browser: "Edge 122",   location: "Mumbai, IN",    lastActive: "2d ago" },
  ];

  return (
    <div className="space-y-4">
      <h2 className={cn("text-[16px] font-semibold", dark ? "text-[#F1F5F9]" : "text-gray-900")}>Password &amp; Security</h2>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <SectionHeader>Change Password</SectionHeader>
          <div className="space-y-3">
            <div>
              <Label>Current Password</Label>
              <div className="relative">
                <Input type={showCurrent ? "text" : "password"} value={current} onChange={e => setCurrent(e.target.value)} placeholder="Enter current password" className="pr-10" />
                <button className={cn("absolute right-2 top-1/2 -translate-y-1/2", dark ? "text-[#475569] hover:text-[#94A3B8]" : "text-gray-400 hover:text-gray-600")} onClick={() => setShowCurrent(v => !v)}>
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>New Password</Label>
              <div className="relative">
                <Input type={showNew ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Enter new password" className="pr-10" />
                <button className={cn("absolute right-2 top-1/2 -translate-y-1/2", dark ? "text-[#475569] hover:text-[#94A3B8]" : "text-gray-400 hover:text-gray-600")} onClick={() => setShowNew(v => !v)}>
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {newPw.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= strength ? strengthColor : dark ? "bg-[#334155]" : "bg-gray-200")} />
                    ))}
                  </div>
                  <p className={cn("text-[11px]", dark ? "text-[#64748B]" : "text-gray-500")}>Strength: <span className="font-bold">{strengthLabel}</span></p>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {[
                      { key: "length", label: "8+ characters" },
                      { key: "upper", label: "Uppercase letter" },
                      { key: "number", label: "Number" },
                      { key: "special", label: "Special character" },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-1.5">
                        <div className={cn("w-3 h-3 rounded-full flex items-center justify-center", checks[key as keyof typeof checks] ? "bg-emerald-500" : dark ? "bg-[#334155]" : "bg-gray-200")}>
                          {checks[key as keyof typeof checks] && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
                        </div>
                        <span className={cn("text-[10px]", dark ? "text-[#64748B]" : "text-gray-500")}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm new password" className={confirm.length > 0 && confirm !== newPw ? "border-red-400" : ""} />
              {confirm.length > 0 && confirm !== newPw && (
                <p className="text-[11px] text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
            <PrimaryBtn>Update Password</PrimaryBtn>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className={cn("text-sm font-semibold flex items-center gap-2", dark ? "text-[#F1F5F9]" : "text-gray-900")}>
                  <Shield className={cn("w-4 h-4", dark ? "text-[#00D4AA]" : "text-[#00775B]")} />
                  Two-Factor Authentication
                </p>
                <p className={cn("text-[12px] mt-0.5", dark ? "text-[#64748B]" : "text-gray-500")}>Adds a second layer of security to your account.</p>
              </div>
              <Toggle on={twoFactor} onToggle={() => setTwoFactor(v => !v)} />
            </div>
            {twoFactor && (
              <div className={cn(
                "mt-3 p-3 rounded text-[12px] font-medium",
                dark ? "bg-[#00D4AA]/10 border border-[#00D4AA]/30 text-[#00D4AA]" : "bg-[#E5FFF9] border border-[#00775B]/20 text-[#00775B]"
              )}>
                2FA is enabled. You will be prompted for a verification code on each login.
              </div>
            )}
          </Card>

          <Card>
            <SectionHeader>Active Sessions</SectionHeader>
            <div className="space-y-2">
              {SESSIONS.map((s, i) => (
                <div key={i} className={cn("flex items-center justify-between py-2 border-b last:border-0", dark ? "border-[#334155]" : "border-gray-100")}>
                  <div className="flex items-center gap-2.5">
                    <div className={cn("w-7 h-7 rounded flex items-center justify-center shrink-0", dark ? "bg-[#0F172A]" : "bg-gray-100")}>
                      <Monitor className={cn("w-3.5 h-3.5", dark ? "text-[#64748B]" : "text-gray-500")} />
                    </div>
                    <div>
                      <p className={cn("text-[12px] font-semibold", dark ? "text-[#CBD5E1]" : "text-gray-800")}>{s.device} · {s.browser}</p>
                      <p className={cn("text-[10px]", dark ? "text-[#475569]" : "text-gray-400")}>{s.location} · {s.lastActive}</p>
                    </div>
                  </div>
                  {i > 0
                    ? <button className={cn("text-[11px] font-bold px-2 py-1 rounded transition-colors", dark ? "text-red-400 hover:text-red-300 hover:bg-red-900/20" : "text-red-500 hover:text-red-700 hover:bg-red-50")}>Revoke</button>
                    : <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Current</span>
                  }
                </div>
              ))}
            </div>
            <button className={cn("mt-2 text-[12px] font-medium hover:underline flex items-center gap-1", dark ? "text-[#00D4AA]" : "text-[#00775B]")}>
              <LogOut className="w-3 h-3" /> Sign out all other sessions
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Members ─────────────────────────────────────────────────────────
function MembersSection() {
  const dark = useDark();
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("monitoring");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const PENDING = [
    { email: "priya.m@matrice.ai", role: "Monitoring Staff", expires: "3 days" },
    { email: "carlos.v@matrice.ai", role: "Manager", expires: "3 days" },
  ];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const total = members.length;
  const monitoringCount = members.filter(m => m.role === "monitoring").length;
  const managerCount = members.filter(m => m.role === "manager").length;

  const handleRemove = (id: string) => {
    setMembers(m => m.filter(x => x.id !== id));
    setOpenMenu(null);
  };

  return (
    <div className="space-y-4">
      <h2 className={cn("text-[16px] font-semibold", dark ? "text-[#F1F5F9]" : "text-gray-900")}>Members</h2>

      <div>
        <p className={cn("text-[11px] font-semibold uppercase tracking-widest mb-2", dark ? "text-[#475569]" : "text-gray-400")}>Summary</p>
        <div className="flex gap-3">
        {[
          { label: "Total Members", value: total },
          { label: "Monitoring Staff", value: monitoringCount },
          { label: "Managers", value: managerCount },
        ].map(s => (
          <div key={s.label} className={cn("flex items-center gap-2 px-4 py-2 rounded border shadow-sm", dark ? "bg-[#1E293B] border-[#334155]" : "bg-white border-gray-200")}>
            <span className={cn("text-[18px] font-black", dark ? "text-[#00D4AA]" : "text-[#00775B]")}>{s.value}</span>
            <span className={cn("text-[11px] font-medium", dark ? "text-[#64748B]" : "text-gray-500")}>{s.label}</span>
          </div>
        ))}
        </div>
      </div>

      <Card>
        <SectionHeader>Invite Member</SectionHeader>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Label>Email Address</Label>
            <Input
              type="email"
              placeholder="colleague@matrice.ai"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
            />
          </div>
          <div className="w-48">
            <Label>Role</Label>
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value as Role)}
              className={cn(
                "h-9 px-3 rounded border text-sm focus:outline-none w-full",
                dark
                  ? "bg-[#0F172A] border-[#334155] text-[#F1F5F9] focus:border-[#00D4AA] focus:ring-2 focus:ring-[#00D4AA]/15"
                  : "border-gray-200 text-gray-900 bg-white focus:ring-2 focus:ring-[#00775B]/15 focus:border-[#00775B]"
              )}
            >
              <option value="monitoring">Monitoring Staff</option>
              <option value="manager">Manager</option>
              <option value="director">Director</option>
            </select>
          </div>
          <PrimaryBtn className="shrink-0 flex items-center gap-2">
            <UserPlus className="w-3.5 h-3.5" /> Send Invite
          </PrimaryBtn>
        </div>
      </Card>

      <Card>
        <SectionHeader>Pending Invitations ({PENDING.length})</SectionHeader>
        <div className="space-y-2">
          {PENDING.map((p, i) => (
            <div key={i} className={cn("flex items-center justify-between py-2.5 px-3 rounded border", dark ? "bg-[#0F172A] border-[#334155]" : "bg-gray-50 border-gray-200")}>
              <div>
                <p className={cn("text-[12px] font-semibold", dark ? "text-[#CBD5E1]" : "text-gray-800")}>{p.email}</p>
                <p className={cn("text-[11px]", dark ? "text-[#475569]" : "text-gray-400")}>{p.role} · Expires in {p.expires}</p>
              </div>
              <div className="flex gap-2">
                <SecondaryBtn className="h-7 text-[11px] px-3">Resend</SecondaryBtn>
                <button className={cn("h-7 px-3 text-[11px] rounded border border-transparent transition-colors font-medium", dark ? "text-red-400 hover:text-red-300 hover:bg-red-900/20 hover:border-red-800/30" : "text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-100")}>Cancel</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={cn("border-b text-[10px] uppercase tracking-wider font-semibold", dark ? "bg-[#0F172A] border-[#334155] text-[#475569]" : "bg-gray-50 border-gray-200 text-gray-400")}>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last Active</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className={cn("divide-y", dark ? "divide-[#334155]" : "divide-gray-100")}>
            {members.map(m => (
              <tr key={m.id} className={cn("transition-colors", dark ? "hover:bg-[#1E293B]" : "hover:bg-gray-50")}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
                      dark ? "bg-[#00D4AA] text-[#020617]" : "bg-[#00775B] text-white"
                    )}>
                      {initials(m.name)}
                    </div>
                    <div>
                      <p className={cn("text-[12px] font-semibold", dark ? "text-[#CBD5E1]" : "text-gray-800")}>{m.name}</p>
                      <p className={cn("text-[11px]", dark ? "text-[#475569]" : "text-gray-400")}>{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={roleBadge(m.role, dark)}>{m.role}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("w-2 h-2 rounded-full", m.status === "active" ? "bg-emerald-500" : dark ? "bg-[#334155]" : "bg-gray-300")} />
                    <span className={cn("text-[11px] capitalize", dark ? "text-[#64748B]" : "text-gray-600")}>{m.status}</span>
                  </div>
                </td>
                <td className={cn("px-4 py-3 text-[11px]", dark ? "text-[#475569]" : "text-gray-500")}>{m.lastActive}</td>
                <td className="px-4 py-3 relative" ref={m.id === openMenu ? menuRef : null}>
                  <button
                    onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}
                    className={cn("p-1 rounded transition-colors", dark ? "text-[#475569] hover:bg-[#334155] hover:text-[#94A3B8]" : "hover:bg-gray-100 text-gray-400 hover:text-gray-600")}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openMenu === m.id && (
                    <div className={cn("absolute right-4 top-8 z-50 w-36 rounded shadow-xl border py-1", dark ? "bg-[#1E293B] border-[#334155]" : "bg-white border-gray-200")}>
                      <button className={cn("w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors", dark ? "text-[#94A3B8] hover:bg-[#334155]" : "text-gray-700 hover:bg-gray-50")}>
                        <Edit2 className="w-3.5 h-3.5" /> Change Role
                      </button>
                      <button
                        onClick={() => handleRemove(m.id)}
                        className={cn("w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors", dark ? "text-red-400 hover:bg-red-900/20" : "text-red-500 hover:bg-red-50")}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── Section: User Groups ─────────────────────────────────────────────────────
function GroupsSection() {
  const dark = useDark();
  const [groups, setGroups] = useState<Group[]>(MOCK_GROUPS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const CHANNEL_ICONS: Record<string, React.ReactNode> = {
    email: <Mail className="w-3 h-3" />,
    sms:   <Phone className="w-3 h-3" />,
    slack: <Hash className="w-3 h-3" />,
  };

  const handleCreate = (data: Omit<Group, "id">) => {
    setGroups(g => [...g, { ...data, id: `g${Date.now()}` }]);
    setShowCreateModal(false);
  };

  const handleEdit = (data: Omit<Group, "id">) => {
    if (!editingGroup) return;
    setGroups(g => g.map(x => x.id === editingGroup.id ? { ...data, id: x.id } : x));
    setEditingGroup(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn("text-[16px] font-semibold", dark ? "text-[#F1F5F9]" : "text-gray-900")}>User Groups</h2>
          <p className={cn("text-[12px] mt-0.5", dark ? "text-[#64748B]" : "text-gray-500")}>{groups.length} group{groups.length !== 1 ? "s" : ""}</p>
        </div>
        <PrimaryBtn onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" /> New Group
        </PrimaryBtn>
      </div>

      <div className={cn(
        "p-3 rounded border text-[12px] flex items-start gap-2",
        dark ? "bg-blue-900/20 border-blue-700/30 text-blue-300" : "bg-blue-50 border-blue-100 text-blue-700"
      )}>
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        User groups let you route alerts to specific teams. Groups can only contain Monitoring Staff members.
      </div>

      <div className="grid grid-cols-2 gap-3">
        {groups.map(g => {
          const groupMembers = MOCK_MEMBERS.filter(m => g.members.includes(m.id));
          return (
            <div
              key={g.id}
              className={cn(
                "group relative rounded border p-4 transition-all duration-200",
                dark
                  ? "bg-[#1E293B] border-[#334155] hover:border-[#475569] hover:shadow-lg hover:shadow-black/30 hover:-translate-y-px"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md hover:shadow-gray-100/80 hover:-translate-y-px"
              )}
            >
              {/* Icon action buttons — visible on group hover */}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150">
                <button
                  onClick={() => setEditingGroup(g)}
                  title="Edit group"
                  className={cn(
                    "w-7 h-7 rounded flex items-center justify-center transition-colors",
                    dark
                      ? "text-[#64748B] hover:text-[#00D4AA] hover:bg-[#00D4AA]/10"
                      : "text-gray-400 hover:text-[#00775B] hover:bg-[#E5FFF9]"
                  )}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setGroups(gg => gg.filter(x => x.id !== g.id))}
                  title="Delete group"
                  className={cn(
                    "w-7 h-7 rounded flex items-center justify-center transition-colors",
                    dark
                      ? "text-[#64748B] hover:text-red-400 hover:bg-red-900/20"
                      : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                  )}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pr-16">
                <p className={cn("text-[13px] font-bold", dark ? "text-[#CBD5E1]" : "text-gray-800")}>{g.name}</p>
                <p className={cn("text-[12px] mt-0.5 line-clamp-1", dark ? "text-[#475569]" : "text-gray-400")}>{g.description}</p>
              </div>

              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <div className="flex -space-x-1">
                  {groupMembers.map(m => (
                    <div key={m.id} title={m.name} className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center text-[8px] font-bold",
                      dark ? "bg-[#00D4AA]/20 text-[#00D4AA] border-[#1E293B]" : "bg-[#00775B]/10 text-[#00775B] border-white"
                    )}>
                      {initials(m.name)}
                    </div>
                  ))}
                  {groupMembers.length === 0 && (
                    <span className={cn("text-[11px]", dark ? "text-[#475569]" : "text-gray-400")}>No members</span>
                  )}
                </div>
                {groupMembers.length > 0 && (
                  <span className={cn("text-[11px]", dark ? "text-[#475569]" : "text-gray-400")}>
                    {groupMembers.length} member{groupMembers.length !== 1 ? "s" : ""}
                  </span>
                )}
                <div className="flex gap-1 ml-auto">
                  {g.channels.map(c => (
                    <span key={c} className={cn("flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full", dark ? "text-[#64748B] bg-[#0F172A]" : "text-gray-500 bg-gray-100")}>
                      {CHANNEL_ICONS[c]} {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {groups.length === 0 && (
          <div className={cn(
            "col-span-2 py-12 rounded border-2 border-dashed flex flex-col items-center gap-3",
            dark ? "border-[#334155] text-[#475569]" : "border-gray-200 text-gray-400"
          )}>
            <Users className="w-8 h-8 opacity-40" />
            <p className="text-[13px] font-medium">No groups yet</p>
            <p className="text-[12px]">Create a group to route alerts to specific teams</p>
            <PrimaryBtn onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 mt-1">
              <Plus className="w-3.5 h-3.5" /> Create First Group
            </PrimaryBtn>
          </div>
        )}
      </div>

      {showCreateModal && (
        <GroupModal mode="create" onSave={handleCreate} onClose={() => setShowCreateModal(false)} />
      )}

      {editingGroup && (
        <GroupModal mode="edit" group={editingGroup} onSave={handleEdit} onClose={() => setEditingGroup(null)} />
      )}
    </div>
  );
}

// ─── Section: Alert Channels ──────────────────────────────────────────────────
function ChannelsSection() {
  const dark = useDark();
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(true);
  const [slack, setSlack] = useState(false);
  const [teams, setTeams] = useState(false);
  const [emailList, setEmailList] = useState(["alerts@matrice.ai", "ops-team@matrice.ai"]);
  const [newEmail, setNewEmail] = useState("");
  const [slackWebhook, setSlackWebhook] = useState("");

  type Severity = "Critical" | "High" | "Medium" | "Low";
  type Channel = "Email" | "SMS" | "Slack" | "Teams";

  const [matrix, setMatrix] = useState<Record<Severity, Record<Channel, boolean>>>({
    Critical: { Email: true,  SMS: true,  Slack: true,  Teams: true },
    High:     { Email: true,  SMS: true,  Slack: false, Teams: false },
    Medium:   { Email: true,  SMS: false, Slack: false, Teams: false },
    Low:      { Email: false, SMS: false, Slack: false, Teams: false },
  });

  const severities: Severity[] = ["Critical", "High", "Medium", "Low"];
  const channels: Channel[] = ["Email", "SMS", "Slack", "Teams"];

  const toggleMatrix = (sev: Severity, ch: Channel) => {
    setMatrix(m => ({ ...m, [sev]: { ...m[sev], [ch]: !m[sev][ch] } }));
  };

  const severityColor: Record<Severity, string> = dark
    ? { Critical: "text-red-400 bg-red-900/30", High: "text-orange-400 bg-orange-900/30", Medium: "text-yellow-400 bg-yellow-900/30", Low: "text-blue-400 bg-blue-900/30" }
    : { Critical: "text-red-600 bg-red-50", High: "text-orange-600 bg-orange-50", Medium: "text-yellow-600 bg-yellow-50", Low: "text-blue-600 bg-blue-50" };

  return (
    <div className="space-y-4">
      <h2 className={cn("text-[16px] font-semibold", dark ? "text-[#F1F5F9]" : "text-gray-900")}>Alert Channels</h2>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded flex items-center justify-center", dark ? "bg-blue-900/30" : "bg-blue-50")}>
                <Mail className="text-blue-600" style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <p className={cn("text-[13px] font-bold", dark ? "text-[#CBD5E1]" : "text-gray-800")}>Email</p>
                <p className={cn("text-[11px]", dark ? "text-[#475569]" : "text-gray-400")}>Send alert notifications via email</p>
              </div>
            </div>
            <Toggle on={email} onToggle={() => setEmail(v => !v)} />
          </div>
          {email && (
            <div className={cn("mt-4 pt-4 border-t", dark ? "border-[#334155]" : "border-gray-100")}>
              <Label>Email Recipients</Label>
              <div className="space-y-2">
                {emailList.map((e, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input value={e} readOnly className={dark ? "bg-[#0F172A]" : "bg-gray-50"} />
                    <button onClick={() => setEmailList(l => l.filter((_, j) => j !== i))} className={cn("p-1 shrink-0 transition-colors", dark ? "text-[#475569] hover:text-red-400" : "text-gray-400 hover:text-red-500")}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input placeholder="Add email address" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                  <PrimaryBtn onClick={() => { if (newEmail.trim()) { setEmailList(l => [...l, newEmail.trim()]); setNewEmail(""); } }} className="shrink-0 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </PrimaryBtn>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded flex items-center justify-center", dark ? "bg-green-900/30" : "bg-green-50")}>
                <Phone className="text-green-600" style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <p className={cn("text-[13px] font-bold", dark ? "text-[#CBD5E1]" : "text-gray-800")}>SMS</p>
                <p className={cn("text-[11px]", dark ? "text-[#475569]" : "text-gray-400")}>Send alert notifications via SMS</p>
              </div>
            </div>
            <Toggle on={sms} onToggle={() => setSms(v => !v)} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded flex items-center justify-center", dark ? "bg-purple-900/30" : "bg-purple-50")}>
                <Hash className="text-purple-600" style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <p className={cn("text-[13px] font-bold", dark ? "text-[#CBD5E1]" : "text-gray-800")}>Slack</p>
                <p className={cn("text-[11px]", dark ? "text-[#475569]" : "text-gray-400")}>Post alerts to a Slack channel</p>
              </div>
            </div>
            <Toggle on={slack} onToggle={() => setSlack(v => !v)} />
          </div>
          {slack && (
            <div className={cn("mt-4 pt-4 border-t", dark ? "border-[#334155]" : "border-gray-100")}>
              <Label>Webhook URL</Label>
              <Input placeholder="https://hooks.slack.com/services/..." value={slackWebhook} onChange={e => setSlackWebhook(e.target.value)} />
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded flex items-center justify-center", dark ? "bg-indigo-900/30" : "bg-indigo-50")}>
                <Globe className="text-indigo-600" style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <p className={cn("text-[13px] font-bold", dark ? "text-[#CBD5E1]" : "text-gray-800")}>Microsoft Teams</p>
                <p className={cn("text-[11px]", dark ? "text-[#475569]" : "text-gray-400")}>Post alerts to a Teams channel</p>
              </div>
            </div>
            <Toggle on={teams} onToggle={() => setTeams(v => !v)} />
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <SectionHeader>Severity Routing Matrix</SectionHeader>
          <p className={cn("text-[12px]", dark ? "text-[#64748B]" : "text-gray-500")}>Choose which channels receive alerts by severity level.</p>
        </div>
        <table className={cn("w-full border-t", dark ? "border-[#334155]" : "border-gray-100")}>
          <thead>
            <tr className={cn("text-[10px] uppercase tracking-wider font-bold", dark ? "bg-[#0F172A] text-[#475569]" : "bg-gray-50 text-gray-400")}>
              <th className="px-5 py-3 text-left">Severity</th>
              {channels.map(c => <th key={c} className="px-4 py-3 text-center">{c}</th>)}
            </tr>
          </thead>
          <tbody className={cn("divide-y", dark ? "divide-[#334155]" : "divide-gray-100")}>
            {severities.map(sev => (
              <tr key={sev} className={cn("transition-colors", dark ? "hover:bg-[#1E293B]" : "hover:bg-gray-50")}>
                <td className="px-5 py-3">
                  <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full", severityColor[sev])}>{sev}</span>
                </td>
                {channels.map(ch => (
                  <td key={ch} className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={matrix[sev][ch]}
                      onChange={() => toggleMatrix(sev, ch)}
                      className={cn("w-4 h-4 cursor-pointer", dark ? "accent-[#00D4AA]" : "accent-[#00775B]")}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── Section: Appearance ──────────────────────────────────────────────────────
function AppearanceSection({ isDark, onToggleDark }: { isDark: boolean; onToggleDark: () => void }) {
  const dark = useDark();
  const [theme, setTheme] = useState<"light" | "dark" | "system">(isDark ? "dark" : "light");
  const [persona, setPersona] = useState<"monitoring" | "manager" | "director">("monitoring");
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("24h");
  const [density, setDensity] = useState<"compact" | "comfortable">("comfortable");

  // Current user is Director — monitoring staff cannot switch persona
  const CURRENT_USER_ROLE: Role = "director";
  const canSwitchPersona = CURRENT_USER_ROLE !== "monitoring";

  const handleTheme = (t: "light" | "dark" | "system") => {
    setTheme(t);
    if (t === "dark" && !isDark) onToggleDark();
    if (t === "light" && isDark) onToggleDark();
  };

  const THEMES: { key: "light" | "dark" | "system"; label: string; desc: string; icon: React.ReactNode }[] = [
    { key: "light",  label: "Light",  desc: "Clean white interface", icon: <Sun className="w-5 h-5 text-yellow-500" /> },
    { key: "dark",   label: "Dark",   desc: "Easy on the eyes",      icon: <Moon className="w-5 h-5 text-indigo-400" /> },
    { key: "system", label: "System", desc: "Follows OS preference", icon: <Monitor className={cn("w-5 h-5", dark ? "text-[#64748B]" : "text-gray-500")} /> },
  ];

  const PERSONAS: { key: "monitoring" | "manager" | "director"; label: string; desc: string }[] = [
    { key: "monitoring", label: "Monitoring Staff", desc: "Real-time ops view with live alerts" },
    { key: "manager",    label: "Manager",          desc: "Operational decisions & team oversight" },
    { key: "director",   label: "Director",         desc: "Executive KPI & strategic overview" },
  ];

  return (
    <div className="space-y-4">
      <h2 className={cn("text-[16px] font-semibold", dark ? "text-[#F1F5F9]" : "text-gray-900")}>Appearance</h2>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <SectionHeader>Theme</SectionHeader>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map(t => (
              <button
                key={t.key}
                onClick={() => handleTheme(t.key)}
                className={cn(
                  "relative flex flex-col items-center gap-2 p-3 rounded border-2 transition-all",
                  theme === t.key
                    ? dark ? "border-[#00D4AA] bg-[#00D4AA]/10" : "border-[#00775B] bg-[#E5FFF9]"
                    : dark ? "border-[#334155] hover:border-[#475569]" : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className={cn(
                  "w-full h-14 rounded overflow-hidden border",
                  t.key === "dark" ? "bg-[#0d1f1b] border-[#1a3830]" : "bg-white border-gray-200"
                )}>
                  <div className={cn("h-3.5 w-full flex items-center px-2 gap-1", t.key === "dark" ? "bg-[#021d18]" : "bg-[#0d1f1b]")}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00775B]" />
                    <div className={cn("h-1 w-8 rounded-full", t.key === "dark" ? "bg-[#1e3a32]" : "bg-white/50")} />
                  </div>
                  <div className="p-1.5 flex gap-1">
                    <div className={cn("h-5 w-5 rounded", t.key === "dark" ? "bg-[#1a3830]" : "bg-gray-100")} />
                    <div className="flex-1 space-y-1">
                      <div className={cn("h-1 w-full rounded-full", t.key === "dark" ? "bg-[#1e3a32]" : "bg-gray-200")} />
                      <div className={cn("h-1 w-3/4 rounded-full", t.key === "dark" ? "bg-[#17302a]" : "bg-gray-100")} />
                    </div>
                  </div>
                </div>
                {t.icon}
                <div className="text-center">
                  <p className={cn("text-[12px] font-bold", dark ? "text-[#CBD5E1]" : "text-gray-800")}>{t.label}</p>
                  <p className={cn("text-[10px]", dark ? "text-[#475569]" : "text-gray-400")}>{t.desc}</p>
                </div>
                {theme === t.key && (
                  <div className={cn("absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center", dark ? "bg-[#00D4AA]" : "bg-[#00775B]")}>
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Switch Persona View — Admins & Managers only */}
        <Card className={cn(!canSwitchPersona ? "opacity-60" : "")}>
          <div className="flex items-start justify-between mb-3">
            <SectionHeader>Switch Persona View</SectionHeader>
            <span className={cn(
              "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold -mt-1 shrink-0",
              dark ? "bg-[#334155] text-[#64748B]" : "bg-gray-100 text-gray-500"
            )}>
              <Lock className="w-2.5 h-2.5" />
              Admins &amp; Managers only
            </span>
          </div>
          {canSwitchPersona ? (
            <div className="space-y-2">
              {PERSONAS.map(p => (
                <label
                  key={p.key}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded border-2 cursor-pointer transition-all",
                    persona === p.key
                      ? dark ? "border-[#00D4AA] bg-[#00D4AA]/10" : "border-[#00775B] bg-[#E5FFF9]"
                      : dark ? "border-[#334155] hover:border-[#475569]" : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <input
                    type="radio"
                    name="persona"
                    value={p.key}
                    checked={persona === p.key}
                    onChange={() => setPersona(p.key)}
                    className={dark ? "accent-[#00D4AA] mt-0.5" : "accent-[#00775B] mt-0.5"}
                  />
                  <div>
                    <p className={cn("text-[12px] font-bold", dark ? "text-[#CBD5E1]" : "text-gray-800")}>{p.label}</p>
                    <p className={cn("text-[11px]", dark ? "text-[#475569]" : "text-gray-400")}>{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className={cn("flex flex-col items-center justify-center py-5 gap-2 rounded border-2 border-dashed", dark ? "border-[#334155] text-[#475569]" : "border-gray-200 text-gray-400")}>
              <Lock className="w-5 h-5 opacity-50" />
              <p className="text-[12px] font-medium text-center">Persona switching is restricted to Admins and Managers.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Display Preferences */}
      <Card>
        <SectionHeader>Display Preferences</SectionHeader>
        <div className="grid grid-cols-3 gap-x-8 gap-y-4">
          <div>
            <Label>Time Format</Label>
            <div className={cn("flex mt-1 rounded p-0.5 w-fit", dark ? "bg-[#0F172A]" : "bg-gray-100")}>
              {(["12h", "24h"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTimeFormat(f)}
                  className={cn(
                    "px-4 py-1.5 rounded text-[12px] font-semibold transition-all",
                    timeFormat === f
                      ? dark ? "bg-[#1E293B] text-[#00D4AA] shadow-sm" : "bg-white text-[#00775B] shadow-sm"
                      : dark ? "text-[#64748B]" : "text-gray-500"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Dashboard Density</Label>
            <div className={cn("flex mt-1 rounded p-0.5 w-fit", dark ? "bg-[#0F172A]" : "bg-gray-100")}>
              {(["compact", "comfortable"] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDensity(d)}
                  className={cn(
                    "px-4 py-1.5 rounded text-[12px] font-semibold transition-all capitalize",
                    density === d
                      ? dark ? "bg-[#1E293B] text-[#00D4AA] shadow-sm" : "bg-white text-[#00775B] shadow-sm"
                      : dark ? "text-[#64748B]" : "text-gray-500"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Timezone</Label>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={cn("text-[13px]", dark ? "text-[#CBD5E1]" : "text-gray-700")}>Asia/Kolkata (IST)</span>
              <button className={cn("text-[12px] hover:underline font-medium", dark ? "text-[#00D4AA]" : "text-[#00775B]")}>Change</button>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <PrimaryBtn>Save Preferences</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Account",
    items: [
      { key: "profile"  as NavSection, label: "My Profile",         icon: User },
      { key: "security" as NavSection, label: "Password & Security", icon: Lock },
    ],
  },
  {
    label: "Team",
    items: [
      { key: "members" as NavSection, label: "Members",    icon: Users },
      { key: "groups"  as NavSection, label: "User Groups", icon: Layers },
    ],
  },
  {
    label: "Notifications",
    items: [
      { key: "channels" as NavSection, label: "Alert Channels", icon: Bell },
    ],
  },
  {
    label: "Platform",
    items: [
      { key: "appearance" as NavSection, label: "Appearance", icon: Palette },
    ],
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
interface SettingsPageProps {
  isDark: boolean;
  onToggleDark: () => void;
}

export function SettingsPage({ isDark, onToggleDark }: SettingsPageProps) {
  const [activeSection, setActiveSection] = useState<NavSection>("profile");

  const renderContent = () => {
    switch (activeSection) {
      case "profile":    return <ProfileSection />;
      case "security":   return <SecuritySection />;
      case "members":    return <MembersSection />;
      case "groups":     return <GroupsSection />;
      case "channels":   return <ChannelsSection />;
      case "appearance": return <AppearanceSection isDark={isDark} onToggleDark={onToggleDark} />;
    }
  };

  return (
    <ThemeCtx.Provider value={isDark}>
      <div className={cn("flex flex-1 min-h-0 w-full", isDark ? "bg-[#020617]" : "bg-[#F1F5F9]")}>

        {/* Left nav — fixed width, full height, no internal scroll */}
        <aside className={cn(
          "w-56 shrink-0 border-r flex flex-col",
          isDark ? "bg-[#0A0F1A] border-[#1E293B]" : "bg-white border-gray-200"
        )}>
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {NAV_GROUPS.map(group => (
              <div key={group.label} className="mb-5">
                <p className={cn("px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest", isDark ? "text-[#334155]" : "text-gray-300")}>
                  {group.label}
                </p>
                {group.items.map(item => {
                  const Icon = item.icon;
                  const active = activeSection === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveSection(item.key)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 rounded text-[13px] font-medium transition-all",
                        active
                          ? isDark
                            ? "bg-[#00D4AA]/10 text-[#00D4AA]"
                            : "bg-gray-100 text-gray-900"
                          : isDark
                            ? "text-[#64748B] hover:bg-[#1E293B]/60 hover:text-[#94A3B8]"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 shrink-0", active && !isDark && "text-[#00775B]")} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Section content */}
        <main className={cn("flex-1 overflow-y-auto", isDark ? "bg-[#020617]" : "bg-[#F1F5F9]")}>
          <div className="px-6 py-6">
            {renderContent()}
          </div>
        </main>

      </div>
    </ThemeCtx.Provider>
  );
}
