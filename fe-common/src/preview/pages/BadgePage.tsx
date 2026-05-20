import { Badge } from "../../components/ui/badge";
import { CheckCircle2, AlertTriangle, Info, XCircle, Star } from "lucide-react";

export function BadgePage() {
  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary) mb-1">Badge</h1>
        <p className="text-sm text-(--text-secondary)">Semantic status labels with icon support.</p>
      </div>

      {/* Variants */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Variants</h2>
        <div className="flex flex-wrap gap-3">
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="neutral">Neutral</Badge>
        </div>
      </section>

      {/* Sizes */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Sizes</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="primary" size="sm">Small</Badge>
          <Badge variant="primary" size="default">Default</Badge>
          <Badge variant="primary" size="lg">Large</Badge>
        </div>
      </section>

      {/* With Icons */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">With Icons</h2>
        <div className="flex flex-wrap gap-3">
          <Badge variant="success" icon={<CheckCircle2 size={12} />}>Verified</Badge>
          <Badge variant="warning" icon={<AlertTriangle size={12} />}>Pending</Badge>
          <Badge variant="error" icon={<XCircle size={12} />}>Failed</Badge>
          <Badge variant="info" icon={<Info size={12} />}>Processing</Badge>
          <Badge variant="primary" icon={<Star size={12} />}>Featured</Badge>
        </div>
      </section>

      {/* All combinations */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Common Use Cases</h2>
        <div className="flex flex-wrap gap-3">
          <Badge variant="success">Active</Badge>
          <Badge variant="success">Deployed</Badge>
          <Badge variant="warning">In Review</Badge>
          <Badge variant="warning">Pending Approval</Badge>
          <Badge variant="error">Rejected</Badge>
          <Badge variant="error">Offline</Badge>
          <Badge variant="info">Training</Badge>
          <Badge variant="info">Uploading</Badge>
          <Badge variant="neutral">Draft</Badge>
          <Badge variant="neutral">Archived</Badge>
        </div>
      </section>
    </div>
  );
}
