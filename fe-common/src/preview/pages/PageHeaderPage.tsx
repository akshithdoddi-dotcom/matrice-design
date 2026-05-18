import { BarChart3, Database, Settings, Plus, Upload } from "lucide-react";
import { PageHeader } from "../../components/ui/page-header";
import { Button } from "../../components/ui/button";

export function PageHeaderPage() {
  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary) mb-1">Page Header</h1>
        <p className="text-sm text-(--text-secondary)">
          Icon + title + subtitle row with optional eyebrow, action slot, and border.
        </p>
      </div>

      {/* Default */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Default</h2>
        <div className="border border-(--border-color) rounded-xl p-4 bg-(--surface)">
          <PageHeader
            icon={<BarChart3 className="size-5" />}
            title="Analytics Overview"
            subtitle="Real-time model performance and dataset statistics."
          />
        </div>
      </section>

      {/* With action */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">With Action</h2>
        <div className="border border-(--border-color) rounded-xl p-4 bg-(--surface)">
          <PageHeader
            icon={<Database className="size-5" />}
            title="Datasets"
            subtitle="Manage your training and evaluation datasets."
            action={
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Upload className="size-4 mr-1.5" />Import</Button>
                <Button size="sm"><Plus className="size-4 mr-1.5" />New Dataset</Button>
              </div>
            }
          />
        </div>
      </section>

      {/* Sizes */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Sizes</h2>
        <div className="space-y-4">
          {(["sm", "default", "lg"] as const).map((size) => (
            <div key={size} className="border border-(--border-color) rounded-xl p-4 bg-(--surface)">
              <PageHeader
                size={size}
                icon={<Settings className="size-5" />}
                title={`Settings — size="${size}"`}
                subtitle="Configure your workspace and preferences."
              />
            </div>
          ))}
        </div>
      </section>

      {/* Bordered */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Bordered</h2>
        <div className="border border-(--border-color) rounded-xl bg-(--surface) overflow-hidden">
          <div className="px-4">
            <PageHeader
              bordered
              icon={<BarChart3 className="size-5" />}
              title="Model Training"
              subtitle="Monitor and manage active training runs."
              action={<Button size="sm">New Run</Button>}
            />
          </div>
          <div className="p-4 text-(--text-secondary) text-sm">Page content goes here</div>
        </div>
      </section>

      {/* With eyebrow / breadcrumb */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">With Eyebrow</h2>
        <div className="border border-(--border-color) rounded-xl p-4 bg-(--surface)">
          <PageHeader
            eyebrow={
              <span className="text-xs text-(--text-muted)">
                Projects &rsaquo; ResNet-50 Fine-Tune &rsaquo;
              </span>
            }
            icon={<BarChart3 className="size-5" />}
            title="Run #42"
            subtitle="Epoch 38 / 50 — 76% complete"
            action={<Button variant="destructive" size="sm">Stop Run</Button>}
          />
        </div>
      </section>
    </div>
  );
}
