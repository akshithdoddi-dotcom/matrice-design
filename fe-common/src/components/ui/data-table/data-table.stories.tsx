import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../button";
import { StatusChip } from "../status-chip";
import { type ColumnDef, DataTable } from "./index";

type DemoRow = {
  id: string;
  name: string;
  status: "active" | "idle" | "error";
  type: string;
  createdAt: string;
  owner: string;
  region: string;
};

const demoData: DemoRow[] = Array.from({ length: 42 }, (_, index) => ({
  id: `row-${index + 1}`,
  name: `Model ${index + 1}`,
  status: index % 7 === 0 ? "error" : index % 3 === 0 ? "idle" : "active",
  type: index % 2 === 0 ? "Detection" : "Classification",
  createdAt: new Date(Date.now() - index * 86_400_000).toISOString(),
  owner: index % 2 === 0 ? "Anita" : "Rahul",
  region: index % 3 === 0 ? "us-east-1" : "ap-south-1",
}));

const columns: ColumnDef<DemoRow>[] = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    sortable: true,
    filterable: true,
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    sortable: true,
    filterable: true,
    cell: ({ getValue }) => <StatusChip status={getValue() as string} />,
  },
  {
    id: "type",
    header: "Type",
    accessorKey: "type",
    sortable: true,
    filterable: true,
  },
  {
    id: "createdAt",
    header: "Created",
    accessorKey: "createdAt",
    sortable: true,
    cell: ({ getValue }) => new Date(String(getValue())).toLocaleString(),
  },
  { id: "owner", header: "Owner", accessorKey: "owner", filterable: true },
];

