import { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@fe-common/components/ui/Button";
import { cn } from "@/app/lib/utils";
import { TrainingProject, OutputType } from "@/app/data/mockData";

// ─── Option lists ─────────────────────────────────────────────────────────────

const PROJECT_TYPES   = ["build", "deploy"] as const;
const INPUT_TYPES     = ["Image", "Video", "Text", "Audio"] as const;
const INDUSTRIES      = ["Healthcare","Retail","Manufacturing","Automotive","Agriculture","Security","Logistics","Finance"] as const;
const COUNTRIES       = ["United States","United Kingdom","Germany","India","Singapore"] as const;
const COMPUTE_TYPES   = ["Matrice","AWS","GCP"] as const;
const STORAGE_TYPES   = ["Matrice","S3","GCS"] as const;
const DEVICE_TYPES    = ["Nvidia GPU","CPU","TPU"] as const;

// ─── Output type cards ────────────────────────────────────────────────────────

const OUTPUT_CARDS: { type: OutputType; label: string; description: string }[] = [
  { type: "classification",      label: "Classification",       description: "Classify image content according to its visual content." },
  { type: "detection",           label: "Detection",            description: "Identifies and locates individual objects in an image." },
  { type: "instance_segmentation", label: "Instance Segmentation", description: "Identifies and outlines individual objects in an image." },
];

// SVG illustrations for output type cards
function OutputIllustration({ type }: { type: OutputType }) {
  if (type === "classification") return (
    <svg viewBox="0 0 180 100" className="w-full h-full">
      <rect width="180" height="100" fill="#e8f4f1" />
      <rect x="55" y="15" width="70" height="70" rx="8" fill="#00775B" opacity="0.15" />
      <rect x="55" y="15" width="70" height="70" rx="8" fill="none" stroke="#00775B" strokeWidth="1.5" strokeDasharray="4 2" />
      <text x="90" y="55" textAnchor="middle" fontSize="9" fill="#00775B" fontFamily="sans-serif" fontWeight="600">Object</text>
      <rect x="60" y="72" width="60" height="8" rx="2" fill="#00775B" opacity="0.2" />
      <text x="90" y="79" textAnchor="middle" fontSize="6" fill="#00775B" fontFamily="sans-serif">LABEL: 0.94</text>
    </svg>
  );
  if (type === "detection") return (
    <svg viewBox="0 0 180 100" className="w-full h-full">
      <rect width="180" height="100" fill="#e8f4f1" />
      <rect x="18" y="20" width="58" height="58" rx="2" fill="none" stroke="#00775B" strokeWidth="2" />
      <rect x="104" y="35" width="52" height="48" rx="2" fill="none" stroke="#0284C7" strokeWidth="2" />
      <text x="47" y="53" textAnchor="middle" fontSize="8" fill="#00775B" fontFamily="sans-serif">Person</text>
      <text x="130" y="62" textAnchor="middle" fontSize="8" fill="#0284C7" fontFamily="sans-serif">Car</text>
      <rect x="18" y="15" width="30" height="8" rx="1" fill="#00775B" />
      <text x="33" y="21" textAnchor="middle" fontSize="6" fill="white" fontFamily="sans-serif">0.97</text>
      <rect x="104" y="30" width="26" height="8" rx="1" fill="#0284C7" />
      <text x="117" y="36" textAnchor="middle" fontSize="6" fill="white" fontFamily="sans-serif">0.89</text>
    </svg>
  );
  return (
    <svg viewBox="0 0 180 100" className="w-full h-full">
      <rect width="180" height="100" fill="#e8f4f1" />
      <ellipse cx="68" cy="55" rx="38" ry="32" fill="#00775B" opacity="0.2" />
      <ellipse cx="68" cy="55" rx="38" ry="32" fill="none" stroke="#00775B" strokeWidth="1.5" />
      <ellipse cx="115" cy="48" rx="32" ry="28" fill="#0284C7" opacity="0.2" />
      <ellipse cx="115" cy="48" rx="32" ry="28" fill="none" stroke="#0284C7" strokeWidth="1.5" />
      <text x="68" y="58" textAnchor="middle" fontSize="8" fill="#00775B" fontFamily="sans-serif" fontWeight="600">Object 1</text>
      <text x="115" y="51" textAnchor="middle" fontSize="8" fill="#0284C7" fontFamily="sans-serif" fontWeight="600">Object 2</text>
    </svg>
  );
}

// ─── Reusable small select ────────────────────────────────────────────────────

function NativeSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wide text-neutral-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-9 rounded-sm border border-neutral-200 bg-white px-3 text-sm text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#00775B] focus:border-[#00775B] transition-colors"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (project: TrainingProject) => void;
}

