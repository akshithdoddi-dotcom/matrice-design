import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";

const TAGS = Array.from({ length: 20 }, (_, i) => `v1.${i}.0`);

const NOTIFICATIONS = [
  { id: 1, title: "Model training complete", desc: "person-detect-v3 reached 98.4% accuracy", time: "2m ago", type: "success" },
  { id: 2, title: "New alert triggered", desc: "Critical: Unauthorized access at Zone B2", time: "5m ago", type: "error" },
  { id: 3, title: "Dataset uploaded", desc: "thermal-surveillance-2025.zip processed", time: "12m ago", type: "info" },
  { id: 4, title: "Model deployed", desc: "vehicle-class-v2 deployed to production", time: "18m ago", type: "success" },
  { id: 5, title: "Storage warning", desc: "Storage at 85% capacity", time: "1h ago", type: "warning" },
  { id: 6, title: "Model training complete", desc: "face-recog-v4 finished — 99.1% accuracy", time: "2h ago", type: "success" },
  { id: 7, title: "API rate limit reached", desc: "Inference API exceeded 10k req/min", time: "3h ago", type: "error" },
  { id: 8, title: "Camera offline", desc: "Camera-07 (North Gate) disconnected", time: "4h ago", type: "warning" },
];

const TYPE_COLORS: Record<string, string> = {
  success: "bg-green-500",
  error: "bg-red-500",
  warning: "bg-yellow-400",
  info: "bg-blue-500",
};

export function ScrollAreaPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ScrollArea</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overflow container with styled scrollbars for constrained-height content areas.
        </p>
      </div>

      {/* Vertical list */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Vertical List</h2>
        <div className="flex flex-wrap gap-4 p-6 bg-white rounded-xl border border-gray-100">
          <div className="w-48">
            <p className="text-xs font-medium text-gray-400 mb-2">Tags (20 items)</p>
            <ScrollArea className="h-48 rounded-md border border-gray-200 p-2">
              {TAGS.map((tag) => (
                <div key={tag} className="py-1.5 px-2 text-xs text-gray-700 hover:bg-gray-50 rounded cursor-pointer">
                  {tag}
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<ScrollArea className="h-48 rounded-md border p-2">
  {items.map((item) => (
    <div key={item} className="py-1.5 px-2 text-xs">
      {item}
    </div>
  ))}
</ScrollArea>`}</pre>
      </div>

      {/* Notification feed */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Notification Feed</h2>
        <div className="p-6 bg-white rounded-xl border border-gray-100">
          <ScrollArea className="h-72 rounded-lg border border-gray-100">
            <div className="p-4 space-y-0">
              {NOTIFICATIONS.map((n, idx) => (
                <div key={n.id}>
                  <div className="flex items-start gap-3 py-3">
                    <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${TYPE_COLORS[n.type]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{n.desc}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">{n.time}</span>
                  </div>
                  {idx < NOTIFICATIONS.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<ScrollArea className="h-72 rounded-lg border">
  <div className="p-4">
    {notifications.map((n) => (
      <div key={n.id} className="flex items-start gap-3 py-3">
        <div className="h-2 w-2 rounded-full bg-green-500" />
        <div className="flex-1">
          <p className="text-sm font-medium">{n.title}</p>
          <p className="text-xs text-gray-500">{n.desc}</p>
        </div>
        <span className="text-[10px] text-gray-400">{n.time}</span>
      </div>
    ))}
  </div>
</ScrollArea>`}</pre>
      </div>

      {/* Horizontal scroll */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Horizontal Scroll</h2>
        <div className="p-6 bg-white rounded-xl border border-gray-100">
          <ScrollArea className="w-full whitespace-nowrap rounded-md border border-gray-200">
            <div className="flex gap-3 p-3">
              {Array.from({ length: 15 }, (_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-32 h-20 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center text-xs text-gray-400"
                >
                  Card {i + 1}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<ScrollArea className="w-full whitespace-nowrap rounded-md border">
  <div className="flex gap-3 p-3">
    {items.map((item) => (
      <div key={item} className="flex-shrink-0 w-32 h-20 rounded-md bg-gray-50">
        {item}
      </div>
    ))}
  </div>
</ScrollArea>`}</pre>
      </div>
    </div>
  );
}

export default ScrollAreaPage;