const meta: Meta<typeof DataTable<DemoRow>> = {
  title: "Components/DataTable",
  component: DataTable<DemoRow>,
  tags: ["autodocs"],
  args: {
    columns,
    data: demoData.slice(0, 10),
    rowIdKey: "id",
    loading: false,
    selectable: false,
    striped: true,
    toolbar: true,
    pagination: "client",
    pageSize: 10,
  },
  argTypes: {
    loading: { control: "boolean" },
    selectable: { control: "boolean" },
    striped: { control: "boolean" },
    toolbar: { control: "boolean" },
    pagination: { control: "select", options: ["client", "server", "none"] },
    pageSize: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCardWrapper: Story = {
  args: {
    cardTitle: "Access Keys",
    cardSubTitle: "Manage and monitor active keys",
    cardAction: <Button size="sm">Create Key</Button>,
  },
};

export const ServerPagination: Story = {
  render: (args) => {
    const [page, setPage] = React.useState(1);
    const [size, setSize] = React.useState(10);
    const start = (page - 1) * size;
    const pageRows = demoData.slice(start, start + size);

    return (
      <DataTable
        {...args}
        columns={args.columns ?? columns}
        data={pageRows}
        rowIdKey={args.rowIdKey ?? "id"}
        pagination="server"
        currentPage={page}
        pageSize={size}
        totalRows={demoData.length}
        onPageChange={setPage}
        onPageSizeChange={(next) => {
          setSize(next);
          setPage(1);
        }}
      />
    );
  },
};

export const ClientPagination: Story = {
  args: {
    data: demoData,
    pagination: "client",
    pageSize: 5,
  },
};

export const Sortable: Story = {
  args: {
    data: demoData,
    sortable: true,
  },
};

export const Selectable: Story = {
  args: {
    data: demoData.slice(0, 15),
    selectable: true,
    selectionMode: "multi",
    showRowCue: false,
  },
};

export const SingleSelect: Story = {
  args: {
    data: demoData.slice(0, 15),
    selectable: true,
    selectionMode: "single",
    showRowCue: false,
  },
};

export const WithToolbar: Story = {
  args: {
    data: demoData,
    toolbar: true,
    selectable: true,
    exportable: true,
    showRowCue: false,
    toolbarActions: <Button size="sm">Create Model</Button>,
  },
};

export const Loading: Story = {
  args: {
    data: demoData.slice(0, 10),
    loading: true,
  },
};

export const EmptyState: Story = {
  args: {
    data: [],
    emptyState: {
      title: "No models",
      description: "No items to display",
      action: <Button size="sm">Create Model</Button>,
    },
  },
};

export const Striped: Story = {
  args: {
    data: demoData.slice(0, 12),
    striped: true,
  },
};

export const CustomCellRenderers: Story = {
  args: {
    data: demoData.slice(0, 12),
    columns: [
      columns[0],
      columns[1],
      {
        id: "link",
        header: "Open",
        accessorFn: (row: DemoRow) => row.id,
        cell: ({ getValue }: { row: DemoRow; getValue: () => unknown }) => (
          <a
            href="#"
            onClick={(event) => event.preventDefault()}
            className="text-(--primary-main) underline"
          >
            {String(getValue())}
          </a>
        ),
      },
      columns[3],
    ],
  },
};

export const ManyColumns: Story = {
  args: {
    data: demoData,
    columns: [
      ...columns,
      { id: "region", header: "Region", accessorKey: "region" },
      { id: "id", header: "ID", accessorKey: "id" },
      { id: "owner2", header: "Owner Copy", accessorKey: "owner" },
      { id: "type2", header: "Type Copy", accessorKey: "type" },
    ],
  },
};

export const RowClick: Story = {
  args: {
    data: demoData.slice(0, 12),
    onRowClick: (row: DemoRow) => {
      console.log("Clicked row:", row.id);
    },
  },
};

export const Expandable: Story = {
  args: {
    data: demoData.slice(0, 8),
    expandable: true,
    renderExpandedRow: (row: DemoRow) => (
      <div className="px-4">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <dt className="text-(--text-muted)">Owner</dt>
          <dd>{row.owner}</dd>
          <dt className="text-(--text-muted)">Region</dt>
          <dd>{row.region}</dd>
          <dt className="text-(--text-muted)">Created</dt>
          <dd>{new Date(row.createdAt).toLocaleString()}</dd>
          <dt className="text-(--text-muted)">ID</dt>
          <dd className="font-mono">{row.id}</dd>
        </dl>
      </div>
    ),
  },
};

export const ExpandableNestedTable: Story = {
  args: {
    data: demoData.slice(0, 5),
    expandable: true,
    renderExpandedRow: (row: DemoRow) => {
      type Step = { id: string; step: string; duration: string };
      const stepColumns: ColumnDef<Step>[] = [
        { id: "step", header: "Step", accessorKey: "step" },
        { id: "duration", header: "Duration", accessorKey: "duration" },
      ];
      const stepData: Step[] = [
        { id: `${row.id}-a`, step: "Preprocess", duration: "1.2s" },
        { id: `${row.id}-b`, step: "Inference", duration: "0.4s" },
        { id: `${row.id}-c`, step: "Postprocess", duration: "0.8s" },
      ];
      return (
        <DataTable
          className="w-full min-w-0 max-w-none"
          columns={stepColumns}
          data={stepData}
          rowIdKey="id"
          toolbar={false}
          pagination="none"
          striped={false}
          showRowCue={false}
        />
      );
    },
  },
};

export const ExpandableControlled: Story = {
  render: (args) => {
    const [expanded, setExpanded] = React.useState<string[]>([]);
    return (
      <DataTable
        {...args}
        columns={args.columns ?? columns}
        data={demoData.slice(0, 6)}
        rowIdKey={args.rowIdKey ?? "id"}
        expandable
        expansionMode="single"
        expandedRows={expanded}
        onExpandedRowsChange={(ids) => setExpanded(ids as string[])}
        renderExpandedRow={(row: DemoRow) => (
          <div className="px-4">
            <pre className="text-xs">{JSON.stringify(row, null, 2)}</pre>
          </div>
        )}
      />
    );
  },
};

export const DarkMode: Story = {
  args: {
    data: demoData.slice(0, 10),
    selectable: true,
    exportable: true,
    showRowCue: false,
  },
  decorators: [
    (StoryFn) => (
      <div data-theme="dark" className="bg-background p-6">
        <StoryFn />
      </div>
    ),
  ],
};
