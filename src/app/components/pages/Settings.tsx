import { useState, useRef, useEffect } from "react";
import {
  User, Lock, Users, Bell, Zap, Sun, Moon, Monitor, Mail, Phone, Key,
  Eye, EyeOff, Plus, Trash2, Edit2, Check, Shield, Info, Upload,
  Globe, AlertCircle, Hash, UserPlus, Building, RefreshCw,
  LogOut, Copy, ExternalLink, Clipboard, MoreVertical, Palette, Layers,
  Clock, ChevronRight, Activity
} from "lucide-react";
import { cn } from "@/app/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type NavSection =
  | "profile" | "security"
  | "members" | "groups"
  | "channels" | "rules"
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function roleBadge(role: Role | "invited") {
  const map: Record<string, string> = {
    director:   "bg-purple-100 text-purple-700 border border-purple-200",
    manager:    "bg-blue-100 text-blue-700 border border-blue-200",
    monitoring: "bg-teal-100 text-teal-700 border border-teal-200",
    invited:    "bg-gray-100 text-gray-500 border border-gray-200",
  };
  return cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide", map[role] ?? map.invited);
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative w-10 h-5 rounded-full transition-colors shrink-0",
        on ? "bg-[#00775B]" : "bg-gray-300"
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
const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">{children}</p>
);

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("rounded-lg border border-gray-200 bg-white p-4", className)}>{children}</div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1.5">{children}</label>
);

const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      "h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400",
      "focus:outline-none focus:ring-2 focus:ring-[#00775B]/15 focus:border-[#00775B]",
      "disabled:bg-gray-50 disabled:text-gray-500",
      className
    )}
    {...props}
  />
);

const Textarea = ({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={cn(
      "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400",
      "focus:outline-none focus:ring-2 focus:ring-[#00775B]/15 focus:border-[#00775B] resize-none",
      className
    )}
    {...props}
  />
);

const PrimaryBtn = ({ children, onClick, className, type = "button" }: { children: React.ReactNode; onClick?: () => void; className?: string; type?: "button" | "submit" }) => (
  <button
    type={type}
    onClick={onClick}
    className={cn("h-9 px-4 rounded-md bg-[#00775B] text-white text-sm font-medium hover:bg-[#006649] transition-colors", className)}
  >
    {children}
  </button>
);

const SecondaryBtn = ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
  <button
    onClick={onClick}
    className={cn("h-9 px-4 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors", className)}
  >
    {children}
  </button>
);

