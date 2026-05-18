import { describe, expect, it, vi } from "vitest";

import { FormProvider, useForm } from "react-hook-form";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FormSelect, Select } from "./index";

const options = [
  { label: "Option A", value: "a" },
  { label: "Option B", value: "b" },
  { label: "Option C", value: "c" },
];

const optionsWithDisabled = [
  { label: "Option A", value: "a" },
  { label: "Option B", value: "b", disabled: true },
  { label: "Option C", value: "c" },
];

describe("Select — Single", () => {
  it("renders with placeholder text", () => {
    render(<Select options={options} placeholder="Pick one" />);
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });

  it("opens dropdown when clicked", async () => {
    const user = userEvent.setup();
    render(<Select options={options} placeholder="Pick one" />);
    const trigger = screen.getByRole("button", { name: /Pick one/i });
    await user.click(trigger);
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  it("selects an option and displays it", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Select
        options={options}
        placeholder="Pick one"
        onChange={handleChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Pick one/i }));
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("option", { name: "Option A" }));
    expect(handleChange).toHaveBeenCalledWith("a");
  });

  it("clears selection when clearable and clear icon is clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Select options={options} value="a" clearable onChange={handleChange} />,
    );
    expect(screen.getByText("Option A")).toBeInTheDocument();
    const clearButton = screen.getByRole("button", { name: "Clear selection" });
    await user.click(clearButton);
    expect(handleChange).toHaveBeenCalledWith(null);
  });
});

describe("Select — Multiple", () => {
  it("selects multiple options and shows chips", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Select
        options={options}
        multiple
        value={["a", "b"]}
        onChange={handleChange}
        placeholder="Pick many"
      />,
    );
    // Chips should be visible for selected values
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();

    // Open and select a third
    await user.click(screen.getByRole("button", { expanded: false }));
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("option", { name: "Option C" }));
    expect(handleChange).toHaveBeenCalledWith(["a", "b", "c"]);
  });

  it("removes a chip when its remove icon is clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Select
        options={options}
        multiple
        value={["a", "b"]}
        onChange={handleChange}
      />,
    );
    const removeButton = screen.getByRole("button", {
      name: "Remove Option A",
    });
    await user.click(removeButton);
    expect(handleChange).toHaveBeenCalledWith(["b"]);
  });

  it("shows +N more when more than maxDisplay items selected", () => {
    render(
      <Select
        options={options}
        multiple
        value={["a", "b", "c"]}
        maxDisplay={1}
      />,
    );
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("+2 more")).toBeInTheDocument();
  });

  it("toggles select all when clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Select
        options={options}
        multiple
        value={[]}
        onChange={handleChange}
        selectAll
      />,
    );
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Select All"));
    expect(handleChange).toHaveBeenCalledWith(["a", "b", "c"]);
  });

  it("deselects all when all are selected and select all is clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Select
        options={options}
        multiple
        value={["a", "b", "c"]}
        onChange={handleChange}
        selectAll
      />,
    );
    const trigger = document.querySelector(
      ".mui-select-trigger",
    ) as HTMLElement;
    await user.click(trigger);
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Select All"));
    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it("uses custom select all label", async () => {
    const user = userEvent.setup();
    render(
      <Select
        options={options}
        multiple
        value={[]}
        selectAll
        selectAllLabel="Choose All"
      />,
    );
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByText("Choose All")).toBeInTheDocument();
    });
  });
});

