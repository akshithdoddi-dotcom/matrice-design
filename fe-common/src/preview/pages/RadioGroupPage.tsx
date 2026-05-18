import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Label } from "../../components/ui/label";

export function RadioGroupPage() {
  const [plan, setPlan]       = useState("pro");
  const [model, setModel]     = useState("resnet50");
  const [runtime, setRuntime] = useState("gpu");

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary) mb-1">Radio Group</h1>
        <p className="text-sm text-(--text-secondary)">
          Single-select radix-based radio group. Compose with Label for accessible forms.
        </p>
      </div>

      {/* Basic */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Basic</h2>
        <RadioGroup value={plan} onValueChange={setPlan} className="flex flex-col gap-3">
          {[
            { value: "starter", label: "Starter — 50 GPU hours / month" },
            { value: "pro",     label: "Pro — 500 GPU hours / month"    },
            { value: "team",    label: "Team — Unlimited hours"          },
          ].map(({ value, label }) => (
            <div key={value} className="flex items-center gap-2">
              <RadioGroupItem value={value} id={`plan-${value}`} />
              <Label htmlFor={`plan-${value}`} className="cursor-pointer">{label}</Label>
            </div>
          ))}
        </RadioGroup>
        <p className="text-xs text-(--text-muted)">Selected: {plan}</p>
      </section>

      {/* Horizontal */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Horizontal</h2>
        <RadioGroup value={runtime} onValueChange={setRuntime} className="flex gap-6">
          {[
            { value: "gpu", label: "GPU" },
            { value: "cpu", label: "CPU" },
            { value: "tpu", label: "TPU" },
          ].map(({ value, label }) => (
            <div key={value} className="flex items-center gap-2">
              <RadioGroupItem value={value} id={`rt-${value}`} />
              <Label htmlFor={`rt-${value}`} className="cursor-pointer">{label}</Label>
            </div>
          ))}
        </RadioGroup>
        <p className="text-xs text-(--text-muted)">Runtime: {runtime}</p>
      </section>

      {/* Model selector */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Model Architecture</h2>
        <RadioGroup value={model} onValueChange={setModel} className="flex flex-col gap-2">
          {[
            { value: "resnet50",   label: "ResNet-50",       desc: "Classic CNN backbone, 25M params"   },
            { value: "vit-b",      label: "ViT-B/16",        desc: "Vision Transformer, 86M params"     },
            { value: "efficientnet",label: "EfficientNet-B4", desc: "Compound scaled CNN, 19M params"   },
            { value: "yolov8",     label: "YOLOv8-m",        desc: "Real-time object detection"        },
          ].map(({ value, label, desc }) => (
            <div key={value} className="flex items-start gap-3 p-3 rounded-lg border border-(--border-color) cursor-pointer hover:border-(--primary-main) transition-colors">
              <RadioGroupItem value={value} id={`model-${value}`} className="mt-0.5" />
              <Label htmlFor={`model-${value}`} className="cursor-pointer flex flex-col gap-0.5">
                <span className="font-medium text-(--text-primary)">{label}</span>
                <span className="text-xs text-(--text-muted)">{desc}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
        <p className="text-xs text-(--text-muted)">Selected: {model}</p>
      </section>

      {/* Disabled */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Disabled</h2>
        <RadioGroup defaultValue="option1" disabled className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="option1" id="d1" />
            <Label htmlFor="d1">Option 1 (selected)</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="option2" id="d2" />
            <Label htmlFor="d2">Option 2</Label>
          </div>
        </RadioGroup>
      </section>
    </div>
  );
}
