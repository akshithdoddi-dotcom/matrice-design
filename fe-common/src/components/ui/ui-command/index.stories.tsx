import { BarChart3, Camera, Headphones, Shield } from "lucide-react";

import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./index";

const meta: Meta<typeof Command> = {
  title: "UI/Command",
  component: Command,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Command>;

/* -------------------------------------------------------------------------- */
/*  Figma — Platforms switcher                                                */
/* -------------------------------------------------------------------------- */

export const PlatformsSwitcher: Story = {
  render: () => (
    <div className="w-56 border border-border rounded-md shadow-md bg-surface p-1.5">
      <Command>
        <CommandList>
          <CommandGroup heading="Platforms">
            <CommandItem value="matrice-vms">
              <Camera className="size-4 shrink-0" />
              <span className="flex-1 truncate">Matrice VMS</span>
              <CommandShortcut>⌘1</CommandShortcut>
            </CommandItem>

            <CommandItem value="matrice-analytics" active>
              <BarChart3 className="size-4 shrink-0" />
              <span className="flex-1 truncate">Matrice Analytics</span>
              <CommandShortcut>⌘2</CommandShortcut>
            </CommandItem>

            <CommandItem value="matrice-support">
              <Headphones className="size-4 shrink-0" />
              <span className="flex-1 truncate">Matrice Support</span>
              <CommandShortcut>⌘3</CommandShortcut>
            </CommandItem>

            <CommandItem value="matrice-internal">
              <Shield className="size-4 shrink-0" />
              <span className="flex-1 truncate">Matrice Internal</span>
              <CommandShortcut>⌘4</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
};

/* -------------------------------------------------------------------------- */
/*  With separator between groups                                             */
/* -------------------------------------------------------------------------- */

export const MultipleGroups: Story = {
  render: () => (
    <div className="w-56 border border-border rounded-md shadow-md bg-surface p-1.5">
      <Command>
        <CommandList>
          <CommandGroup heading="Platforms">
            <CommandItem value="matrice-vms" active>
              <Camera className="size-4 shrink-0" />
              <span className="flex-1 truncate">Matrice VMS</span>
              <CommandShortcut>⌘1</CommandShortcut>
            </CommandItem>

            <CommandItem value="matrice-analytics">
              <BarChart3 className="size-4 shrink-0" />
              <span className="flex-1 truncate">Matrice Analytics</span>
              <CommandShortcut>⌘2</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Tools">
            <CommandItem value="matrice-support">
              <Headphones className="size-4 shrink-0" />
              <span className="flex-1 truncate">Matrice Support</span>
              <CommandShortcut>⌘3</CommandShortcut>
            </CommandItem>

            <CommandItem value="matrice-internal">
              <Shield className="size-4 shrink-0" />
              <span className="flex-1 truncate">Matrice Internal</span>
              <CommandShortcut>⌘4</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
};

/* -------------------------------------------------------------------------- */
/*  Empty state                                                               */
/* -------------------------------------------------------------------------- */

export const EmptyState: Story = {
  render: () => (
    <div className="w-56 border border-border rounded-md shadow-md bg-surface p-1.5">
      <Command>
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
        </CommandList>
      </Command>
    </div>
  ),
};

/* -------------------------------------------------------------------------- */
/*  Disabled items                                                            */
/* -------------------------------------------------------------------------- */

export const WithDisabledItems: Story = {
  render: () => (
    <div className="w-56 border border-border rounded-md shadow-md bg-surface p-1.5">
      <Command>
        <CommandList>
          <CommandGroup heading="Platforms">
            <CommandItem value="matrice-vms" active>
              <Camera className="size-4 shrink-0" />
              <span className="flex-1 truncate">Matrice VMS</span>
              <CommandShortcut>⌘1</CommandShortcut>
            </CommandItem>

            <CommandItem value="matrice-analytics" disabled>
              <BarChart3 className="size-4 shrink-0" />
              <span className="flex-1 truncate">Matrice Analytics</span>
              <CommandShortcut>⌘2</CommandShortcut>
            </CommandItem>

            <CommandItem value="matrice-support">
              <Headphones className="size-4 shrink-0" />
              <span className="flex-1 truncate">Matrice Support</span>
              <CommandShortcut>⌘3</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
};