describe("Select — Label and Helper Text", () => {
  it("renders label when provided", () => {
    render(<Select options={options} label="Select an option" />);
    expect(screen.getByText("Select an option")).toBeInTheDocument();
  });

  it("renders required indicator when required", () => {
    render(<Select options={options} label="Required field" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders helper text when provided", () => {
    render(<Select options={options} helperText="This is helper text" />);
    expect(screen.getByText("This is helper text")).toBeInTheDocument();
  });

  it("renders error message when error is true with errorMessage", () => {
    render(
      <Select options={options} error errorMessage="This field has an error" />,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("This field has an error");
  });

  it("displays errorMessage over helperText when both provided", () => {
    render(
      <Select
        options={options}
        helperText="Helper"
        error
        errorMessage="Error message"
      />,
    );
    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.queryByText("Helper")).not.toBeInTheDocument();
  });
});

describe("Select — Disabled State", () => {
  it("disables the trigger when disabled is true", () => {
    render(<Select options={options} disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("does not open dropdown when disabled", async () => {
    const user = userEvent.setup();
    render(<Select options={options} disabled />);
    await user.click(screen.getByRole("button"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("skips disabled options in list", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Select options={optionsWithDisabled} onChange={handleChange} />);
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    const disabledOption = screen.getByRole("option", { name: "Option B" });
    expect(disabledOption).toBeDisabled();
  });
});

describe("Select — Search Functionality", () => {
  it("filters options when searching", async () => {
    const user = userEvent.setup();
    render(<Select options={options} searchable />);
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    const searchInput = screen.getByPlaceholderText("Search...");
    await user.type(searchInput, "Option A");
    expect(
      screen.getByRole("option", { name: "Option A" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Option B" }),
    ).not.toBeInTheDocument();
  });

  it("shows no options found when search has no results", async () => {
    const user = userEvent.setup();
    render(<Select options={options} searchable />);
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    const searchInput = screen.getByPlaceholderText("Search...");
    await user.type(searchInput, "xyz");
    expect(screen.getByText("No options found")).toBeInTheDocument();
  });

  it("does not show search input when searchable is false", async () => {
    const user = userEvent.setup();
    render(<Select options={options} searchable={false} />);
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    expect(screen.queryByPlaceholderText("Search...")).not.toBeInTheDocument();
  });
});

describe("Select — Creatable", () => {
  it("shows create option when typing a new value", async () => {
    const user = userEvent.setup();
    render(<Select options={options} searchable creatable />);
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    const searchInput = screen.getByPlaceholderText("Search...");
    await user.type(searchInput, "New Option");
    expect(screen.getByText('Create "New Option"')).toBeInTheDocument();
  });

  it("creates and selects new option when clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Select options={options} searchable creatable onChange={handleChange} />,
    );
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    const searchInput = screen.getByPlaceholderText("Search...");
    await user.type(searchInput, "Custom");
    await user.click(screen.getByText('Create "Custom"'));
    expect(handleChange).toHaveBeenCalledWith("Custom");
  });

  it("does not show create option for existing label", async () => {
    const user = userEvent.setup();
    render(<Select options={options} searchable creatable />);
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    const searchInput = screen.getByPlaceholderText("Search...");
    await user.type(searchInput, "Option A");
    expect(screen.queryByText(/Create/)).not.toBeInTheDocument();
  });
});

describe("Select — Loading State", () => {
  it("shows loading spinner in trigger when loading", () => {
    render(<Select options={options} loading />);
    // The spinner should be visible (no chevron)
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows loading state in dropdown when loading", async () => {
    const user = userEvent.setup();
    render(<Select options={options} loading />);
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });
});

describe("Select — Keyboard Navigation", () => {
  it("opens dropdown with ArrowDown key", async () => {
    const user = userEvent.setup();
    render(<Select options={options} />);
    const trigger = screen.getByRole("button");
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  it("opens dropdown with Enter key", async () => {
    const user = userEvent.setup();
    render(<Select options={options} />);
    const trigger = screen.getByRole("button");
    trigger.focus();
    await user.keyboard("{Enter}");
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  it("opens dropdown with Space key", async () => {
    const user = userEvent.setup();
    render(<Select options={options} />);
    const trigger = screen.getByRole("button");
    trigger.focus();
    await user.keyboard(" ");
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  it("navigates options with arrow keys in search input", async () => {
    const user = userEvent.setup();
    render(<Select options={options} searchable />);
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    // Should have moved highlight
    const highlighted = document.querySelector('[data-highlighted="true"]');
    expect(highlighted).toBeInTheDocument();
  });

  it("selects highlighted option with Enter key", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Select options={options} searchable onChange={handleChange} />);
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    // Focus the search input and use arrow keys
    const searchInput = screen.getByPlaceholderText("Search...");
    searchInput.focus();
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");
    expect(handleChange).toHaveBeenCalled();
  });

  it("closes dropdown with Escape key", async () => {
    const user = userEvent.setup();
    render(<Select options={options} searchable />);
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("removes last selected value with Backspace in multi mode", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Select
        options={options}
        multiple
        value={["a", "b"]}
        onChange={handleChange}
        searchable
      />,
    );
    // Click the trigger that's not a chip remove button
    const trigger = document.querySelector(
      ".mui-select-trigger",
    ) as HTMLElement;
    await user.click(trigger);
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    // Focus search input and press backspace when empty
    const searchInput = screen.getByPlaceholderText("Search...");
    searchInput.focus();
    await user.keyboard("{Backspace}");
    expect(handleChange).toHaveBeenCalledWith(["a"]);
  });
});

describe("Select — Size Variants", () => {
  it("applies sm size class", () => {
    render(<Select options={options} size="sm" />);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("data-size", "sm");
  });

  it("applies default size class", () => {
    render(<Select options={options} size="default" />);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("data-size", "default");
  });
});

describe("Select — Accessibility", () => {
  it("sets aria-expanded based on open state", async () => {
    const user = userEvent.setup();
    render(<Select options={options} />);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    await waitFor(() => {
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });
  });

  it("sets aria-invalid when error is true", () => {
    render(<Select options={options} error />);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
  });

  it("sets aria-describedby when helper text exists", () => {
    render(<Select options={options} helperText="Helper" />);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-describedby");
  });
});

// FormSelect tests
describe("FormSelect", () => {
  const TestFormSingle = ({ onSubmit = vi.fn() }) => {
    const methods = useForm({ defaultValues: { country: "" } });
    return (
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <FormSelect name="country" options={options} label="Country" />
          <button type="submit">Submit</button>
        </form>
      </FormProvider>
    );
  };

  const TestFormMulti = ({ onSubmit = vi.fn() }) => {
    const methods = useForm({ defaultValues: { countries: [] as string[] } });
    return (
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <FormSelect
            name="countries"
            options={options}
            label="Countries"
            multiple
          />
          <button type="submit">Submit</button>
        </form>
      </FormProvider>
    );
  };

  it("integrates with react-hook-form for single select", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<TestFormSingle onSubmit={handleSubmit} />);

    await user.click(screen.getByRole("button", { name: /Select/i }));
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("option", { name: "Option A" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        { country: "a" },
        expect.anything(),
      );
    });
  });

  it("integrates with react-hook-form for multi select", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<TestFormMulti onSubmit={handleSubmit} />);

    await user.click(screen.getByRole("button", { name: /Select/i }));
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("option", { name: "Option A" }));
    await user.click(screen.getByRole("option", { name: "Option B" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        { countries: ["a", "b"] },
        expect.anything(),
      );
    });
  });
});
