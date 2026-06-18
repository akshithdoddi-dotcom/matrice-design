import type React from "react";
import { useState } from "react";
import {
  LayoutGrid,
  MousePointerClick,
  TextCursorInput,
  AlignLeft,
  CheckSquare2,
  ToggleLeft,
  ListFilter,
  SlidersHorizontal,
  CircleUser,
  SquareDashed,
  TrendingUp,
  FolderOpen,
  Table2,
  AlertCircle,
  MessageCircle,
  List,
  AppWindow,
  PanelRight,
  Layers,
  LayoutDashboard,
  Minus,
  ScrollText,
  Tag,
  CreditCard,
  Loader2,
  Radio,
  BarChart2,
  Grid3x3,
  Bell,
  Calendar,
  Activity,
  PanelLeft,
  Navigation,
  GaugeCircle,
  FileText,
  Sliders,
  ChevronLeftSquare,
  UserCircle,
  BellRing,
  ExternalLink,
  Circle,
  FormInput,
  Layout,
  AlertTriangle,
} from "lucide-react";
import { AppShell, type NavItem } from "../components/layout/AppShell";
import { OverviewPage } from "./pages/OverviewPage";
import { ButtonPage } from "./pages/ButtonPage";
import { InputPage } from "./pages/InputPage";
import { TextareaPage } from "./pages/TextareaPage";
import { CheckboxPage } from "./pages/CheckboxPage";
import { SwitchPage } from "./pages/SwitchPage";
import { SelectPage } from "./pages/SelectPage";
import { SliderPage } from "./pages/SliderPage";
import { AvatarPage } from "./pages/AvatarPage";
import { SkeletonPage } from "./pages/SkeletonPage";
import { StatCardPage } from "./pages/StatCardPage";
import { EmptyStatePage } from "./pages/EmptyStatePage";
import { DataGridPage } from "./pages/DataGridPage";
import { AlertPage } from "./pages/AlertPage";
import { TooltipPage } from "./pages/TooltipPage";
import { AccordionPage } from "./pages/AccordionPage";
import { DialogPage } from "./pages/DialogPage";
import { SheetPage } from "./pages/SheetPage";
import { PopoverPage } from "./pages/PopoverPage";
import { TabsPage } from "./pages/TabsPage";
import { SeparatorPage } from "./pages/SeparatorPage";
import { ScrollAreaPage } from "./pages/ScrollAreaPage";
import { BadgePage } from "./pages/BadgePage";
import { CardPage } from "./pages/CardPage";
import { LoaderPage } from "./pages/LoaderPage";
import { StatusChipPage } from "./pages/StatusChipPage";
import { ChartsPage } from "./pages/ChartsPage";
import { DataTablePage } from "./pages/DataTablePage";
import { ToastPage } from "./pages/ToastPage";
import { ChoiceGroupPage } from "./pages/ChoiceGroupPage";
import { DatePickerPage } from "./pages/DatePickerPage";
// New pages
import { SidebarPage } from "./pages/SidebarPage";
import { NavbarPage } from "./pages/NavbarPage";
import { KpiCardPage } from "./pages/KpiCardPage";
import { PageHeaderPage } from "./pages/PageHeaderPage";
import { SegmentedControlPage } from "./pages/SegmentedControlPage";
import { TablePaginationPage } from "./pages/TablePaginationPage";
import { ProfileMenuPage } from "./pages/ProfileMenuPage";
import { NotificationMenuPage } from "./pages/NotificationMenuPage";
import { LinkPage } from "./pages/LinkPage";
import { RadioGroupPage } from "./pages/RadioGroupPage";
import { FormTextFieldPage } from "./pages/FormTextFieldPage";
import { ErrorPagePage } from "./pages/ErrorPagePage";

// ── Types ─────────────────────────────────────────────────────────────────────

type Page =
  | "overview"
  | "button"
  | "input"
  | "textarea"
  | "checkbox"
  | "switch"
  | "select"
  | "slider"
  | "radio-group"
  | "choice-group"
  | "date-picker"
  | "form-text-field"
  | "avatar"
  | "skeleton"
  | "badge"
  | "status-chip"
  | "stat-card"
  | "kpi-card"
  | "card"
  | "empty-state"
  | "data-grid"
  | "data-table"
  | "charts"
  | "loader"
  | "link"
  | "alert"
  | "toast"
  | "tooltip"
  | "accordion"
  | "dialog"
  | "sheet"
  | "popover"
  | "tabs"
  | "separator"
  | "scroll-area"
  | "sidebar"
  | "navbar"
  | "page-header"
  | "segmented-control"
  | "table-pagination"
  | "profile-menu"
  | "notification-menu"
  | "error-page";

