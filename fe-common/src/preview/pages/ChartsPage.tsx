import { BarChart, LineChart, PieChart, ScatterChart } from "../../components/ui/Charts";

const MONTHLY_DATA = [
  { month: "Jan", accuracy: 78, loss: 0.42, models: 12 },
  { month: "Feb", accuracy: 81, loss: 0.38, models: 18 },
  { month: "Mar", accuracy: 84, loss: 0.32, models: 15 },
  { month: "Apr", accuracy: 86, loss: 0.28, models: 22 },
  { month: "May", accuracy: 89, loss: 0.24, models: 28 },
  { month: "Jun", accuracy: 91, loss: 0.20, models: 31 },
  { month: "Jul", accuracy: 90, loss: 0.22, models: 27 },
  { month: "Aug", accuracy: 93, loss: 0.17, models: 35 },
];

const PLATFORM_DATA = [
  { platform: "Analytics", users: 1240, sessions: 4320 },
  { platform: "Training", users: 890, sessions: 2100 },
  { platform: "Marketplace", users: 560, sessions: 1400 },
  { platform: "Support", users: 320, sessions: 780 },
];

const PIE_DATA = [
  { label: "Image Classification", value: 42 },
  { label: "Object Detection", value: 28 },
  { label: "NLP", value: 18 },
  { label: "Segmentation", value: 12 },
];

const SCATTER_DATA = [
  {
    label: "Models",
    data: Array.from({ length: 20 }, (_, i) => ({
      x: Math.round(10 + i * 4 + Math.random() * 8),
      y: Math.round(60 + i * 1.5 + Math.random() * 10),
      z: Math.round(100 + Math.random() * 200),
    })),
  },
];

export function ChartsPage() {
  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary) mb-1">Charts</h1>
        <p className="text-sm text-(--text-secondary)">BarChart, LineChart, PieChart, and ScatterChart built on Recharts.</p>
      </div>

      {/* BarChart — vertical (default) */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Bar Chart — Grouped</h2>
        <div className="border border-border rounded-lg p-4">
          <BarChart
            data={PLATFORM_DATA}
            categoryKey="platform"
            height={260}
            bars={[
              { dataKey: "users", label: "Users", color: "#00775B" },
              { dataKey: "sessions", label: "Sessions", color: "#4CAF90" },
            ]}
            legend={{ show: true }}
          />
        </div>
      </section>

      {/* BarChart — horizontal */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Bar Chart — Stacked</h2>
        <div className="border border-border rounded-lg p-4">
          <BarChart
            data={MONTHLY_DATA}
            categoryKey="month"
            height={260}
            stacked
            bars={[
              { dataKey: "models", label: "Models Trained", color: "#00775B" },
            ]}
            legend={{ show: true }}
          />
        </div>
      </section>

      {/* LineChart */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Line Chart — Multi-series</h2>
        <div className="border border-border rounded-lg p-4">
          <LineChart
            data={MONTHLY_DATA}
            categoryKey="month"
            height={260}
            lines={[
              { dataKey: "accuracy", label: "Accuracy (%)", color: "#00775B", smooth: true },
            ]}
            legend={{ show: true }}
          />
        </div>
      </section>

      {/* PieChart */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Pie Chart</h2>
        <div className="border border-border rounded-lg p-4">
          <PieChart
            data={PIE_DATA}
            height={280}
            legend={{ show: true }}
          />
        </div>
      </section>

      {/* ScatterChart */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Scatter Chart</h2>
        <div className="border border-border rounded-lg p-4">
          <ScatterChart
            series={SCATTER_DATA}
            height={260}
            xAxis={{ label: "Training Epochs" }}
            yAxis={{ label: "Accuracy (%)" }}
          />
        </div>
      </section>
    </div>
  );
}
