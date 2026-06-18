import { useState, useRef, useCallback, useEffect } from "react";
import {
  MousePointer2, Square, PenTool, ZoomIn, ZoomOut, Trash2,
  Type, Wand2, ChevronDown, ChevronRight, Search, X, Eye,
  EyeOff, Lock, Unlock, MessageCircle, Clock, BookOpen,
  SkipForward, Check, ThumbsDown, Sparkles, Plus, Minus,
  Tag, Layers, AlertCircle, RotateCcw, Sun, Moon,
} from "lucide-react";
import { MatriceLogo } from "@fe-common/shared/svgs";
import { cn } from "@/app/lib/utils";

// ─── Image assets (from public/) ──────────────────────────────────────────────

const IMAGES = [
  { id: "img-1", src: "/1_qre-gAVNTuazaUPvNw2w-Q.jpg",   label: "Vehicle 01" },
  { id: "img-2", src: "/images.jpeg",                       label: "Vehicle 02" },
  { id: "img-3", src: "/images (1).jpeg",                   label: "Vehicle 03" },
  { id: "img-4", src: "/images (2).jpeg",                   label: "Vehicle 04" },
  { id: "img-5", src: "/images (3).jpeg",                   label: "Vehicle 05" },
  { id: "img-6", src: "/man3.jpg",                          label: "Person 01"  },
  { id: "img-7", src: "/man2.webp",                         label: "Person 02"  },
  { id: "img-8", src: "/AI-autism_900x600.jpg",             label: "Person 03"  },
  { id: "img-9", src: "/face_landmark.png",                 label: "Person 04"  },
];

// ─── Label taxonomy ────────────────────────────────────────────────────────────

const LABEL_TAXONOMY = [
  {
    group: "Vehicles",
    items: [
      { id: "car",        label: "Car",         color: "#0284C7" },
      { id: "truck",      label: "Truck",       color: "#0EA5E9" },
      { id: "bus",        label: "Bus",         color: "#6366F1" },
      { id: "motorcycle", label: "Motorcycle",  color: "#8B5CF6" },
      { id: "bicycle",    label: "Bicycle",     color: "#A78BFA" },
    ],
  },
  {
    group: "People",
    items: [
      { id: "person",      label: "Person",       color: "#00775B" },
      { id: "pedestrian",  label: "Pedestrian",   color: "#059669" },
      { id: "cyclist",     label: "Cyclist",      color: "#10B981" },
    ],
  },
  {
    group: "Traffic Signs",
    items: [
      { id: "stop-sign",  label: "Stop Sign",    color: "#EF4444" },
      { id: "speed-limit",label: "Speed Limit",  color: "#F59E0B" },
      { id: "yield",      label: "Yield",        color: "#F97316" },
    ],
  },
];

// ─── Tool definitions ──────────────────────────────────────────────────────────

const TOOLS = [
  { id: "cursor",   icon: MousePointer2, hotkey: "V",   label: "Select"        },
  { id: "bbox",     icon: Square,        hotkey: "B",   label: "Bounding Box"  },
  { id: "polygon",  icon: PenTool,       hotkey: "P",   label: "Polygon"       },
  { id: "wand",     icon: Wand2,         hotkey: "W",   label: "AI Magic Wand" },
  { id: "zoom-in",  icon: ZoomIn,        hotkey: "+",   label: "Zoom In"       },
  { id: "zoom-out", icon: ZoomOut,       hotkey: "-",   label: "Zoom Out"      },
  { id: "text",     icon: Type,          hotkey: "T",   label: "Text"          },
  { id: "delete",   icon: Trash2,        hotkey: "Del", label: "Delete"        },
] as const;

// ─── Types ─────────────────────────────────────────────────────────────────────

type Instance = {
  id: string;
  labelId: string;
  label: string;
  color: string;
  visible: boolean;
  locked: boolean;
  bbox: { x: number; y: number; w: number; h: number };
};

// ─── Tool button ───────────────────────────────────────────────────────────────

