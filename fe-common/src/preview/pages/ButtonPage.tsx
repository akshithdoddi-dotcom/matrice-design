import { Plus } from "lucide-react";
import { Button } from "../../components/ui/Button";

export function ButtonPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Button</h1>
        <p className="mt-1 text-sm text-gray-500">
          Interactive button element with multiple variants, sizes, and states.
        </p>
      </div>

      {/* Variants */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Variants</h2>
        <div className="flex flex-wrap gap-3 items-center p-6 bg-white rounded-xl border border-gray-100">
          <Button variant="default">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Delete</Button>
          <Button variant="link">Learn more</Button>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="link">Learn more</Button>`}</pre>
      </div>

      {/* Sizes */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Sizes</h2>
        <div className="flex flex-wrap gap-3 items-center p-6 bg-white rounded-xl border border-gray-100">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>`}</pre>
      </div>

      {/* States */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">States</h2>
        <div className="flex flex-wrap gap-3 items-center p-6 bg-white rounded-xl border border-gray-100">
          <Button>Normal</Button>
          <Button disabled>Disabled</Button>
          <Button>
            <Plus className="w-4 h-4 mr-1" />
            With Icon
          </Button>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<Button>Normal</Button>
<Button disabled>Disabled</Button>
<Button>
  <Plus className="w-4 h-4 mr-1" />
  With Icon
</Button>`}</pre>
      </div>
    </div>
  );
}

export default ButtonPage;
