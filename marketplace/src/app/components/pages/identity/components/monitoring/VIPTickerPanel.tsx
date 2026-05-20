import { Panel } from "../shared/Panel";
import { Star, ShieldCheck, Eye } from "lucide-react";
import { VIP_ENTRIES } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { IdentityEvidenceMedia } from "../shared/IdentityEvidenceMedia";
import { DataGrid, DataGridColumn, MonoCell, InterCell, GridActions, GridActionButton } from "@fe-common/components/ui/DataGrid";

interface Props { terminology: IdentityTerminology }

const VIP_FACE_IMAGES = [
  "https://images.pexels.com/photos/33738484/pexels-photo-33738484.jpeg?cs=srgb&dl=pexels-vika-glitter-392079-33738484.jpg&fm=jpg",
  "https://images.pexels.com/photos/14801453/pexels-photo-14801453.jpeg?cs=srgb&dl=pexels-kwizera-gadson-14801453.jpg&fm=jpg",
];

type VipEntry = (typeof VIP_ENTRIES)[number] & { id: string };

const vipColumns: DataGridColumn<VipEntry>[] = [
  {
    key: "capture",
    header: "Capture",
    width: "64px",
    render: (entry) => {
      const index = VIP_ENTRIES.findIndex((e) => e.id === entry.id);
      return (
        <IdentityEvidenceMedia
          kind="FACE"
          seed={entry.id}
          imageSrc={VIP_FACE_IMAGES[index % VIP_FACE_IMAGES.length]}
          confidence={entry.confidence}
          className="h-12 w-12"
        />
      );
    },
  },
  {
    key: "identity",
    header: "Identity",
    width: "1fr",
    render: (entry, hovered) => (
      <div>
        <InterCell hovered={hovered} isPrimary fontSize={12}>{entry.label}</InterCell>
        <div className="mt-0.5">
          <MonoCell hovered={hovered} fontSize={10} color="#94A3B8">ID {entry.id}</MonoCell>
        </div>
      </div>
    ),
  },
  {
    key: "zone",
    header: "Zone",
    width: "1fr",
    render: (entry, hovered) => (
      <InterCell hovered={hovered}>{entry.zone}</InterCell>
    ),
  },
  {
    key: "status",
    header: "Status",
    width: "120px",
    render: () => (
      <div className="flex items-center gap-1.5">
        <span className="inline-flex h-5 items-center gap-1 rounded-[2px] border border-purple-200 bg-purple-50 px-1.5 text-[9px] font-black text-purple-700">
          <Star className="h-2.5 w-2.5" />
          VIP
        </span>
        <span className="inline-flex h-5 items-center gap-1 rounded-[2px] border border-emerald-200 bg-emerald-50 px-1.5 text-[9px] font-black text-emerald-700">
          <ShieldCheck className="h-2.5 w-2.5" />
          Verified
        </span>
      </div>
    ),
  },
  {
    key: "confidence",
    header: "Conf",
    width: "72px",
    align: "right",
    render: (entry, hovered) => (
      <MonoCell hovered={hovered} isPrimary fontSize={13}>{entry.confidence}%</MonoCell>
    ),
  },
  {
    key: "time",
    header: "Time",
    width: "80px",
    align: "right",
    render: (entry, hovered) => (
      <MonoCell hovered={hovered} fontSize={11} color="#94A3B8">{entry.timestamp}</MonoCell>
    ),
  },
  {
    key: "action",
    header: "",
    width: "56px",
    render: (_entry, hovered) => (
      <GridActions visible={hovered}>
        <GridActionButton title="View">
          <Eye className="h-3 w-3" />
        </GridActionButton>
      </GridActions>
    ),
  },
];

export const VIPTickerPanel = ({ terminology: _terminology }: Props) => (
  <Panel
    title="VIP Detections"
    icon={Star}
    info="VIP and executive individuals detected today. Escort protocols may apply."
    collapsible
    defaultOpen={false}
  >
    <div className="-mx-4 -mb-4">
      <DataGrid<VipEntry>
        columns={vipColumns}
        data={VIP_ENTRIES as VipEntry[]}
        getRowId={(row) => row.id}
      />
    </div>
  </Panel>
);
