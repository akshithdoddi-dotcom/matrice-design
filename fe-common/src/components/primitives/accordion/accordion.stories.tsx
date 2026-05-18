import type { Meta, StoryObj } from "@storybook/react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./index";

const meta: Meta<typeof Accordion> = {
  title: "Primitives/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  argTypes: {
    type: { control: "select", options: ["single", "multiple"] },
    collapsible: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Single: Story = {
  args: { type: "single", collapsible: true },
  render: (args) => (
    <Accordion {...args} className="w-[480px]">
      <AccordionItem value="one">
        <AccordionTrigger>What is the design system?</AccordionTrigger>
        <AccordionContent>
          A shared library of primitives and tokens used across consuming apps.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>How do I install it?</AccordionTrigger>
        <AccordionContent>
          Add the package, import the stylesheet, then import primitives by
          name.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="three">
        <AccordionTrigger>How are styles delivered?</AccordionTrigger>
        <AccordionContent>
          A single bundled stylesheet ships with the package. Consumers do not
          author component styles.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  args: { type: "multiple" },
  render: (args) => (
    <Accordion {...args} className="w-[480px]">
      <AccordionItem value="a">
        <AccordionTrigger>Item A</AccordionTrigger>
        <AccordionContent>Body A</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Item B</AccordionTrigger>
        <AccordionContent>Body B</AccordionContent>
      </AccordionItem>
      <AccordionItem value="c">
        <AccordionTrigger>Item C</AccordionTrigger>
        <AccordionContent>Body C</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const DefaultOpen: Story = {
  args: { type: "single", collapsible: true, defaultValue: "two" },
  render: (args) => (
    <Accordion {...args} className="w-[480px]">
      <AccordionItem value="one">
        <AccordionTrigger>Closed</AccordionTrigger>
        <AccordionContent>Hidden by default</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>Open by default</AccordionTrigger>
        <AccordionContent>Visible on first render</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Disabled: Story = {
  args: { type: "single", collapsible: true, disabled: true },
  render: (args) => (
    <Accordion {...args} className="w-[480px]">
      <AccordionItem value="one">
        <AccordionTrigger>Cannot expand</AccordionTrigger>
        <AccordionContent>You should not see this</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
