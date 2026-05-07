import { useState, useRef, useEffect } from "react";
import {
  X, Plus, Trash2, Camera, Grid3x3, Layers, Save, Upload,
  ChevronRight, ChevronLeft, Check, ZoomIn, ZoomOut, Move, Ruler, Pencil,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";

// ── Types ──────────────────────────────────────────────────────────────────

interface Floor {
  id: string;
  name: string;
}

interface Scale {
  pxPerUnit: number;
  unit: string;
}

interface ZoneConfig {
  id: string;
  name: string;
  cells: Set<string>;
  color: string;
  floor: string;
}

interface CameraViewpoint {
  id: string;
  cameraId: string;
  cameraName: string;
  cells: Set<string>;
  floor: string;
  color: string;
  intraZoneSections?: IntraZoneSection[];
}

interface IntraZoneSection {
  id: string;
  name: string;
  cells: Set<string>;
  color: string;
}

interface FloorPlan {
  floor: string; // floor ID
  imageUrl: string;
  naturalWidth: number;
  naturalHeight: number;
}

interface GridDims {
  cols: number;
  rows: number;
  canvasW: number;
  canvasH: number;
}

interface AlignRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CameraDevice {
  id: string;
  name: string;
}

interface ScalePoint {
  x: number;
  y: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const MOCK_CAMERAS: CameraDevice[] = [
  { id: "CAM-001", name: "Main Entrance" },
  { id: "CAM-002", name: "Server Room Hallway" },
  { id: "CAM-003", name: "Loading Dock Bay 1" },
  { id: "CAM-004", name: "Parking Lot North" },
  { id: "CAM-005", name: "Restricted Area C3" },
  { id: "CAM-006", name: "Cafeteria Overview" },
  { id: "CAM-007", name: "Lobby Reception" },
  { id: "CAM-008", name: "Perimeter North Gate" },
  { id: "CAM-009", name: "Warehouse Floor A" },
  { id: "CAM-010", name: "Emergency Exit B" },
];

const ZONE_COLORS = [
  "#00A63E", "#0088CC", "#E19A04", "#9333EA",
  "#EC4899", "#F97316", "#14B8A6", "#8B5CF6",
];

const CAMERA_VIEWPOINT_COLORS = [
  "#FF6B6B", "#4ECDC4", "#95E1D3", "#F3A683",
  "#6C5CE7", "#A8E6CF", "#FFD3B6", "#FFAAA5",
];

const CELL_SIZE = 24;
const HANDLE_SIZE = 14;

// ── Helpers ────────────────────────────────────────────────────────────────

const getGridDims = (fp: FloorPlan | null): GridDims => {
  if (!fp) return { cols: 40, rows: 28, canvasW: 960, canvasH: 672 };
  const cols = Math.max(10, Math.round(fp.naturalWidth / CELL_SIZE));
  const rows = Math.max(8, Math.round(fp.naturalHeight / CELL_SIZE));
  return { cols, rows, canvasW: cols * CELL_SIZE, canvasH: rows * CELL_SIZE };
};

const getBrushCells = (
  gx: number,
  gy: number,
  bs: number,
  gd: GridDims,
): { x: number; y: number }[] => {
  const cells: { x: number; y: number }[] = [];
  for (let dy = 0; dy < bs; dy++) {
    for (let dx = 0; dx < bs; dx++) {
      const nx = gx + dx;
      const ny = gy + dy;
      if (nx >= 0 && nx < gd.cols && ny >= 0 && ny < gd.rows) {
        cells.push({ x: nx, y: ny });
      }
    }
  }
  return cells;
};

const getZoneOutlinePath = (cells: Set<string>, cellSize: number): string => {
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  cells.forEach((cell) => {
    const [cx, cy] = cell.split(",").map(Number);
    const x = cx * cellSize;
    const y = cy * cellSize;
    const s = cellSize;
    if (!cells.has(`${cx},${cy - 1}`)) edges.push({ x1: x, y1: y, x2: x + s, y2: y });
    if (!cells.has(`${cx},${cy + 1}`)) edges.push({ x1: x, y1: y + s, x2: x + s, y2: y + s });
    if (!cells.has(`${cx - 1},${cy}`)) edges.push({ x1: x, y1: y, x2: x, y2: y + s });
    if (!cells.has(`${cx + 1},${cy}`)) edges.push({ x1: x + s, y1: y, x2: x + s, y2: y + s });
  });
  if (edges.length === 0) return "";

  const edgeMap = new Map<string, { x: number; y: number }[]>();
  const key = (x: number, y: number) => `${x},${y}`;
  for (const e of edges) {
    const k1 = key(e.x1, e.y1);
    const k2 = key(e.x2, e.y2);
    if (!edgeMap.has(k1)) edgeMap.set(k1, []);
    if (!edgeMap.has(k2)) edgeMap.set(k2, []);
    edgeMap.get(k1)!.push({ x: e.x2, y: e.y2 });
    edgeMap.get(k2)!.push({ x: e.x1, y: e.y1 });
  }

  const paths: string[] = [];
  const usedEdges = new Set<string>();
  for (const e of edges) {
    const ek = `${e.x1},${e.y1}-${e.x2},${e.y2}`;
    if (usedEdges.has(ek)) continue;
    const pts: { x: number; y: number }[] = [{ x: e.x1, y: e.y1 }, { x: e.x2, y: e.y2 }];
    usedEdges.add(ek);
    usedEdges.add(`${e.x2},${e.y2}-${e.x1},${e.y1}`);
    let cur = { x: e.x2, y: e.y2 };
    let prev = { x: e.x1, y: e.y1 };
    for (let i = 0; i < edges.length; i++) {
      const neighbors = edgeMap.get(key(cur.x, cur.y)) || [];
      let moved = false;
      for (const nb of neighbors) {
        const ek2 = `${cur.x},${cur.y}-${nb.x},${nb.y}`;
        if (!usedEdges.has(ek2) && (nb.x !== prev.x || nb.y !== prev.y)) {
          usedEdges.add(ek2);
          usedEdges.add(`${nb.x},${nb.y}-${cur.x},${cur.y}`);
          pts.push(nb);
          prev = cur;
          cur = nb;
          moved = true;
          break;
        }
      }
      if (!moved) break;
    }
    if (pts.length > 2) {
      paths.push(`M ${pts.map((p) => `${p.x} ${p.y}`).join(" L ")} Z`);
    }
  }
  return paths.join(" ");
};

const getSVGPoint = (
  svgEl: SVGSVGElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } => {
  const ctm = svgEl.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const inv = ctm.inverse();
  const pt = svgEl.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const tp = pt.matrixTransform(inv);
  return { x: tp.x, y: tp.y };
};

// ── Canvas Container ───────────────────────────────────────────────────────

interface CanvasContainerProps {
  canvasW: number;
  canvasH: number;
  children: React.ReactNode;
}

const CanvasContainer = ({ canvasW, canvasH, children }: CanvasContainerProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const ratio = canvasW / canvasH;
      if (width / height > ratio) {
        setDims({ w: Math.floor(height * ratio), h: Math.floor(height) });
      } else {
        setDims({ w: Math.floor(width), h: Math.floor(width / ratio) });
      }
    });
    obs.observe(wrapper);
    return () => obs.disconnect();
  }, [canvasW, canvasH]);

  return (
    <div ref={wrapperRef} className="flex-1 min-w-0 min-h-0 flex items-center justify-center p-4">
      <div
        className="relative overflow-hidden bg-neutral-900 rounded border-2 border-neutral-700 flex-shrink-0"
        style={{ width: dims.w || undefined, height: dims.h || undefined }}
      >
        {dims.w > 0 && children}
      </div>
    </div>
  );
};

// ── Floor Plan Upload (Step 1) ─────────────────────────────────────────────

interface FloorPlanUploadProps {
  floors: Floor[];
  onFloorsChange: (floors: Floor[]) => void;
  floorPlans: FloorPlan[];
  onFloorPlanUpload: (floorId: string, imageUrl: string, w: number, h: number) => void;
  onDeleteFloorPlan: (floorId: string) => void;
}

