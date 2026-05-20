import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { ManagedTabs, Tabs, TabsContent, TabsList, TabsTrigger } from "./index";

const meta: Meta<typeof ManagedTabs> = {
  title: "Components/Tabs",
  component: ManagedTabs,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ManagedTabs>;

// ── Shared helpers ────────────────────────────────────────────────────────────

function Panel({
  title,
  color = "var(--primary-subtle)",
}: {
  title: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: color,
        borderRadius: "var(--radius-md)",
        padding: "24px 16px",
        minHeight: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-secondary)",
        fontSize: "0.875rem",
        fontWeight: 500,
      }}
    >
      {title}
    </div>
  );
}

// ── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <ManagedTabs
      tabs={[
        { label: "Summary", content: <Panel title="Summary content" /> },
        { label: "Analysis", content: <Panel title="Analysis content" /> },
        { label: "Logs", content: <Panel title="Logs content" /> },
      ]}
    />
  ),
};

// ── Many tabs (overflow scroll) ───────────────────────────────────────────────

export const ManyTabs: Story = {
  name: "Many Tabs (overflow scroll)",
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <ManagedTabs
        tabs={[
          "Overview",
          "Dataset",
          "Training",
          "Evaluation",
          "Deployment",
          "Monitoring",
          "Versioning",
          "Logs",
          "Settings",
          "Access Control",
          "Billing",
        ].map((label, i) => ({
          label,
          content: <Panel title={`${label} panel`} />,
          disabled: i === 9 || i === 10,
        }))}
      />
    </div>
  ),
};

// ── Disabled tabs ─────────────────────────────────────────────────────────────

export const DisabledTabs: Story = {
  name: "Disabled Tabs",
  render: () => (
    <ManagedTabs
      tabs={[
        { label: "Summary", content: <Panel title="Always available" /> },
        { label: "Training", content: <Panel title="Training panel" /> },
        {
          label: "Export",
          content: <Panel title="Export (requires trained model)" />,
          disabled: true,
        },
        {
          label: "Evaluation",
          content: <Panel title="Evaluation (requires trained model)" />,
          disabled: true,
        },
      ]}
    />
  ),
};

// ── Controlled ────────────────────────────────────────────────────────────────

export const Controlled: Story = {
  name: "Controlled (value + onChange)",
  render: () => {
    const [active, setActive] = React.useState(0);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            fontSize: "0.75rem",
            color: "var(--text-muted)",
          }}
        >
          <span>Active index:</span>
          <strong style={{ color: "var(--primary-main)" }}>{active}</strong>
          <span style={{ marginLeft: 8 }}>
            (simulates URL sync — consumer calls router.replace)
          </span>
        </div>
        <ManagedTabs
          value={active}
          onChange={setActive}
          tabs={[
            { label: "Tab A", content: <Panel title="Panel A" /> },
            { label: "Tab B", content: <Panel title="Panel B" /> },
            { label: "Tab C", content: <Panel title="Panel C" /> },
          ]}
        />
        <div style={{ display: "flex", gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                padding: "4px 12px",
                fontSize: "0.75rem",
                borderRadius: 4,
                border: "1px solid var(--border-color)",
                background:
                  active === i ? "var(--primary-main)" : "transparent",
                color: active === i ? "#fff" : "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              Jump to {i}
            </button>
          ))}
        </div>
      </div>
    );
  },
};

// ── Single tab ────────────────────────────────────────────────────────────────

export const SingleTab: Story = {
  name: "Single Tab (edge case)",
  render: () => (
    <ManagedTabs
      tabs={[
        { label: "Only Tab", content: <Panel title="Only one tab panel" /> },
      ]}
    />
  ),
};

// ── Long labels ───────────────────────────────────────────────────────────────

export const LongLabels: Story = {
  name: "Long Labels",
  render: () => (
    <ManagedTabs
      tabs={[
        {
          label: "Model Configuration & Settings",
          content: <Panel title="Long label tab 1" />,
        },
        {
          label: "Training & Validation Metrics",
          content: <Panel title="Long label tab 2" />,
        },
        {
          label: "Dataset Preprocessing Pipeline",
          content: <Panel title="Long label tab 3" />,
        },
      ]}
    />
  ),
};

// ── Composable primitives ─────────────────────────────────────────────────────

export const ComposablePrimitives: Story = {
  name: "Composable Primitives",
  render: () => (
    <Tabs defaultValue="summary">
      <TabsList>
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="logs">Logs</TabsTrigger>
        <TabsTrigger value="settings" disabled>
          Settings (disabled)
        </TabsTrigger>
      </TabsList>
      <TabsContent value="summary">
        <Panel title="Summary panel — raw Tabs primitives" />
      </TabsContent>
      <TabsContent value="logs">
        <Panel title="Logs panel — raw Tabs primitives" />
      </TabsContent>
      <TabsContent value="settings">
        <Panel title="Settings panel" />
      </TabsContent>
    </Tabs>
  ),
};

// ── Dark mode ─────────────────────────────────────────────────────────────────

export const DarkMode: Story = {
  name: "Dark Mode",
  decorators: [
    (Story) => (
      <div
        data-theme="dark"
        style={{
          background: "var(--bg-body)",
          padding: 32,
          borderRadius: 8,
          minWidth: 500,
        }}
      >
        <Story />
      </div>
    ),
  ],
  render: () => (
    <ManagedTabs
      tabs={[
        { label: "Overview", content: <Panel title="Dark mode — overview" /> },
        { label: "Training", content: <Panel title="Dark mode — training" /> },
        {
          label: "Disabled",
          content: <Panel title="unreachable" />,
          disabled: true,
        },
      ]}
    />
  ),
};
