import { Slider } from "../../components/ui/slider";
import { Label } from "../../components/ui/label";

export function SliderPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Slider</h1>
        <p className="mt-1 text-sm text-gray-500">
          Range input control for selecting numeric values within a defined range.
        </p>
      </div>

      {/* States */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">States</h2>
        <div className="flex flex-col gap-6 p-6 bg-white rounded-xl border border-gray-100">
          <div className="flex flex-col gap-2 w-72">
            <Label>Default (50%)</Label>
            <Slider defaultValue={[50]} min={0} max={100} step={1} />
          </div>
          <div className="flex flex-col gap-2 w-72">
            <Label>Low value (20%)</Label>
            <Slider defaultValue={[20]} min={0} max={100} step={1} />
          </div>
          <div className="flex flex-col gap-2 w-72">
            <Label>High value (80%)</Label>
            <Slider defaultValue={[80]} min={0} max={100} step={1} />
          </div>
          <div className="flex flex-col gap-2 w-72">
            <Label className="text-gray-400">Disabled</Label>
            <Slider defaultValue={[50]} min={0} max={100} step={1} disabled />
          </div>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<Slider defaultValue={[50]} min={0} max={100} step={1} />
<Slider defaultValue={[50]} min={0} max={100} step={1} disabled />`}</pre>
      </div>

      {/* Range */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Range Slider</h2>
        <div className="flex flex-col gap-6 p-6 bg-white rounded-xl border border-gray-100">
          <div className="flex flex-col gap-2 w-72">
            <Label>Price range (20–80)</Label>
            <Slider defaultValue={[20, 80]} min={0} max={100} step={1} />
          </div>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<Slider defaultValue={[20, 80]} min={0} max={100} step={1} />`}</pre>
      </div>
    </div>
  );
}

export default SliderPage;