const FloorPlanUpload = ({
  floors,
  onFloorsChange,
  floorPlans,
  onFloorPlanUpload,
  onDeleteFloorPlan,
}: FloorPlanUploadProps) => {
  const fileInputRefs = useRef<{ [floorId: string]: HTMLInputElement | null }>({});
  const [editingFloorId, setEditingFloorId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const addFloor = () => {
    const newFloor: Floor = { id: `floor-${Date.now()}`, name: `Floor ${floors.length + 1}` };
    onFloorsChange([...floors, newFloor]);
  };

  const deleteFloor = (id: string) => {
    if (floors.length === 1) return;
    onFloorsChange(floors.filter((f) => f.id !== id));
    onDeleteFloorPlan(id);
  };

  const startEdit = (floor: Floor) => {
    setEditingFloorId(floor.id);
    setEditName(floor.name);
  };

  const commitEdit = () => {
    if (!editingFloorId) return;
    const name = editName.trim() || floors.find((f) => f.id === editingFloorId)?.name || "";
    onFloorsChange(floors.map((f) => (f.id === editingFloorId ? { ...f, name } : f)));
    setEditingFloorId(null);
    setEditName("");
  };

  const handleFileChange = (floorId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      console.error('Failed to read file');
    };
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (!url) return;

      const img = new Image();
      img.onerror = () => {
        console.error('Failed to load image');
      };
      img.onload = () => {
        onFloorPlanUpload(floorId, url, img.naturalWidth, img.naturalHeight);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-6">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold uppercase tracking-widest text-neutral-800">Floors</div>
            <div className="text-xs text-neutral-400 mt-0.5">Upload one floor plan per level. You can rename each floor.</div>
          </div>
          <button
            onClick={addFloor}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#00775B] text-white rounded text-xs font-bold uppercase tracking-wide hover:bg-[#005f48] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Floor
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {floors.map((floor, floorIndex) => {
            const plan = floorPlans.find((fp) => fp.floor === floor.id);
            const bgColors = [
              "bg-blue-50/70 border-blue-100",
              "bg-violet-50/70 border-violet-100",
              "bg-amber-50/60 border-amber-100",
              "bg-rose-50/60 border-rose-100",
              "bg-teal-50/60 border-teal-100",
            ];
            const colorClass = bgColors[floorIndex % bgColors.length];
            return (
              <div
                key={floor.id}
                className={`flex gap-3 p-4 rounded-lg border transition-colors ${colorClass}`}
              >
                {/* Thumbnail preview */}
                {plan ? (
                  <div className="flex-shrink-0 w-20 h-16 rounded overflow-hidden border border-neutral-200 bg-white">
                    <img
                      src={plan.imageUrl}
                      alt={`${floor.name} plan`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-20 h-16 rounded border-2 border-dashed border-neutral-200 bg-white/60 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-neutral-300" />
                  </div>
                )}

                {/* Floor info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                  {editingFloorId === floor.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit();
                        if (e.key === "Escape") setEditingFloorId(null);
                      }}
                      autoFocus
                      className="w-full px-2 py-1 text-sm font-semibold border border-[#00775B] rounded outline-none focus:ring-1 focus:ring-[#00775B] bg-white"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-neutral-800 truncate">{floor.name}</span>
                      <button
                        onClick={() => startEdit(floor)}
                        className="text-neutral-300 hover:text-neutral-500 transition-colors flex-shrink-0"
                        title="Rename floor"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {plan ? (
                    <div className="text-[10px] text-neutral-500 font-medium">
                      {plan.naturalWidth} × {plan.naturalHeight} px
                    </div>
                  ) : (
                    <div className="text-[10px] text-neutral-400">No floor plan uploaded</div>
                  )}
                </div>

                {/* Upload / replace */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {plan ? (
                    <>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#00775B]">
                        <Check className="w-3.5 h-3.5" />
                        Uploaded
                      </div>
                      <button
                        onClick={() => fileInputRefs.current[floor.id]?.click()}
                        className="px-2.5 py-1.5 text-xs font-semibold border border-neutral-200 rounded hover:border-[#00775B] hover:text-[#00775B] bg-white transition-colors"
                      >
                        Replace
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => fileInputRefs.current[floor.id]?.click()}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-2 border-dashed border-neutral-300 rounded hover:border-[#00775B] hover:text-[#00775B] bg-white transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Plan
                    </button>
                  )}
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteFloor(floor.id)}
                  disabled={floors.length === 1}
                  className="text-neutral-300 hover:text-red-400 transition-colors disabled:opacity-20 disabled:cursor-not-allowed flex-shrink-0 self-center"
                  title="Delete floor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <input
                  ref={(el) => { fileInputRefs.current[floor.id] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(floor.id, e)}
                />
              </div>
            );
          })}
        </div>

        {floors.length === 0 && (
          <div className="text-center text-neutral-400 text-sm py-8">
            Click "Add Floor" to get started.
          </div>
        )}

        <div className="text-xs text-neutral-400 bg-neutral-50 rounded p-3 border border-neutral-100">
          Tip: You'll align each floor plan to the grid and set the real-world scale in the next step.
        </div>
      </div>
    </div>
  );
};

// ── Align + Scale Step (Step 2) ────────────────────────────────────────────

interface AlignAndScaleStepProps {
  floorPlan: FloorPlan;
  gd: GridDims;
  alignRect: AlignRect;
  onAlignRectChange: (r: AlignRect) => void;
  onScaleChange: (scale: Scale | null) => void;
  existingScale: Scale | null;
  nextFloor: Floor | null;
  onNextFloor: () => void;
}

const AlignAndScaleStep = ({
  floorPlan,
  gd,
  alignRect,
  onAlignRectChange,
  onScaleChange,
  existingScale,
  nextFloor,
  onNextFloor,
}: AlignAndScaleStepProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [subMode, setSubMode] = useState<"align" | "scale">("align");

  const dragRef = useRef<{
    type: "move" | "corner";
    corner?: "tl" | "tr" | "bl" | "br";
    startX: number;
    startY: number;
    startRect: AlignRect;
  } | null>(null);

  const [scaleA, setScaleA] = useState<ScalePoint | null>(null);
  const [scaleB, setScaleB] = useState<ScalePoint | null>(null);
  const [distance, setDistance] = useState<string>("");
  const [unit, setUnit] = useState<"m" | "ft" | "cm" | "mm">("m");
  const [nextPoint, setNextPoint] = useState<"A" | "B">("A");

  // Skip the first effect run (component mount) to avoid clearing stored scale
  const mountedRef = useRef(false);

  const { canvasW, canvasH } = gd;
  const snapToGrid = (val: number) => Math.round(val / CELL_SIZE) * CELL_SIZE;

  const pixelDist =
    scaleA && scaleB
      ? Math.sqrt(Math.pow(scaleB.x - scaleA.x, 2) + Math.pow(scaleB.y - scaleA.y, 2))
      : null;
  const pxPerUnit =
    pixelDist && distance && parseFloat(distance) > 0
      ? pixelDist / parseFloat(distance)
      : null;
  const cellCount = pixelDist !== null ? pixelDist / CELL_SIZE : null;

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (pxPerUnit) {
      onScaleChange({ pxPerUnit, unit });
    }
  }, [scaleA, scaleB, distance, unit, pxPerUnit]);

  const clearScale = () => {
    setScaleA(null);
    setScaleB(null);
    setNextPoint("A");
    setDistance("");
    onScaleChange(null);
  };

  // Align drag handlers
  const handleAlignMouseDown = (
    e: React.MouseEvent<SVGElement>,
    type: "move" | "corner",
    corner?: "tl" | "tr" | "bl" | "br",
  ) => {
    if (subMode !== "align") return;
    e.stopPropagation();
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const pt = getSVGPoint(svgEl, e.clientX, e.clientY);
    dragRef.current = { type, corner, startX: pt.x, startY: pt.y, startRect: { ...alignRect } };
  };

  useEffect(() => {
    if (subMode !== "align") return;
    const handleMouseMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      const svgEl = svgRef.current;
      if (!drag || !svgEl) return;
      const pt = getSVGPoint(svgEl, e.clientX, e.clientY);
      const dx = pt.x - drag.startX;
      const dy = pt.y - drag.startY;
      const r = drag.startRect;
      if (drag.type === "move") {
        onAlignRectChange({ ...alignRect, x: r.x + dx, y: r.y + dy });
      } else if (drag.type === "corner" && drag.corner) {
        let newW = r.width;
        let newH = r.height;
        let newX = r.x;
        let newY = r.y;
        const aspect = r.width / r.height;
        if (drag.corner === "br") {
          newW = Math.max(CELL_SIZE * 2, r.width + dx);
          newH = newW / aspect;
        } else if (drag.corner === "bl") {
          newW = Math.max(CELL_SIZE * 2, r.width - dx);
          newH = newW / aspect;
          newX = r.x + r.width - newW;
        } else if (drag.corner === "tr") {
          newW = Math.max(CELL_SIZE * 2, r.width + dx);
          newH = newW / aspect;
          newY = r.y + r.height - newH;
        } else if (drag.corner === "tl") {
          newW = Math.max(CELL_SIZE * 2, r.width - dx);
          newH = newW / aspect;
          newX = r.x + r.width - newW;
          newY = r.y + r.height - newH;
        }
        onAlignRectChange({ x: newX, y: newY, width: newW, height: newH });
      }
    };
    const handleMouseUp = () => { dragRef.current = null; };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [subMode, alignRect, onAlignRectChange]);

  const handleScaleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (subMode !== "scale") return;
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const pt = getSVGPoint(svgEl, e.clientX, e.clientY);
    const snapped = { x: snapToGrid(pt.x), y: snapToGrid(pt.y) };
    if (nextPoint === "A") { setScaleA(snapped); setNextPoint("B"); }
    else { setScaleB(snapped); setNextPoint("A"); }
  };

  const handleZoom = (factor: number) => {
    const cx = alignRect.x + alignRect.width / 2;
    const cy = alignRect.y + alignRect.height / 2;
    const newW = alignRect.width * factor;
    const newH = alignRect.height * factor;
    onAlignRectChange({ x: cx - newW / 2, y: cy - newH / 2, width: newW, height: newH });
  };

  const handleFit = () => onAlignRectChange({ x: 0, y: 0, width: canvasW, height: canvasH });

  const scaleIsSet = pxPerUnit !== null || existingScale !== null;

  return (
    <div className="flex-1 flex min-h-0">
      <CanvasContainer canvasW={canvasW} canvasH={canvasH}>
        <svg
          ref={svgRef}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            display: "block", userSelect: "none",
            cursor: subMode === "align" ? "default" : "crosshair",
          }}
          viewBox={`0 0 ${canvasW} ${canvasH}`}
          preserveAspectRatio="none"
          onClick={handleScaleClick}
        >
          <defs>
            <pattern id="align-grid" width={CELL_SIZE} height={CELL_SIZE} patternUnits="userSpaceOnUse">
              <rect width={CELL_SIZE} height={CELL_SIZE} fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.4" />
            </pattern>
          </defs>

          {/* 1. Dark background */}
          <rect width={canvasW} height={canvasH} fill="#1a1a1a" />

          {/* 2. Floor plan image */}
          <image
            href={floorPlan.imageUrl}
            x={alignRect.x}
            y={alignRect.y}
            width={alignRect.width}
            height={alignRect.height}
            preserveAspectRatio="none"
            opacity={0.55}
            style={{
              cursor: subMode === "align" ? "move" : "default",
              pointerEvents: subMode === "align" ? "auto" : "none",
            }}
            onMouseDown={(e) => handleAlignMouseDown(e, "move")}
          />

          {/* 3. Grid ABOVE floor plan */}
          <rect width={canvasW} height={canvasH} fill="url(#align-grid)" style={{ pointerEvents: "none" }} />

          {/* 4. Alignment handles */}
          {subMode === "align" &&
            (
              [
                { id: "tl" as const, x: alignRect.x, y: alignRect.y },
                { id: "tr" as const, x: alignRect.x + alignRect.width, y: alignRect.y },
                { id: "bl" as const, x: alignRect.x, y: alignRect.y + alignRect.height },
                { id: "br" as const, x: alignRect.x + alignRect.width, y: alignRect.y + alignRect.height },
              ] as const
            ).map((h) => (
              <rect
                key={h.id}
                x={h.x - HANDLE_SIZE / 2}
                y={h.y - HANDLE_SIZE / 2}
                width={HANDLE_SIZE}
                height={HANDLE_SIZE}
                fill="#00775B"
                stroke="white"
                strokeWidth="1.5"
                rx="2"
                style={{ cursor: "nwse-resize" }}
                onMouseDown={(e) => handleAlignMouseDown(e, "corner", h.id)}
              />
            ))}

          {/* 5. Scale points */}
          {scaleA && (
            <>
              <circle cx={scaleA.x} cy={scaleA.y} r={6} fill="#FF6B6B" stroke="white" strokeWidth="2" />
              <text x={scaleA.x + 10} y={scaleA.y - 6} fill="#FF6B6B" fontSize="12" fontWeight="bold">A</text>
            </>
          )}
          {scaleB && (
            <>
              <circle cx={scaleB.x} cy={scaleB.y} r={6} fill="#4ECDC4" stroke="white" strokeWidth="2" />
              <text x={scaleB.x + 10} y={scaleB.y - 6} fill="#4ECDC4" fontSize="12" fontWeight="bold">B</text>
            </>
          )}
          {scaleA && scaleB && (
            <g>
              <line
                x1={scaleA.x} y1={scaleA.y} x2={scaleB.x} y2={scaleB.y}
                stroke="white" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7"
              />
              {cellCount !== null && (
                <>
                  <rect
                    x={(scaleA.x + scaleB.x) / 2 - 28}
                    y={(scaleA.y + scaleB.y) / 2 - 20}
                    width="56" height="16"
                    fill="rgba(0,0,0,0.65)" rx="3"
                    style={{ pointerEvents: "none" }}
                  />
                  <text
                    x={(scaleA.x + scaleB.x) / 2}
                    y={(scaleA.y + scaleB.y) / 2 - 9}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                    style={{ pointerEvents: "none" }}
                  >
                    {cellCount.toFixed(1)}× edge
                  </text>
                </>
              )}
            </g>
          )}
        </svg>
      </CanvasContainer>

      {/* Right panel */}
      <div className="w-64 flex-shrink-0 border-l border-neutral-200 bg-white flex flex-col overflow-hidden">
        {/* Mode toggle */}
        <div className="p-3 border-b border-neutral-100">
          <div className="flex gap-1 p-1 bg-neutral-100 rounded">
            <button
              onClick={() => setSubMode("align")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-colors",
                subMode === "align" ? "bg-white text-[#00775B] shadow-sm" : "text-neutral-400 hover:text-neutral-700",
              )}
            >
              <Move className="w-3 h-3" /> Align
            </button>
            <button
              onClick={() => setSubMode("scale")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-colors",
                subMode === "scale" ? "bg-white text-[#00775B] shadow-sm" : "text-neutral-400 hover:text-neutral-700",
              )}
            >
              <Ruler className="w-3 h-3" /> Scale
              {scaleIsSet && <span className="w-1.5 h-1.5 rounded-full bg-[#00775B] ml-0.5 flex-shrink-0" />}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
          {subMode === "align" ? (
            <>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Position & Size</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
                  {[
                    ["X", Math.round(alignRect.x)],
                    ["Y", Math.round(alignRect.y)],
                    ["W", Math.round(alignRect.width)],
                    ["H", Math.round(alignRect.height)],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-neutral-50 rounded px-2 py-1.5">
                      <span className="text-neutral-400 font-medium">{label} </span>
                      <span className="font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Zoom</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleZoom(1.2)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-neutral-200 rounded text-xs font-semibold hover:border-[#00775B] hover:text-[#00775B] transition-colors"
                  >
                    <ZoomIn className="w-3 h-3" /> In
                  </button>
                  <button
                    onClick={() => handleZoom(1 / 1.2)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-neutral-200 rounded text-xs font-semibold hover:border-[#00775B] hover:text-[#00775B] transition-colors"
                  >
                    <ZoomOut className="w-3 h-3" /> Out
                  </button>
                </div>
                <button
                  onClick={handleFit}
                  className="w-full mt-2 py-1.5 border border-neutral-200 rounded text-xs font-semibold hover:border-[#00775B] hover:text-[#00775B] transition-colors"
                >
                  Fit to Canvas
                </button>
              </div>
              <div className="text-xs text-neutral-400 bg-neutral-50 rounded p-2 leading-relaxed">
                Drag the image to reposition. Drag corners to resize proportionally.
              </div>
            </>
          ) : (
            <>
              {/* Existing scale indicator */}
              {existingScale && !pxPerUnit && (
                <div className="flex items-center gap-2 bg-[#E5FFF9] border border-[#00775B]/20 rounded p-2">
                  <Check className="w-3.5 h-3.5 text-[#00775B] flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-[#00775B]">Scale set</div>
                    <div className="text-[10px] text-[#00775B]/70">
                      1 cell ≈ {(CELL_SIZE / existingScale.pxPerUnit).toFixed(3)} {existingScale.unit}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Set Scale Points</div>
                <div className="text-xs text-neutral-500 bg-neutral-50 rounded p-2 mb-3 leading-relaxed">
                  Click two grid points on the canvas.
                  Next: <span className="font-bold text-neutral-700">{nextPoint}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "A", point: scaleA, color: "#FF6B6B", bg: "bg-red-50", border: "border-[#FF6B6B]" },
                    { label: "B", point: scaleB, color: "#4ECDC4", bg: "bg-teal-50", border: "border-[#4ECDC4]" },
                  ].map(({ label, point, color, bg, border }) => (
                    <div key={label} className={cn("flex items-center gap-2 px-3 py-2 rounded border text-xs", point ? `${border} ${bg}` : "border-neutral-200 bg-neutral-50")}>
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      {point ? (
                        <span className="text-neutral-700 font-semibold">{label} set ✓</span>
                      ) : (
                        <span className="text-neutral-400">Point {label} not set</span>
                      )}
                    </div>
                  ))}
                </div>
                {(scaleA || scaleB) && (
                  <button
                    onClick={clearScale}
                    className="w-full mt-2 py-1.5 text-xs font-semibold border border-neutral-200 rounded hover:border-red-300 hover:text-red-500 transition-colors"
                  >
                    Clear Points
                  </button>
                )}
              </div>

              {scaleA && scaleB && cellCount !== null && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Real-World Distance</div>
                  <div className="text-xs text-neutral-600 font-mono mb-2 bg-neutral-50 rounded px-2 py-1.5">
                    <span className="font-bold text-neutral-800">{cellCount.toFixed(1)}</span>
                    <span className="text-neutral-400"> × X = </span>
                    <span className="font-bold text-neutral-800">{distance || "?"}</span>
                    <span className="text-neutral-400"> {unit}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 mb-2">
                    <input
                      type="number"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      placeholder="distance…"
                      className="w-full border border-neutral-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00775B]"
                    />
                    <div className="flex gap-0.5">
                      {(["m", "ft", "cm", "mm"] as const).map((u) => (
                        <button
                          key={u}
                          onClick={() => setUnit(u)}
                          className={cn(
                            "px-1.5 py-1 text-[10px] font-bold rounded border transition-colors",
                            unit === u ? "bg-[#00775B] text-white border-[#00775B]" : "bg-white text-neutral-400 border-neutral-200 hover:border-[#00775B]",
                          )}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                  {pxPerUnit && (
                    <div className="bg-[#E5FFF9] rounded p-2 text-xs text-[#00775B]">
                      <div className="text-[10px] text-[#00775B]/70 font-mono mb-1">
                        {cellCount.toFixed(1)} × X = {distance} {unit}
                      </div>
                      <div className="font-bold text-sm">
                        1 cell = {(CELL_SIZE / pxPerUnit).toFixed(3)} {unit}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Next Floor button */}
              {nextFloor && scaleIsSet && (
                <button
                  onClick={onNextFloor}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-[#00775B] hover:bg-[#005f48] text-white rounded text-xs font-bold uppercase tracking-wide transition-colors mt-auto"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  Next: {nextFloor.name}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Zone Drawing Canvas (Step 3) ───────────────────────────────────────────

interface ZoneDrawingCanvasProps {
  floorPlan: FloorPlan | null;
  gd: GridDims;
  alignRect: AlignRect;
  zones: ZoneConfig[];
  currentFloor: string;
  onZonesChange: (zones: ZoneConfig[]) => void;
  selectedZone: string | null;
  onSelectedZoneChange: (id: string | null) => void;
  scale: Scale | null;
  nextFloor: Floor | null;
  onNextFloor: () => void;
}

const ZoneDrawingCanvas = ({
  floorPlan,
  gd,
  alignRect,
  zones,
  currentFloor,
  onZonesChange,
  selectedZone,
  onSelectedZoneChange,
  scale,
  nextFloor,
  onNextFloor,
}: ZoneDrawingCanvasProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [brushSize, setBrushSize] = useState<1 | 2 | 3>(1);
  const [drawMode, setDrawMode] = useState<"paint" | "erase">("paint");
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);
  const [newZoneName, setNewZoneName] = useState("");
  const [pendingCells, setPendingCells] = useState<Set<string>>(new Set());
  const isDrawingRef = useRef(false);

  // Zoom and Pan state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);

  const { canvasW, canvasH } = gd;
  const floorZones = zones.filter((z) => z.floor === currentFloor);
  const activeZone = floorZones.find((z) => z.id === selectedZone);

  // Zoom and Pan handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.5, 5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handlePanStart = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) { // Middle button or Shift+Left click
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (isPanning && panStartRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPanOffset(prev => ({
        x: prev.x + dx * (canvasW / 1000), // Scale based on canvas size
        y: prev.y + dy * (canvasH / 700)
      }));
      panStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePanEnd = () => {
    setIsPanning(false);
    panStartRef.current = null;
  };

  // Calculate viewBox with zoom and pan
  const viewBoxWidth = canvasW / zoomLevel;
  const viewBoxHeight = canvasH / zoomLevel;
  const viewBoxX = (canvasW - viewBoxWidth) / 2 - panOffset.x;
  const viewBoxY = (canvasH - viewBoxHeight) / 2 - panOffset.y;
  const viewBox = `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`;

  const getCellFromSVGPoint = (svgPt: { x: number; y: number }) => ({
    x: Math.floor(svgPt.x / CELL_SIZE),
    y: Math.floor(svgPt.y / CELL_SIZE),
  });

  const paintCells = (svgPt: { x: number; y: number }, mode: "paint" | "erase") => {
    if (!activeZone) return;
    const cell = getCellFromSVGPoint(svgPt);
    const brushCells = getBrushCells(cell.x, cell.y, brushSize, gd);
    const newCells = new Set(activeZone.cells);
    brushCells.forEach((bc) => {
      const k = `${bc.x},${bc.y}`;
      if (mode === "paint") newCells.add(k);
      else newCells.delete(k);
    });
    onZonesChange(zones.map((z) => (z.id === activeZone.id ? { ...z, cells: newCells } : z)));
  };

  const paintPending = (svgPt: { x: number; y: number }, mode: "paint" | "erase") => {
    const cell = getCellFromSVGPoint(svgPt);
    const brushCells = getBrushCells(cell.x, cell.y, brushSize, gd);
    const newPending = new Set(pendingCells);
    brushCells.forEach((bc) => {
      const k = `${bc.x},${bc.y}`;
      if (mode === "paint") newPending.add(k);
      else newPending.delete(k);
    });
    setPendingCells(newPending);
  };

  const handleSVGMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // Check for pan mode first
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      handlePanStart(e);
      return;
    }
    
    if (e.button !== 0 && e.button !== 2) return;
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const pt = getSVGPoint(svgEl, e.clientX, e.clientY);
    const cell = getCellFromSVGPoint(pt);

    if (!activeZone) {
      // Drawing into pending selection
      const k = `${cell.x},${cell.y}`;
      const mode = pendingCells.has(k) ? "erase" : "paint";
      setDrawMode(mode);
      isDrawingRef.current = true;
      paintPending(pt, mode);
    } else {
      // Drawing into active zone — toggle: click painted cell to erase
      const k = `${cell.x},${cell.y}`;
      const mode = e.button === 2 ? "erase" : (activeZone.cells.has(k) ? "erase" : "paint");
      setDrawMode(mode);
      isDrawingRef.current = true;
      paintCells(pt, mode);
    }
  };

  const handleSVGMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      handlePanMove(e);
      return;
    }
    
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const pt = getSVGPoint(svgEl, e.clientX, e.clientY);
    const cell = getCellFromSVGPoint(pt);
    if (cell.x >= 0 && cell.x < gd.cols && cell.y >= 0 && cell.y < gd.rows) {
      setHoverCell(cell);
    } else {
      setHoverCell(null);
    }
    if (isDrawingRef.current) {
      if (!activeZone) paintPending(pt, drawMode);
      else paintCells(pt, drawMode);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => { 
      isDrawingRef.current = false;
      handlePanEnd();
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const addZone = () => {
    if (!newZoneName.trim() || pendingCells.size === 0) return;
    const newZone: ZoneConfig = {
      id: `zone-${Date.now()}`,
      name: newZoneName.trim(),
      cells: new Set(pendingCells),
      color: ZONE_COLORS[floorZones.length % ZONE_COLORS.length],
      floor: currentFloor,
    };
    onZonesChange([...zones, newZone]);
    onSelectedZoneChange(null);
    setPendingCells(new Set());
    setNewZoneName("");
  };

  const deleteZone = (id: string) => {
    onZonesChange(zones.filter((z) => z.id !== id));
    if (selectedZone === id) onSelectedZoneChange(null);
  };

  const getZoneArea = (zone: ZoneConfig): string => {
    if (!scale || scale.pxPerUnit <= 0) return `${zone.cells.size} cells`;
    const cellSide = CELL_SIZE / scale.pxPerUnit;
    const area = zone.cells.size * cellSide * cellSide;
    return `${area.toFixed(1)} ${scale.unit}²`;
  };

  return (
    <div className="flex-1 flex min-h-0">
      <CanvasContainer canvasW={canvasW} canvasH={canvasH}>
        {/* Zoom/Pan Controls */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 bg-white/90 backdrop-blur-sm rounded-md shadow-md p-1">
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-neutral-100 rounded transition-colors"
            title="Zoom In (or scroll)"
          >
            <ZoomIn className="w-4 h-4 text-neutral-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-neutral-100 rounded transition-colors"
            title="Zoom Out (or scroll)"
          >
            <ZoomOut className="w-4 h-4 text-neutral-700" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 hover:bg-neutral-100 rounded transition-colors border-t border-neutral-200"
            title="Reset View"
          >
            <Move className="w-4 h-4 text-neutral-700" />
          </button>
          <div className="text-[9px] text-center text-neutral-500 font-mono px-1 border-t border-neutral-200 pt-1">
            {(zoomLevel * 100).toFixed(0)}%
          </div>
        </div>

        <svg
          ref={svgRef}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            display: "block", userSelect: "none",
            cursor: isPanning ? "grabbing" : "crosshair",
          }}
          viewBox={viewBox}
          preserveAspectRatio="none"
          onMouseDown={handleSVGMouseDown}
          onMouseMove={handleSVGMouseMove}
          onMouseLeave={() => {
            setHoverCell(null);
            handlePanEnd();
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <defs>
            <pattern id="zone-grid" width={CELL_SIZE} height={CELL_SIZE} patternUnits="userSpaceOnUse">
              <rect width={CELL_SIZE} height={CELL_SIZE} fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.35" />
            </pattern>
          </defs>

          {/* 1. Background */}
          <rect width={canvasW} height={canvasH} fill="#1a1a1a" />

          {/* 2. Floor plan */}
          {floorPlan && (
            <image
              href={floorPlan.imageUrl}
              x={alignRect.x}
              y={alignRect.y}
              width={alignRect.width}
              height={alignRect.height}
              preserveAspectRatio="none"
              opacity={0.55}
              style={{ pointerEvents: "none" }}
            />
          )}

          {/* 3. Grid ABOVE floor plan */}
          <rect width={canvasW} height={canvasH} fill="url(#zone-grid)" style={{ pointerEvents: "none" }} />

          {/* 4. Pending cells */}
          {Array.from(pendingCells).map((cellKey) => {
            const [cx, cy] = cellKey.split(",").map(Number);
            return (
              <rect
                key={`pending-${cellKey}`}
                x={cx * CELL_SIZE} y={cy * CELL_SIZE}
                width={CELL_SIZE} height={CELL_SIZE}
                fill="#00775B" opacity={0.5}
                style={{ pointerEvents: "none" }}
              />
            );
          })}

          {/* 5. Zone cells */}
          {floorZones.map((zone) =>
            Array.from(zone.cells).map((cellKey) => {
              const [cx, cy] = cellKey.split(",").map(Number);
              return (
                <rect
                  key={`${zone.id}-${cellKey}`}
                  x={cx * CELL_SIZE} y={cy * CELL_SIZE}
                  width={CELL_SIZE} height={CELL_SIZE}
                  fill={zone.color}
                  opacity={zone.id === selectedZone ? 0.65 : 0.4}
                  style={{ pointerEvents: "none" }}
                />
              );
            }),
          )}

          {/* 6. Zone outlines */}
          {floorZones.map((zone) => {
            const path = getZoneOutlinePath(zone.cells, CELL_SIZE);
            if (!path) return null;
            return (
              <path
                key={`outline-${zone.id}`}
                d={path} fill="none"
                stroke={zone.color}
                strokeWidth={zone.id === selectedZone ? 2.5 : 1.5}
                style={{ pointerEvents: "none" }}
              />
            );
          })}

          {/* 7. Hover preview */}
          {hoverCell &&
            getBrushCells(hoverCell.x, hoverCell.y, brushSize, gd).map((bc) => (
              <rect
                key={`hover-${bc.x}-${bc.y}`}
                x={bc.x * CELL_SIZE} y={bc.y * CELL_SIZE}
                width={CELL_SIZE} height={CELL_SIZE}
                fill={activeZone ? activeZone.color : "#00775B"}
                opacity={0.45}
                stroke={activeZone ? activeZone.color : "#00775B"}
                strokeWidth="1"
                style={{ pointerEvents: "none" }}
              />
            ))}
        </svg>
      </CanvasContainer>

      {/* Right panel */}
      <div className="w-64 flex-shrink-0 border-l border-neutral-200 bg-white flex flex-col overflow-hidden">
        {/* Brush size */}
        <div className="p-3 border-b border-neutral-100">
          <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Brush Size</div>
          <div className="flex gap-1">
            {([1, 2, 3] as const).map((bs) => (
              <button
                key={bs}
                onClick={() => setBrushSize(bs)}
                className={cn(
                  "flex-1 py-1.5 text-xs font-bold rounded border transition-colors",
                  brushSize === bs
                    ? "bg-[#00775B] text-white border-[#00775B]"
                    : "bg-white text-neutral-500 border-neutral-200 hover:border-[#00775B] hover:text-[#00775B]",
                )}
              >
                {bs}×{bs}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          {/* Add zone */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Add Zone</div>
            {pendingCells.size > 0 ? (
              <div className="flex items-center gap-1.5 bg-[#E5FFF9] rounded px-2 py-1.5 mb-2">
                <Check className="w-3 h-3 text-[#00775B] flex-shrink-0" />
                <span className="text-xs font-semibold text-[#00775B]">{pendingCells.size} cells selected</span>
              </div>
            ) : (
              <div className="text-xs text-neutral-400 bg-neutral-50 rounded p-2 mb-2 leading-relaxed">
                {activeZone
                  ? "Deselect current zone to draw a new selection."
                  : "Draw on the canvas to select cells, then name the zone."}
              </div>
            )}
            <div className="flex gap-1">
              <input
                type="text"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addZone()}
                placeholder="Zone name…"
                className="flex-1 border border-neutral-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00775B]"
              />
              <button
                onClick={addZone}
                disabled={!newZoneName.trim() || pendingCells.size === 0}
                title={pendingCells.size === 0 ? "Draw cells on the canvas first" : "Add zone"}
                className="px-2 py-1.5 bg-[#00775B] text-white rounded text-xs disabled:opacity-40 hover:bg-[#005f48] transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            {pendingCells.size > 0 && newZoneName.trim() === "" && (
              <p className="text-[10px] text-amber-500 mt-1 font-medium">Enter a name for this zone</p>
            )}
          </div>

          {/* Zones list */}
          {floorZones.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Zones</div>
              <div className="flex flex-col gap-1">
                {floorZones.map((zone) => (
                  <div
                    key={zone.id}
                    onClick={() => onSelectedZoneChange(selectedZone === zone.id ? null : zone.id)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-2 rounded cursor-pointer border transition-colors",
                      selectedZone === zone.id
                        ? "border-[#00775B] bg-green-50"
                        : "border-transparent hover:bg-neutral-50",
                    )}
                  >
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: zone.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-neutral-800 truncate">{zone.name}</div>
                      <div className="text-[10px] text-neutral-400 font-medium">{getZoneArea(zone)}</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteZone(zone.id); }}
                      className="text-neutral-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeZone && (
            <div className="text-xs bg-neutral-50 rounded p-2 text-neutral-500 leading-relaxed">
              Editing{" "}
              <span className="font-semibold" style={{ color: activeZone.color }}>
                {activeZone.name}
              </span>
              . Click painted cells to erase.
            </div>
          )}

          {/* Next Floor button */}
          {nextFloor && floorZones.length > 0 && (
            <button
              onClick={onNextFloor}
              className="w-full flex items-center justify-center gap-2 py-2 bg-[#00775B] hover:bg-[#005f48] text-white rounded text-xs font-bold uppercase tracking-wide transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              Next: {nextFloor.name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Camera Viewpoint Canvas (Step 4) ───────────────────────────────────────

interface CameraViewpointCanvasProps {
  floorPlan: FloorPlan | null;
  gd: GridDims;
  alignRect: AlignRect;
  zones: ZoneConfig[];
  cameraViewpoints: CameraViewpoint[];
  currentFloor: string;
  onCameraViewpointsChange: (cvs: CameraViewpoint[]) => void;
  nextFloor: Floor | null;
  onNextFloor: () => void;
}

const CameraViewpointCanvas = ({
  floorPlan,
  gd,
  alignRect,
  zones,
  cameraViewpoints,
  currentFloor,
  onCameraViewpointsChange,
  nextFloor,
  onNextFloor,
}: CameraViewpointCanvasProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedCVId, setSelectedCVId] = useState<string | null>(null);
  const [cvDrawMode, setCvDrawMode] = useState<"paint" | "erase">("paint");
  const isDrawingRef = useRef(false);

  // Zoom and Pan state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);

  // Intra Zone Sections state
  const [showIntraSections, setShowIntraSections] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [pendingSectionCells, setPendingSectionCells] = useState<Set<string>>(new Set());

  const { canvasW, canvasH } = gd;
  const floorCVs = cameraViewpoints.filter((cv) => cv.floor === currentFloor);
  const floorZones = zones.filter((z) => z.floor === currentFloor);
  const activeCv = floorCVs.find((cv) => cv.id === selectedCVId);

  // Zoom and Pan handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.5, 5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handlePanStart = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (isPanning && panStartRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPanOffset(prev => ({
        x: prev.x + dx * (canvasW / 1000),
        y: prev.y + dy * (canvasH / 700)
      }));
      panStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePanEnd = () => {
    setIsPanning(false);
    panStartRef.current = null;
  };

  // Calculate viewBox with zoom and pan
  const viewBoxWidth = canvasW / zoomLevel;
  const viewBoxHeight = canvasH / zoomLevel;
  const viewBoxX = (canvasW - viewBoxWidth) / 2 - panOffset.x;
  const viewBoxY = (canvasH - viewBoxHeight) / 2 - panOffset.y;
  const viewBox = `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`;

  const getCellFromSVGPoint = (svgPt: { x: number; y: number }) => ({
    x: Math.floor(svgPt.x / CELL_SIZE),
    y: Math.floor(svgPt.y / CELL_SIZE),
  });

  const paintCells = (svgPt: { x: number; y: number }, mode: "paint" | "erase") => {
    if (!activeCv) return;
    const cell = getCellFromSVGPoint(svgPt);
    if (cell.x < 0 || cell.x >= gd.cols || cell.y < 0 || cell.y >= gd.rows) return;
    const k = `${cell.x},${cell.y}`;
    const newCells = new Set(activeCv.cells);
    if (mode === "paint") newCells.add(k);
    else newCells.delete(k);
    onCameraViewpointsChange(
      cameraViewpoints.map((cv) => cv.id === activeCv.id ? { ...cv, cells: newCells } : cv),
    );
  };

  // Paint intra zone section cells
  const paintSectionCells = (svgPt: { x: number; y: number }, mode: "paint" | "erase") => {
    if (!showIntraSections || !activeCv) return;
    const cell = getCellFromSVGPoint(svgPt);
    if (cell.x < 0 || cell.x >= gd.cols || cell.y < 0 || cell.y >= gd.rows) return;
    const k = `${cell.x},${cell.y}`;
    
    // Check if cell is within the FOV
    if (!activeCv.cells.has(k)) return;

    if (selectedSectionId) {
      // Editing existing section
      const sections = activeCv.intraZoneSections || [];
      const section = sections.find(s => s.id === selectedSectionId);
      if (!section) return;
      
      const newCells = new Set(section.cells);
      if (mode === "paint") newCells.add(k);
      else newCells.delete(k);
      
      const updatedSections = sections.map(s => 
        s.id === selectedSectionId ? { ...s, cells: newCells } : s
      );
      
      onCameraViewpointsChange(
        cameraViewpoints.map((cv) => 
          cv.id === activeCv.id ? { ...cv, intraZoneSections: updatedSections } : cv
        ),
      );
    } else {
      // Adding to pending cells
      const newPending = new Set(pendingSectionCells);
      if (mode === "paint") newPending.add(k);
      else newPending.delete(k);
      setPendingSectionCells(newPending);
    }
  };

  const addIntraSection = () => {
    if (!activeCv || !newSectionName.trim() || pendingSectionCells.size === 0) return;
    
    const sections = activeCv.intraZoneSections || [];
    const newSection: IntraZoneSection = {
      id: `section-${Date.now()}`,
      name: newSectionName.trim(),
      cells: new Set(pendingSectionCells),
      color: `hsl(${(sections.length * 60) % 360}, 70%, 60%)`, // Generate colors
    };
    
    onCameraViewpointsChange(
      cameraViewpoints.map((cv) => 
        cv.id === activeCv.id 
          ? { ...cv, intraZoneSections: [...sections, newSection] } 
          : cv
      ),
    );
    
    setNewSectionName("");
    setPendingSectionCells(new Set());
    setSelectedSectionId(null);
  };

  const deleteIntraSection = (sectionId: string) => {
    if (!activeCv) return;
    const sections = activeCv.intraZoneSections || [];
    onCameraViewpointsChange(
      cameraViewpoints.map((cv) => 
        cv.id === activeCv.id 
          ? { ...cv, intraZoneSections: sections.filter(s => s.id !== sectionId) } 
          : cv
      ),
    );
    if (selectedSectionId === sectionId) setSelectedSectionId(null);
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      handlePanStart(e);
      return;
    }
    
    if (!activeCv || e.button !== 0) return;
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const pt = getSVGPoint(svgEl, e.clientX, e.clientY);
    const cell = getCellFromSVGPoint(pt);
    const k = `${cell.x},${cell.y}`;
    
    if (showIntraSections) {
      // In intra-section mode, paint sections within FOV
      const mode = selectedSectionId ? 
        ((activeCv.intraZoneSections?.find(s => s.id === selectedSectionId)?.cells.has(k)) ? "erase" : "paint") :
        (pendingSectionCells.has(k) ? "erase" : "paint");
      setCvDrawMode(mode);
      isDrawingRef.current = true;
      paintSectionCells(pt, mode);
    } else {
      // Regular FOV painting mode
      const mode = activeCv.cells.has(k) ? "erase" : "paint";
      setCvDrawMode(mode);
      isDrawingRef.current = true;
      paintCells(pt, mode);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      handlePanMove(e);
      return;
    }
    
    if (!isDrawingRef.current) return;
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const pt = getSVGPoint(svgEl, e.clientX, e.clientY);
    
    if (showIntraSections) {
      paintSectionCells(pt, cvDrawMode);
    } else {
      paintCells(pt, cvDrawMode);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => { isDrawingRef.current = false; };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const unassignedCameras = MOCK_CAMERAS.filter(
    (cam) => !cameraViewpoints.some((cv) => cv.cameraId === cam.id && cv.floor === currentFloor),
  );

  const addCamera = (cam: CameraDevice) => {
    const newCv: CameraViewpoint = {
      id: `cv-${Date.now()}`,
      cameraId: cam.id,
      cameraName: cam.name,
      cells: new Set(),
      floor: currentFloor,
      color: CAMERA_VIEWPOINT_COLORS[floorCVs.length % CAMERA_VIEWPOINT_COLORS.length],
    };
    onCameraViewpointsChange([...cameraViewpoints, newCv]);
    setSelectedCVId(newCv.id);
  };

  const removeCv = (id: string) => {
    onCameraViewpointsChange(cameraViewpoints.filter((cv) => cv.id !== id));
    if (selectedCVId === id) setSelectedCVId(null);
  };

  return (
    <div className="flex-1 flex min-h-0">
      <CanvasContainer canvasW={canvasW} canvasH={canvasH}>
        {/* Zoom and Pan Controls */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 flex items-center justify-center bg-white border border-neutral-300 rounded shadow-sm hover:bg-neutral-50 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-neutral-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 flex items-center justify-center bg-white border border-neutral-300 rounded shadow-sm hover:bg-neutral-50 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-neutral-700" />
          </button>
          <button
            onClick={handleResetView}
            className="w-8 h-8 flex items-center justify-center bg-white border border-neutral-300 rounded shadow-sm hover:bg-neutral-50 transition-colors text-[9px] font-mono font-bold text-neutral-700"
            title="Reset View"
          >
            1:1
          </button>
          <div className="text-[9px] text-center text-neutral-500 font-mono px-1 border-t border-neutral-200 pt-1 bg-white/80">
            {(zoomLevel * 100).toFixed(0)}%
          </div>
        </div>
        
        <svg
          ref={svgRef}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            display: "block", userSelect: "none",
            cursor: isPanning ? "grabbing" : (activeCv ? "crosshair" : "default"),
          }}
          viewBox={viewBox}
          preserveAspectRatio="none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            isDrawingRef.current = false;
            handlePanEnd();
          }}
        >
          <defs>
            <pattern id="cam-grid" width={CELL_SIZE} height={CELL_SIZE} patternUnits="userSpaceOnUse">
              <rect width={CELL_SIZE} height={CELL_SIZE} fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.2" />
            </pattern>
          </defs>

          <rect width={canvasW} height={canvasH} fill="#1a1a1a" />

          {floorPlan && (
            <image
              href={floorPlan.imageUrl}
              x={alignRect.x} y={alignRect.y}
              width={alignRect.width} height={alignRect.height}
              preserveAspectRatio="none"
              opacity={0.55}
              style={{ pointerEvents: "none" }}
            />
          )}

          <rect width={canvasW} height={canvasH} fill="url(#cam-grid)" style={{ pointerEvents: "none" }} />

          {/* Zone outlines only — solid border, no fill, chip label */}
          {floorZones.map((zone) => {
            const path = getZoneOutlinePath(zone.cells, CELL_SIZE);
            if (!path || zone.cells.size === 0) return null;
            const cellArr = Array.from(zone.cells);
            const avgCx = cellArr.reduce((s, k) => s + parseInt(k.split(",")[0]), 0) / cellArr.length;
            const avgCy = cellArr.reduce((s, k) => s + parseInt(k.split(",")[1]), 0) / cellArr.length;
            const labelX = (avgCx + 0.5) * CELL_SIZE;
            const labelY = (avgCy + 0.5) * CELL_SIZE;
            const chipW = Math.max(32, zone.name.length * 6 + 12);
            const chipH = 14;
            return (
              <g key={`zone-${zone.id}`} style={{ pointerEvents: "none" }}>
                <path
                  d={path}
                  fill="none"
                  stroke={zone.color}
                  strokeWidth="1.5"
                  opacity="0.9"
                />
                <rect
                  x={labelX - chipW / 2} y={labelY - chipH / 2}
                  width={chipW} height={chipH}
                  rx="3" ry="3"
                  fill={zone.color}
                  opacity="0.95"
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                >
                  {zone.name}
                </text>
              </g>
            );
          })}

          {/* Camera FOV cells + outlines + center icon */}
          {floorCVs.map((cv) => {
            const cellArr = Array.from(cv.cells);
            const outline = getZoneOutlinePath(cv.cells, CELL_SIZE);
            const centerX = cellArr.length > 0
              ? (cellArr.reduce((s, k) => s + parseInt(k.split(",")[0]), 0) / cellArr.length + 0.5) * CELL_SIZE
              : null;
            const centerY = cellArr.length > 0
              ? (cellArr.reduce((s, k) => s + parseInt(k.split(",")[1]), 0) / cellArr.length + 0.5) * CELL_SIZE
              : null;
            const iconSize = 16;
            const isValidCenter = centerX !== null && centerY !== null && !isNaN(centerX) && !isNaN(centerY);
            return (
              <g key={`cv-group-${cv.id}`} style={{ pointerEvents: "none" }}>
                {/* FOV fill */}
                {cellArr.map((cellKey) => {
                  const [cx, cy] = cellKey.split(",").map(Number);
                  return (
                    <rect
                      key={`cv-${cv.id}-${cellKey}`}
                      x={cx * CELL_SIZE} y={cy * CELL_SIZE}
                      width={CELL_SIZE} height={CELL_SIZE}
                      fill={cv.color}
                      opacity={cv.id === selectedCVId ? 0.6 : 0.35}
                    />
                  );
                })}
                {/* FOV outline */}
                {outline && (
                  <path
                    d={outline} fill="none"
                    stroke={cv.color}
                    strokeWidth={cv.id === selectedCVId ? 2.5 : 1.5}
                  />
                )}
                {/* Camera icon at center for completed (non-selected) cameras */}
                {isValidCenter && cv.cells.size > 0 && cv.id !== selectedCVId && (
                  <g transform={`translate(${centerX}, ${centerY}) scale(${iconSize / 24}) translate(-12, -12)`}>
                    <path
                      d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"
                      fill={cv.color} stroke="white" strokeWidth="1.5"
                    />
                    <circle cx="12" cy="13" r="3" fill="white" />
                  </g>
                )}
                
                {/* Intra Zone Sections for selected camera */}
                {showIntraSections && cv.id === selectedCVId && cv.intraZoneSections && cv.intraZoneSections.map((section) => {
                  const sectionCellArr = Array.from(section.cells);
                  const sectionOutline = getZoneOutlinePath(section.cells, CELL_SIZE);
                  return (
                    <g key={`section-${section.id}`} style={{ pointerEvents: "none" }}>
                      {sectionCellArr.map((cellKey) => {
                        const [cx, cy] = cellKey.split(",").map(Number);
                        return (
                          <rect
                            key={`section-${section.id}-${cellKey}`}
                            x={cx * CELL_SIZE}
                            y={cy * CELL_SIZE}
                            width={CELL_SIZE}
                            height={CELL_SIZE}
                            fill={section.color}
                            opacity={selectedSectionId === section.id ? 0.7 : 0.4}
                          />
                        );
                      })}
                      {sectionOutline && (
                        <path
                          d={sectionOutline}
                          fill="none"
                          stroke={section.color}
                          strokeWidth={selectedSectionId === section.id ? 2.5 : 1.5}
                          strokeDasharray={selectedSectionId === section.id ? "none" : "4 2"}
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
          
          {/* Pending section cells (before adding) */}
          {showIntraSections && activeCv && pendingSectionCells.size > 0 && !selectedSectionId && (
            <g style={{ pointerEvents: "none" }}>
              {Array.from(pendingSectionCells).map((cellKey) => {
                const [cx, cy] = cellKey.split(",").map(Number);
                return (
                  <rect
                    key={`pending-${cellKey}`}
                    x={cx * CELL_SIZE}
                    y={cy * CELL_SIZE}
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    fill="#FFD700"
                    opacity={0.5}
                    stroke="#FFA500"
                    strokeWidth={1}
                  />
                );
              })}
            </g>
          )}
        </svg>
      </CanvasContainer>

      {/* Right panel */}
      <div className="w-64 flex-shrink-0 border-l border-neutral-200 bg-white flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          {/* Assigned cameras */}
          {floorCVs.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Assigned Cameras</div>
              <div className="flex flex-col gap-1">
                {floorCVs.map((cv) => (
                  <div
                    key={cv.id}
                    onClick={() => setSelectedCVId(selectedCVId === cv.id ? null : cv.id)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-2 rounded cursor-pointer border transition-colors",
                      selectedCVId === cv.id ? "border-[#00775B] bg-green-50" : "border-transparent hover:bg-neutral-50",
                    )}
                  >
                    <div className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: cv.color }}>
                      <Camera className="w-2.5 h-2.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-neutral-800 truncate">{cv.cameraName}</div>
                      <div className="text-[10px] text-neutral-400 font-medium">{cv.cells.size} cells</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeCv(cv.id); }}
                      className="text-neutral-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available cameras */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Available Cameras</div>
            {unassignedCameras.length === 0 ? (
              <div className="text-xs text-neutral-400 text-center py-3">All cameras assigned.</div>
            ) : (
              <div className="flex flex-col gap-1">
                {unassignedCameras.map((cam) => (
                  <div
                    key={cam.id}
                    className="flex items-center gap-2 px-2 py-2 rounded border border-neutral-100 hover:border-[#00775B] hover:bg-green-50 cursor-pointer transition-colors"
                    onClick={() => addCamera(cam)}
                  >
                    <Camera className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-neutral-700 truncate">{cam.name}</div>
                      <div className="text-[10px] text-neutral-400">{cam.id}</div>
                    </div>
                    <Plus className="w-3 h-3 text-neutral-300" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {activeCv && !showIntraSections && (
            <div className="text-xs bg-neutral-50 rounded p-2 text-neutral-500 leading-relaxed">
              Painting FOV for{" "}
              <span className="font-semibold" style={{ color: activeCv.color }}>{activeCv.cameraName}</span>.
              Click to paint · click painted to erase.
            </div>
          )}

          {/* Intra Zone Sections (Optional) */}
          {activeCv && activeCv.cells.size > 0 && (
            <div className="border-t border-neutral-200 pt-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Intra-Zone Sections
                  <span className="ml-1 text-neutral-300">(Optional)</span>
                </div>
                <button
                  onClick={() => {
                    setShowIntraSections(!showIntraSections);
                    setSelectedSectionId(null);
                    setPendingSectionCells(new Set());
                  }}
                  className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide transition-colors",
                    showIntraSections 
                      ? "bg-[#00775B] text-white" 
                      : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
                  )}
                >
                  {showIntraSections ? "Exit" : "Add"}
                </button>
              </div>

              {showIntraSections && (
                <div className="space-y-2">
                  <div className="text-[10px] text-neutral-500 mb-2 leading-relaxed">
                    Define focused areas within the camera FOV where key events occur.
                  </div>

                  {/* Existing Sections */}
                  {activeCv.intraZoneSections && activeCv.intraZoneSections.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {activeCv.intraZoneSections.map((section) => (
                        <div
                          key={section.id}
                          onClick={() => setSelectedSectionId(selectedSectionId === section.id ? null : section.id)}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer border transition-colors",
                            selectedSectionId === section.id 
                              ? "border-[#00775B] bg-green-50" 
                              : "border-neutral-200 hover:bg-neutral-50"
                          )}
                        >
                          <div 
                            className="w-3 h-3 rounded flex-shrink-0" 
                            style={{ backgroundColor: section.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-semibold text-neutral-800 truncate">
                              {section.name}
                            </div>
                            <div className="text-[9px] text-neutral-400">
                              {section.cells.size} cells
                            </div>
                          </div>
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              deleteIntraSection(section.id);
                            }}
                            className="text-neutral-300 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Section */}
                  <div className="bg-neutral-50 rounded p-2 space-y-2">
                    <input
                      type="text"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addIntraSection()}
                      placeholder="Section name..."
                      className="w-full border border-neutral-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00775B]"
                    />
                    <button
                      onClick={addIntraSection}
                      disabled={!newSectionName.trim() || pendingSectionCells.size === 0}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#00775B] text-white rounded text-xs font-bold hover:bg-[#005f48] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add Section ({pendingSectionCells.size} cells)
                    </button>
                  </div>

                  {selectedSectionId && (
                    <div className="text-xs bg-blue-50 rounded p-2 text-blue-700 leading-relaxed">
                      Editing <span className="font-semibold">
                        {activeCv.intraZoneSections?.find(s => s.id === selectedSectionId)?.name}
                      </span>. Paint within FOV to modify.
                    </div>
                  )}

                  {!selectedSectionId && pendingSectionCells.size > 0 && (
                    <div className="text-xs bg-amber-50 rounded p-2 text-amber-700 leading-relaxed">
                      {pendingSectionCells.size} cells selected. Enter name and click "Add Section".
                    </div>
                  )}
                </div>
              )}

              {!showIntraSections && activeCv.intraZoneSections && activeCv.intraZoneSections.length > 0 && (
                <div className="text-[10px] text-neutral-500 mt-1">
                  {activeCv.intraZoneSections.length} section(s) defined
                </div>
              )}
            </div>
          )}

          {/* Next Floor button */}
          {nextFloor && (
            <button
              onClick={onNextFloor}
              className="w-full flex items-center justify-center gap-2 py-2 bg-[#00775B] hover:bg-[#005f48] text-white rounded text-xs font-bold uppercase tracking-wide transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              Next: {nextFloor.name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Modal ─────────────────────────────────────────────────────────────

const steps = [
  { number: 1 as const, title: "Upload Floor Plans", icon: Upload },
  { number: 2 as const, title: "Align + Set Scale", icon: Move },
  { number: 3 as const, title: "Draw Zones", icon: Grid3x3 },
  { number: 4 as const, title: "Cameras FOV", icon: Camera },
];

interface ZoneConfigurationModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: () => void;
}

export const ZoneConfigurationModal = ({
  isOpen: isOpenProp,
  onClose,
  onSave,
}: ZoneConfigurationModalProps = {}) => {
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  const isOpen = isOpenProp !== undefined ? isOpenProp : isOpenInternal;
  const setIsOpen = (val: boolean) => {
    setIsOpenInternal(val);
    if (!val && onClose) onClose();
  };

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [floors, setFloors] = useState<Floor[]>([{ id: "floor-1", name: "Floor 1" }]);
  const [currentFloor, setCurrentFloor] = useState<string>("floor-1");
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [alignRects, setAlignRects] = useState<{ [floorId: string]: AlignRect }>({});
  const [scales, setScales] = useState<{ [floorId: string]: Scale | null }>({});
  const [zones, setZones] = useState<ZoneConfig[]>([]);
  const [cameraViewpoints, setCameraViewpoints] = useState<CameraViewpoint[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const floorsWithPlans = floors.filter((f) => floorPlans.some((fp) => fp.floor === f.id));
  const currentFloorPlan = floorPlans.find((fp) => fp.floor === currentFloor) ?? null;
  const gd = getGridDims(currentFloorPlan);

  const getDefaultAlignRect = (fp: FloorPlan): AlignRect => {
    const d = getGridDims(fp);
    return { x: 0, y: 0, width: d.canvasW, height: d.canvasH };
  };

  const currentAlignRect: AlignRect =
    alignRects[currentFloor] ??
    (currentFloorPlan
      ? getDefaultAlignRect(currentFloorPlan)
      : { x: 0, y: 0, width: gd.canvasW, height: gd.canvasH });

  const handleFloorPlanUpload = (floorId: string, imageUrl: string, w: number, h: number) => {
    const newFp: FloorPlan = { floor: floorId, imageUrl, naturalWidth: w, naturalHeight: h };
    setFloorPlans((prev) => [...prev.filter((fp) => fp.floor !== floorId), newFp]);
    const d = getGridDims(newFp);
    setAlignRects((prev) => ({ ...prev, [floorId]: { x: 0, y: 0, width: d.canvasW, height: d.canvasH } }));
  };

  const handleDeleteFloorPlan = (floorId: string) => {
    setFloorPlans((prev) => prev.filter((fp) => fp.floor !== floorId));
    setAlignRects((prev) => { const n = { ...prev }; delete n[floorId]; return n; });
    setScales((prev) => { const n = { ...prev }; delete n[floorId]; return n; });
    setZones((prev) => prev.filter((z) => z.floor !== floorId));
    setCameraViewpoints((prev) => prev.filter((cv) => cv.floor !== floorId));
  };

  const handleFloorsChange = (newFloors: Floor[]) => {
    setFloors(newFloors);
    if (!newFloors.find((f) => f.id === currentFloor) && newFloors.length > 0) {
      setCurrentFloor(newFloors[0].id);
    }
  };

  const canGoNext = (): boolean => {
    if (currentStep === 1) return floorsWithPlans.length > 0;
    if (currentStep === 2) return floorsWithPlans.every((f) => scales[f.id] != null);
    if (currentStep === 3) return floorsWithPlans.every((f) =>
      zones.some((z) => z.floor === f.id && z.cells.size > 0)
    );
    return true;
  };

  const getNextHint = (): string | null => {
    if (currentStep === 1 && floorsWithPlans.length === 0)
      return "Upload at least one floor plan to continue";
    if (currentStep === 2) {
      const missing = floorsWithPlans.filter((f) => !scales[f.id]);
      if (missing.length > 0)
        return `Set scale for: ${missing.map((f) => f.name).join(", ")}`;
    }
    if (currentStep === 3) {
      const missing = floorsWithPlans.filter((f) =>
        !zones.some((z) => z.floor === f.id && z.cells.size > 0)
      );
      if (missing.length > 0)
        return `Draw at least one zone for: ${missing.map((f) => f.name).join(", ")}`;
    }
    return null;
  };

  const handleNext = () => {
    if (currentStep < 4 && canGoNext()) {
      const nextStep = (currentStep + 1) as 1 | 2 | 3 | 4;
      setCurrentStep(nextStep);
      if (floorsWithPlans.length > 0) setCurrentFloor(floorsWithPlans[0].id);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
      if (floorsWithPlans.length > 0) setCurrentFloor(floorsWithPlans[0].id);
    }
  };

  const getNextFloor = (): Floor | null => {
    const idx = floorsWithPlans.findIndex((f) => f.id === currentFloor);
    if (idx >= 0 && idx < floorsWithPlans.length - 1) return floorsWithPlans[idx + 1];
    return null;
  };

  const handleNextFloor = () => {
    const next = getNextFloor();
    if (next) setCurrentFloor(next.id);
  };

  const handleSave = () => {
    console.log("Saving configuration:", { floors, floorPlans, alignRects, scales, zones, cameraViewpoints });
    onSave?.();
    setIsOpen(false);
  };

  const hint = getNextHint();

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      {/* Only show trigger button when uncontrolled */}
      {isOpenProp === undefined && (
        <Dialog.Trigger asChild>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#00775B] text-white rounded-lg text-sm font-bold hover:bg-[#005f48] transition-colors shadow-sm">
            <Layers className="w-4 h-4" />
            Zone Configuration
          </button>
        </Dialog.Trigger>
      )}

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed inset-4 z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#00775B] rounded-lg flex items-center justify-center flex-shrink-0">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <div>
                <Dialog.Title className="font-bold text-neutral-900 text-sm">Zone Configuration</Dialog.Title>
                <Dialog.Description className="text-xs text-neutral-400 font-medium">Step {currentStep} of {steps.length}</Dialog.Description>
              </div>
            </div>

            {/* Step chips */}
            <div className="flex items-center gap-1.5">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isDone = currentStep > step.number;
                const isCurrent = currentStep === step.number;
                return (
                  <div key={step.number} className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wide transition-colors",
                        isCurrent
                          ? "bg-[#00775B] text-white"
                          : isDone
                          ? "bg-[#00775B]/15 text-[#00775B]"
                          : "bg-neutral-100 text-neutral-400",
                      )}
                    >
                      {isDone ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                      {step.title}
                    </div>
                    {idx < steps.length - 1 && (
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            <Dialog.Close className="text-neutral-400 hover:text-neutral-600 transition-colors ml-4 flex-shrink-0">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Floor selector (steps 2–4, only floors with plans) */}
          {currentStep > 1 && floorsWithPlans.length > 0 && (
            <div className="flex items-center gap-2 px-6 py-2 border-b border-neutral-100 flex-shrink-0 bg-neutral-50">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Floor:</span>
              {floorsWithPlans.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setCurrentFloor(f.id)}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-bold border transition-colors",
                    currentFloor === f.id
                      ? "bg-[#00775B] text-white border-[#00775B]"
                      : "bg-white text-neutral-500 border-neutral-200 hover:border-[#00775B]",
                  )}
                >
                  {f.name}
                  {currentStep === 2 && scales[f.id] && (
                    <span className="ml-1.5 text-[8px] opacity-80">✓</span>
                  )}
                  {currentStep === 3 && zones.some(z => z.floor === f.id && z.cells.size > 0) && (
                    <span className="ml-1.5 text-[8px] opacity-80">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step content */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {currentStep === 1 && (
              <FloorPlanUpload
                floors={floors}
                onFloorsChange={handleFloorsChange}
                floorPlans={floorPlans}
                onFloorPlanUpload={handleFloorPlanUpload}
                onDeleteFloorPlan={handleDeleteFloorPlan}
              />
            )}

            {currentStep === 2 && currentFloorPlan && (
              <AlignAndScaleStep
                key={currentFloor}
                floorPlan={currentFloorPlan}
                gd={gd}
                alignRect={currentAlignRect}
                onAlignRectChange={(r) => setAlignRects((prev) => ({ ...prev, [currentFloor]: r }))}
                onScaleChange={(s) => setScales((prev) => ({ ...prev, [currentFloor]: s }))}
                existingScale={scales[currentFloor] ?? null}
                nextFloor={getNextFloor()}
                onNextFloor={handleNextFloor}
              />
            )}

            {currentStep === 2 && !currentFloorPlan && (
              <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm">
                No floor plan for this floor. Go back and upload one.
              </div>
            )}

            {currentStep === 3 && (
              <ZoneDrawingCanvas
                key={currentFloor}
                floorPlan={currentFloorPlan}
                gd={gd}
                alignRect={currentAlignRect}
                zones={zones}
                currentFloor={currentFloor}
                onZonesChange={setZones}
                selectedZone={selectedZone}
                onSelectedZoneChange={setSelectedZone}
                scale={scales[currentFloor] ?? null}
                nextFloor={getNextFloor()}
                onNextFloor={handleNextFloor}
              />
            )}

            {currentStep === 4 && (
              <CameraViewpointCanvas
                key={currentFloor}
                floorPlan={currentFloorPlan}
                gd={gd}
                alignRect={currentAlignRect}
                zones={zones}
                cameraViewpoints={cameraViewpoints}
                currentFloor={currentFloor}
                onCameraViewpointsChange={setCameraViewpoints}
                nextFloor={getNextFloor()}
                onNextFloor={handleNextFloor}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 flex-shrink-0">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded text-sm font-semibold text-neutral-600 hover:border-neutral-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {/* Progress dots */}
            <div className="flex items-center gap-2">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    currentStep === step.number
                      ? "bg-[#00775B]"
                      : currentStep > step.number
                      ? "bg-[#00775B]/40"
                      : "bg-neutral-200",
                  )}
                />
              ))}
            </div>

            {currentStep < 4 ? (
              <div className="flex flex-col items-end gap-1">
                {hint && (
                  <div className="text-[10px] text-amber-600 font-semibold max-w-48 text-right leading-tight">{hint}</div>
                )}
                <button
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#00775B] text-white rounded text-sm font-bold hover:bg-[#005f48] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-[#00775B] text-white rounded text-sm font-bold hover:bg-[#005f48] transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Configuration
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
