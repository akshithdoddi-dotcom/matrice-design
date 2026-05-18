import { StatusChip } from "../../components/ui/status-chip";
import { CheckCircle2, AlertTriangle, XCircle, Activity } from "lucide-react";

const ALL_STATUSES = [
  "success", "complete", "active", "running", "deployed", "healthy",
  "error", "fail", "stopped", "crashed", "rejected",
  "warning", "pending", "queued", "paused", "degraded",
  "info", "progress", "training", "uploading", "processing",
  "unknown", "idle", "ready",
];

export function StatusChipPage() {
  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary) mb-1">StatusChip</h1>
        <p className="text-sm text-(--text-secondary)">
          Auto-detects visual variant from status string. No manual variant needed.
        </p>
      </div>

      {/* Auto-detected */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Auto-detected Variants</h2>
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map((s) => (
            <StatusChip key={s} status={s} />
          ))}
        </div>
      </section>

      {/* Manual Override */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Manual Variant Override</h2>
        <div className="flex flex-wrap gap-2">
          <StatusChip status="Custom Label" variant="success" />
          <StatusChip status="Custom Label" variant="error" />
          <StatusChip status="Custom Label" variant="warning" />
          <StatusChip status="Custom Label" variant="info" />
          <StatusChip status="Custom Label" variant="default" />
        </div>
      </section>

      {/* With Icons */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">With Icons</h2>
        <div className="flex flex-wrap gap-2">
          <StatusChip status="Running" icon={<Activity size={12} />} />
          <StatusChip status="Deployed" icon={<CheckCircle2 size={12} />} />
          <StatusChip status="Pending" icon={<AlertTriangle size={12} />} />
          <StatusChip status="Failed" icon={<XCircle size={12} />} />
        </div>
      </section>

      {/* Sizes */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Sizes</h2>
        <div className="flex flex-wrap items-center gap-3">
          <StatusChip status="active" size="sm" />
          <StatusChip status="active" size="default" />
        </div>
      </section>

      {/* Real-world examples */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Real-world Examples</h2>
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-(--bg-subtle) border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-(--text-secondary)">Model</th>
                <th className="text-left px-4 py-3 font-medium text-(--text-secondary)">Status</th>
                <th className="text-left px-4 py-3 font-medium text-(--text-secondary)">Pipeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { model: "ResNet-50 v3", status: "deployed", pipeline: "active" },
                { model: "YOLO v8", status: "training", pipeline: "running" },
                { model: "EfficientDet", status: "pending", pipeline: "queued" },
                { model: "MobileNet v2", status: "error", pipeline: "stopped" },
                { model: "ViT-Base", status: "complete", pipeline: "success" },
              ].map((row) => (
                <tr key={row.model}>
                  <td className="px-4 py-3 text-(--text-primary)">{row.model}</td>
                  <td className="px-4 py-3"><StatusChip status={row.status} size="sm" /></td>
                  <td className="px-4 py-3"><StatusChip status={row.pipeline} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
