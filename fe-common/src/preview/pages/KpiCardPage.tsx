import { TrendingUp, TrendingDown, Cpu, Database } from "lucide-react";
import { KpiCard } from "../../components/ui/kpi-card";

const SPARK_DATA = [40, 55, 35, 70, 60, 85, 75, 90, 80, 95];
const DOWN_DATA  = [95, 80, 90, 75, 85, 60, 70, 35, 55, 40];

export function KpiCardPage() {
  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary) mb-1">KPI Card</h1>
        <p className="text-sm text-(--text-secondary)">
          Versatile metric card — stat, sparkline, alert, performance, capacity, and grid layouts.
        </p>
      </div>

      {/* Stat */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Type: stat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard type="stat" label="Total Models" value="1,248" badge={{ text: "+12%", variant: "success" }} />
          <KpiCard type="stat" label="Active Runs"  value="34"    badge={{ text: "+5",   variant: "info"    }} />
          <KpiCard type="stat" label="GPU Hours"    value="9,831" badge={{ text: "-3%",  variant: "error"   }} />
          <KpiCard type="stat" label="Datasets"     value="156"   />
        </div>
      </section>

      {/* Sparkline */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Type: spark</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard type="spark" label="mAP Score"     value="94.2%" chartData={SPARK_DATA}  badge={{ text: "↑ 2.1%", variant: "success" }} />
          <KpiCard type="spark" label="Loss"          value="0.034" chartData={DOWN_DATA}   badge={{ text: "↓ 0.01", variant: "success" }} chartType="line" />
          <KpiCard type="spark" label="Inference Avg" value="12ms"  chartData={SPARK_DATA}  badge={{ text: "stable",  variant: "neutral" }} />
        </div>
      </section>

      {/* Alert */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Type: alert</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard type="alert" colorTheme="error"   label="Failed Jobs"    value="3"  icon={<TrendingDown className="size-5" />} definition="Jobs that terminated with errors in the last 24h." />
          <KpiCard type="alert" colorTheme="warning" label="Queue Backlog"  value="18" icon={<Cpu className="size-5" />} />
          <KpiCard type="alert" colorTheme="success" label="Uptime"         value="99.98%" icon={<TrendingUp className="size-5" />} />
        </div>
      </section>

      {/* Performance */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Type: performance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KpiCard type="performance" label="GPU Utilisation" value="78%" chartData={SPARK_DATA} chartTooltip chartFormatValue={(v) => `${v}%`} badge={{ text: "high", variant: "warning" }} />
          <KpiCard type="performance" label="Throughput"      value="4.2 GB/s" chartData={DOWN_DATA} chartTooltip />
        </div>
      </section>

      {/* Capacity */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Type: capacity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard type="capacity" label="Storage"   value="78%"  capacityPercent={78}  colorTheme="warning" />
          <KpiCard type="capacity" label="CPU"       value="42%"  capacityPercent={42}  colorTheme="success" />
          <KpiCard type="capacity" label="Memory"    value="91%"  capacityPercent={91}  colorTheme="error"   />
        </div>
      </section>

      {/* Grid */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Type: grid</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KpiCard
            type="grid"
            label="Training Summary"
            icon={<Database className="size-4" />}
            items={[
              { label: "Epochs",   value: "50"   },
              { label: "Batch",    value: "32"   },
              { label: "LR",       value: "1e-4" },
              { label: "Optimizer",value: "Adam" },
            ]}
          />
          <KpiCard
            type="grid"
            label="Dataset Info"
            items={[
              { label: "Train",  value: "80,000" },
              { label: "Val",    value: "10,000" },
              { label: "Test",   value: "10,000" },
              { label: "Classes",value: "80"     },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
