import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationRoot,
} from "./index";

const meta: Meta<typeof Pagination> = {
  title: "Primitives/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  argTypes: {
    page: { control: { type: "number", min: 1 } },
    totalPages: { control: { type: "number", min: 0 } },
    siblingCount: { control: { type: "number", min: 0, max: 3 } },
    showEdges: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  args: { page: 1, totalPages: 5, siblingCount: 1 },
  render: (args) => {
    const [page, setPage] = useState(args.page);
    return <Pagination {...args} page={page} onPageChange={setPage} />;
  },
};

export const ManyPages: Story = {
  args: { page: 7, totalPages: 20, siblingCount: 1 },
  render: (args) => {
    const [page, setPage] = useState(args.page);
    return <Pagination {...args} page={page} onPageChange={setPage} />;
  },
};

export const FirstPage: Story = {
  args: { page: 1, totalPages: 10 },
  render: (args) => {
    const [page, setPage] = useState(args.page);
    return <Pagination {...args} page={page} onPageChange={setPage} />;
  },
};

export const LastPage: Story = {
  args: { page: 10, totalPages: 10 },
  render: (args) => {
    const [page, setPage] = useState(args.page);
    return <Pagination {...args} page={page} onPageChange={setPage} />;
  },
};

export const WithCustomLabels: Story = {
  args: { page: 2, totalPages: 8 },
  render: (args) => {
    const [page, setPage] = useState(args.page);
    return (
      <Pagination
        {...args}
        page={page}
        onPageChange={setPage}
        labels={{
          previous: "Anterior",
          next: "Siguiente",
          more: "Más páginas",
          page: (n) => `Página ${n}`,
        }}
      />
    );
  },
};

export const WithHrefBuilder: Story = {
  args: { page: 3, totalPages: 8 },
  render: (args) => (
    <Pagination
      {...args}
      onPageChange={() => {}}
      hrefBuilder={(n) => `/list?page=${n}`}
    />
  ),
};

export const ComposableParts: Story = {
  render: () => (
    <PaginationRoot>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">8</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  ),
};
