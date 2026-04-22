import { Panel } from "../shared/Panel";
import { Package, CheckCircle2, XCircle } from "lucide-react";
import { BATCH_TICKER } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: QualityTerminology;
}

export const BatchTickerPanel = ({ terminology }: Props) => {
  const passCount    = BATCH_TICKER.filter(b => b.pass).length;
  const failCount    = BATCH_TICKER.length - passCount;
  const passRate     = Math.round((passCount / BATCH_TICKER.length) * 100);
  const failedBatches = BATCH_TICKER.filter(b => !b.pass);

  return (
    <Panel
      title="Batch Pass / Fail"
      icon={Package}
      info={`Pass/fail status for the last ${BATCH_TICKER.length} ${terminology.entityLabel.toLowerCase()} batches.`}
    >
      <div className="flex flex-col gap-3">

        {/* Pass rate + counts */}
        <div className="flex items-center gap-3">
          <div>
            <p className="text-3xl font-black font-data text-neutral-900 leading-none">{passRate}%</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-1">
              Pass Rate · Last {BATCH_TICKER.length}
            </p>
          </div>
          <div className="ml-auto flex flex-col gap-1 items-end">
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
              <CheckCircle2 className="w-3 h-3" />{passCount} Pass
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-red-600">
              <XCircle className="w-3 h-3" />{failCount} Fail
            </span>
          </div>
        </div>

        {/* Visual sequence strip */}
        <div className="flex gap-1">
          {BATCH_TICKER.map(b => (
            <div
              key={b.id}
              title={b.pass ? `${b.id} — Pass` : `${b.id} — Fail (${b.defectCount} defects)`}
              className={cn(
                "flex-1 h-6 rounded-[3px] flex items-center justify-center",
                b.pass ? "bg-emerald-100" : "bg-red-100"
              )}
            >
              <span className={cn("text-[9px] font-black", b.pass ? "text-emerald-600" : "text-red-600")}>
                {b.pass ? "✓" : "✗"}
              </span>
            </div>
          ))}
        </div>

        {/* Ratio bar */}
        <div className="h-1.5 rounded-full overflow-hidden bg-neutral-100">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${passRate}%` }}
          />
        </div>

        {/* Failed batch list */}
        {failedBatches.length > 0 && (
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
              Failed Batches
            </p>
            <div className="space-y-1">
              {failedBatches.map(b => (
                <div
                  key={b.id}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-[4px] bg-red-50 border border-red-100"
                >
                  <span className="text-[11px] font-bold font-mono text-neutral-800">{b.id}</span>
                  <span className="text-[10px] font-bold text-red-600">
                    {b.defectCount} defect{b.defectCount !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </Panel>
  );
};
