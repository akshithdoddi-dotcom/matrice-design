import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/label";

export function InputPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Input</h1>
        <p className="mt-1 text-sm text-gray-500">
          Text input field for forms, supporting labels, placeholders, and validation states.
        </p>
      </div>

      {/* Variants */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Variants</h2>
        <div className="flex flex-wrap gap-6 items-start p-6 bg-white rounded-xl border border-gray-100">
          <div className="flex flex-col gap-1.5 w-56">
            <Label htmlFor="default-input">Default</Label>
            <Input id="default-input" placeholder="Enter your email" />
          </div>
          <div className="flex flex-col gap-1.5 w-56">
            <Label htmlFor="filled-input">With Value</Label>
            <Input id="filled-input" defaultValue="admin@matrice.ai" />
          </div>
          <div className="flex flex-col gap-1.5 w-56">
            <Label htmlFor="disabled-input">Disabled</Label>
            <Input id="disabled-input" placeholder="Disabled input" disabled />
          </div>
          <div className="flex flex-col gap-1.5 w-56">
            <Label htmlFor="error-input" className="text-red-500">Error State</Label>
            <Input
              id="error-input"
              defaultValue="bad-value"
              className="ring-red-500 border-red-500 focus-visible:ring-red-500"
            />
            <p className="text-xs text-red-500">This field is required.</p>
          </div>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<div className="flex flex-col gap-1.5">
  <Label htmlFor="email">Email</Label>
  <Input id="email" placeholder="Enter your email" />
</div>

<Input disabled placeholder="Disabled input" />

<Input className="ring-red-500 border-red-500" />`}</pre>
      </div>

      {/* Types */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Input Types</h2>
        <div className="flex flex-wrap gap-6 items-start p-6 bg-white rounded-xl border border-gray-100">
          <div className="flex flex-col gap-1.5 w-56">
            <Label>Text</Label>
            <Input type="text" placeholder="Text input" />
          </div>
          <div className="flex flex-col gap-1.5 w-56">
            <Label>Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="flex flex-col gap-1.5 w-56">
            <Label>Number</Label>
            <Input type="number" placeholder="0" />
          </div>
          <div className="flex flex-col gap-1.5 w-56">
            <Label>Search</Label>
            <Input type="search" placeholder="Search..." />
          </div>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<Input type="text" placeholder="Text input" />
<Input type="password" placeholder="••••••••" />
<Input type="number" placeholder="0" />
<Input type="search" placeholder="Search..." />`}</pre>
      </div>
    </div>
  );
}

export default InputPage;
