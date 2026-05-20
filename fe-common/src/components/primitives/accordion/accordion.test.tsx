import { describe, expect, it } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./index";

function Example({ type = "single" as "single" | "multiple" }) {
  return (
    <Accordion type={type} collapsible={type === "single" ? true : undefined}>
      <AccordionItem value="one">
        <AccordionTrigger>Section one</AccordionTrigger>
        <AccordionContent>Content one</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>Section two</AccordionTrigger>
        <AccordionContent>Content two</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

describe("Primitives/Accordion", () => {
  it("renders all triggers", () => {
    render(<Example />);
    expect(
      screen.getByRole("button", { name: "Section one" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Section two" }),
    ).toBeInTheDocument();
  });

  it("expands an item on trigger click", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Section one" }));
    expect(screen.getByText("Content one")).toBeVisible();
  });

  it("collapses other items in single mode", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Section one" }));
    await user.click(screen.getByRole("button", { name: "Section two" }));
    expect(screen.getByRole("button", { name: "Section one" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByRole("button", { name: "Section two" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("forwards className on AccordionItem", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="one" className="custom-item">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Body</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const item = document.querySelector('[data-slot="accordion-item"]');
    expect(item).toHaveClass("custom-item");
  });

  it("sets data-slot attributes for styling overrides", () => {
    render(<Example />);
    expect(
      document.querySelector('[data-slot="accordion"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="accordion-item"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="accordion-trigger"]'),
    ).toBeInTheDocument();
  });
});
