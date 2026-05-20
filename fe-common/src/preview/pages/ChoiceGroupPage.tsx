import { useState } from "react";
import { ChoiceGroup } from "../../components/ui/choice-group";
import { Cpu, Database, Globe, Shield } from "lucide-react";

export function ChoiceGroupPage() {
  const [single, setSingle] = useState<string>("batch");
  const [multi, setMulti] = useState<string[]>(["gpu"]);
  const [plan, setPlan] = useState<string>("pro");

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary) mb-1">ChoiceGroup</h1>
        <p className="text-sm text-(--text-secondary)">Radio and checkbox group with single/multi-select and custom rendering.</p>
      </div>

      {/* Single select */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Single Select (Radio)</h2>
        <p className="text-xs text-(--text-muted)">Selected: {single}</p>
        <ChoiceGroup
          label="Inference Mode"
          options={[
            { value: "batch", label: "Batch", description: "Process multiple inputs at once" },
            { value: "realtime", label: "Real-time", description: "Low-latency single-item inference" },
            { value: "stream", label: "Streaming", description: "Continuous data processing" },
          ]}
          value={single}
          onChange={(v) => setSingle(v as string)}
        />
      </section>

      {/* Multi select */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Multi Select (Checkbox)</h2>
        <p className="text-xs text-(--text-muted)">Selected: {(multi as string[]).join(", ") || "none"}</p>
        <ChoiceGroup
          label="Hardware Accelerators"
          multiple
          options={[
            { value: "gpu",  label: "GPU",  description: "NVIDIA CUDA acceleration", icon: <Cpu size={14} /> },
            { value: "cpu",  label: "CPU",  description: "Standard compute",         icon: <Cpu size={14} /> },
            { value: "tpu",  label: "TPU",  description: "Tensor processing units",  icon: <Cpu size={14} /> },
          ]}
          value={multi}
          onChange={(v) => setMulti(v as string[])}
        />
      </section>

      {/* Horizontal */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Horizontal Layout</h2>
        <p className="text-xs text-(--text-muted)">Selected: {plan}</p>
        <ChoiceGroup
          label="Plan"
          orientation="horizontal"
          options={[
            { value: "free",       label: "Free",       description: "5 models",   icon: <Database size={14} /> },
            { value: "pro",        label: "Pro",        description: "50 models",  icon: <Globe size={14} /> },
            { value: "enterprise", label: "Enterprise", description: "Unlimited",  icon: <Shield size={14} /> },
          ]}
          value={plan}
          onChange={(v) => setPlan(v as string)}
        />
      </section>

      {/* Disabled */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Disabled</h2>
        <ChoiceGroup
          label="Region (locked)"
          disabled
          options={[
            { value: "us-east", label: "US East", description: "Virginia, USA" },
            { value: "eu-west", label: "EU West", description: "Ireland, EU" },
          ]}
          value="us-east"
          onChange={() => {}}
        />
      </section>

      {/* With error */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">With Error</h2>
        <ChoiceGroup
          label="Framework"
          options={[
            { value: "pytorch",    label: "PyTorch" },
            { value: "tensorflow", label: "TensorFlow" },
            { value: "jax",        label: "JAX" },
          ]}
          value=""
          onChange={() => {}}
          error="Please select a training framework"
          helperText="The framework cannot be changed after training starts"
        />
      </section>
    </div>
  );
}
