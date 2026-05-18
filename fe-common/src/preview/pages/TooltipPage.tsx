import { Button } from "../../components/ui/Button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../../components/ui/Tooltip";
import { Info, Settings, HelpCircle } from "lucide-react";

export function TooltipPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tooltip</h1>
        <p className="mt-1 text-sm text-gray-500">
          Contextual information popup shown on hover, supporting any trigger element.
        </p>
      </div>

      {/* Basic */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Basic</h2>
        <div className="flex flex-wrap gap-6 items-center p-6 bg-white rounded-xl border border-gray-100">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>This is a tooltip!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm text-gray-700 underline decoration-dotted cursor-help">
                  Hover this text
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tooltips work on any element</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50">
                  <Info className="h-4 w-4 text-gray-500" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>More information</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>This is a tooltip!</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>`}</pre>
      </div>

      {/* Positioning */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Positioning</h2>
        <div className="flex flex-wrap gap-4 items-center justify-center p-10 bg-white rounded-xl border border-gray-100">
          <TooltipProvider>
            {(["top", "right", "bottom", "left"] as const).map((side) => (
              <Tooltip key={side}>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="capitalize">{side}</Button>
                </TooltipTrigger>
                <TooltipContent side={side}>
                  <p>Tooltip on {side}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<TooltipContent side="top">...</TooltipContent>
<TooltipContent side="right">...</TooltipContent>
<TooltipContent side="bottom">...</TooltipContent>
<TooltipContent side="left">...</TooltipContent>`}</pre>
      </div>

      {/* Toolbar example */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Icon Toolbar</h2>
        <div className="flex items-center gap-1 p-6 bg-white rounded-xl border border-gray-100">
          <TooltipProvider>
            {[
              { icon: Settings, label: "Settings" },
              { icon: HelpCircle, label: "Help & Support" },
              { icon: Info, label: "About" },
            ].map(({ icon: Icon, label }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <button className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                    <Icon className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<TooltipProvider>
  {icons.map(({ icon: Icon, label }) => (
    <Tooltip key={label}>
      <TooltipTrigger asChild>
        <button className="p-2 rounded-md hover:bg-gray-100">
          <Icon className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent><p>{label}</p></TooltipContent>
    </Tooltip>
  ))}
</TooltipProvider>`}</pre>
      </div>
    </div>
  );
}

export default TooltipPage;
