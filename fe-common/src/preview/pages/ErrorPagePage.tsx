import { ErrorPage } from "../../components/ui/ErrorPage";

export function ErrorPagePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Error Page</h1>
        <p className="mt-1 text-sm text-gray-500">
          High-tech sci-fi error screens for 404 and 500 states. Features a proximity cursor glow,
          glassmorphic card, JetBrains Mono error code, and an expandable system log accordion.
        </p>
      </div>

      {/* 404 */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">404 — Not Found</h2>
        <div className="rounded-xl overflow-hidden border border-gray-200" style={{ minHeight: 420 }}>
          <ErrorPage code={404} onHome={() => {}} homeLabel="Contact Support" />
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<ErrorPage
  code={404}
  onHome={() => router.push("/support")}
  homeLabel="Contact Support"
/>`}</pre>
      </div>

      {/* 500 */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">500 — System Disruption</h2>
        <div className="rounded-xl overflow-hidden border border-gray-200" style={{ minHeight: 420 }}>
          <ErrorPage code={500} onHome={() => {}} homeLabel="Reboot System" />
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<ErrorPage
  code={500}
  onHome={() => window.location.reload()}
  homeLabel="Reboot System"
/>`}</pre>
      </div>
    </div>
  );
}
