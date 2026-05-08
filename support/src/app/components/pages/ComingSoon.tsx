import { Construction } from "lucide-react";
import { Page } from "@/app/components/layout/AppSidebar";

const PAGE_LABELS: Record<string, string> = {
  "system-flow":    "System Flow",
  "cameras":        "Cameras",
  "gateways":       "Gateways",
  "compute":        "Compute",
  "ml-apps":        "ML Apps",
  "command-centre": "Command Centre",
  "settings":       "Settings",
};

export function ComingSoon({ page }: { page: Page }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
      <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] flex items-center justify-center">
        <Construction className="w-6 h-6 text-[#94A3B8]" />
      </div>
      <div className="text-center">
        <p className="text-[15px] font-semibold text-[#0F172A]">{PAGE_LABELS[page] ?? page}</p>
        <p className="text-[13px] text-[#94A3B8] mt-1">This section is coming soon.</p>
      </div>
    </div>
  );
}
