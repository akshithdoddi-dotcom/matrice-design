import { BarChart3, Monitor, Shield, Wrench } from "lucide-react";
import { Home, Settings, Users } from "lucide-react";

import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "../sidebar";
import { PlatformSwitcher } from "./index";
import type { Platform } from "./index";

const platforms: Platform[] = [
  {
    value: "vms",
    label: "Matrice VMS",
    icon: <Monitor className="size-4 shrink-0" />,
    shortcut: "1",
  },
  {
    value: "analytics",
    label: "Matrice Analytics",
    icon: <BarChart3 className="size-4 shrink-0" />,
    shortcut: "2",
  },
  {
    value: "support",
    label: "Matrice Support",
    icon: <Wrench className="size-4 shrink-0" />,
    shortcut: "3",
  },
  {
    value: "internal",
    label: "Matrice Internal",
    icon: <Shield className="size-4 shrink-0" />,
    shortcut: "4",
  },
];

const meta: Meta<typeof PlatformSwitcher> = {
  title: "Primitives/PlatformSwitcher",
  component: PlatformSwitcher,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PlatformSwitcher>;

export const Standalone: Story = {
  render: function StandaloneDemo() {
    const [active, setActive] = React.useState("support");
    return (
      <div style={{ padding: 48, maxWidth: 300 }}>
        <PlatformSwitcher
          platforms={platforms}
          activePlatform={active}
          onPlatformChange={setActive}
          title="Matrice.ai"
          subtitle="Support Platform"
          side="bottom"
        />
      </div>
    );
  },
};

export const InSidebar: Story = {
  name: "Inside Sidebar",
  parameters: { layout: "fullscreen" },
  render: function SidebarDemo() {
    const [active, setActive] = React.useState("support");
    return (
      <div style={{ height: "100vh" }}>
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <PlatformSwitcher
                    platforms={platforms}
                    activePlatform={active}
                    onPlatformChange={setActive}
                    title="Matrice.ai"
                    subtitle="Support Platform"
                  />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive tooltip="Home">
                        <Home className="size-4" />
                        <span>Home</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip="Users">
                        <Users className="size-4" />
                        <span>Users</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip="Settings">
                        <Settings className="size-4" />
                        <span>Settings</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <header className="flex items-center gap-2 p-4 border-b border-border">
              <SidebarTrigger />
              <span>Platform switcher inside sidebar header</span>
            </header>
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  },
};

export const CollapsedSidebar: Story = {
  name: "Collapsed Sidebar (Icon Mode)",
  parameters: { layout: "fullscreen" },
  render: function CollapsedDemo() {
    const [active, setActive] = React.useState("analytics");
    return (
      <div style={{ height: "100vh" }}>
        <SidebarProvider defaultOpen={false}>
          <Sidebar collapsible="icon">
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <PlatformSwitcher
                    platforms={platforms}
                    activePlatform={active}
                    onPlatformChange={setActive}
                    title="Matrice.ai"
                    subtitle="Analytics"
                  />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive tooltip="Home">
                        <Home className="size-4" />
                        <span>Home</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <header className="flex items-center gap-2 p-4 border-b border-border">
              <SidebarTrigger />
              <span>
                Collapsed — only logo icon visible. Click trigger to expand.
              </span>
            </header>
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  },
};

export const CustomLogo: Story = {
  render: function CustomLogoDemo() {
    const [active, setActive] = React.useState("vms");
    return (
      <div style={{ padding: 48, maxWidth: 300 }}>
        <PlatformSwitcher
          platforms={platforms}
          activePlatform={active}
          onPlatformChange={setActive}
          title="Acme Corp"
          subtitle="Dashboard"
          logo={
            <div className="size-8 rounded-md bg-destructive flex items-center justify-center text-white text-xs font-bold">
              AC
            </div>
          }
          side="bottom"
        />
      </div>
    );
  },
};
