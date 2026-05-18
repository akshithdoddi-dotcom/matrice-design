import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import { Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export function AlertPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alert</h1>
        <p className="mt-1 text-sm text-gray-500">
          Inline notification banners for feedback messages, warnings, and status updates.
        </p>
      </div>

      {/* Variants */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Variants</h2>
        <div className="flex flex-col gap-3 p-6 bg-white rounded-xl border border-gray-100">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              Your API key was last used 3 hours ago. Make sure to rotate it regularly for security.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to connect to the inference server. Check your network settings and try again.
            </AlertDescription>
          </Alert>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>Your message here.</AlertDescription>
</Alert>

<Alert variant="destructive">
  <XCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong.</AlertDescription>
</Alert>`}</pre>
      </div>

      {/* Custom styled */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Custom Styles</h2>
        <div className="flex flex-col gap-3 p-6 bg-white rounded-xl border border-gray-100">
          <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Your storage is 85% full. Consider archiving old datasets to free up space.
            </AlertDescription>
          </Alert>
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription className="text-green-700">
              Model training completed successfully. Accuracy improved by 2.3% over the previous version.
            </AlertDescription>
          </Alert>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`{/* Warning */}
<Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
  <AlertTriangle className="h-4 w-4 text-yellow-600" />
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription className="text-yellow-700">...</AlertDescription>
</Alert>

{/* Success */}
<Alert className="border-green-200 bg-green-50 text-green-800">
  <CheckCircle2 className="h-4 w-4 text-green-600" />
  <AlertTitle>Success</AlertTitle>
  <AlertDescription className="text-green-700">...</AlertDescription>
</Alert>`}</pre>
      </div>

      {/* Without icon */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Without Icon</h2>
        <div className="flex flex-col gap-3 p-6 bg-white rounded-xl border border-gray-100">
          <Alert>
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              You can add components and dependencies to your app using the CLI.
            </AlertDescription>
          </Alert>
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components and dependencies to your app using the CLI.
  </AlertDescription>
</Alert>`}</pre>
      </div>
    </div>
  );
}

export default AlertPage;
