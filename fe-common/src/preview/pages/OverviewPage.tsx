import type React from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Checkbox } from "../../components/ui/Checkbox";
import { Switch } from "../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Skeleton } from "../../components/ui/Skeleton";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { AlertCircle } from "lucide-react";

type Page =
  | "overview" | "button" | "input" | "textarea" | "checkbox" | "switch"
  | "select" | "slider" | "avatar" | "skeleton" | "stat-card" | "empty-state"
  | "data-grid" | "alert" | "tooltip" | "accordion" | "dialog" | "sheet"
  | "popover" | "tabs" | "separator" | "scroll-area";

interface ComponentCard {
  page: Page;
  name: string;
  category: string;
  categoryColor: string;
  preview: React.ReactNode;
}

const CARDS: ComponentCard[] = [
  {
    page: "button",
    name: "Button",
    category: "Foundation",
    categoryColor: "bg-emerald-100 text-emerald-700",
    preview: (
      <div className="flex gap-2">
        <Button size="sm">Primary</Button>
        <Button size="sm" variant="outline">Outline</Button>
      </div>
    ),
  },
  {
    page: "input",
    name: "Input",
    category: "Foundation",
    categoryColor: "bg-emerald-100 text-emerald-700",
    preview: (
      <Input placeholder="Enter value..." className="h-7 text-xs" />
    ),
  },
  {
    page: "checkbox",
    name: "Checkbox",
    category: "Foundation",
    categoryColor: "bg-emerald-100 text-emerald-700",
    preview: (
      <div className="flex items-center gap-2">
        <Checkbox defaultChecked id="ov-chk" />
        <label htmlFor="ov-chk" className="text-xs text-gray-600">Option enabled</label>
      </div>
    ),
  },
  {
    page: "switch",
    name: "Switch",
    category: "Foundation",
    categoryColor: "bg-emerald-100 text-emerald-700",
    preview: (
      <div className="flex items-center gap-2">
        <Switch defaultChecked id="ov-sw" />
        <label htmlFor="ov-sw" className="text-xs text-gray-600">Enabled</label>
      </div>
    ),
  },
  {
    page: "select",
    name: "Select",
    category: "Foundation",
    categoryColor: "bg-emerald-100 text-emerald-700",
    preview: (
      <Select>
        <SelectTrigger className="h-7 text-xs w-36">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
        </SelectContent>
      </Select>
    ),
  },
  {
    page: "avatar",
    name: "Avatar",
    category: "Display",
    categoryColor: "bg-blue-100 text-blue-700",
    preview: (
      <div className="flex -space-x-1.5">
        {["MF", "AU", "JD"].map((init) => (
          <Avatar key={init} className="h-7 w-7 border-2 border-white text-xs">
            <AvatarFallback>{init}</AvatarFallback>
          </Avatar>
        ))}
      </div>
    ),
  },
  {
    page: "skeleton",
    name: "Skeleton",
    category: "Display",
    categoryColor: "bg-blue-100 text-blue-700",
    preview: (
      <div className="flex flex-col gap-1.5 w-full">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    ),
  },
  {
    page: "stat-card",
    name: "StatCard",
    category: "Display",
    categoryColor: "bg-blue-100 text-blue-700",
    preview: (
      <div className="text-xs font-mono">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Models</div>
        <div className="text-xl font-bold text-gray-900 mt-0.5">142</div>
        <div className="text-[10px] text-green-600 font-semibold">↑ +12%</div>
      </div>
    ),
  },
  {
    page: "alert",
    name: "Alert",
    category: "Feedback",
    categoryColor: "bg-orange-100 text-orange-700",
    preview: (
      <Alert className="py-2 px-3 text-xs">
        <AlertCircle className="h-3.5 w-3.5" />
        <AlertTitle className="text-xs font-medium">Heads up!</AlertTitle>
        <AlertDescription className="text-xs">Check your settings.</AlertDescription>
      </Alert>
    ),
  },
  {
    page: "accordion",
    name: "Accordion",
    category: "Feedback",
    categoryColor: "bg-orange-100 text-orange-700",
    preview: (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="i1" className="border-b-0">
          <AccordionTrigger className="text-xs py-1.5 hover:no-underline">FAQ Item</AccordionTrigger>
          <AccordionContent className="text-xs">Answer here.</AccordionContent>
        </AccordionItem>
      </Accordion>
    ),
  },
  {
    page: "tabs",
    name: "Tabs",
    category: "Layout",
    categoryColor: "bg-purple-100 text-purple-700",
    preview: (
      <Tabs defaultValue="a">
        <TabsList className="h-7">
          <TabsTrigger value="a" className="text-xs h-5 px-2">Tab A</TabsTrigger>
          <TabsTrigger value="b" className="text-xs h-5 px-2">Tab B</TabsTrigger>
        </TabsList>
        <TabsContent value="a" className="text-xs text-gray-500 mt-1">Content A</TabsContent>
        <TabsContent value="b" className="text-xs text-gray-500 mt-1">Content B</TabsContent>
      </Tabs>
    ),
  },
  {
    page: "dialog",
    name: "Dialog",
    category: "Overlay",
    categoryColor: "bg-pink-100 text-pink-700",
    preview: (
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Example Dialog</DialogTitle>
            <DialogDescription>This is a modal overlay.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    ),
  },
];

interface OverviewPageProps {
  onNavigate?: (page: Page) => void;
}

export function OverviewPage({ onNavigate }: OverviewPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Component Library</h1>
        <p className="mt-1 text-sm text-gray-500">
          fe-common design system — built on shadcn/ui + Tailwind CSS. Click any card to explore.
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total Components", value: "22" },
          { label: "Categories", value: "5" },
          { label: "Base", value: "shadcn/ui" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-100 text-xs">
            <span className="text-gray-400">{s.label}</span>
            <span className="font-semibold text-gray-900">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {CARDS.map((card) => (
          <div
            key={card.page}
            role="button"
            tabIndex={0}
            onClick={() => onNavigate?.(card.page)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNavigate?.(card.page); } }}
            className="text-left cursor-pointer bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md hover:border-gray-200 transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00775B]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm text-gray-900 group-hover:text-[#00775B] transition-colors">
                {card.name}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${card.categoryColor}`}>
                {card.category}
              </span>
            </div>
            <div className="min-h-[52px] flex items-center">
              <div className="w-full pointer-events-none" onClick={(e) => e.stopPropagation()}>
                {card.preview}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OverviewPage;
