import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";
import { Database, Search, FolderOpen, Plus, RefreshCw } from "lucide-react";

export function EmptyStatePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">EmptyState</h1>
        <p className="mt-1 text-sm text-gray-500">
          Placeholder component shown when a list or data view has no content to display.
        </p>
      </div>

      {/* Default */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Default</h2>
        <div className="p-6 bg-white rounded-xl border border-gray-100">
          <EmptyState
            title="No data found"
            description="There are no items to display at this time. Try adjusting your filters or check back later."
          />
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<EmptyState
  title="No data found"
  description="There are no items to display at this time."
/>`}</pre>
      </div>

      {/* With custom icon */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">With Custom Icon</h2>
        <div className="p-6 bg-white rounded-xl border border-gray-100">
          <EmptyState
            icon={<Database className="h-6 w-6 text-neutral-400" />}
            title="No datasets yet"
            description="Upload your first dataset to start training models. Supported formats include CSV, JSON, and Parquet."
            action={
              <Button>
                <Plus className="w-4 h-4 mr-1" />
                Upload Dataset
              </Button>
            }
          />
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<EmptyState
  icon={<Database className="h-6 w-6 text-neutral-400" />}
  title="No datasets yet"
  description="Upload your first dataset to start training models."
  action={
    <Button>
      <Plus className="w-4 h-4 mr-1" />
      Upload Dataset
    </Button>
  }
/>`}</pre>
      </div>

      {/* Search empty */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Search Empty</h2>
        <div className="p-6 bg-white rounded-xl border border-gray-100">
          <EmptyState
            icon={<Search className="h-6 w-6 text-neutral-400" />}
            title='No results for "thermal camera"'
            description="Try different search terms or clear your filters to see all available items."
            action={
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-1" />
                Clear Filters
              </Button>
            }
          />
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<EmptyState
  icon={<Search className="h-6 w-6 text-neutral-400" />}
  title='No results for "thermal camera"'
  description="Try different search terms or clear your filters."
  action={<Button variant="outline">Clear Filters</Button>}
/>`}</pre>
      </div>
    </div>
  );
}

export default EmptyStatePage;
