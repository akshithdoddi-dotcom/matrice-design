import { Info, Trash2 } from "lucide-react";

import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../button";
import { Input } from "../input";
import { StatusChip } from "../status-chip";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ManagedDialog,
  type ManagedDialogProps,
} from "./index";

const meta: Meta<typeof ManagedDialog> = {
  title: "Components/Dialog",
  component: ManagedDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    open: { control: "boolean" },
    title: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    dividers: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ManagedDialog>;

// ── Reusable trigger wrapper ──────────────────────────────────────────────────

function DialogDemo({
  label = "Open Dialog",
  props,
}: {
  label?: string;
  props: Omit<ManagedDialogProps, "open" | "onClose">;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <ManagedDialog {...props} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

// ── Dark mode wrapper ─────────────────────────────────────────────────────────
// DialogContent renders in a Portal (appended to document.body), so wrapping
// the story in a div with data-theme="dark" would have no effect on the dialog.
// Instead we set the attribute directly on body and clean it up on unmount.

function DarkModeWrapper({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    document.body.setAttribute("data-theme", "dark");
    return () => document.body.removeAttribute("data-theme");
  }, []);
  return (
    <div style={{ background: "var(--bg-body)", padding: 32, borderRadius: 8 }}>
      {children}
    </div>
  );
}

// ── General mode stories ──────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <DialogDemo
      props={{
        title: "Add Team Member",
        size: "sm",
        footer: <Button>Save</Button>,
        children: (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Full name" placeholder="Jane Doe" />
            <Input
              label="Email address"
              placeholder="jane@example.com"
              type="email"
            />
          </div>
        ),
      }}
    />
  ),
};

export const NoTitle: Story = {
  name: "No Title",
  render: () => (
    <DialogDemo
      label="Open (no title)"
      props={{
        size: "sm",
        footer: <Button>Got it</Button>,
        children: (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            This dialog has no title. The close button appears at the top-right
            corner and the content has extra top padding so nothing is hidden
            behind it.
          </p>
        ),
      }}
    />
  ),
};

export const NoFooter: Story = {
  name: "No Footer (read-only)",
  render: () => (
    <DialogDemo
      label="View Details"
      props={{
        title: "Model Details",
        size: "sm",
        children: (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["Status", <StatusChip key="s" status="running" />],
              ["Accuracy", "94.2%"],
              ["Framework", "PyTorch 2.1"],
              ["GPU", "A100 (80GB)"],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.875rem",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>{label}</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        ),
      }}
    />
  ),
};

export const WithExtraTitleNode: Story = {
  name: "With Extra Title Node",
  render: () => (
    <DialogDemo
      props={{
        title: "Configure Threshold",
        extraTitleNode: (
          <span
            title="Changes apply to all future predictions"
            style={{ cursor: "help", display: "inline-flex" }}
          >
            <Info size={16} />
          </span>
        ),
        size: "sm",
        footer: <Button>Apply</Button>,
        children: (
          <Input label="Decision threshold" placeholder="0.5" type="number" />
        ),
      }}
    />
  ),
};

export const NoDividers: Story = {
  name: "No Dividers",
  render: () => (
    <DialogDemo
      props={{
        title: "Seamless Layout",
        size: "sm",
        dividers: false,
        footer: <Button>Save</Button>,
        children: (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            This dialog has <code>dividers=false</code> — no separator lines
            between header, content, and footer.
          </p>
        ),
      }}
    />
  ),
};

// ── Confirmation mode ─────────────────────────────────────────────────────────
// Both variants (danger / warning) are shown side-by-side.
// Click confirm to see the loading state; typing the wrong text shows the error.
// These are all driven by the same confirmation prop — no extra variants needed.

function ConfirmationDemo({
  variant = "danger",
}: {
  variant?: "danger" | "warning";
}) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
    }, 2000);
  };

  const isDanger = variant === "danger";

  return (
    <>
      <Button
        variant={isDanger ? "destructive" : "default"}
        onClick={() => setOpen(true)}
      >
        {isDanger ? "Delete Project" : "Update Threshold"}
      </Button>
      <ManagedDialog
        open={open}
        onClose={() => !loading && setOpen(false)}
        title={isDanger ? "Confirm Deletion" : "Confirm Update"}
        size="sm"
        confirmation={{
          message: isDanger
            ? `Type CONFIRM to permanently delete project "alpha-v2".\n\nThis action cannot be undone.`
            : `Current threshold: 0.5 → 0.72\n\nThis will affect all active deployments.`,
          variant,
          onConfirm: handleConfirm,
          loading,
        }}
      />
    </>
  );
}

export const Confirmation: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <ConfirmationDemo variant="danger" />
      <ConfirmationDemo variant="warning" />
    </div>
  ),
};

// ── Composable primitives ─────────────────────────────────────────────────────

export const ComposablePrimitives: Story = {
  name: "Composable Primitives",
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open Raw Dialog
        </Button>
        <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
          <DialogContent className="max-w-[480px]">
            <DialogClose asChild>
              <button
                className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-(--bg-hover) transition-all duration-(--duration-fast) ease-(--ease-snappy) focus-visible:outline-none"
                aria-label="Close"
              >
                <Trash2 size={14} />
              </button>
            </DialogClose>
            <DialogHeader>
              <DialogTitle>Custom Composable</DialogTitle>
            </DialogHeader>
            <div className="h-px w-full bg-border" />
            <div className="p-4">
              <DialogDescription>
                Using raw Radix primitives for full layout control. The close
                button, header, separator, and footer are all composed manually.
              </DialogDescription>
            </div>
            <div className="h-px w-full bg-border" />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button onClick={() => setOpen(false)}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};

// ── Dark mode ─────────────────────────────────────────────────────────────────

export const DarkMode: Story = {
  name: "Dark Mode",
  decorators: [
    (Story) => (
      <DarkModeWrapper>
        <Story />
      </DarkModeWrapper>
    ),
  ],
  render: () => (
    <DialogDemo
      props={{
        title: "Dark Mode Dialog",
        size: "sm",
        footer: (
          <>
            <Button variant="outline">Cancel</Button>
            <Button>Confirm</Button>
          </>
        ),
        children: (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Project name" placeholder="my-project" />
            <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
              Surface, border, text, and button colors all adapt automatically.
            </p>
          </div>
        ),
      }}
    />
  ),
};
