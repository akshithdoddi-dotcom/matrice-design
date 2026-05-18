import { Separator } from "../../components/ui/separator";

export function SeparatorPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Separator</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visual divider to separate content sections, both horizontally and vertically.
        </p>
      </div>

      {/* Horizontal */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Horizontal</h2>
        <div className="flex flex-col gap-4 p-6 bg-white rounded-xl border border-gray-100">
          <div>
            <h4 className="text-sm font-medium">Section One</h4>
            <p className="text-xs text-gray-500">This is content in the first section.</p>
          </div>
          <Separator />
          <div>
            <h4 className="text-sm font-medium">Section Two</h4>
            <p className="text-xs text-gray-500">This is content in the second section.</p>
          </div>
          <Separator />
          <div>
            <h4 className="text-sm font-medium">Section Three</h4>
            <p className="text-xs text-gray-500">This is content in the third section.</p>
          </div>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<div>Section One content</div>
<Separator />
<div>Section Two content</div>
<Separator />
<div>Section Three content</div>`}</pre>
      </div>

      {/* Vertical */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Vertical</h2>
        <div className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center gap-4 h-8">
            <span className="text-sm font-medium text-gray-700">Blog</span>
            <Separator orientation="vertical" />
            <span className="text-sm font-medium text-gray-700">Docs</span>
            <Separator orientation="vertical" />
            <span className="text-sm font-medium text-gray-700">API</span>
            <Separator orientation="vertical" />
            <span className="text-sm font-medium text-gray-700">GitHub</span>
          </div>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<div className="flex items-center gap-4 h-8">
  <span>Blog</span>
  <Separator orientation="vertical" />
  <span>Docs</span>
  <Separator orientation="vertical" />
  <span>API</span>
</div>`}</pre>
      </div>

      {/* In a card header */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">In Card</h2>
        <div className="p-6 bg-white rounded-xl border border-gray-100">
          <div className="rounded-lg border border-gray-200 overflow-hidden w-80">
            <div className="px-4 py-3">
              <h3 className="font-semibold text-sm">Model Details</h3>
              <p className="text-xs text-gray-500 mt-0.5">person-detect-v3</p>
            </div>
            <Separator />
            <div className="px-4 py-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Accuracy</span>
                <span className="font-medium">98.4%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Latency</span>
                <span className="font-medium">42ms</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Version</span>
                <span className="font-medium">3.0.1</span>
              </div>
            </div>
            <Separator />
            <div className="px-4 py-3 flex gap-2">
              <button className="text-xs text-[#00775B] font-medium hover:underline">Deploy</button>
              <Separator orientation="vertical" className="h-4 self-center" />
              <button className="text-xs text-gray-500 hover:text-gray-700">Edit</button>
            </div>
          </div>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<div className="rounded-lg border overflow-hidden">
  <div className="px-4 py-3">
    <h3>Card Header</h3>
  </div>
  <Separator />
  <div className="px-4 py-3">Card Body</div>
  <Separator />
  <div className="px-4 py-3">Card Footer</div>
</div>`}</pre>
      </div>
    </div>
  );
}

export default SeparatorPage;
