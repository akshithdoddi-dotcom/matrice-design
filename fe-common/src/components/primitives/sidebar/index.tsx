// ─────────────────────────────────────────────────────────────────────────────
// Public API — the props-driven sidebar component
// ─────────────────────────────────────────────────────────────────────────────

export { AppSidebar } from "./app-sidebar";

export type {
  AppSidebarProps,
  SidebarMenuItemConfig,
  SidebarMenuGroupConfig,
  SidebarPlatformConfig,
  SidebarClassNames,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Low-level primitives — re-exported for internal sibling usage and advanced
// composition. Prefer `AppSidebar` for standard consumer usage.
// ─────────────────────────────────────────────────────────────────────────────

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  sidebarMenuButtonVariants,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
  useOptionalSidebar,
} from "./sidebar";
