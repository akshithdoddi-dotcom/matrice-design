import { useState, useEffect, useMemo } from "react";
import { Search, Globe, Server, Copy, Check as CheckIcon } from "lucide-react";
import {
  MOCK_ACCOUNTS,
  MOCK_CLUSTERS,
  Account,
  Cluster,
} from "@/data/mockData";

// ── Cluster card ──────────────────────────────────────────────────────────────

function ClusterCard({ cluster, onClick }: { cluster: Cluster; onClick: () => void }) {
  const isActive  = cluster.status === "active";
  const isWarning = cluster.status === "warning";
  const dotColor  = isActive ? "#22C55E" : isWarning ? "#F59E0B" : "#94A3B8";

  return (
    <div
      onClick={onClick}
      className="bg-white rounded p-4 cursor-pointer transition-all duration-150 hover:shadow-md hover:border-gray-300"
      style={{ border: "1px solid #E5E7EB" }}
    >
      {/* Name + status dot */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className="font-semibold text-[13px] text-gray-900 leading-snug break-all"
          title={cluster.name}
        >
          {cluster.name}
        </span>
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5"
          style={{ backgroundColor: dotColor }}
        />
      </div>

      {/* IP */}
      <div className="font-mono text-[12px] text-gray-400 mb-3">{cluster.ip}</div>

      {/* Meta rows */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-[12px] text-gray-500">{cluster.location || "unknown"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Server className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-[12px] text-gray-500">Edge</span>
        </div>
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface SupportDeskProps {
  selectedAccount: Account | null;
  onSelectAccount: (account: Account) => void;
  onSelectCluster: (cluster: Cluster) => void;
  onSelectProject?: (cluster: Cluster, project: never) => void;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function SupportDesk({
  selectedAccount,
  onSelectAccount,
  onSelectCluster,
}: SupportDeskProps) {
  const [search, setSearch]   = useState("");
  const [copied, setCopied]   = useState(false);

  const handleCopy = () => {
    if (!selectedAccount) return;
    navigator.clipboard.writeText(selectedAccount.accountId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto-select first account
  useEffect(() => {
    if (!selectedAccount && MOCK_ACCOUNTS.length > 0) {
      onSelectAccount(MOCK_ACCOUNTS[0]);
    }
  }, []);

  const accountClusters = useMemo(
    () => selectedAccount ? MOCK_CLUSTERS.filter((c) => c.accountId === selectedAccount.id) : MOCK_CLUSTERS,
    [selectedAccount]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return accountClusters;
    return accountClusters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.ip.includes(q) ||
        (c.location ?? "").toLowerCase().includes(q)
    );
  }, [accountClusters, search]);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#F3F4F6" }}>

      {/* ── Search bar ── */}
      <div className="bg-white border-b border-gray-200 px-5 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clusters by name, IP, or region..."
            className="w-full pl-9 pr-4 py-2 text-[13px] rounded bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-[#00775B]/20 focus:border-[#00775B] transition-all placeholder-gray-400"
          />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto p-5">

        {/* Account context banner */}
        {selectedAccount && (
          <div className="group flex items-center gap-2 mb-4 text-[13px] text-gray-500">
            <span>
              You are now in{" "}
              <span className="font-semibold text-gray-800">{selectedAccount.name}</span>
            </span>
            <span className="font-mono text-gray-400">({selectedAccount.accountId})</span>
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1 text-gray-400 hover:text-gray-700"
              title="Copy account ID"
            >
              {copied
                ? <CheckIcon className="w-3.5 h-3.5 text-green-500" />
                : <Copy className="w-3.5 h-3.5" />
              }
            </button>
          </div>
        )}

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
            {filtered.map((cluster) => (
              <ClusterCard
                key={cluster.id}
                cluster={cluster}
                onClick={() => onSelectCluster(cluster)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Server className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-[14px] font-medium text-gray-500">No clusters found</p>
            <p className="text-[12px] text-gray-400 mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
