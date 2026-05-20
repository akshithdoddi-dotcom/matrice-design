import { Button } from "../../components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/label";
import { Settings, Filter, Calendar } from "lucide-react";

export function PopoverPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Popover</h1>
        <p className="mt-1 text-sm text-gray-500">
          Floating panel anchored to a trigger element for context menus and mini forms.
        </p>
      </div>

      {/* Basic */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Basic</h2>
        <div className="flex flex-wrap gap-6 p-6 bg-white rounded-xl border border-gray-100">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Open Popover</Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Quick Info</h4>
                <p className="text-xs text-gray-500">
                  This is a basic popover with some text content. Click outside to dismiss.
                </p>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <button className="p-2 rounded-md border border-gray-200 hover:bg-gray-50">
                <Settings className="h-4 w-4 text-gray-500" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="start">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mb-2">Options</p>
                {["Rename", "Duplicate", "Archive", "Delete"].map((opt) => (
                  <button
                    key={opt}
                    className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent className="w-64">
    <p>Content goes here.</p>
  </PopoverContent>
</Popover>`}</pre>
      </div>

      {/* Filter popover */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Filter Panel</h2>
        <div className="flex flex-wrap gap-4 p-6 bg-white rounded-xl border border-gray-100">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="start">
              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Filter Results</h4>
                <div className="space-y-2">
                  <Label className="text-xs">Search</Label>
                  <Input placeholder="Filter by name..." className="h-8 text-xs" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Status</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {["Active", "Training", "Pending", "Failed"].map((s) => (
                      <button
                        key={s}
                        className="px-2.5 py-1 text-xs rounded-full border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="flex-1 h-7 text-xs">Apply</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs">Reset</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Date Range
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Select Range</h4>
                <div className="space-y-2">
                  <Label className="text-xs">From</Label>
                  <Input type="date" className="h-8 text-xs" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">To</Label>
                  <Input type="date" className="h-8 text-xs" />
                </div>
                <Button size="sm" className="w-full h-7 text-xs">Apply</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      <Filter className="h-3.5 w-3.5 mr-1.5" />
      Filter
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-72" align="start">
    {/* filter controls */}
  </PopoverContent>
</Popover>`}</pre>
      </div>
    </div>
  );
}

export default PopoverPage;
