import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/Button";

export function TabsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tabs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Tabbed navigation for switching between related content sections.
        </p>
      </div>

      {/* Basic */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Basic</h2>
        <div className="p-6 bg-white rounded-xl border border-gray-100">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <div className="rounded-md bg-gray-50 border border-gray-100 p-4 text-sm text-gray-600">
                Overview content: A high-level summary of the model's performance, deployment status, and recent activity.
              </div>
            </TabsContent>
            <TabsContent value="metrics" className="mt-4">
              <div className="rounded-md bg-gray-50 border border-gray-100 p-4 text-sm text-gray-600">
                Metrics content: Detailed performance charts, accuracy over time, and inference latency histograms.
              </div>
            </TabsContent>
            <TabsContent value="logs" className="mt-4">
              <div className="rounded-md bg-gray-50 border border-gray-100 p-4 text-sm text-gray-600 font-mono text-xs">
                <div className="text-green-600">[2025-05-14 09:12:45] Model inference OK — 42ms</div>
                <div className="text-green-600">[2025-05-14 09:12:44] Model inference OK — 38ms</div>
                <div className="text-yellow-600">[2025-05-14 09:12:43] Low confidence detection (0.61) skipped</div>
                <div className="text-green-600">[2025-05-14 09:12:42] Model inference OK — 45ms</div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<Tabs defaultValue="overview" className="w-full">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="metrics">Metrics</TabsTrigger>
    <TabsTrigger value="logs">Logs</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">...</TabsContent>
  <TabsContent value="metrics">...</TabsContent>
  <TabsContent value="logs">...</TabsContent>
</Tabs>`}</pre>
      </div>

      {/* With badge */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">With Badges</h2>
        <div className="p-6 bg-white rounded-xl border border-gray-100">
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all" className="gap-2">
                All
                <span className="h-4 min-w-4 px-1 text-[10px] font-bold rounded-full bg-gray-900 text-white flex items-center justify-center">
                  48
                </span>
              </TabsTrigger>
              <TabsTrigger value="active" className="gap-2">
                Active
                <span className="h-4 min-w-4 px-1 text-[10px] font-bold rounded-full bg-green-600 text-white flex items-center justify-center">
                  32
                </span>
              </TabsTrigger>
              <TabsTrigger value="failed" className="gap-2">
                Failed
                <span className="h-4 min-w-4 px-1 text-[10px] font-bold rounded-full bg-red-500 text-white flex items-center justify-center">
                  3
                </span>
              </TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-md">Showing all 48 items.</div>
            </TabsContent>
            <TabsContent value="active" className="mt-4">
              <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-md">Showing 32 active items.</div>
            </TabsContent>
            <TabsContent value="failed" className="mt-4">
              <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-md">Showing 3 failed items.</div>
            </TabsContent>
            <TabsContent value="draft" className="mt-4">
              <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-md">Showing draft items.</div>
            </TabsContent>
          </Tabs>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<TabsTrigger value="active" className="gap-2">
  Active
  <span className="h-4 px-1 text-[10px] rounded-full bg-green-600 text-white">
    32
  </span>
</TabsTrigger>`}</pre>
      </div>
    </div>
  );
}

export default TabsPage;
