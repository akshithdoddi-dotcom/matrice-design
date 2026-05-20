import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { TablePagination } from "./index";

const meta: Meta<typeof TablePagination> = {
  title: "Components/TablePagination",
  component: TablePagination,
  tags: ["autodocs"],
  args: {
    currentPage: 1,
    pageCount: 2,
    totalItems: 12,
    pageSize: 10,
  },
};

export default meta;
type Story = StoryObj<typeof TablePagination>;

function StatefulPagination(
  args: React.ComponentProps<typeof TablePagination>,
) {
  const [page, setPage] = React.useState(args.currentPage ?? 1);
  React.useEffect(() => {
    setPage(args.currentPage ?? 1);
  }, [args.currentPage]);

  return (
    <TablePagination {...args} currentPage={page} onPageChange={setPage} />
  );
}

export const Default: Story = {
  render: (args) => <StatefulPagination {...args} />,
};

export const FirstPage: Story = {
  render: (args) => (
    <StatefulPagination
      {...args}
      currentPage={1}
      pageCount={5}
      totalItems={48}
      pageSize={10}
    />
  ),
};

export const LastPage: Story = {
  render: (args) => (
    <StatefulPagination
      {...args}
      currentPage={5}
      pageCount={5}
      totalItems={48}
      pageSize={10}
    />
  ),
};

export const ManyPages: Story = {
  render: (args) => (
    <StatefulPagination
      {...args}
      currentPage={6}
      pageCount={20}
      totalItems={195}
      pageSize={10}
    />
  ),
};

export const WithoutSummary: Story = {
  args: {
    totalItems: undefined,
    pageSize: undefined,
    showSummary: false,
  },
  render: (args) => <StatefulPagination {...args} />,
};

export const CustomSummary: Story = {
  args: {
    summary: "12 cameras · Page 1",
    totalItems: undefined,
    pageSize: undefined,
  },
  render: (args) => <StatefulPagination {...args} />,
};

export const EmptyResults: Story = {
  args: {
    currentPage: 1,
    pageCount: 1,
    totalItems: 0,
    pageSize: 10,
  },
  render: (args) => <StatefulPagination {...args} />,
};

export const DarkMode: Story = {
  args: {
    currentPage: 1,
    pageCount: 4,
    totalItems: 35,
    pageSize: 10,
  },
  render: (args) => (
    <div data-theme="dark" className="bg-background p-8">
      <StatefulPagination {...args} />
    </div>
  ),
};