function ToolButton({
  tool, active, onClick, dark,
}: { tool: typeof TOOLS[number]; active: boolean; onClick: () => void; dark: boolean }) {
  const Icon = tool.icon;
  const activeBg = "#00775B";
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        title={`${tool.label} (${tool.hotkey})`}
        className={cn(
          "w-9 h-9 flex items-center justify-center rounded-lg transition-all",
          active
            ? "text-white shadow"
            : dark
              ? "text-neutral-400 hover:bg-white/10 hover:text-white"
              : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
        )}
        style={active ? { backgroundColor: activeBg } : undefined}
      >
        <Icon className="w-4 h-4" />
      </button>
      {/* Tooltip */}
      <div className={cn(
        "pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50",
        "flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity",
        "rounded-lg px-3 py-1.5 whitespace-nowrap shadow-xl border text-[11px] font-medium",
        dark
          ? "bg-neutral-800 border-white/10 text-white"
          : "bg-white border-neutral-200 text-neutral-800 shadow-md"
      )}>
        {tool.label}
        <kbd className={cn(
          "text-[9px] font-mono px-1.5 py-0.5 rounded",
          dark ? "bg-white/10 text-neutral-400" : "bg-neutral-100 text-neutral-500"
        )}>
          {tool.hotkey}
        </kbd>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function AnnotationEditor() {
  const [dark, setDark] = useState<boolean>(() => {
    try { return localStorage.getItem("matrice-annotation-theme") === "dark"; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("matrice-annotation-theme", dark ? "dark" : "light"); } catch {}
  }, [dark]);

  const [activeTool,       setActiveTool]       = useState<string>("bbox");
  const [selectedLabel,    setSelectedLabel]    = useState<string>("car");
  const [labelSearch,      setLabelSearch]      = useState("");
  const [expandedGroups,   setExpandedGroups]   = useState<Set<string>>(
    new Set(["Vehicles", "People", "Traffic Signs"])
  );
  const [instances,        setInstances]        = useState<Instance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [utilityTab,       setUtilityTab]       = useState<"issues" | "history" | "guidelines">("guidelines");
  const [modelPredictions, setModelPredictions] = useState(false);
  const [activeImageIdx,   setActiveImageIdx]   = useState(0);
  const [zoom,             setZoom]             = useState(100);

  const canvasRef  = useRef<HTMLDivElement>(null);
  const [drawing,  setDrawing]  = useState(false);
  const [drawStart,setDrawStart]= useState<{ x: number; y: number } | null>(null);
  const [drawRect, setDrawRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const activeImage  = IMAGES[activeImageIdx];
  const activeLabel  = LABEL_TAXONOMY.flatMap(g => g.items).find(i => i.id === selectedLabel);
  const labeled      = Math.floor(activeImageIdx * 3.7 + 14);
  const totalImages  = IMAGES.length * 10;

  const filteredTaxonomy = LABEL_TAXONOMY.map(g => ({
    ...g,
    items: g.items.filter(i => i.label.toLowerCase().includes(labelSearch.toLowerCase())),
  })).filter(g => g.items.length > 0 || !labelSearch);

  const toggleGroup    = (g: string) => setExpandedGroups(prev => {
    const n = new Set(prev); n.has(g) ? n.delete(g) : n.add(g); return n;
  });
  const toggleInstance = (id: string, f: "visible" | "locked") =>
    setInstances(prev => prev.map(i => i.id === id ? { ...i, [f]: !i[f] } : i));
  const deleteInstance = (id: string) => {
    setInstances(prev => prev.filter(i => i.id !== id));
    if (selectedInstance === id) setSelectedInstance(null);
  };

  const getPct = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
  }, []);

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== "bbox") return;
    setDrawStart(getPct(e)); setDrawing(true); setDrawRect(null);
  };
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawing || !drawStart) return;
    const pt = getPct(e);
    setDrawRect({
      x: Math.min(drawStart.x, pt.x), y: Math.min(drawStart.y, pt.y),
      w: Math.abs(pt.x - drawStart.x), h: Math.abs(pt.y - drawStart.y),
    });
  };
  const onMouseUp = () => {
    if (!drawing || !drawRect || drawRect.w < 2 || drawRect.h < 2) {
      setDrawing(false); setDrawStart(null); setDrawRect(null); return;
    }
    if (!activeLabel) return;
    const inst: Instance = {
      id: `inst-${Date.now()}`, labelId: activeLabel.id, label: activeLabel.label,
      color: activeLabel.color, visible: true, locked: false, bbox: drawRect,
    };
    setInstances(prev => [...prev, inst]);
    setSelectedInstance(inst.id);
    setDrawing(false); setDrawStart(null); setDrawRect(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, string> = { v: "cursor", b: "bbox", p: "polygon", w: "wand", t: "text" };
      if (map[e.key.toLowerCase()]) setActiveTool(map[e.key.toLowerCase()]);
      if (e.key === "+" || e.key === "=") setZoom(z => Math.min(z + 25, 400));
      if (e.key === "-") setZoom(z => Math.max(z - 25, 25));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Reset instances when image changes
  useEffect(() => { setInstances([]); setSelectedInstance(null); }, [activeImageIdx]);

  // Design system tokens (GUIDELINES1.1.md)
  const primary = dark ? "#00D4AA" : "#00775B";
  const primaryHover = dark ? "#00F5C4" : "#004E3D";
  const surface = dark
    ? { bg: "bg-[#020617]", header: "bg-[#021d18] border-white/[0.07]", toolbar: "bg-[#0F172A] border-white/[0.07]", panel: "bg-[#0F172A] border-white/[0.07]", canvas: "bg-[#020617]", text: "text-white", subtext: "text-neutral-400", divider: "border-white/[0.07]", input: "bg-white/5 border-white/10 text-white placeholder:text-neutral-600", hover: "hover:bg-white/[0.05]" }
    : { bg: "bg-[#F1F5F9]", header: "bg-[#021d18] border-white/[0.07]", toolbar: "bg-white border-neutral-200", panel: "bg-white border-neutral-200", canvas: "bg-[#E2E8F0]", text: "text-neutral-900", subtext: "text-neutral-500", divider: "border-neutral-200", input: "bg-neutral-50 border-neutral-200 text-neutral-800 placeholder:text-neutral-400", hover: "hover:bg-neutral-50" };

  return (
    <div className={cn("h-screen w-screen flex overflow-hidden select-none", surface.bg)}>

      {/* ── Left Sidebar (logo + tools, full height) ────────────────────────── */}
      <div className="w-12 flex-shrink-0 flex flex-col items-center bg-[#021d18] border-r border-white/[0.07]">

        {/* Logo */}
        <div className="w-full flex items-center justify-center h-11 border-b border-white/[0.07] flex-shrink-0">
          <MatriceLogo size={22} />
        </div>

        {/* Tools */}
        <div className="flex flex-col items-center py-3 gap-1 flex-1 overflow-hidden">
          {TOOLS.map(tool => (
            <ToolButton key={tool.id} tool={tool} active={activeTool === tool.id} onClick={() => setActiveTool(tool.id)} dark={true} />
          ))}

          <div className="flex-1" />

          {/* Model predictions */}
          <div className="relative group mb-1">
            <button onClick={() => setModelPredictions(p => !p)}
              className={cn("w-9 h-9 flex items-center justify-center rounded-lg transition-all",
                modelPredictions ? "bg-violet-500/20 text-violet-400" : "text-neutral-500 hover:text-white hover:bg-white/10"
              )}>
              <Sparkles className="w-4 h-4" />
            </button>
            <div className={cn(
              "pointer-events-none absolute left-full ml-3 bottom-0 z-50",
              "flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity",
              "rounded-lg px-3 py-1.5 whitespace-nowrap shadow-xl border text-[11px] font-medium",
              dark ? "bg-neutral-800 border-white/10 text-white" : "bg-white border-neutral-200 text-neutral-800 shadow-md"
            )}>
              {modelPredictions ? "Hide" : "Show"} AI Predictions
            </div>
          </div>
        </div>
      </div>

      {/* ── Main area (header + canvas + right panel + filmstrip) ───────────── */}
      <div className="flex flex-col flex-1 overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className={cn("h-11 flex items-center justify-between px-4 border-b flex-shrink-0 z-10", surface.header)}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-neutral-400">Vehicle Detection</span>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <span className="text-[11px] text-neutral-400">Batch 3_Training</span>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <span className="text-[12px] font-semibold text-white">{activeImage.label}</span>
        </div>

        {/* Center: progress */}
        <div className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
          <span className="text-[11px] text-neutral-400">{labeled} / {totalImages} labeled</span>
          <div className="w-36 h-1.5 rounded-full overflow-hidden bg-white/10">
            <div className="h-full rounded-full transition-all" style={{ width: `${(labeled / totalImages) * 100}%`, backgroundColor: "#00775B" }} />
          </div>
          <span className="text-[11px] font-semibold text-[#00775B]">{Math.round((labeled / totalImages) * 100)}%</span>
        </div>

        {/* Right: theme toggle + actions */}
        <div className="flex items-center gap-2">
          <button onClick={() => setDark(d => !d)}
            className="w-7 h-7 flex items-center justify-center rounded-md transition-colors text-neutral-400 hover:bg-white/10 hover:text-white">
            {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <div className="w-px h-5 bg-white/10" />
          <button className="flex items-center gap-1.5 h-7 px-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-500 text-[11px] font-semibold hover:bg-red-500/20 transition-colors">
            <ThumbsDown className="w-3 h-3" /> Reject
            <kbd className="text-[9px] font-mono px-1 rounded ml-0.5 bg-red-500/20">R</kbd>
          </button>
          <button className="flex items-center gap-1.5 h-7 px-3 rounded-md border text-[11px] font-semibold transition-colors bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10">
            <SkipForward className="w-3 h-3" /> Skip
            <kbd className="text-[9px] font-mono px-1 rounded ml-0.5 bg-white/10">Esc</kbd>
          </button>
          <button className="flex items-center gap-1.5 h-7 px-4 rounded-md text-white text-[11px] font-bold transition-colors shadow-sm bg-[#00775B] hover:bg-[#004E3D]">
            <Check className="w-3 h-3" /> Approve
            <kbd className="text-[9px] font-mono bg-white/20 px-1 rounded ml-0.5">Space</kbd>
          </button>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Canvas ──────────────────────────────────────────────────────── */}
        <div className={cn("flex-1 relative overflow-hidden flex items-center justify-center", surface.canvas)}>
          <div
            ref={canvasRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            className={cn("relative overflow-hidden shadow-2xl rounded", activeTool === "bbox" ? "cursor-crosshair" : "cursor-default")}
            style={{ width: `${Math.min(zoom, 100)}%`, maxWidth: 820, aspectRatio: "4/3" }}
          >
            {/* Actual image */}
            <img
              src={activeImage.src}
              alt={activeImage.label}
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />

            {/* Annotation boxes */}
            {instances.filter(i => i.visible).map(inst => {
              const sel = inst.id === selectedInstance;
              return (
                <div key={inst.id} onClick={() => setSelectedInstance(inst.id)}
                  className="absolute cursor-pointer"
                  style={{ left: `${inst.bbox.x}%`, top: `${inst.bbox.y}%`, width: `${inst.bbox.w}%`, height: `${inst.bbox.h}%` }}
                >
                  <div className="absolute inset-0 rounded-sm"
                    style={{ border: `2px solid ${inst.color}`, backgroundColor: `${inst.color}22` }} />
                  {sel && (
                    <>
                      {["-translate-x-1/2 -translate-y-1/2 top-0 left-0",
                        "translate-x-1/2 -translate-y-1/2 top-0 right-0",
                        "-translate-x-1/2 translate-y-1/2 bottom-0 left-0",
                        "translate-x-1/2 translate-y-1/2 bottom-0 right-0"].map((cls, i) => (
                        <div key={i} className={cn("absolute w-2.5 h-2.5 rounded-sm border-2 bg-white", cls)}
                          style={{ borderColor: inst.color }} />
                      ))}
                      <div className="absolute -top-6 left-0 px-1.5 py-0.5 rounded-t text-[10px] font-bold text-white whitespace-nowrap"
                        style={{ backgroundColor: inst.color }}>{inst.label}</div>
                    </>
                  )}
                  {!sel && (
                    <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded-t text-[10px] font-semibold text-white whitespace-nowrap opacity-80"
                      style={{ backgroundColor: inst.color }}>{inst.label}</div>
                  )}
                </div>
              );
            })}

            {/* Drawing ghost */}
            {drawing && drawRect && (
              <div className="absolute pointer-events-none rounded-sm"
                style={{
                  left: `${drawRect.x}%`, top: `${drawRect.y}%`,
                  width: `${drawRect.w}%`, height: `${drawRect.h}%`,
                  border: `2px dashed ${activeLabel?.color ?? primary}`,
                  backgroundColor: `${activeLabel?.color ?? primary}18`,
                }}
              />
            )}

            {/* AI prediction overlay */}
            {modelPredictions && (
              <div className="absolute pointer-events-none" style={{ left: "8%", top: "12%", width: "38%", height: "65%" }}>
                <div className="absolute inset-0 rounded-sm border-2 border-dashed border-violet-400" style={{ backgroundColor: "#7C3AED18" }} />
                <div className="absolute -top-6 left-0 flex items-center gap-1 px-1.5 py-0.5 rounded-t text-[10px] font-bold text-white bg-violet-600 whitespace-nowrap">
                  <Sparkles className="w-2.5 h-2.5" /> Vehicle · 91%
                </div>
              </div>
            )}
          </div>

          {/* Zoom / reset controls */}
          <div className={cn(
            "absolute bottom-4 left-4 flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px]",
            dark ? "bg-black/50 backdrop-blur-sm" : "bg-white/80 backdrop-blur-sm border border-neutral-200 shadow-sm"
          )}>
            <button onClick={() => setZoom(z => Math.max(z - 25, 25))} className={cn("transition-colors", dark ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-800")}>
              <Minus className="w-3 h-3" />
            </button>
            <span className={cn("font-mono w-10 text-center", surface.subtext)}>{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(z + 25, 400))} className={cn("transition-colors", dark ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-800")}>
              <Plus className="w-3 h-3" />
            </button>
            <button onClick={() => setZoom(100)} className={cn("ml-1 transition-colors", dark ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-800")}>
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Label pill showing active selection */}
          {activeLabel && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-neutral-200 dark:border-white/10 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: activeLabel.color }} />
              <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">{activeLabel.label}</span>
              <kbd className="text-[9px] font-mono bg-neutral-100 dark:bg-white/10 text-neutral-500 px-1 rounded">B</kbd>
            </div>
          )}
        </div>

        {/* ── Right Panel ─────────────────────────────────────────────────── */}
        <div className={cn("w-64 flex-shrink-0 flex flex-col border-l overflow-hidden", surface.panel)}>

          {/* ── Labels section ── */}
          <div className={cn("flex-1 flex flex-col overflow-hidden border-b", surface.divider)}>
            <div className={cn("flex items-center justify-between px-4 py-2.5 border-b", surface.divider)}>
              <div className="flex items-center gap-2">
                <Tag className={cn("w-3.5 h-3.5", surface.subtext)} />
                <span className={cn("text-[11px] font-bold uppercase tracking-wider", surface.subtext)}>Labels</span>
              </div>
              <span className={cn("text-[10px]", dark ? "text-neutral-600" : "text-neutral-400")}>
                {LABEL_TAXONOMY.flatMap(g => g.items).length} classes
              </span>
            </div>

            {/* Search */}
            <div className={cn("px-3 py-2 border-b", surface.divider)}>
              <div className={cn("flex items-center gap-2 h-8 rounded-md px-3 border", surface.input)}>
                <Search className={cn("w-3 h-3 flex-shrink-0", surface.subtext)} />
                <input
                  value={labelSearch}
                  onChange={e => setLabelSearch(e.target.value)}
                  placeholder="Search labels…"
                  className="flex-1 bg-transparent text-[11px] outline-none min-w-0"
                />
                {labelSearch && (
                  <button onClick={() => setLabelSearch("")}>
                    <X className={cn("w-3 h-3 transition-colors", dark ? "text-neutral-500 hover:text-white" : "text-neutral-400 hover:text-neutral-700")} />
                  </button>
                )}
              </div>
            </div>

            {/* Tree */}
            <div className="flex-1 overflow-y-auto py-1">
              {filteredTaxonomy.map(group => (
                <div key={group.group}>
                  <button onClick={() => toggleGroup(group.group)}
                    className={cn("w-full flex items-center gap-2 px-4 py-2 transition-colors", surface.hover)}>
                    {expandedGroups.has(group.group)
                      ? <ChevronDown className={cn("w-3 h-3", surface.subtext)} />
                      : <ChevronRight className={cn("w-3 h-3", surface.subtext)} />
                    }
                    <span className={cn("text-[11px] font-semibold flex-1 text-left", surface.text)}>{group.group}</span>
                    <span className={cn("text-[10px]", dark ? "text-neutral-600" : "text-neutral-400")}>{group.items.length}</span>
                  </button>

                  {expandedGroups.has(group.group) && group.items.map(item => (
                    <button key={item.id} onClick={() => setSelectedLabel(item.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 pl-9 pr-4 py-1.5 transition-colors text-left",
                        selectedLabel === item.id
                          ? dark ? "bg-white/[0.08] text-white" : "bg-[#E5FFF9]"
                          : cn(dark ? "text-neutral-400" : "text-neutral-600", surface.hover, dark ? "hover:text-neutral-200" : "hover:text-neutral-800")
                      )}
                      style={selectedLabel === item.id && !dark ? { color: primary } : undefined}>
                      <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-[11px] flex-1 truncate">{item.label}</span>
                      {selectedLabel === item.id && (
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: primary }} />
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* ── Instances section ── */}
          <div className={cn("border-b", surface.divider)}>
            <div className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Layers className={cn("w-3.5 h-3.5", surface.subtext)} />
                <span className={cn("text-[11px] font-bold uppercase tracking-wider", surface.subtext)}>Objects</span>
              </div>
              <span className={cn("text-[10px]", dark ? "text-neutral-600" : "text-neutral-400")}>{instances.length} on screen</span>
            </div>

            <div className="max-h-40 overflow-y-auto pb-1">
              {instances.length === 0 ? (
                <p className={cn("text-[10px] px-4 pb-3", dark ? "text-neutral-600" : "text-neutral-400")}>
                  No annotations yet. Select the Bounding Box tool and draw.
                </p>
              ) : instances.map(inst => {
                const sel = inst.id === selectedInstance;
                return (
                  <div key={inst.id} onClick={() => setSelectedInstance(inst.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors group/inst",
                      sel ? (dark ? "bg-white/8" : "bg-[#E5FFF9]") : surface.hover
                    )}>
                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: inst.color }} />
                    <span className={cn("text-[11px] flex-1 truncate", sel ? (dark ? "text-white" : "") : surface.subtext)} style={sel && !dark ? { color: primary } : undefined}>
                      {inst.label}
                    </span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover/inst:opacity-100 transition-opacity">
                      {[
                        { icon: inst.visible ? Eye : EyeOff, action: () => toggleInstance(inst.id, "visible"), danger: false },
                        { icon: inst.locked ? Lock : Unlock, action: () => toggleInstance(inst.id, "locked"), danger: false },
                        { icon: Trash2, action: () => deleteInstance(inst.id), danger: true },
                      ].map(({ icon: Icon, action, danger }, i) => (
                        <button key={i} onClick={e => { e.stopPropagation(); action(); }}
                          className={cn(
                            "w-5 h-5 flex items-center justify-center rounded transition-colors",
                            danger
                              ? "text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                              : dark ? "text-neutral-500 hover:text-white hover:bg-white/10" : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                          )}>
                          <Icon className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Utility tabs ── */}
          <div className="flex flex-col flex-shrink-0">
            <div className={cn("flex border-b", surface.divider)}>
              {([
                { id: "issues",     icon: AlertCircle, label: "Issues"  },
                { id: "history",    icon: Clock,       label: "History" },
                { id: "guidelines", icon: BookOpen,    label: "Guide"   },
              ] as const).map(tab => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setUtilityTab(tab.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-semibold transition-colors border-b-2",
                      utilityTab === tab.id ? "border-b-2" : cn("border-transparent", dark ? "text-neutral-600 hover:text-neutral-400" : "text-neutral-400 hover:text-neutral-600")
                    )}
                    style={utilityTab === tab.id ? { color: primary, borderBottomColor: primary } : undefined}>
                    <Icon className="w-3 h-3" /> {tab.label}
                  </button>
                );
              })}
            </div>
            <div className="p-3 max-h-36 overflow-y-auto">
              {utilityTab === "issues" && (
                <div className="flex flex-col gap-2">
                  <button className={cn("flex items-center justify-center gap-1.5 h-7 w-full rounded-md border border-dashed text-[11px] transition-colors",
                    dark ? "border-white/10 text-neutral-500 hover:text-neutral-300" : "border-neutral-200 text-neutral-400 hover:text-neutral-700")}>
                    <Plus className="w-3 h-3" /> Add Issue
                  </button>
                  <p className={cn("text-[10px] text-center", dark ? "text-neutral-600" : "text-neutral-400")}>No issues reported.</p>
                </div>
              )}
              {utilityTab === "history" && (
                <div className="flex flex-col gap-2">
                  {instances.slice(-3).reverse().map((inst, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: primary }} />
                      <div>
                        <p className={cn("text-[11px]", surface.text)}>Box created: {inst.label}</p>
                        <p className={cn("text-[10px]", dark ? "text-neutral-600" : "text-neutral-400")}>just now</p>
                      </div>
                    </div>
                  ))}
                  {instances.length === 0 && (
                    <p className={cn("text-[10px]", dark ? "text-neutral-600" : "text-neutral-400")}>No history yet.</p>
                  )}
                </div>
              )}
              {utilityTab === "guidelines" && (
                <p className={cn("text-[11px] leading-relaxed", dark ? "text-neutral-500" : "text-neutral-500")}>
                  Draw tight bounding boxes around each object. Include the full body for people, full chassis for vehicles. Label partial objects only if &gt;50% is visible.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Filmstrip ───────────────────────────────────────────────────────── */}
      <div className={cn("h-[72px] flex-shrink-0 flex items-center gap-2 px-4 border-t overflow-x-auto", surface.toolbar, surface.divider)}>
        <button onClick={() => setActiveImageIdx(i => Math.max(0, i - 1))}
          className={cn("flex-shrink-0 w-6 h-6 flex items-center justify-center rounded transition-colors", dark ? "text-neutral-500 hover:text-white hover:bg-white/10" : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100")}>
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>

        {IMAGES.map((img, idx) => (
          <button key={img.id} onClick={() => setActiveImageIdx(idx)}
            className={cn("flex-shrink-0 relative w-[68px] h-[50px] rounded overflow-hidden border-2 transition-all",
              idx !== activeImageIdx && (dark ? "border-transparent opacity-50 hover:opacity-80" : "border-transparent opacity-60 hover:opacity-100")
            )}
            style={idx === activeImageIdx ? { borderColor: primary, boxShadow: `0 4px 12px ${primary}33` } : undefined}>
            <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
            <div className="absolute bottom-0.5 left-1 text-[8px] font-mono text-white drop-shadow">
              {String(idx + 1).padStart(2, "0")}
            </div>
          </button>
        ))}

        <button onClick={() => setActiveImageIdx(i => Math.min(IMAGES.length - 1, i + 1))}
          className={cn("flex-shrink-0 w-6 h-6 flex items-center justify-center rounded transition-colors", dark ? "text-neutral-500 hover:text-white hover:bg-white/10" : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100")}>
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className={cn("ml-auto flex items-center gap-1.5 text-[10px] flex-shrink-0", dark ? "text-neutral-500" : "text-neutral-400")}>
          <MessageCircle className="w-3 h-3" /> Use ← → arrow keys to navigate
        </div>
      </div>
      </div>
    </div>
  );
}
