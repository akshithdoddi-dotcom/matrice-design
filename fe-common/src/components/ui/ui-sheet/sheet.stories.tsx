import { Info } from "lucide-react";

import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../button";
import { Input } from "../input";
import { ManagedSheet, type ManagedSheetProps } from "./index";

const meta: Meta<typeof ManagedSheet> = {
  title: "Components/Sheet",
  component: ManagedSheet,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    open: { control: "boolean" },
    title: { control: "text" },
    description: { control: "text" },
    side: {
      control: "select",
      options: ["top", "right", "bottom", "left"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "full"],
    },
    dividers: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ManagedSheet>;

// ── Reusable trigger wrapper ──────────────────────────────────────────────────

function SheetDemo({
  label = "Open Sheet",
  props,
}: {
  label?: string;
  props: Omit<ManagedSheetProps, "open" | "onClose">;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <ManagedSheet {...props} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

// ── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <SheetDemo
      props={{
        title: "Model Details",
        description: "Per-model training and evaluation breakdown.",
        side: "right",
        size: "md",
        footer: <Button>Close</Button>,
        children: (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Name" placeholder="alpha-v2" />
            <Input label="Threshold" placeholder="0.5" type="number" />
          </div>
        ),
      }}
    />
  ),
};

// ── Side variants ────────────────────────────────────────────────────────────

export const Right: Story = {
  render: () => (
    <SheetDemo
      label="Open from Right"
      props={{
        title: "Right Drawer",
        side: "right",
        size: "md",
        children: <p>Slides in from the right.</p>,
      }}
    />
  ),
};

export const Left: Story = {
  render: () => (
    <SheetDemo
      label="Open from Left"
      props={{
        title: "Left Drawer",
        side: "left",
        size: "md",
        children: <p>Slides in from the left.</p>,
      }}
    />
  ),
};

export const Top: Story = {
  render: () => (
    <SheetDemo
      label="Open from Top"
      props={{
        title: "Top Drawer",
        side: "top",
        size: "md",
        children: <p>Slides in from the top.</p>,
      }}
    />
  ),
};

export const Bottom: Story = {
  render: () => (
    <SheetDemo
      label="Open from Bottom"
      props={{
        title: "Bottom Drawer",
        side: "bottom",
        size: "md",
        children: <p>Slides in from the bottom.</p>,
      }}
    />
  ),
};

// ── Size variants (right side) ───────────────────────────────────────────────

export const SizeSmall: Story = {
  name: "Size: sm",
  render: () => (
    <SheetDemo
      label="sm"
      props={{
        title: "Small Drawer",
        side: "right",
        size: "sm",
        children: <p>Approx. 24rem wide.</p>,
      }}
    />
  ),
};

export const SizeMedium: Story = {
  name: "Size: md (default)",
  render: () => (
    <SheetDemo
      label="md"
      props={{
        title: "Medium Drawer",
        side: "right",
        size: "md",
        children: <p>Approx. 32rem wide.</p>,
      }}
    />
  ),
};

export const SizeLarge: Story = {
  name: "Size: lg",
  render: () => (
    <SheetDemo
      label="lg"
      props={{
        title: "Large Drawer",
        side: "right",
        size: "lg",
        children: <p>Approx. 48rem wide.</p>,
      }}
    />
  ),
};

export const SizeExtraLarge: Story = {
  name: "Size: xl",
  render: () => (
    <SheetDemo
      label="xl"
      props={{
        title: "Extra-Large Drawer",
        side: "right",
        size: "xl",
        children: <p>Approx. 64rem wide.</p>,
      }}
    />
  ),
};

export const SizeFull: Story = {
  name: "Size: full",
  render: () => (
    <SheetDemo
      label="full"
      props={{
        title: "Full Drawer",
        side: "right",
        size: "full",
        children: <p>Spans the full viewport width.</p>,
      }}
    />
  ),
};

// ── With footer ──────────────────────────────────────────────────────────────

export const WithFooter: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open with Footer</Button>
        <ManagedSheet
          open={open}
          onClose={() => setOpen(false)}
          title="Edit Settings"
          description="Save or cancel your changes."
          side="right"
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Save</Button>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Name" placeholder="my-project" />
            <Input label="Description" placeholder="optional" />
          </div>
        </ManagedSheet>
      </>
    );
  },
};

// ── Long scrolling body ──────────────────────────────────────────────────────

export const LongScrollingBody: Story = {
  name: "Long Scrolling Body",
  render: () => (
    <SheetDemo
      label="Open long body"
      props={{
        title: "Activity Log",
        description: "Header and footer stay fixed while body scrolls.",
        side: "right",
        size: "md",
        footer: <Button>Close</Button>,
        children: (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Array.from({ length: 40 }, (_, i) => (
              <div
                key={i}
                style={{
                  padding: 12,
                  borderRadius: 6,
                  background: "var(--bg-subtle)",
                  fontSize: "0.875rem",
                }}
              >
                Event #{i + 1} — lorem ipsum dolor sit amet, consectetur
                adipiscing elit.
              </div>
            ))}
          </div>
        ),
      }}
    />
  ),
};

// ── Extra title node ─────────────────────────────────────────────────────────

export const WithExtraTitleNode: Story = {
  name: "With Extra Title Node",
  render: () => (
    <SheetDemo
      props={{
        title: "Configure Threshold",
        side: "right",
        size: "md",
        extraTitleNode: (
          <span
            title="Changes apply to all future predictions"
            style={{ cursor: "help", display: "inline-flex" }}
          >
            <Info size={16} />
          </span>
        ),
        footer: <Button>Apply</Button>,
        children: (
          <Input label="Decision threshold" placeholder="0.5" type="number" />
        ),
      }}
    />
  ),
};

// ── No dividers ──────────────────────────────────────────────────────────────

export const NoDividers: Story = {
  name: "No Dividers",
  render: () => (
    <SheetDemo
      props={{
        title: "Seamless Layout",
        side: "right",
        size: "md",
        dividers: false,
        footer: <Button>Save</Button>,
        children: (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            This sheet has <code>dividers=false</code> — no separator lines
            between header, body, and footer.
          </p>
        ),
      }}
    />
  ),
};
