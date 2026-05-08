import { useState } from "react";
import { Search, Briefcase, Users, FolderOpen, Tag, ArrowRight } from "lucide-react";
import { MOCK_ACCOUNTS, Account } from "@/data/mockData";
import { cn } from "@/app/lib/utils";

interface SupportDeskProps {
  onSelectAccount: (account: Account) => void;
}

export function SupportDesk({ onSelectAccount }: SupportDeskProps) {
  const [query, setQuery] = useState("");

  const filtered = MOCK_ACCOUNTS.filter(
    (a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.accountId.includes(query)
  );

  return (
    <div className="max-w-5xl mx-auto w-full">
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Search for client accounts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-11 pl-11 pr-4 rounded-[8px] border border-[#E2E8F0] bg-white text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#00775B] focus:ring-2 focus:ring-[#00775B]/10 transition-all"
        />
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[6px] bg-[#F0FDF9] border border-[#00775B]/15 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-[#00775B]" />
          </div>
          <span className="text-[15px] font-semibold text-[#0F172A]">My Managed Accounts</span>
        </div>
        <span className="text-[12px] text-[#94A3B8]">{filtered.length} account{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="h-px bg-[#E2E8F0] mb-5" />

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#94A3B8] text-[13px]">No accounts found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onClick={() => onSelectAccount(account)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Account card ─────────────────────────────────────────────────────────────

function AccountCard({
  account,
  onClick,
}: {
  account: Account;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative bg-white rounded-[10px] border border-[#E2E8F0] p-5 cursor-pointer outline-none transition-all duration-200 group"
      style={{
        boxShadow: hovered
          ? "0 8px 24px rgba(0,0,0,0.10)"
          : "0 1px 3px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-1px)" : "none",
        borderColor: hovered ? "rgba(0,119,91,0.25)" : "#E2E8F0",
      }}
    >
      {/* Top row: icon + action indicator */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-[8px] bg-[#F0FDF9] border border-[#00775B]/15 flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-[#00775B]" />
        </div>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            backgroundColor: hovered ? "#00775B" : "#F1F5F9",
            color: hovered ? "#fff" : "#94A3B8",
          }}
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Account name + ID */}
      <div className="mb-4">
        <h3 className="text-[14px] font-semibold text-[#0F172A] leading-tight mb-1">{account.name}</h3>
        <p className="text-[11px] font-mono text-[#94A3B8] leading-tight truncate">{account.accountId}</p>
      </div>

      {/* Project count */}
      <div className="flex items-baseline gap-2 mb-4">
        <span
          className="text-[2rem] font-bold leading-none"
          style={{ color: "#0F172A" }}
        >
          {account.projectCount.toLocaleString()}
        </span>
        <div className="flex items-center gap-1">
          <FolderOpen className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="text-[12px] text-[#94A3B8]">Projects</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {account.tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] border border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-medium text-[#64748B]"
          >
            <Tag className="w-2.5 h-2.5" />
            {tag}
          </span>
        ))}
      </div>

      {/* Hover accent line */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[10px] transition-all duration-200"
        style={{ backgroundColor: hovered ? "#00775B" : "transparent" }}
      />
    </div>
  );
}
