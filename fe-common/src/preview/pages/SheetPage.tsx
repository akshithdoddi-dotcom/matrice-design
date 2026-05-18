import { Button } from "../../components/ui/Button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";

export function SheetPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sheet</h1>
        <p className="mt-1 text-sm text-gray-500">
          Slide-in panel that appears from the edge of the screen for sidebars and drawers.
        </p>
      </div>

      {/* Side variants */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Side Variants</h2>
        <div className="flex flex-wrap gap-3 p-6 bg-white rounded-xl border border-gray-100">
          {(["top", "right", "bottom", "left"] as const).map((side) => (
            <Sheet key={side}>
              <SheetTrigger asChild>
                <Button variant="outline" className="capitalize">{side}</Button>
              </SheetTrigger>
              <SheetContent side={side}>
                <SheetHeader>
                  <SheetTitle>Sheet — {side}</SheetTitle>
                  <SheetDescription>
                    This sheet slides in from the {side}. Use it for navigation, forms, or detail panels.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 text-sm text-gray-500">
                  Sheet content goes here.
                </div>
              </SheetContent>
            </Sheet>
          ))}
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<Sheet>
  <SheetTrigger asChild>
    <Button>Open Right</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Panel Title</SheetTitle>
      <SheetDescription>Description here.</SheetDescription>
    </SheetHeader>
    {/* content */}
  </SheetContent>
</Sheet>`}</pre>
      </div>

      {/* Settings panel example */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Settings Panel</h2>
        <div className="flex flex-wrap gap-3 p-6 bg-white rounded-xl border border-gray-100">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open Settings Panel</Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Model Settings</SheetTitle>
                <SheetDescription>
                  Configure inference parameters for person-detect-v3.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Confidence Threshold</Label>
                  <Input type="number" defaultValue="0.75" step="0.05" min="0" max="1" />
                  <p className="text-xs text-gray-400">Minimum confidence score to trigger a detection.</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Max Detections Per Frame</Label>
                  <Input type="number" defaultValue="50" min="1" max="500" />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Model Alias</Label>
                  <Input defaultValue="person-detect-v3" />
                </div>
                <div className="flex gap-2 mt-6">
                  <Button className="flex-1">Save Settings</Button>
                  <Button variant="outline">Reset</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<Sheet>
  <SheetTrigger asChild>
    <Button>Open Settings Panel</Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-[400px]">
    <SheetHeader>
      <SheetTitle>Model Settings</SheetTitle>
    </SheetHeader>
    {/* form fields */}
  </SheetContent>
</Sheet>`}</pre>
      </div>
    </div>
  );
}

export default SheetPage;