export function CreateProjectModal({ open, onClose, onCreated }: CreateProjectModalProps) {
  const [name, setName]                 = useState("");
  const [projectType, setProjectType]   = useState<"build" | "deploy">("build");
  const [inputType, setInputType]       = useState<string>("Image");
  const [industry, setIndustry]         = useState<string>("Retail");
  const [tagInput, setTagInput]         = useState("");
  const [tags, setTags]                 = useState<string[]>([]);
  const [outputType, setOutputType]     = useState<OutputType>("classification");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [country, setCountry]           = useState("United States");
  const [computeType, setComputeType]   = useState("Matrice");
  const [storageType, setStorageType]   = useState("Matrice");
  const [devices, setDevices]           = useState("Nvidia GPU");

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((p) => [...p, t]);
    setTagInput("");
  }

  function reset() {
    setName(""); setProjectType("build"); setInputType("Image"); setIndustry("Retail");
    setTagInput(""); setTags([]); setOutputType("classification"); setShowAdvanced(false);
    setCountry("United States"); setComputeType("Matrice"); setStorageType("Matrice"); setDevices("Nvidia GPU");
  }

  function handleCreate() {
    if (!name.trim()) return;
    onCreated({
      id: `p${Date.now()}`,
      name: name.trim(),
      type: projectType,
      inputType,
      outputType,
      industry,
      tags,
      status: "draft",
      createdAt: new Date().toISOString().split("T")[0],
      computeType,
      country,
      storageType,
      supportedDevices: devices,
    });
    reset();
    onClose();
  }

  function handleClose() { reset(); onClose(); }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-[#FAFAFA] shrink-0">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Create Project</h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">Configure your new ML training project</p>
          </div>
          <button onClick={handleClose} className="text-neutral-400 hover:text-neutral-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5">

          {/* Row 1: Name + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-neutral-600">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Retail PPE Detection"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="h-9 rounded-sm border border-neutral-200 bg-white px-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#00775B] focus:border-[#00775B] transition-colors"
              />
            </div>
            <NativeSelect label="Project Type" value={projectType} options={PROJECT_TYPES} onChange={setProjectType} />
          </div>

          {/* Row 2: Input type + Industry */}
          <div className="grid grid-cols-2 gap-4">
            <NativeSelect label="Input Type" value={inputType} options={INPUT_TYPES} onChange={setInputType} />
            <NativeSelect label="Industry"   value={industry}  options={INDUSTRIES}  onChange={setIndustry}  />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-neutral-600">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                className="flex-1 h-9 rounded-sm border border-neutral-200 bg-white px-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#00775B] focus:border-[#00775B] transition-colors"
              />
              <Button variant="outline" onClick={addTag} className="h-9 text-xs">Add</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#00775B]/10 text-[#00775B] rounded-full text-[11px] font-medium">
                    {tag}
                    <button onClick={() => setTags((p) => p.filter((t) => t !== tag))} className="hover:text-[#004E3D]">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Output Type cards */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-600">Output Type</span>
            <div className="grid grid-cols-3 gap-3">
              {OUTPUT_CARDS.map((card) => (
                <button
                  key={card.type}
                  type="button"
                  onClick={() => setOutputType(card.type)}
                  className={cn(
                    "flex flex-col rounded-sm border-2 overflow-hidden text-left transition-all hover:shadow-sm",
                    outputType === card.type
                      ? "border-[#00775B] shadow-sm"
                      : "border-neutral-200 hover:border-[#00775B]/40"
                  )}
                >
                  <div className="h-24 relative overflow-hidden">
                    <OutputIllustration type={card.type} />
                    {outputType === card.type && (
                      <span className="absolute top-2 right-2 bg-[#00775B] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="p-2.5 flex flex-col gap-0.5 border-t border-neutral-100">
                    <span className="text-[11px] font-bold text-neutral-800">{card.label}</span>
                    <span className="text-[10px] text-neutral-500 leading-snug">{card.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div className="border border-neutral-200 rounded-sm overflow-hidden">
            <button
              type="button"
              className="flex items-center justify-between w-full px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-600 hover:bg-neutral-50 transition-colors"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              <span>Advanced Options</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showAdvanced && (
              <div className="px-4 pb-4 flex flex-col gap-4 border-t border-neutral-100 pt-4 bg-neutral-50/50">
                <div className="grid grid-cols-2 gap-4">
                  <NativeSelect label="Country"      value={country}      options={COUNTRIES}     onChange={setCountry}      />
                  <NativeSelect label="Compute Type" value={computeType}  options={COMPUTE_TYPES} onChange={setComputeType}  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <NativeSelect label="Storage Type"      value={storageType} options={STORAGE_TYPES} onChange={setStorageType} />
                  <NativeSelect label="Supported Devices" value={devices}     options={DEVICE_TYPES}  onChange={setDevices}     />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAFAFA] border-t border-neutral-100 flex justify-end gap-3 shrink-0">
          <Button variant="outline" onClick={handleClose} className="h-9 text-sm">Cancel</Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="h-9 text-sm bg-[#00775B] hover:bg-[#006649] text-white border-transparent disabled:opacity-50"
          >
            Create Project
          </Button>
        </div>
      </div>
    </div>
  );
}
