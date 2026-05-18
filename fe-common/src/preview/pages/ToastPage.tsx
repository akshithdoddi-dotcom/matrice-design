import { Button } from "../../components/ui/button";
import { Toaster } from "../../components/ui/toast/toaster";
import { useToast } from "../../components/ui/toast/use-toast";
import { ToastAction } from "../../components/ui/toast";

function ToastDemo() {
  const { toast } = useToast();

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary) mb-1">Toast</h1>
        <p className="text-sm text-(--text-secondary)">Non-intrusive notification system built on Radix Toast.</p>
      </div>

      {/* Variants */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Variants</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() =>
              toast({ title: "Default", description: "Your changes have been saved." })
            }
          >
            Default
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: "Success",
                description: "Model deployed successfully.",
                variant: "default",
              })
            }
          >
            Success
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              toast({
                title: "Error",
                description: "Training run failed. Check the logs for details.",
                variant: "destructive",
              })
            }
          >
            Destructive
          </Button>
        </div>
      </section>

      {/* With action */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">With Action</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: "Dataset uploaded",
                description: "ResNet-50-training-set.zip — 2.4 GB",
                action: (
                  <ToastAction altText="View dataset" onClick={() => {}}>
                    View
                  </ToastAction>
                ),
              })
            }
          >
            With Action Button
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: "Job queued",
                description: "Training will start when resources are available.",
                action: (
                  <ToastAction altText="Cancel job" onClick={() => {}}>
                    Cancel
                  </ToastAction>
                ),
              })
            }
          >
            Undo Action
          </Button>
        </div>
      </section>

      {/* Title only */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Title Only</h2>
        <Button
          variant="outline"
          onClick={() => toast({ title: "Copied to clipboard" })}
        >
          Show Short Toast
        </Button>
      </section>

      {/* Multiple */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Multiple (stacked)</h2>
        <Button
          variant="outline"
          onClick={() => {
            toast({ title: "Job 1 started", description: "ResNet fine-tune" });
            setTimeout(() => toast({ title: "Job 2 queued", description: "ViT-Base training" }), 300);
            setTimeout(() => toast({ title: "Job 3 queued", description: "BERT-tiny NLP" }), 600);
          }}
        >
          Trigger 3 Toasts
        </Button>
      </section>
    </div>
  );
}

export function ToastPage() {
  return (
    <>
      <Toaster />
      <ToastDemo />
    </>
  );
}
