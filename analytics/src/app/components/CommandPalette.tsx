import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, X, Zap, MapPin, Package, Activity,
} from "lucide-react";

// ─── Typography shorthands ────────────────────────────────────────────────────
const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace" };
const INTER: React.CSSProperties = { fontFamily: "'Inter',sans-serif" };

// ─── Suggestion corpus ────────────────────────────────────────────────────────

interface Suggestion {
  id: string;
  text: string;
  category: "Actions" | "Objects" | "Locations";
}

const VMS_SUGGESTIONS: Suggestion[] = [
  // Actions
  { id: "va1", text: "Cleaning activity",           category: "Actions"   },
  { id: "va2", text: "Running person",              category: "Actions"   },
  { id: "va3", text: "PPE violation",               category: "Actions"   },
  { id: "va4", text: "Loitering detected",          category: "Actions"   },
  { id: "va5", text: "Tailgating at door",          category: "Actions"   },
  { id: "va6", text: "Person falling",              category: "Actions"   },
  // Objects
  { id: "vo1", text: "Blue shirt",                  category: "Objects"   },
  { id: "vo2", text: "Yellow safety vest",          category: "Objects"   },
  { id: "vo3", text: "Hard hat",                    category: "Objects"   },
  { id: "vo4", text: "Forklift",                    category: "Objects"   },
  { id: "vo5", text: "Unattended bag",              category: "Objects"   },
  { id: "vo6", text: "Red delivery truck",          category: "Objects"   },
  { id: "vo7", text: "Black sedan",                 category: "Objects"   },
  // Locations
  { id: "vl1", text: "Loading Dock B",              category: "Locations" },
  { id: "vl2", text: "Main Entrance",               category: "Locations" },
  { id: "vl3", text: "Server Room",                 category: "Locations" },
  { id: "vl4", text: "Parking Lot",                 category: "Locations" },
  { id: "vl5", text: "Lobby Entrance",              category: "Locations" },
  { id: "vl6", text: "Rooftop Garden",              category: "Locations" },
  { id: "vl7", text: "Emergency Exit B",            category: "Locations" },
];

const ANALYTICS_SUGGESTIONS: Suggestion[] = [
  // Actions
  { id: "aa1", text: "Unauthorized access",         category: "Actions"   },
  { id: "aa2", text: "After-hours access",          category: "Actions"   },
  { id: "aa3", text: "Crowd density spike",         category: "Actions"   },
  { id: "aa4", text: "Fence breach",                category: "Actions"   },
  { id: "aa5", text: "Door held open",              category: "Actions"   },
  { id: "aa6", text: "Slip / Fall risk",            category: "Actions"   },
  // Objects
  { id: "ao1", text: "PPE violation",               category: "Objects"   },
  { id: "ao2", text: "Compliance breach",           category: "Objects"   },
  { id: "ao3", text: "Unattended baggage",          category: "Objects"   },
  { id: "ao4", text: "Anomalous behavior",          category: "Objects"   },
  { id: "ao5", text: "Fire hazard",                 category: "Objects"   },
  // Locations
  { id: "al1", text: "Building A",                  category: "Locations" },
  { id: "al2", text: "Entrance Zone",               category: "Locations" },
  { id: "al3", text: "Server Room",                 category: "Locations" },
  { id: "al4", text: "Loading Zone",                category: "Locations" },
  { id: "al5", text: "Parking Area",                category: "Locations" },
  { id: "al6", text: "Break Area",                  category: "Locations" },
];

const EXAMPLE_PROMPTS = [
  "Blue shirt guy cleaning the room",
  "Red delivery truck at loading dock B",
  "Forklift moving without lights",
  "Person in yellow vest near exit",
  "Unattended bag in lobby",
];

