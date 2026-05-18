import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";

export function TextareaPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Textarea</h1>
        <p className="mt-1 text-sm text-gray-500">
          Multi-line text input for longer form content like descriptions and comments.
        </p>
      </div>

      {/* States */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">States</h2>
        <div className="flex flex-wrap gap-6 items-start p-6 bg-white rounded-xl border border-gray-100">
          <div className="flex flex-col gap-1.5 w-64">
            <Label>Default</Label>
            <Textarea placeholder="Write something..." />
          </div>
          <div className="flex flex-col gap-1.5 w-64">
            <Label>With Content</Label>
            <Textarea defaultValue="This is some pre-filled content that spans across multiple lines and shows the textarea in an active state." />
          </div>
          <div className="flex flex-col gap-1.5 w-64">
            <Label>Disabled</Label>
            <Textarea placeholder="Disabled textarea" disabled />
          </div>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<Textarea placeholder="Write something..." />
<Textarea defaultValue="Pre-filled content..." />
<Textarea disabled placeholder="Disabled textarea" />`}</pre>
      </div>

      {/* With Label */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Field Group</h2>
        <div className="flex flex-wrap gap-6 items-start p-6 bg-white rounded-xl border border-gray-100">
          <div className="flex flex-col gap-1.5 w-80">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="Tell us about yourself..." rows={4} />
            <p className="text-xs text-gray-400">Max 200 characters.</p>
          </div>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<div className="flex flex-col gap-1.5">
  <Label htmlFor="bio">Bio</Label>
  <Textarea id="bio" placeholder="Tell us about yourself..." rows={4} />
  <p className="text-xs text-gray-400">Max 200 characters.</p>
</div>`}</pre>
      </div>
    </div>
  );
}

export default TextareaPage;
