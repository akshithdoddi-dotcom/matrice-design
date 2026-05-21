import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Zap, MapPin, Package, Activity } from "lucide-react";

// ─── Typography ───────────────────────────────────────────────────────────────
const MONO: React.CSSProperties  = { fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace" };
const INTER: React.CSSProperties = { fontFamily: "'Inter',sans-serif" };

// ─── Card style (shared between input + suggestions) ──────────────────────────
const CARD: React.CSSProperties = {
  background: "rgba(22,32,50,0.97)",
  border:     "1px solid rgba(255,255,255,0.11)",
  borderRadius: "4px",
  boxShadow:  "0 24px 64px rgba(0,0,0,0.60), 0 2px 8px rgba(0,0,0,0.30)",
};

// ─── Suggestion corpus ────────────────────────────────────────────────────────
interface Suggestion {
  id: string;
  text: string;
  category: "Actions" | "Objects" | "Locations";
}

const VMS_SUGGESTIONS: Suggestion[] = [
  { id: "va1", text: "Cleaning activity",      category: "Actions"   },
  { id: "va2", text: "Running person",         category: "Actions"   },
  { id: "va3", text: "PPE violation",          category: "Actions"   },
  { id: "va4", text: "Loitering detected",     category: "Actions"   },
  { id: "va5", text: "Tailgating at door",     category: "Actions"   },
  { id: "va6", text: "Person falling",         category: "Actions"   },
  { id: "vo1", text: "Blue shirt",             category: "Objects"   },
  { id: "vo2", text: "Yellow safety vest",     category: "Objects"   },
  { id: "vo3", text: "Hard hat",               category: "Objects"   },
  { id: "vo4", text: "Forklift",               category: "Objects"   },
  { id: "vo5", text: "Unattended bag",         category: "Objects"   },
  { id: "vo6", text: "Red delivery truck",     category: "Objects"   },
  { id: "vo7", text: "Black sedan",            category: "Objects"   },
  { id: "vl1", text: "Loading Dock B",         category: "Locations" },
  { id: "vl2", text: "Main Entrance",          category: "Locations" },
  { id: "vl3", text: "Server Room",            category: "Locations" },
  { id: "vl4", text: "Parking Lot",            category: "Locations" },
  { id: "vl5", text: "Lobby Entrance",         category: "Locations" },
  { id: "vl6", text: "Rooftop Garden",         category: "Locations" },
  { id: "vl7", text: "Emergency Exit B",       category: "Locations" },
];

const ANALYTICS_SUGGESTIONS: Suggestion[] = [
  { id: "aa1", text: "Unauthorized access",    category: "Actions"   },
  { id: "aa2", text: "After-hours access",     category: "Actions"   },
  { id: "aa3", text: "Crowd density spike",    category: "Actions"   },
  { id: "aa4", text: "Fence breach",           category: "Actions"   },
  { id: "aa5", text: "Door held open",         category: "Actions"   },
  { id: "aa6", text: "Slip / Fall risk",       category: "Actions"   },
  { id: "ao1", text: "PPE violation",          category: "Objects"   },
  { id: "ao2", text: "Compliance breach",      category: "Objects"   },
  { id: "ao3", text: "Unattended baggage",     category: "Objects"   },
  { id: "ao4", text: "Anomalous behavior",     category: "Objects"   },
  { id: "ao5", text: "Fire hazard",            category: "Objects"   },
  { id: "al1", text: "Building A",             category: "Locations" },
  { id: "al2", text: "Entrance Zone",          category: "Locations" },
  { id: "al3", text: "Server Room",            category: "Locations" },
  { id: "al4", text: "Loading Zone",           category: "Locations" },
  { id: "al5", text: "Parking Area",           category: "Locations" },
  { id: "al6", text: "Break Area",             category: "Locations" },
];

const EXAMPLE_PROMPTS = [
  "Blue shirt guy cleaning the room",
  "Red delivery truck at loading dock B",
  "Forklift moving without lights",
  "Person in yellow vest near exit",
  "Unattended bag in lobby",
];

const QUICK_TAGS_VMS       = ["Blue shirt", "Yellow safety vest", "Hard hat", "Forklift", "Unattended bag", "PPE violation"];
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
  onClose:  () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function CommandPalette({ platform, onSearch, onClose }: CommandPaletteProps) {
  const [query,       setQuery]       = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef                      = useRef<HTMLInputElement>(null);

  const corpus    = platform === "vms" ? VMS_SUGGESTIONS      : ANALYTICS_SUGGESTIONS;
  const quickTags = platform === "vms" ? QUICK_TAGS_VMS       : QUICK_TAGS_ANALYTICS;

  // Auto-focus
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, []);

  // Escape closes
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // Suggestions
  const isEmpty  = query.trim() === "";
  const filtered = isEmpty
    ? []
    : corpus.filter(s => s.text.toLowerCase().includes(query.toLowerCase()));

  const grouped: Record<string, Suggestion[]> = {};
  filtered.forEach(s => { (grouped[s.category] ??= []).push(s); });

  const flatItems = (["Actions", "Objects", "Locations"] as const).flatMap(cat => grouped[cat] ?? []);
  useEffect(() => setActiveIndex(-1), [query]);

  // Execute
  const execute = useCallback((text: string) => {
    onSearch(text);
    onClose();
  }, [onSearch, onClose]);

  // Keyboard nav
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && flatItems[activeIndex]) execute(flatItems[activeIndex].text);
      else if (query.trim()) execute(query.trim());
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, flatItems.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, -1)); }
  };

  // Show suggestions panel when: empty (show examples) OR has typed results OR no results msg
  const showPanel = true; // always render panel to show examples/results

  return (
    <div
      className="fixed inset-0 z-[600] flex justify-center"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(8px)", paddingTop: "16vh" }}
      onClick={onClose}
    >
      {/* ── Two-card stack with 12px gap ─────────────────────────────────── */}
      <div
        className="w-[680px] max-w-[calc(100vw-2rem)] flex flex-col animate-in fade-in zoom-in-95 duration-150"
        style={{ gap: "12px" }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Card 1: Input ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 h-[56px]" style={CARD}>
          <Search className="w-[18px] h-[18px] shrink-0" style={{ color: "rgba(255,255,255,0.50)" }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search objects, colors, actions, or analytical trends system-wide..."
            className="flex-1 bg-transparent outline-none"
            style={{ ...INTER, fontSize: "13px", color: "rgba(255,255,255,0.92)", letterSpacing: "0.01em" }}
          />
          {query ? (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="shrink-0 rounded p-1 transition-colors"
              style={{ color: "rgba(255,255,255,0.45)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.80)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd
              className="shrink-0 px-2 py-0.5 text-[10px]"
              style={{ ...MONO, color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: "3px", background: "rgba(255,255,255,0.05)" }}
            >
              ESC
            </kbd>
          )}
        </div>

        {/* ── Card 2: Suggestions (always present, content-height only) ───── */}
        <div style={CARD} className="overflow-hidden">

          {/* ── Empty state: examples + quick tags ─────────────────────── */}
          {isEmpty && (
            <div className="px-4 py-3">
              {/* Section header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <Zap className="w-3 h-3" style={{ color: "#00956D" }} />
                <span style={{ ...MONO, fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.55)" }}>
                  SUGGESTIONS
                </span>
                <span
                  className="ml-auto px-1.5 py-0.5 rounded"
                  style={{ ...MONO, fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", background: "rgba(0,119,91,0.20)", color: "#34D399", border: "1px solid rgba(0,119,91,0.30)" }}
                >
                  AI
                </span>
              </div>

              {/* Example prompts — WCAG AA contrast */}
              <div className="space-y-0.5 mb-1">
                {EXAMPLE_PROMPTS.slice(0, 3).map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => execute(ex)}
                    className="flex items-center gap-3 w-full px-2 py-2.5 rounded-md text-left transition-colors"
                    style={{ background: "transparent" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <Search className="w-3.5 h-3.5 shrink-0" style={{ color: "rgba(255,255,255,0.38)" }} />
                    <span style={{ ...INTER, fontSize: "12px", fontStyle: "italic", color: "rgba(255,255,255,0.82)" }}>
                      {ex}
                    </span>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="my-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />

              {/* Quick tags */}
              <div className="px-1 pb-1">
                <span style={{ ...MONO, fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>
                  QUICK TAGS
                </span>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {quickTags.map((tag, i) => (
                    <button
                      key={i}
                      onClick={() => execute(tag)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all"
                      style={{ ...INTER, fontSize: "11px", color: "rgba(255,255,255,0.80)", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.80)"; }}
                    >
                      <Package className="w-2.5 h-2.5 shrink-0" style={{ opacity: 0.65 }} />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Typed: categorised results ──────────────────────────────── */}
          {!isEmpty && filtered.length > 0 && (
            <div className="py-1.5">
              {(["Actions", "Objects", "Locations"] as const).map(cat => {
                const items = grouped[cat];
                if (!items?.length) return null;
                const Icon = CATEGORY_ICONS[cat];
                return (
                  <div key={cat} className="mb-0.5">
                    <div className="flex items-center gap-2 px-4 pt-2 pb-1">
                      <Icon className="w-3 h-3" style={{ color: "rgba(255,255,255,0.38)" }} />
                      <span style={{ ...MONO, fontSize: "10px", fontWeight: 700, letterSpacing: "0.10em", color: "rgba(255,255,255,0.50)", textTransform: "uppercase" }}>
                        {cat}
                      </span>
                    </div>
                    {items.map(s => {
                      const globalIdx = flatItems.indexOf(s);
                      const isActive  = activeIndex === globalIdx;
                      return (
                        <button
                          key={s.id}
                          onClick={() => execute(s.text)}
                          className="flex items-center gap-3 w-full px-5 py-2.5 text-left transition-colors"
                          style={{ background: isActive ? "rgba(255,255,255,0.07)" : "transparent" }}
                          onMouseEnter={() => setActiveIndex(globalIdx)}
                          onMouseLeave={() => setActiveIndex(-1)}
                        >
                          <Search className="w-3 h-3 shrink-0" style={{ color: "rgba(255,255,255,0.30)" }} />
                          <span style={{ ...INTER, fontSize: "12px", color: isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.82)" }}>
                            {s.text}
                          </span>
                          {isActive && (
                            <span className="ml-auto shrink-0" style={{ ...MONO, fontSize: "9px", color: "rgba(255,255,255,0.28)" }}>
                              ↵ search
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── No results ──────────────────────────────────────────────── */}
          {!isEmpty && filtered.length === 0 && (
            <div className="px-4 py-8 flex flex-col items-center gap-2 text-center">
              <Search className="w-5 h-5" style={{ color: "rgba(255,255,255,0.18)" }} />
              <span style={{ ...INTER, fontSize: "12px", color: "rgba(255,255,255,0.55)" }}>
                No suggestions for <em>"{query}"</em>
              </span>
              <span style={{ ...INTER, fontSize: "11px", color: "rgba(255,255,255,0.32)" }}>
                Press Enter to search anyway
              </span>
            </div>
          )}

          {/* ── Footer hint bar ─────────────────────────────────────────── */}
          <div
            className="flex items-center gap-4 px-4 py-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
          >
            {[
              { key: "↵",   label: "search"   },
              { key: "↑↓",  label: "navigate" },
              { key: "esc", label: "close"     },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-1.5">
                <kbd
                  className="px-1.5 py-0.5"
                  style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.38)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "3px", background: "rgba(255,255,255,0.05)" }}
                >
                  {key}
                </kbd>
                <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.28)" }}>{label}</span>
              </div>
            ))}
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00956D] animate-pulse" />
              <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.22)" }}>
                Vision Intelligence · {platform === "vms" ? "VMS" : "Analytics"}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
