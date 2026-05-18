import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../button";
import { FullScreenLoader, Loader } from "./index";

const meta: Meta<typeof Loader> = {
  title: "Components/Loader",
  component: Loader,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "default", "lg", "fullscreen"],
    },
    label: { control: "text" },
  },
  args: {
    size: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ── Fullscreen — default, full-page auth/session loading ──────────────────────

export const Fullscreen: Story = {
  name: "Fullscreen",
  args: { size: "fullscreen" },
};

// ── Default — medium container, dialogs / content panels ─────────────────────

export const Default: Story = {
  name: "Default",
  args: { size: "default" },
  parameters: { layout: "centered" },
};

// ── Small — compact for cards / table cells ───────────────────────────────────

export const Small: Story = {
  name: "Small",
  args: { size: "sm" },
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 320,
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

// ── Large — section loading, big panels ───────────────────────────────────────

export const Large: Story = {
  name: "Large",
  args: { size: "lg" },
  parameters: { layout: "centered" },
};

// ── With Label ────────────────────────────────────────────────────────────────

export const WithLabel: Story = {
  name: "With Label",
  args: {
    size: "default",
    label: "Loading project...",
  },
  parameters: { layout: "centered" },
};

// ── Dark Mode ─────────────────────────────────────────────────────────────────

export const DarkMode: Story = {
  name: "Dark Mode",
  args: { size: "default", label: "Loading project..." },
  parameters: { layout: "centered" },
  decorators: [
    (Story) => {
      React.useEffect(() => {
        document.body.setAttribute("data-theme", "dark");
        return () => document.body.removeAttribute("data-theme");
      }, []);
      return <Story />;
    },
  ],
};

// ── FullScreenLoader — overlay variant ────────────────────────────────────────

function FullScreenDemo({
  label,
  backdrop,
  loaderSize,
  durationMs = 3000,
}: {
  label?: string;
  backdrop?: React.ComponentProps<typeof FullScreenLoader>["backdrop"];
  loaderSize?: React.ComponentProps<typeof FullScreenLoader>["loaderSize"];
  durationMs?: number;
}) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => setOpen(false), durationMs);
    return () => window.clearTimeout(id);
  }, [open, durationMs]);

  return (
    <div style={{ padding: 24 }}>
      <Button onClick={() => setOpen(true)}>
        Trigger overlay ({Math.round(durationMs / 1000)}s)
      </Button>
      <FullScreenLoader
        open={open}
        label={label}
        backdrop={backdrop}
        loaderSize={loaderSize}
      />
    </div>
  );
}

export const FullScreen_Default: Story = {
  name: "FullScreenLoader / Default",
  parameters: { layout: "fullscreen" },
  render: () => <FullScreenDemo label="Switching workspace…" />,
};

export const FullScreen_Subtle: Story = {
  name: "FullScreenLoader / Subtle backdrop",
  parameters: { layout: "fullscreen" },
  render: () => <FullScreenDemo label="Loading…" backdrop="subtle" />,
};

export const FullScreen_Strong: Story = {
  name: "FullScreenLoader / Strong backdrop",
  parameters: { layout: "fullscreen" },
  render: () => <FullScreenDemo label="Saving changes…" backdrop="strong" />,
};

export const FullScreen_SmallLoader: Story = {
  name: "FullScreenLoader / Small loader",
  parameters: { layout: "fullscreen" },
  render: () => <FullScreenDemo label="One moment…" loaderSize="sm" />,
};

export const FullScreen_NoLabel: Story = {
  name: "FullScreenLoader / No label",
  parameters: { layout: "fullscreen" },
  render: () => <FullScreenDemo />,
};
