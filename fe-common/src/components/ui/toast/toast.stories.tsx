import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../button";
import { Toaster } from "./toaster";
import { toast } from "./use-toast";

const meta: Meta = {
  title: "Components/Toast",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj;

function TriggerToast({
  variant,
  title,
  description,
}: {
  variant: "default" | "success" | "warning" | "error" | "info";
  title: string;
  description: string;
}) {
  return (
    <Button
      onClick={() =>
        toast({
          variant,
          title,
          description,
        })
      }
    >
      Show {variant} toast
    </Button>
  );
}

export const Default: Story = {
  render: () => (
    <>
      <TriggerToast
        variant="default"
        title="Saved"
        description="Your settings were updated successfully."
      />
      <Toaster />
    </>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <TriggerToast
        variant="success"
        title="Success"
        description="Operation completed."
      />
      <TriggerToast
        variant="warning"
        title="Warning"
        description="Please review the input."
      />
      <TriggerToast
        variant="error"
        title="Error"
        description="Something went wrong."
      />
      <TriggerToast
        variant="info"
        title="Info"
        description="Background sync in progress."
      />
      <Toaster />
    </div>
  ),
};
