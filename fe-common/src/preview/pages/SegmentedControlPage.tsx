import { useState } from "react";
import { LayoutGrid, List, BarChart2, Table2, Map } from "lucide-react";
import { SegmentedControl } from "../../components/ui/segmented-control";

export function SegmentedControlPage() {
  const [view, setView] = useState("grid");
  const [tab, setTab] = useState("overview");
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary) mb-1">Segmented Control</h1>
        <p className="text-sm text-(--text-secondary)">
          Compact toggle widget for selecting a single view mode or option.
        </p>
      </div>

      {/* Icon only */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Icon Only</h2>
        <SegmentedControl
          value={view}
          onChange={setView}
          options={[
            { value: "grid",  icon: <LayoutGrid className="size-4" />, ariaLabel: "Grid view"  },
            { value: "list",  icon: <List className="size-4" />,       ariaLabel: "List view"  },
            { value: "chart", icon: <BarChart2 className="size-4" />,  ariaLabel: "Chart view" },
            { value: "table", icon: <Table2 className="size-4" />,     ariaLabel: "Table view" },
            { value: "map",   icon: <Map className="size-4" />,        ariaLabel: "Map view"   },
          ]}
          ariaLabel="View mode"
        />
        <p className="text-xs text-(--text-muted)">Selected: {view}</p>
      </section>

      {/* Label only */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Label Only</h2>
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { value: "overview",  label: "Overview"  },
            { value: "metrics",   label: "Metrics"   },
            { value: "logs",      label: "Logs"      },
            { value: "artifacts", label: "Artifacts" },
          ]}
          ariaLabel="Tab selection"
        />
        <p className="text-xs text-(--text-muted)">Selected: {tab}</p>
      </section>

      {/* Icon + label */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Icon + Label</h2>
        <SegmentedControl
          value={view}
          onChange={setView}
          options={[
            { value: "grid",  label: "Grid",  icon: <LayoutGrid className="size-3.5" /> },
            { value: "list",  label: "List",  icon: <List className="size-3.5" />       },
            { value: "chart", label: "Chart", icon: <BarChart2 className="size-3.5" />  },
          ]}
          ariaLabel="View mode"
        />
      </section>

      {/* Sizes */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Sizes</h2>
        <div className="flex flex-col gap-4">
          {(["sm", "md", "lg"] as const).map((s) => (
            <div key={s} className="flex items-center gap-4">
              <span className="text-xs w-6 text-(--text-muted)">{s}</span>
              <SegmentedControl
                size={s}
                value={size === s ? view : "grid"}
                onChange={(v) => { setSize(s); setView(v); }}
                options={[
                  { value: "grid",  label: "Grid"  },
                  { value: "list",  label: "List"  },
                  { value: "chart", label: "Chart" },
                ]}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Disabled */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Disabled</h2>
        <div className="flex gap-4 flex-wrap">
          <SegmentedControl
            disabled
            value="grid"
            options={[
              { value: "grid",  label: "Grid"  },
              { value: "list",  label: "List"  },
              { value: "chart", label: "Chart" },
            ]}
          />
          <SegmentedControl
            value="grid"
            options={[
              { value: "grid",  label: "Grid"  },
              { value: "list",  label: "List", disabled: true },
              { value: "chart", label: "Chart" },
            ]}
          />
        </div>
      </section>

      {/* Full width */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Full Width</h2>
        <SegmentedControl
          fullWidth
          value={tab}
          onChange={setTab}
          options={[
            { value: "overview",  label: "Overview"  },
            { value: "metrics",   label: "Metrics"   },
            { value: "logs",      label: "Logs"      },
            { value: "artifacts", label: "Artifacts" },
          ]}
        />
      </section>
    </div>
  );
}
