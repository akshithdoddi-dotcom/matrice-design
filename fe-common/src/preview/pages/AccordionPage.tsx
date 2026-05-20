import { useState } from "react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "../../components/ui/accordion";
import { Settings, ShieldCheck, Bell, Database, HelpCircle } from "lucide-react";

// ─── Sample data ──────────────────────────────────────────────────────────────

const FAQ = [
  { value: "q1", q: "What is the component library?",
    a: "The fe-common component library is a shared design system built on shadcn/ui and Tailwind CSS. It provides consistent UI components across all Matrice AI platform applications." },
  { value: "q2", q: "How do I install the components?",
    a: "Components are bundled as part of the fe-common package. Import them directly using the @fe-common alias configured in your project's Vite config." },
  { value: "q3", q: "Can I customize the theme?",
    a: "Yes — all components use CSS custom properties. Edit fe-common/src/styles/theme.css to change design tokens and the changes propagate to every platform automatically." },
];

const SETTINGS = [
  { value: "notifications", label: "Notifications", icon: Bell,
    content: "Configure how and when you receive alerts. Set thresholds for critical, high, medium, and low severity incidents across all connected cameras and zones." },
  { value: "security", label: "Security & Access", icon: ShieldCheck,
    content: "Manage API keys, SSO configuration, and role-based access control. Audit logs are retained for 90 days and available for export." },
  { value: "integrations", label: "Data Sources", icon: Database,
    content: "Connect to your camera streams, sensor feeds, and third-party data providers. Supports RTSP, ONVIF, WebRTC, and MQTT protocols." },
  { value: "advanced", label: "Advanced Settings", icon: Settings,
    content: "Fine-tune inference parameters, model update policies, and resource allocation across compute nodes." },
  { value: "help", label: "Help & Support", icon: HelpCircle,
    content: "Access documentation, raise a support ticket, or join the Matrice community forum for feature requests and feedback." },
];

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, code, children }: { title: string; code: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</h2>
      <div className="p-6 bg-white rounded-xl border border-gray-100">
        {children}
      </div>
      <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto leading-relaxed">{code}</pre>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AccordionPage() {
  const [openItem, setOpenItem] = useState<string | undefined>("q1");

  return (
    <div className="space-y-10 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Accordion <span className="ml-2 text-sm font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded">v1.2</span></h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Vertically stacked collapsible sections. Supports three variants (default, card, filled),
          multiple open mode, controlled state, leading icons, and disabled items.
        </p>
      </div>

      {/* Default — single collapsible */}
      <Section
        title="Default  —  Single (Collapsible)"
        code={`<Accordion type="single" collapsible>
  <AccordionItem value="q1">
    <AccordionTrigger>What is the component library?</AccordionTrigger>
    <AccordionContent>The fe-common component library…</AccordionContent>
  </AccordionItem>
</Accordion>`}
      >
        <Accordion type="single" collapsible className="w-full">
          {FAQ.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      {/* Multiple */}
      <Section
        title="Multiple  —  Many Open Simultaneously"
        code={`<Accordion type="multiple" defaultValue={["q1", "q3"]}>
  …
</Accordion>`}
      >
        <Accordion type="multiple" defaultValue={["q1", "q3"]} className="w-full">
          {FAQ.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      {/* Controlled */}
      <Section
        title="Controlled State"
        code={`const [open, setOpen] = useState<string | undefined>("q1");

<Accordion type="single" collapsible
  value={open} onValueChange={setOpen}>
  …
</Accordion>`}
      >
        <div className="space-y-3 w-full">
          <p className="text-xs text-slate-400">
            Currently open: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{openItem ?? "none"}</code>
          </p>
          <Accordion
            type="single"
            collapsible
            value={openItem}
            onValueChange={(v) => setOpenItem(v || undefined)}
            className="w-full"
          >
            {FAQ.map((item) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* Card variant */}
      <Section
        title='Card Variant  —  variant="card"'
        code={`<Accordion variant="card" type="single" collapsible>
  <AccordionItem value="notifications">
    <AccordionTrigger icon={<Bell className="size-4" />}>
      Notifications
    </AccordionTrigger>
    <AccordionContent>Configure alerts…</AccordionContent>
  </AccordionItem>
</Accordion>`}
      >
        <Accordion variant="card" type="single" collapsible defaultValue="notifications" className="w-full">
          {SETTINGS.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger icon={<item.icon className="size-4" />}>
                {item.label}
              </AccordionTrigger>
              <AccordionContent>{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      {/* Filled variant */}
      <Section
        title='Filled Variant  —  variant="filled"'
        code={`<Accordion variant="filled" type="multiple">
  …
</Accordion>`}
      >
        <Accordion variant="filled" type="multiple" defaultValue={["q1"]} className="w-full">
          {FAQ.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      {/* Disabled item */}
      <Section
        title="Disabled Item"
        code={`<AccordionItem value="locked" disabled>
  <AccordionTrigger>Locked Section</AccordionTrigger>
  <AccordionContent>…</AccordionContent>
</AccordionItem>`}
      >
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="q1">
            <AccordionTrigger>Available Section</AccordionTrigger>
            <AccordionContent>This section is fully interactive.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="locked" disabled>
            <AccordionTrigger>Locked Section (disabled)</AccordionTrigger>
            <AccordionContent>You cannot reach this content.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="q3">
            <AccordionTrigger>Another Available Section</AccordionTrigger>
            <AccordionContent>Also fully interactive.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>
    </div>
  );
}

export default AccordionPage;