const QUICK_TAGS_VMS      = ["Blue shirt", "Yellow safety vest", "Hard hat", "Forklift", "Unattended bag", "PPE violation"];
const QUICK_TAGS_ANALYTICS = ["Unauthorized access", "PPE violation", "After-hours", "Compliance breach", "Crowd density", "Fire hazard"];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Actions:   Activity,
  Objects:   Package,
  Locations: MapPin,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface CommandPaletteProps {
  platform: "vms" | "analytics";
  onSearch: (query: string) => void;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CommandPalette({ platform, onSearch, onClose }: CommandPaletteProps) {
  const [query,        setQuery]        = useState("");
  const [activeIndex,  setActiveIndex]  = useState(-1);
  const inputRef                        = useRef<HTMLInputElement>(null);

  const corpus    = platform === "vms" ? VMS_SUGGESTIONS : ANALYTICS_SUGGESTIONS;
  const quickTags = platform === "vms" ? QUICK_TAGS_VMS  : QUICK_TAGS_ANALYTICS;

  // ── Auto-focus on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, []);

  // ── Dismiss on Escape ────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // ── Filtered + grouped suggestions ──────────────────────────────────────────
  const isEmpty   = query.trim() === "";
  const filtered  = isEmpty
    ? []
    : corpus.filter(s => s.text.toLowerCase().includes(query.toLowerCase()));

  const grouped: Record<string, Suggestion[]> = {};
  filtered.forEach(s => { (grouped[s.category] ??= []).push(s); });

  // Flat list for keyboard navigation
  const flatItems = (["Actions", "Objects", "Locations"] as const)
    .flatMap(cat => grouped[cat] ?? []);

  // Reset activeIndex when query changes
  useEffect(() => setActiveIndex(-1), [query]);

  // ── Execute ──────────────────────────────────────────────────────────────────
  const execute = useCallback((text: string) => {
    onSearch(text);
    onClose();
  }, [onSearch, onClose]);

  // ── Keyboard navigation ──────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && flatItems[activeIndex]) {
        execute(flatItems[activeIndex].text);
      } else if (query.trim()) {
        execute(query.trim());
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, flatItems.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-[600] flex justify-center"
      style={{
        background:     "rgba(15,23,42,0.4)",
        backdropFilter: "blur(8px)",
        paddingTop:     "18vh",
      }}
      onClick={onClose}
    >
      {/* ── Container ─────────────────────────────────────────────────────── */}
      <div
        className="w-[680px] max-w-[calc(100vw-2rem)] rounded-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        style={{
          background: "rgba(30,41,59,0.92)",
          border:     "1px solid rgba(255,255,255,0.10)",
          borderRadius: "4px",
          boxShadow:  "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(0,0,0,0.12)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Input row ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 h-14"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <Search className="w-4 h-4 text-white/40 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search objects, colors, actions, or analytical trends system-wide..."
            className="flex-1 bg-transparent text-[13px] text-white placeholder:text-white/28 outline-none"
            style={INTER}
          />
          {query ? (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="text-white/30 hover:text-white/65 transition-colors shrink-0 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-0.5 shrink-0">
              <kbd className="text-[9px] px-1.5 py-0.5 rounded text-white/25"
                style={{ ...MONO, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)" }}>
                ESC
              </kbd>
            </div>
          )}
        </div>

        {/* ── Dropdown body ──────────────────────────────────────────────── */}
        <div className="max-h-[380px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">

          {/* ── Empty state ──────────────────────────────────────────────── */}
          {isEmpty && (
            <div className="px-4 py-3">
              {/* Section header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <Zap className="w-3 h-3 text-[#00956D]" />
                <span className="text-[10px] font-bold tracking-widest text-white/35 uppercase"
                  style={MONO}>
                  SEMANTIC VIDEO SEARCH
                </span>
                <span
                  className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-bold tracking-widest"
                  style={{
                    ...MONO,
                    background: "rgba(0,119,91,0.18)",
                    color: "#34D399",
                    border: "1px solid rgba(0,119,91,0.28)",
                  }}
                >
                  AI
                </span>
              </div>

              {/* Example prompts */}
              <div className="space-y-0.5 mb-1">
                {EXAMPLE_PROMPTS.slice(0, 3).map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => execute(ex)}
                    className="flex items-center gap-3 w-full px-2 py-2.5 rounded-md hover:bg-white/6 transition-colors group text-left"
                  >
                    <Search className="w-3.5 h-3.5 text-white/18 group-hover:text-white/40 shrink-0 transition-colors" />
                    <span
                      className="text-[12px] text-white/48 group-hover:text-white/78 italic transition-colors"
                      style={INTER}
                    >
                      {ex}
                    </span>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="my-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

              {/* Quick tags */}
              <div className="px-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/22"
                  style={MONO}>
                  QUICK TAGS
                </span>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {quickTags.map((tag, i) => (
                    <button
                      key={i}
                      onClick={() => execute(tag)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] text-white/55 hover:text-white/85 transition-all"
                      style={{
                        ...INTER,
                        border:     "1px solid rgba(255,255,255,0.10)",
                        background: "rgba(255,255,255,0.05)",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                    >
                      <Package className="w-2.5 h-2.5 opacity-55 shrink-0" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Typed suggestions (categorised) ──────────────────────────── */}
          {!isEmpty && filtered.length > 0 && (
            <div className="py-1.5">
              {(["Actions", "Objects", "Locations"] as const).map(cat => {
                const items = grouped[cat];
                if (!items?.length) return null;
                const Icon = CATEGORY_ICONS[cat];
                return (
                  <div key={cat} className="mb-0.5">
                    {/* Category label */}
                    <div className="flex items-center gap-2 px-4 pt-2 pb-1">
                      <Icon className="w-3 h-3 text-white/22" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/28"
                        style={MONO}>
                        {cat}
                      </span>
                    </div>
                    {/* Items */}
                    {items.map(s => {
                      const globalIdx = flatItems.indexOf(s);
                      const isActive  = activeIndex === globalIdx;
                      return (
                        <button
                          key={s.id}
                          onClick={() => execute(s.text)}
                          className="flex items-center gap-3 w-full px-5 py-2 text-left transition-colors"
                          style={{ background: isActive ? "rgba(255,255,255,0.06)" : "transparent" }}
                          onMouseEnter={() => setActiveIndex(globalIdx)}
                          onMouseLeave={() => setActiveIndex(-1)}
                        >
                          <Search className="w-3 h-3 text-white/18 shrink-0" />
                          <span
                            className="text-[12px] transition-colors"
                            style={{ ...INTER, color: isActive ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.62)" }}
                          >
                            {s.text}
                          </span>
                          {isActive && (
                            <span className="ml-auto text-[9px] text-white/22 shrink-0" style={MONO}>↵ search</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── No matches ───────────────────────────────────────────────── */}
          {!isEmpty && filtered.length === 0 && (
            <div className="px-4 py-9 flex flex-col items-center gap-2 text-center">
              <Search className="w-5 h-5 text-white/15" />
              <span className="text-[12px] text-white/35" style={INTER}>
                No suggestions for <span className="italic">"{query}"</span>
              </span>
              <span className="text-[11px] text-white/20" style={INTER}>
                Press Enter to search anyway
              </span>
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-4 px-4 py-2"
          style={{
            borderTop:  "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {[
            { key: "↵",  label: "search"   },
            { key: "↑↓", label: "navigate" },
            { key: "esc", label: "close"    },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-1.5 text-[10px] text-white/20" style={MONO}>
              <kbd
                className="px-1.5 py-0.5 rounded"
                style={{ border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.05)" }}
              >
                {key}
              </kbd>
              <span>{label}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-1.5 text-[10px] text-white/18" style={MONO}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00956D] animate-pulse" />
            Vision Intelligence · {platform === "vms" ? "VMS" : "Analytics"}
          </div>
        </div>
      </div>
    </div>
  );
}
