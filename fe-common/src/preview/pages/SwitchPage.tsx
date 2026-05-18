import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";

export function SwitchPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Switch</h1>
        <p className="mt-1 text-sm text-gray-500">
          Toggle switch for binary on/off settings and feature flags.
        </p>
      </div>

      {/* States */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">States</h2>
        <div className="flex flex-wrap gap-8 items-center p-6 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center gap-2">
            <Switch id="off" />
            <Label htmlFor="off">Off</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="on" defaultChecked />
            <Label htmlFor="on">On</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="disabled-off" disabled />
            <Label htmlFor="disabled-off" className="text-gray-400">Disabled off</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="disabled-on" disabled defaultChecked />
            <Label htmlFor="disabled-on" className="text-gray-400">Disabled on</Label>
          </div>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<Switch />          {/* off */}
<Switch defaultChecked />  {/* on */}
<Switch disabled />
<Switch disabled defaultChecked />`}</pre>
      </div>

      {/* Settings list */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Settings List</h2>
        <div className="flex flex-col gap-0 p-6 bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
          {[
            { label: "Push Notifications", desc: "Receive alerts on your device", enabled: true },
            { label: "Dark Mode", desc: "Switch to a darker color scheme", enabled: false },
            { label: "Auto-refresh", desc: "Refresh data every 30 seconds", enabled: true },
            { label: "Compact View", desc: "Show more data in less space", enabled: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.enabled} />
            </div>
          ))}
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<div className="flex items-center justify-between">
  <div>
    <p className="text-sm font-medium">Push Notifications</p>
    <p className="text-xs text-gray-500">Receive alerts on your device</p>
  </div>
  <Switch defaultChecked />
</div>`}</pre>
      </div>
    </div>
  );
}

export default SwitchPage;
