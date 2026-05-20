import { Loader } from "../../components/ui/loader";

export function LoaderPage() {
  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary) mb-1">Loader</h1>
        <p className="text-sm text-(--text-secondary)">Isometric 3D cube animation for loading states.</p>
      </div>

      {/* Sizes */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Sizes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-(--text-secondary) text-center">sm</p>
            <div className="border border-border rounded-lg overflow-hidden">
              <Loader size="sm" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-(--text-secondary) text-center">default</p>
            <div className="border border-border rounded-lg overflow-hidden">
              <Loader size="default" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-(--text-secondary) text-center">lg</p>
            <div className="border border-border rounded-lg overflow-hidden">
              <Loader size="lg" />
            </div>
          </div>
        </div>
      </section>

      {/* With Label */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">With Label</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-border rounded-lg overflow-hidden">
            <Loader size="default" label="Loading project…" />
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            <Loader size="default" label="Training model…" />
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            <Loader size="default" label="Fetching dataset…" />
          </div>
        </div>
      </section>
    </div>
  );
}
