import { Checkbox } from "../../components/ui/Checkbox";
import { Label } from "../../components/ui/label";

export function CheckboxPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Checkbox</h1>
        <p className="mt-1 text-sm text-gray-500">
          Binary selection control for form options and settings toggles.
        </p>
      </div>

      {/* States */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">States</h2>
        <div className="flex flex-wrap gap-6 items-center p-6 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center gap-2">
            <Checkbox id="unchecked" />
            <Label htmlFor="unchecked">Unchecked</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="checked" defaultChecked />
            <Label htmlFor="checked">Checked</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="disabled-unchecked" disabled />
            <Label htmlFor="disabled-unchecked" className="text-gray-400">Disabled unchecked</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="disabled-checked" disabled defaultChecked />
            <Label htmlFor="disabled-checked" className="text-gray-400">Disabled checked</Label>
          </div>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<div className="flex items-center gap-2">
  <Checkbox id="unchecked" />
  <Label htmlFor="unchecked">Unchecked</Label>
</div>

<div className="flex items-center gap-2">
  <Checkbox id="checked" defaultChecked />
  <Label htmlFor="checked">Checked</Label>
</div>

<Checkbox disabled />
<Checkbox disabled defaultChecked />`}</pre>
      </div>

      {/* In a list */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Option List</h2>
        <div className="flex flex-wrap gap-6 items-start p-6 bg-white rounded-xl border border-gray-100">
          <div className="flex flex-col gap-3">
            {["Enable notifications", "Send weekly digest", "Allow marketing emails", "Share usage analytics"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <Checkbox id={`opt-${i}`} defaultChecked={i < 2} />
                <Label htmlFor={`opt-${i}`}>{label}</Label>
              </div>
            ))}
          </div>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`{options.map((label, i) => (
  <div key={label} className="flex items-center gap-2">
    <Checkbox id={label} />
    <Label htmlFor={label}>{label}</Label>
  </div>
))}`}</pre>
      </div>
    </div>
  );
}

export default CheckboxPage;
