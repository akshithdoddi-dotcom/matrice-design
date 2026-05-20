import { Skeleton } from "../../components/ui/Skeleton";

export function SkeletonPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Skeleton</h1>
        <p className="mt-1 text-sm text-gray-500">
          Loading placeholder that mimics the shape of content while data is being fetched.
        </p>
      </div>

      {/* Text Lines */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Text Lines</h2>
        <div className="flex flex-col gap-3 p-6 bg-white rounded-xl border border-gray-100">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<Skeleton className="h-4 w-3/4" />
<Skeleton className="h-4 w-1/2" />
<Skeleton className="h-4 w-5/6" />`}</pre>
      </div>

      {/* Card skeleton */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Card</h2>
        <div className="flex flex-wrap gap-4 p-6 bg-white rounded-xl border border-gray-100">
          <div className="flex flex-col gap-3 p-4 border border-gray-100 rounded-lg w-64">
            <Skeleton className="h-32 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2 mt-1">
              <Skeleton className="h-8 w-20 rounded" />
              <Skeleton className="h-8 w-16 rounded" />
            </div>
          </div>
          <div className="flex flex-col gap-3 p-4 border border-gray-100 rounded-lg w-64">
            <Skeleton className="h-32 w-full rounded-md" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-3/5" />
            <div className="flex gap-2 mt-1">
              <Skeleton className="h-8 w-20 rounded" />
              <Skeleton className="h-8 w-16 rounded" />
            </div>
          </div>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<div className="flex flex-col gap-3 p-4 border rounded-lg w-64">
  <Skeleton className="h-32 w-full rounded-md" />
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
</div>`}</pre>
      </div>

      {/* Avatar + text row */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Avatar + Text Row</h2>
        <div className="flex flex-col gap-3 p-6 bg-white rounded-xl border border-gray-100">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full flex-shrink-0" />
            </div>
          ))}
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<div className="flex items-center gap-3">
  <Skeleton className="h-10 w-10 rounded-full" />
  <div className="flex flex-col gap-2 flex-1">
    <Skeleton className="h-3.5 w-32" />
    <Skeleton className="h-3 w-48" />
  </div>
</div>`}</pre>
      </div>

      {/* Table row */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Table Row</h2>
        <div className="flex flex-col gap-2 p-6 bg-white rounded-xl border border-gray-100">
          <div className="grid grid-cols-4 gap-4 p-2 bg-gray-50 rounded">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-full" />
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="grid grid-cols-4 gap-4 p-2">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`{rows.map((i) => (
  <div key={i} className="grid grid-cols-4 gap-4 p-2">
    <Skeleton className="h-3.5 w-full" />
    <Skeleton className="h-3.5 w-3/4" />
    <Skeleton className="h-3.5 w-1/2" />
    <Skeleton className="h-6 w-16 rounded-full" />
  </div>
))}`}</pre>
      </div>
    </div>
  );
}

export default SkeletonPage;