// ─── Section: My Profile ──────────────────────────────────────────────────────
function ProfileSection() {
  const [hoverAvatar, setHoverAvatar] = useState(false);
  const [firstName, setFirstName]     = useState("Mohammed Usman");
  const [lastName,  setLastName]      = useState("F");
  const [jobTitle,  setJobTitle]      = useState("");
  const [company,   setCompany]       = useState("");
  const [phone,     setPhone]         = useState("");
  const [country,   setCountry]       = useState("");
  const [copied,    setCopied]        = useState(false);

  const ACCOUNT_NUMBER = "9782886768719887307619115";

  const handleCopy = () => {
    navigator.clipboard.writeText(ACCOUNT_NUMBER).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[17px] font-semibold text-gray-900">My Profile</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage your personal information and preferences.</p>
        </div>
        <PrimaryBtn>Save Changes</PrimaryBtn>
      </div>

      {/* Two-column layout: avatar/identity left, account info right */}
      <div className="grid grid-cols-[260px_1fr] gap-4">

        {/* Left: Avatar + identity */}
        <div className="space-y-4">
          <Card className="flex flex-col items-center text-center gap-3">
            <div
              className="relative cursor-pointer"
              onMouseEnter={() => setHoverAvatar(true)}
              onMouseLeave={() => setHoverAvatar(false)}
            >
              <div className="w-20 h-20 rounded-full bg-[#00775B] flex items-center justify-center text-white text-2xl font-black select-none">
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
              <p className="text-sm font-semibold text-gray-900">{firstName} {lastName}</p>
              <p className="text-xs text-gray-500 mt-0.5">Director</p>
            </div>
            <button className="text-[12px] text-[#00775B] hover:underline font-medium flex items-center gap-1">
              <Upload className="w-3 h-3" /> Change photo
            </button>
          </Card>

          <Card>
            <SectionHeader>Account Details</SectionHeader>
            <div className="space-y-3">
              <div>
                <Label>Account Type</Label>
                <div className="h-9 px-3 rounded-md border border-gray-200 bg-gray-50 flex items-center gap-2">
                  <span className="text-sm text-gray-800 font-medium">Enterprise</span>
                  <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Active</span>
                </div>
              </div>
              <div>
                <Label>Account Number</Label>
                <div className="relative">
                  <Input value={ACCOUNT_NUMBER} readOnly className="bg-gray-50 font-mono text-[11px] tracking-tight pr-9" />
                  <button onClick={handleCopy} title="Copy" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
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
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
              <div>
                <Label>Job Title</Label>
                <Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="N/A" />
              </div>
              <div className="col-span-2">
                <Label>Company</Label>
                <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="N/A" />
              </div>
            </div>
          </Card>

          <Card>
            <SectionHeader>Personal Information</SectionHeader>
            <div className="grid grid-cols-3 gap-x-4 gap-y-3">
              <div className="col-span-2">
                <Label>Email</Label>
                <div className="relative">
                  <Input value="mohammed.usman@matrice.ai" readOnly className="pr-20 bg-gray-50 text-gray-500" />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">Verified</span>
                </div>
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="N/A" />
              </div>
              <div>
                <Label>Country</Label>
                <Input value={country} onChange={e => setCountry(e.target.value)} placeholder="N/A" />
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}

// ─── Section: Password & Security ────────────────────────────────────────────
function SecuritySection() {
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
      <div>
        <h2 className="text-[17px] font-semibold text-gray-900">Password & Security</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your password and account security settings.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Change Password */}
        <Card>
          <SectionHeader>Change Password</SectionHeader>
          <div className="space-y-3">
            <div>
              <Label>Current Password</Label>
              <div className="relative">
                <Input type={showCurrent ? "text" : "password"} value={current} onChange={e => setCurrent(e.target.value)} placeholder="Enter current password" className="pr-10" />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowCurrent(v => !v)}>
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>New Password</Label>
              <div className="relative">
                <Input type={showNew ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Enter new password" className="pr-10" />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowNew(v => !v)}>
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {newPw.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= strength ? strengthColor : "bg-gray-200")} />
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500">Strength: <span className="font-bold">{strengthLabel}</span></p>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {[
                      { key: "length", label: "8+ characters" },
                      { key: "upper", label: "Uppercase letter" },
                      { key: "number", label: "Number" },
                      { key: "special", label: "Special character" },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-1.5">
                        <div className={cn("w-3 h-3 rounded-full flex items-center justify-center", checks[key as keyof typeof checks] ? "bg-emerald-500" : "bg-gray-200")}>
                          {checks[key as keyof typeof checks] && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-[10px] text-gray-500">{label}</span>
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

        {/* Right: 2FA + Sessions */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#00775B]" />
                  Two-Factor Authentication
                </p>
                <p className="text-[12px] text-gray-500 mt-0.5">Adds a second layer of security to your account.</p>
              </div>
              <Toggle on={twoFactor} onToggle={() => setTwoFactor(v => !v)} />
            </div>
            {twoFactor && (
              <div className="mt-3 p-3 rounded-lg bg-[#E5FFF9] border border-[#00775B]/20 text-[12px] text-[#00775B] font-medium">
                2FA is enabled. You will be prompted for a verification code on each login.
              </div>
            )}
          </Card>

          <Card>
            <SectionHeader>Active Sessions</SectionHeader>
            <div className="space-y-2">
              {SESSIONS.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Monitor className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-gray-800">{s.device} · {s.browser}</p>
                      <p className="text-[10px] text-gray-400">{s.location} · {s.lastActive}</p>
                    </div>
                  </div>
                  {i > 0
                    ? <button className="text-[11px] font-bold text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors">Revoke</button>
                    : <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Current</span>
                  }
                </div>
              ))}
            </div>
            <button className="mt-2 text-[12px] font-medium text-[#00775B] hover:underline flex items-center gap-1">
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
      <div>
        <h2 className="text-[17px] font-semibold text-gray-900">Members</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage who has access to this workspace.</p>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        {[
          { label: "Total Members", value: total },
          { label: "Monitoring Staff", value: monitoringCount },
          { label: "Managers", value: managerCount },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 shadow-sm">
            <span className="text-[18px] font-black text-[#00775B]">{s.value}</span>
            <span className="text-[11px] text-gray-500 font-medium">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Invite form */}
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
              className="h-9 px-3 rounded-md border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00775B]/15 focus:border-[#00775B] w-full bg-white"
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

      {/* Pending */}
      <Card>
        <SectionHeader>Pending Invitations ({PENDING.length})</SectionHeader>
        <div className="space-y-2">
          {PENDING.map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-md border border-gray-200">
              <div>
                <p className="text-[12px] font-semibold text-gray-800">{p.email}</p>
                <p className="text-[11px] text-gray-400">{p.role} · Expires in {p.expires}</p>
              </div>
              <div className="flex gap-2">
                <SecondaryBtn className="h-7 text-[11px] px-3">Resend</SecondaryBtn>
                <button className="h-7 px-3 text-[11px] text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors font-medium">Cancel</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Members table */}
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase tracking-wider font-semibold text-gray-400">
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last Active</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map(m => (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#00775B] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                      {initials(m.name)}
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-gray-800">{m.name}</p>
                      <p className="text-[11px] text-gray-400">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={roleBadge(m.role)}>{m.role}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("w-2 h-2 rounded-full", m.status === "active" ? "bg-emerald-500" : "bg-gray-300")} />
                    <span className="text-[11px] text-gray-600 capitalize">{m.status}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[11px] text-gray-500">{m.lastActive}</td>
                <td className="px-4 py-3 relative" ref={m.id === openMenu ? menuRef : null}>
                  <button
                    onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}
                    className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openMenu === m.id && (
                    <div className="absolute right-4 top-8 z-50 w-36 bg-white rounded-lg shadow-xl border border-gray-200 py-1">
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50">
                        <Edit2 className="w-3.5 h-3.5" /> Change Role
                      </button>
                      <button
                        onClick={() => handleRemove(m.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-500 hover:bg-red-50"
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

// ─── Section: User Groups ────────────────────────────────────────────────────
function GroupsSection() {
  const [groups, setGroups] = useState<Group[]>(MOCK_GROUPS);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formMembers, setFormMembers] = useState<Set<string>>(new Set());
  const [formChannels, setFormChannels] = useState<Set<string>>(new Set(["email"]));

  const monitoringStaff = MOCK_MEMBERS.filter(m => m.role === "monitoring");

  const toggleSet = (set: Set<string>, val: string): Set<string> => {
    const s = new Set(set);
    if (s.has(val)) s.delete(val); else s.add(val);
    return s;
  };

  const handleCreate = () => {
    if (!formName.trim()) return;
    const newGroup: Group = {
      id: `g${Date.now()}`,
      name: formName,
      description: formDesc,
      members: Array.from(formMembers),
      channels: Array.from(formChannels),
    };
    setGroups(g => [...g, newGroup]);
    setShowForm(false);
    setFormName("");
    setFormDesc("");
    setFormMembers(new Set());
    setFormChannels(new Set(["email"]));
  };

  const CHANNEL_ICONS: Record<string, React.ReactNode> = {
    email: <Mail className="w-3 h-3" />,
    sms: <Hash className="w-3 h-3" />,
    slack: <Hash className="w-3 h-3" />,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[17px] font-semibold text-gray-900">User Groups</h2>
          <p className="text-sm text-gray-500 mt-1">Route alerts to specific teams.</p>
        </div>
        <PrimaryBtn onClick={() => setShowForm(v => !v)} className="flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" /> New Group
        </PrimaryBtn>
      </div>

      <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-[12px] text-blue-700 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        User groups let you route alerts to specific teams. Groups can only contain Monitoring Staff members.
      </div>

      {showForm && (
        <Card className="border-[#00775B]/40">
          <SectionHeader>Create New Group</SectionHeader>
          <div className="space-y-4">
            <div>
              <Label>Group Name</Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Night Watch" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Short description" />
            </div>
            <div>
              <Label>Members (Monitoring Staff only)</Label>
              <div className="space-y-2 mt-1">
                {monitoringStaff.map(m => (
                  <label key={m.id} className="flex items-center gap-3 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={formMembers.has(m.id)}
                      onChange={() => setFormMembers(s => toggleSet(s, m.id))}
                      className="accent-[#00775B]"
                    />
                    <span className="text-[12px] text-gray-700">{m.name}</span>
                    <span className="text-[11px] text-gray-400">{m.email}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Notification Channels</Label>
              <div className="flex gap-4 mt-1">
                {["email", "sms", "slack"].map(c => (
                  <label key={c} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formChannels.has(c)}
                      onChange={() => setFormChannels(s => toggleSet(s, c))}
                      className="accent-[#00775B]"
                    />
                    <span className="text-[12px] text-gray-700 capitalize">{c}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <PrimaryBtn onClick={handleCreate}>Create Group</PrimaryBtn>
              <SecondaryBtn onClick={() => setShowForm(false)}>Cancel</SecondaryBtn>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        {groups.map(g => {
          const groupMembers = MOCK_MEMBERS.filter(m => g.members.includes(m.id));
          return (
            <Card key={g.id} className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-800">{g.name}</p>
                <p className="text-[12px] text-gray-400 mt-0.5">{g.description}</p>
                <div className="flex items-center gap-3 mt-3">
                  {/* Member avatars */}
                  <div className="flex -space-x-1">
                    {groupMembers.map(m => (
                      <div key={m.id} title={m.name} className="w-6 h-6 rounded-full bg-[#00775B] border-2 border-white flex items-center justify-center text-white text-[8px] font-bold">
                        {initials(m.name)}
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] text-gray-400">{groupMembers.length} member{groupMembers.length !== 1 ? "s" : ""}</span>
                  <div className="flex gap-1">
                    {g.channels.map(c => (
                      <span key={c} className="flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {CHANNEL_ICONS[c]} {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <SecondaryBtn className="h-8 px-3 text-[11px] flex items-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </SecondaryBtn>
                <button
                  onClick={() => setGroups(gg => gg.filter(x => x.id !== g.id))}
                  className="h-8 px-3 text-[11px] text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Section: Alert Channels ──────────────────────────────────────────────────
function ChannelsSection() {
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

  const severityColor: Record<Severity, string> = {
    Critical: "text-red-600 bg-red-50",
    High: "text-orange-600 bg-orange-50",
    Medium: "text-yellow-600 bg-yellow-50",
    Low: "text-blue-600 bg-blue-50",
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[17px] font-semibold text-gray-900">Alert Channels</h2>
        <p className="text-sm text-gray-500 mt-1">Configure how and where alerts are delivered.</p>
      </div>

      {/* Channel toggles */}
      <div className="grid grid-cols-2 gap-3">
        {/* Email */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Mail className="w-4.5 h-4.5 text-blue-600" style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-800">Email</p>
                <p className="text-[11px] text-gray-400">Send alert notifications via email</p>
              </div>
            </div>
            <Toggle on={email} onToggle={() => setEmail(v => !v)} />
          </div>
          {email && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Label>Email Recipients</Label>
              <div className="space-y-2">
                {emailList.map((e, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input value={e} readOnly className="bg-gray-50" />
                    <button onClick={() => setEmailList(l => l.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 p-1 shrink-0">
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

        {/* SMS */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                <Phone className="w-4.5 h-4.5 text-green-600" style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-800">SMS</p>
                <p className="text-[11px] text-gray-400">Send alert notifications via SMS</p>
              </div>
            </div>
            <Toggle on={sms} onToggle={() => setSms(v => !v)} />
          </div>
        </Card>

        {/* Slack */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                <Hash className="w-4.5 h-4.5 text-purple-600" style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-800">Slack</p>
                <p className="text-[11px] text-gray-400">Post alerts to a Slack channel</p>
              </div>
            </div>
            <Toggle on={slack} onToggle={() => setSlack(v => !v)} />
          </div>
          {slack && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Label>Webhook URL</Label>
              <Input placeholder="https://hooks.slack.com/services/..." value={slackWebhook} onChange={e => setSlackWebhook(e.target.value)} />
            </div>
          )}
        </Card>

        {/* Teams */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Globe className="w-4.5 h-4.5 text-indigo-600" style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-800">Microsoft Teams</p>
                <p className="text-[11px] text-gray-400">Post alerts to a Teams channel</p>
              </div>
            </div>
            <Toggle on={teams} onToggle={() => setTeams(v => !v)} />
          </div>
        </Card>
      </div>

      {/* Severity Routing Matrix */}
      <Card className="p-0 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <SectionHeader>Severity Routing Matrix</SectionHeader>
          <p className="text-[12px] text-gray-500">Choose which channels receive alerts by severity level.</p>
        </div>
        <table className="w-full border-t border-gray-100">
          <thead>
            <tr className="bg-gray-50 text-[10px] uppercase tracking-wider font-bold text-gray-400">
              <th className="px-5 py-3 text-left">Severity</th>
              {channels.map(c => <th key={c} className="px-4 py-3 text-center">{c}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {severities.map(sev => (
              <tr key={sev} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full", severityColor[sev])}>{sev}</span>
                </td>
                {channels.map(ch => (
                  <td key={ch} className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={matrix[sev][ch]}
                      onChange={() => toggleMatrix(sev, ch)}
                      className="accent-[#00775B] w-4 h-4 cursor-pointer"
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

// ─── Section: Alert Rules ─────────────────────────────────────────────────────
function RulesSection() {
  const [threshold, setThreshold] = useState(85);
  const [cooldown, setCooldown] = useState(15);
  const [escalation, setEscalation] = useState(true);
  const [escalationMinutes, setEscalationMinutes] = useState(30);
  const [bolo, setBolo] = useState(true);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[17px] font-semibold text-gray-900">Alert Rules</h2>
        <p className="text-sm text-gray-500 mt-1">Configure alert triggering behavior and thresholds.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Detection settings */}
        <Card>
          <SectionHeader>Detection Settings</SectionHeader>
          <div className="space-y-4">
            {/* Confidence threshold */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Confidence Threshold</Label>
                <span className="text-[20px] font-black text-[#00775B]">{threshold}%</span>
              </div>
              <input
                type="range"
                min={70}
                max={99}
                value={threshold}
                onChange={e => setThreshold(Number(e.target.value))}
                className="w-full accent-[#00775B]"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>70%</span><span>99%</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">Only trigger alerts when match confidence exceeds this value.</p>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Detection cooldown */}
            <div>
              <Label>Detection Cooldown (minutes)</Label>
              <div className="flex items-center gap-3 mt-1">
                <Input
                  type="number"
                  min={1}
                  max={120}
                  value={cooldown}
                  onChange={e => setCooldown(Number(e.target.value))}
                  className="w-32"
                />
                <p className="text-[11px] text-gray-400">Minimum time between repeat alerts for the same identity.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Right: Escalation & Priority */}
        <Card>
          <SectionHeader>Escalation & Priority</SectionHeader>
          <div className="space-y-4">
            {/* Auto-escalation */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <Label>Auto-Escalation</Label>
                  <p className="text-[11px] text-gray-400 mt-0.5">Escalate unacknowledged CRITICAL alerts after this period.</p>
                </div>
                <Toggle on={escalation} onToggle={() => setEscalation(v => !v)} />
              </div>
              {escalation && (
                <div className="mt-3 flex items-center gap-3">
                  <Input
                    type="number"
                    min={5}
                    max={180}
                    value={escalationMinutes}
                    onChange={e => setEscalationMinutes(Number(e.target.value))}
                    className="w-32"
                  />
                  <span className="text-[12px] text-gray-500">minutes</span>
                </div>
              )}
            </div>

            <div className="h-px bg-gray-100" />

            {/* BOLO priority */}
            <div className="flex items-start justify-between">
              <div>
                <Label>BOLO Priority</Label>
                <p className="text-[11px] text-gray-400 mt-0.5">Always notify all channels for BOLO hits regardless of threshold.</p>
              </div>
              <Toggle on={bolo} onToggle={() => setBolo(v => !v)} />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <PrimaryBtn>Save Rules</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Section: Appearance ──────────────────────────────────────────────────────
function AppearanceSection({ isDark, onToggleDark }: { isDark: boolean; onToggleDark: () => void }) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">(isDark ? "dark" : "light");
  const [persona, setPersona] = useState<"monitoring" | "manager" | "director">("monitoring");
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("24h");
  const [density, setDensity] = useState<"compact" | "comfortable">("comfortable");

  const handleTheme = (t: "light" | "dark" | "system") => {
    setTheme(t);
    if (t === "dark" && !isDark) onToggleDark();
    if (t === "light" && isDark) onToggleDark();
  };

  const THEMES: { key: "light" | "dark" | "system"; label: string; desc: string; icon: React.ReactNode }[] = [
    { key: "light",  label: "Light",  desc: "Clean white interface", icon: <Sun className="w-5 h-5 text-yellow-500" /> },
    { key: "dark",   label: "Dark",   desc: "Easy on the eyes",      icon: <Moon className="w-5 h-5 text-indigo-400" /> },
    { key: "system", label: "System", desc: "Follows OS preference", icon: <Monitor className="w-5 h-5 text-gray-500" /> },
  ];

  const PERSONAS: { key: "monitoring" | "manager" | "director"; label: string; desc: string }[] = [
    { key: "monitoring", label: "Monitoring Staff", desc: "Real-time ops view with live alerts" },
    { key: "manager",    label: "Manager",          desc: "Operational decisions & team oversight" },
    { key: "director",   label: "Director",         desc: "Executive KPI & strategic overview" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[17px] font-semibold text-gray-900">Appearance</h2>
        <p className="text-sm text-gray-500 mt-1">Customize how the platform looks and feels.</p>
      </div>

      {/* Theme + Default Persona side by side */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <SectionHeader>Theme</SectionHeader>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map(t => (
              <button
                key={t.key}
                onClick={() => handleTheme(t.key)}
                className={cn(
                  "relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                  theme === t.key ? "border-[#00775B] bg-[#E5FFF9]" : "border-gray-200 hover:border-gray-300"
                )}
              >
                {/* Preview */}
                <div className={cn(
                  "w-full h-14 rounded-lg overflow-hidden border",
                  t.key === "dark" ? "bg-[#0d1f1b] border-[#1a3830]" : "bg-white border-gray-200"
                )}>
                  <div className={cn("h-3.5 w-full flex items-center px-2 gap-1", t.key === "dark" ? "bg-[#021d18]" : "bg-[#0d1f1b]")}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00775B]" />
                    <div className={cn("h-1 w-8 rounded-full", t.key === "dark" ? "bg-white/20" : "bg-white/50")} />
                  </div>
                  <div className="p-1.5 flex gap-1">
                    <div className={cn("h-5 w-5 rounded", t.key === "dark" ? "bg-white/10" : "bg-gray-100")} />
                    <div className="flex-1 space-y-1">
                      <div className={cn("h-1 w-full rounded-full", t.key === "dark" ? "bg-white/20" : "bg-gray-200")} />
                      <div className={cn("h-1 w-3/4 rounded-full", t.key === "dark" ? "bg-white/10" : "bg-gray-100")} />
                    </div>
                  </div>
                </div>
                {t.icon}
                <div className="text-center">
                  <p className="text-[12px] font-bold text-gray-800">{t.label}</p>
                  <p className="text-[10px] text-gray-400">{t.desc}</p>
                </div>
                {theme === t.key && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#00775B] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader>Default Persona</SectionHeader>
          <div className="space-y-2">
            {PERSONAS.map(p => (
              <label
                key={p.key}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                  persona === p.key ? "border-[#00775B] bg-[#E5FFF9]" : "border-gray-200 hover:border-gray-300"
                )}
              >
                <input
                  type="radio"
                  name="persona"
                  value={p.key}
                  checked={persona === p.key}
                  onChange={() => setPersona(p.key)}
                  className="accent-[#00775B] mt-0.5"
                />
                <div>
                  <p className="text-[12px] font-bold text-gray-800">{p.label}</p>
                  <p className="text-[11px] text-gray-400">{p.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>
      </div>

      {/* Display Preferences full width */}
      <Card>
        <SectionHeader>Display Preferences</SectionHeader>
        <div className="grid grid-cols-3 gap-x-8 gap-y-4">
          {/* Time format */}
          <div>
            <Label>Time Format</Label>
            <div className="flex mt-1 bg-gray-100 rounded-lg p-0.5 w-fit">
              {(["12h", "24h"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTimeFormat(f)}
                  className={cn("px-4 py-1.5 rounded-md text-[12px] font-semibold transition-all", timeFormat === f ? "bg-white text-[#00775B] shadow-sm" : "text-gray-500")}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Density */}
          <div>
            <Label>Dashboard Density</Label>
            <div className="flex mt-1 bg-gray-100 rounded-lg p-0.5 w-fit">
              {(["compact", "comfortable"] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDensity(d)}
                  className={cn("px-4 py-1.5 rounded-md text-[12px] font-semibold transition-all capitalize", density === d ? "bg-white text-[#00775B] shadow-sm" : "text-gray-500")}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Timezone */}
          <div>
            <Label>Timezone</Label>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[13px] text-gray-700">Asia/Kolkata (IST)</span>
              <button className="text-[12px] text-[#00775B] hover:underline font-medium">Change</button>
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
      { key: "profile"  as NavSection, label: "My Profile",          icon: User },
      { key: "security" as NavSection, label: "Password & Security",  icon: Lock },
    ],
  },
  {
    label: "Team",
    items: [
      { key: "members"  as NavSection, label: "Members",    icon: Users },
      { key: "groups"   as NavSection, label: "User Groups", icon: Layers },
    ],
  },
  {
    label: "Notifications",
    items: [
      { key: "channels" as NavSection, label: "Alert Channels", icon: Bell },
      { key: "rules"    as NavSection, label: "Alert Rules",    icon: Zap },
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
      case "rules":      return <RulesSection />;
      case "appearance": return <AppearanceSection isDark={isDark} onToggleDark={onToggleDark} />;
    }
  };

  return (
    <div className="flex h-full w-full bg-white overflow-hidden">

      {/* Left nav */}
      <aside className="w-52 shrink-0 border-r border-gray-200 overflow-y-auto bg-white">
        {/* Nav header */}
        <div className="px-5 pt-6 pb-4 border-b border-gray-100">
          <h1 className="text-[15px] font-semibold text-gray-900">Settings</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">Workspace preferences</p>
        </div>

        <nav className="py-4 px-3">
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="mb-5">
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
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
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      active
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <Icon className="w-[15px] h-[15px] shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Section content — full width, scrollable */}
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="px-6 py-6">
          {renderContent()}
        </div>
      </main>

    </div>
  );
}