// ── Nav items ─────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { id: "overview",      label: "Overview",     icon: LayoutGrid },
  // ── Form Controls ──────────────────────────────────────────────────────────
  { id: "button",        label: "Button",       icon: MousePointerClick },
  { id: "input",         label: "Input",        icon: TextCursorInput },
  { id: "textarea",      label: "Textarea",     icon: AlignLeft },
  { id: "form-text-field", label: "FormTextField", icon: FormInput },
  { id: "checkbox",      label: "Checkbox",     icon: CheckSquare2 },
  { id: "switch",        label: "Switch",       icon: ToggleLeft },
  { id: "select",        label: "Select",       icon: ListFilter },
  { id: "slider",        label: "Slider",       icon: SlidersHorizontal },
  { id: "radio-group",   label: "RadioGroup",   icon: Circle },
  { id: "choice-group",  label: "ChoiceGroup",  icon: Radio },
  { id: "date-picker",   label: "DatePicker",   icon: Calendar },
  // ── Display ────────────────────────────────────────────────────────────────
  { id: "avatar",        label: "Avatar",       icon: CircleUser },
  { id: "skeleton",      label: "Skeleton",     icon: SquareDashed },
  { id: "badge",         label: "Badge",        icon: Tag },
  { id: "status-chip",   label: "StatusChip",   icon: Activity },
  { id: "stat-card",     label: "StatCard",     icon: TrendingUp },
  { id: "kpi-card",      label: "KpiCard",      icon: GaugeCircle },
  { id: "card",          label: "Card",         icon: CreditCard },
  { id: "empty-state",   label: "EmptyState",   icon: FolderOpen },
  { id: "data-grid",     label: "DataGrid",     icon: Grid3x3 },
  { id: "data-table",    label: "DataTable",    icon: Table2 },
  { id: "charts",        label: "Charts",       icon: BarChart2 },
  { id: "loader",        label: "Loader",       icon: Loader2 },
  { id: "link",          label: "Link",         icon: ExternalLink },
  // ── Feedback ───────────────────────────────────────────────────────────────
  { id: "alert",         label: "Alert",        icon: AlertCircle },
  { id: "toast",         label: "Toast",        icon: Bell },
  { id: "tooltip",       label: "Tooltip",      icon: MessageCircle },
  { id: "accordion",     label: "Accordion",    icon: List },
  // ── Overlay ────────────────────────────────────────────────────────────────
  { id: "dialog",        label: "Dialog",       icon: AppWindow },
  { id: "sheet",         label: "Sheet",        icon: PanelRight },
  { id: "popover",       label: "Popover",      icon: Layers },
  // ── Layout ─────────────────────────────────────────────────────────────────
  { id: "tabs",          label: "Tabs",         icon: LayoutDashboard },
  { id: "separator",     label: "Separator",    icon: Minus },
  { id: "scroll-area",   label: "ScrollArea",   icon: ScrollText },
  { id: "page-header",   label: "PageHeader",   icon: FileText },
  { id: "segmented-control", label: "SegmentedControl", icon: Sliders },
  { id: "table-pagination",  label: "TablePagination",  icon: ChevronLeftSquare },
  // ── Navigation ─────────────────────────────────────────────────────────────
  { id: "sidebar",       label: "Sidebar",      icon: PanelLeft },
  { id: "navbar",        label: "Navbar",       icon: Navigation },
  { id: "profile-menu",  label: "ProfileMenu",  icon: UserCircle },
  { id: "notification-menu", label: "NotificationMenu", icon: BellRing },
  // ── Pages ──────────────────────────────────────────────────────────────────
  { id: "error-page",    label: "Error Page",   icon: AlertTriangle },
];

// ── Page map ──────────────────────────────────────────────────────────────────

const PAGE_MAP: Record<Page, React.ComponentType<{ onNavigate?: (page: Page) => void }>> = {
  "overview":            OverviewPage,
  "button":              ButtonPage,
  "input":               InputPage,
  "textarea":            TextareaPage,
  "checkbox":            CheckboxPage,
  "switch":              SwitchPage,
  "select":              SelectPage,
  "slider":              SliderPage,
  "radio-group":         RadioGroupPage,
  "choice-group":        ChoiceGroupPage,
  "date-picker":         DatePickerPage,
  "form-text-field":     FormTextFieldPage,
  "avatar":              AvatarPage,
  "skeleton":            SkeletonPage,
  "badge":               BadgePage,
  "status-chip":         StatusChipPage,
  "stat-card":           StatCardPage,
  "kpi-card":            KpiCardPage,
  "card":                CardPage,
  "empty-state":         EmptyStatePage,
  "data-grid":           DataGridPage,
  "data-table":          DataTablePage,
  "charts":              ChartsPage,
  "loader":              LoaderPage,
  "link":                LinkPage,
  "alert":               AlertPage,
  "toast":               ToastPage,
  "tooltip":             TooltipPage,
  "accordion":           AccordionPage,
  "dialog":              DialogPage,
  "sheet":               SheetPage,
  "popover":             PopoverPage,
  "tabs":                TabsPage,
  "separator":           SeparatorPage,
  "scroll-area":         ScrollAreaPage,
  "page-header":         PageHeaderPage,
  "segmented-control":   SegmentedControlPage,
  "table-pagination":    TablePaginationPage,
  "sidebar":             SidebarPage,
  "navbar":              NavbarPage,
  "profile-menu":        ProfileMenuPage,
  "notification-menu":   NotificationMenuPage,
  "error-page":          ErrorPagePage,
};

// ── App ───────────────────────────────────────────────────────────────────────

export interface PreviewAppProps {
  onPlatformSwitch?: (app: string) => void;
}

export function App({ onPlatformSwitch }: PreviewAppProps) {
  const [activePage, setActivePage] = useState<Page>("overview");

  const ActivePage = PAGE_MAP[activePage] ?? OverviewPage;

  return (
    <AppShell
      navItems={NAV_ITEMS}
      activePage={activePage}
      onPageChange={(page) => setActivePage(page as Page)}
      platformLabel="Component Library"
      activePlatformId="fe-common"
      onPlatformSwitch={onPlatformSwitch}
    >
      <ActivePage onNavigate={setActivePage} />
    </AppShell>
  );
}

export default App;
