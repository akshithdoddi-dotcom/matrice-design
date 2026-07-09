import { useRef, useState, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart, 
  AreaChart, Area, LineChart, ReferenceLine, PieChart, Pie, Cell
} from "recharts";
import { 
  Users, TrendingUp, TrendingDown, Activity, BarChart2, Map, Pin, 
  ArrowRight, AlertTriangle, Calendar, Clock, Filter, ChevronRight, ChevronLeft, ChevronDown,
  Radio, ZapOff, AlertCircle, GripVertical, X, Maximize2, PlayCircle, Signal, Bell, Settings, ChevronUp, Video, Check, Flag
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { Persona } from "../dashboard/PersonaSwitcher";
import { 
  VOLUME_STAFFING_DATA, VOLUME_KPIS, VOLUME_SPARKLINES, VOLUME_GROWTH_DATA, 
  VOLUME_HEATMAP_DATA, CAMERA_PERFORMANCE_DATA, REGIONAL_PERFORMANCE_DATA,
  APPLICATION_VOLUME_DATA, MANAGER_OPERATIONAL_DATA, DIRECTOR_STRATEGIC_DATA,
  ALL_INCIDENTS, IMG_CROWD, DIRECTOR_KPIS, YOY_COMPARISON_DATA,
  APPLICATION_MONITORING_DATA, ApplicationPanel, CameraLocation, ApplicationMetric,
  PEOPLE_COUNTING_COMPARISON_DATA
} from "@/app/data/mockData";
import { AnalyticsHeader } from "./AnalyticsHeader";
import { Button } from "@fe-common/components/ui/Button";
import { DataGrid, DataGridColumn, StatusCapsule, MonoCell, InterCell } from "@fe-common/components/ui/DataGrid";
import * as Dialog from "@radix-ui/react-dialog";
import * as Collapsible from "@radix-ui/react-collapsible";

// --- Components ---

const VideoOverlay = ({ open, onOpenChange, cameraName, zone }: { open: boolean, onOpenChange: (open: boolean) => void, cameraName: string, zone: string }) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
      <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-900 border border-neutral-800 rounded-sm shadow-2xl z-50 w-[90vw] max-w-4xl p-0 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900/50">
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                 <span className="text-xs font-bold text-white uppercase tracking-wider">Live Feed</span>
              </div>
              <div className="h-4 w-[1px] bg-neutral-700"></div>
              <span className="text-sm font-medium text-neutral-300">{zone}</span>
              <span className="text-xs font-mono text-neutral-500">{cameraName}</span>
           </div>
           <button onClick={() => onOpenChange(false)} className="text-neutral-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
           </button>
        </div>
        
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
           {/* Simulated Video Feed */}
           <img src={IMG_CROWD} alt="Live Feed" className="w-full h-full object-cover opacity-80" />
           
           {/* HUD Overlay */}
           <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                 <div className="bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-green-400 border border-green-900/50">
                    FPS: 30 • BITRATE: 4.2 MBPS
                 </div>
                 <div className="bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-white border border-white/10">
                    {new Date().toLocaleTimeString()}
                 </div>
              </div>
              
              {/* Bounding Box Simulation */}
              <div className="absolute top-1/4 left-1/3 w-24 h-48 border-2 border-[#00775B] rounded-sm opacity-60">
                 <div className="absolute -top-4 left-0 bg-[#00775B] text-white text-[8px] font-bold px-1">PERSON 98%</div>
              </div>
              <div className="absolute top-1/3 left-1/2 w-20 h-40 border-2 border-[#00775B] rounded-sm opacity-60">
                 <div className="absolute -top-4 left-0 bg-[#00775B] text-white text-[8px] font-bold px-1">PERSON 92%</div>
              </div>

              <div className="flex justify-between items-end">
                  <div className="space-y-1">
                     <div className="text-[10px] font-bold text-white uppercase tracking-wider mb-2">Active Analytics</div>
                     <div className="flex gap-2">
                        <span className="bg-[#00775B]/20 border border-[#00775B]/50 text-[#00775B] px-2 py-1 rounded text-[10px] font-bold">Crowd Counting</span>
                        <span className="bg-neutral-800/50 border border-neutral-700 text-neutral-400 px-2 py-1 rounded text-[10px] font-bold">Loitering</span>
                     </div>
                  </div>
                  <div className="flex gap-2">
                      <Button size="sm" variant="secondary" className="h-8 text-xs gap-2">
                         <Maximize2 className="w-3 h-3" /> Fullscreen
                      </Button>
                      <Button size="sm" className="h-8 text-xs bg-[#00775B] hover:bg-[#00956D] text-white gap-2">
                         <PlayCircle className="w-3 h-3" /> Playback
                      </Button>
                  </div>
              </div>
           </div>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

const StatusTicker = () => {
  const activeIncidents = ALL_INCIDENTS.filter(i => ["critical", "high"].includes(i.severity));
  
  return (
    <div className="w-full bg-neutral-900 text-white text-[10px] py-1.5 px-4 overflow-hidden flex items-center gap-4 border-b border-[#00775B]/30">
      <span className="font-bold uppercase tracking-wider text-[#00775B] shrink-0 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#00775B] animate-pulse" />
        Live Feed
      </span>
      <div className="flex-1 overflow-hidden relative">
        <div className="animate-marquee whitespace-nowrap flex gap-8">
          {activeIncidents.map((inc, i) => (
             <span key={i} className="flex items-center gap-2">
                <span className={cn(
                  "px-1.5 rounded-[2px] font-bold uppercase",
                  inc.severity === "critical" ? "bg-red-500 text-white" : "bg-orange-500 text-white"
                )}>
                  {inc.severity}
                </span>
                <span className="font-mono text-neutral-400">{inc.incidentId}</span>
                <span className="font-medium">{inc.title} in {inc.location}</span>
             </span>
          ))}
          {/* Duplicate for seamless loop */}
          {activeIncidents.map((inc, i) => (
             <span key={`dup-${i}`} className="flex items-center gap-2">
                <span className={cn(
                  "px-1.5 rounded-[2px] font-bold uppercase",
                  inc.severity === "critical" ? "bg-red-500 text-white" : "bg-orange-500 text-white"
                )}>
                  {inc.severity}
                </span>
                <span className="font-mono text-neutral-400">{inc.incidentId}</span>
                <span className="font-medium">{inc.title} in {inc.location}</span>
             </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const CapacityGauge = ({ zone, occupancy }: { zone: string, occupancy: number }) => {
  const isCritical = occupancy > 90;
  const isWarning = occupancy > 75 && occupancy <= 90;
  const data = [
    { value: occupancy },
    { value: 100 - occupancy }
  ];
  
  const getBgColor = () => {
    if (isCritical) return 'bg-gradient-to-br from-red-50 to-orange-50';
    if (isWarning) return 'bg-gradient-to-br from-amber-50 to-yellow-50';
    return 'bg-gradient-to-br from-teal-50 to-cyan-50';
  };
  
  const getBorderColor = () => {
    if (isCritical) return 'border-red-500';
    if (isWarning) return 'border-amber-500';
    return 'border-teal-400';
  };
  
  return (
    <div className={cn(
      "p-2 rounded-sm border flex flex-col items-center justify-between relative overflow-hidden h-[136px] transition-all duration-300",
      getBgColor(),
      getBorderColor(),
      isCritical && "shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse-slow"
    )}>
      <div className="absolute top-1.5 left-1.5 right-1.5 flex justify-between items-start z-10">
         <h4 className={cn(
           "text-[10px] font-bold uppercase truncate max-w-[80%]", 
           isCritical ? "text-red-600" : isWarning ? "text-amber-600" : "text-teal-600"
         )}>{zone}</h4>
         {isCritical && <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />}
         {isWarning && <AlertTriangle className="w-3 h-3 text-amber-500" />}
      </div>
      
      <div className="w-full h-20 flex items-end justify-center pb-4 relative mt-2">
         <ResponsiveContainer width="100%" height={80} minWidth={0} minHeight={0}>
            <PieChart margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
               <Pie
                 data={data}
                 cx="50%"
                 cy="100%"
                 startAngle={180}
                 endAngle={0}
                 innerRadius={35}
                 outerRadius={50}
                 paddingAngle={0}
                 dataKey="value"
                 stroke="none"
               >
                 <Cell fill={isCritical ? "#EF4444" : isWarning ? "#F59E0B" : "#14B8A6"} />
                 <Cell fill={isCritical ? "#FEE2E2" : isWarning ? "#FEF3C7" : "#CCFBF1"} />
               </Pie>
            </PieChart>
         </ResponsiveContainer>
         <div className="absolute -bottom-2 left-0 right-0 flex flex-col items-center justify-end pb-2">
            <span className={cn(
               "text-xl font-mono font-bold leading-none",
               isCritical ? "text-red-600 drop-shadow-sm" : isWarning ? "text-amber-600" : "text-teal-600"
            )}>
              {occupancy}%
            </span>
            <span className={cn(
              "text-[9px] font-mono mt-0.5", 
              isCritical ? "text-red-400" : isWarning ? "text-amber-400" : "text-teal-400"
            )}>Capacity</span>
         </div>
      </div>
    </div>
  );
};

const MonitoringSparkline = ({ data, zone, occupancy, onClick }: { data: number[], zone: string, occupancy: number, onClick: () => void }) => {
  const isCritical = occupancy > 90;
  // Simulating Zero Traffic Anomaly (randomly or if passed prop)
  const isZeroTraffic = occupancy === 0; 
  const threshold = 80; // Arbitrary threshold for visual
  const currentVal = Math.round(data[data.length - 1]); // Round to integer
  const isSpike = currentVal > threshold || isCritical;
  
  // Random confidence between 85 and 99
  const confidence = useMemo(() => 85 + Math.floor(Math.random() * 14), []);

  if (isZeroTraffic) {
     return (
        <div className="bg-neutral-900 p-2 rounded-sm border border-neutral-700 flex flex-col items-center justify-center h-[80px] gap-2 relative overflow-hidden group hover:border-neutral-500 transition-colors cursor-not-allowed">
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
           <Signal className="w-4 h-4 text-neutral-600 animate-pulse" />
           <span className="text-[9px] font-bold text-neutral-500 uppercase text-center relative z-10">No Signal<br/>{zone}</span>
        </div>
     );
  }

  // Generate 1-minute granularity data (60 data points for last 60 minutes)
  const oneMinuteData = data.slice(-60).map((val, i) => ({ i, val, minute: i }));

  return (
    <div 
      onClick={onClick}
      className={cn(
      "relative bg-white p-2 rounded-sm border transition-all duration-300 group hover:shadow-md h-[80px] flex flex-col justify-between cursor-pointer active:scale-[0.98]",
      isSpike 
        ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse-slow" 
        : "border-neutral-200 hover:border-[#00775B]/30"
    )}>
      <div className="flex justify-between items-start z-10 w-full mb-1">
         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 -left-1 bg-white p-1 rounded-br shadow-sm border-r border-b border-neutral-100 z-20">
            <GripVertical className="w-3 h-3 text-neutral-400 cursor-grab active:cursor-grabbing" />
         </div>
         
         {/* Title and Live Count Row */}
         <div className="flex items-center justify-between w-full pl-1">
            <h4 className={cn(
              "text-[9px] font-bold uppercase truncate max-w-[60%] transition-colors",
              isSpike ? "text-red-600" : "text-neutral-600 group-hover:text-[#00775B]"
            )}>
              {zone}
            </h4>
            
            <div className={cn(
               "flex items-center px-1.5 py-0.5 rounded-[2px] border",
               isSpike 
                  ? "bg-red-50 border-red-200 text-red-700" 
                  : "bg-neutral-50 border-neutral-100 text-neutral-500 group-hover:border-[#00775B]/30 group-hover:text-[#00775B]"
            )}>
               <div className={cn("w-1 h-1 rounded-full mr-1.5 animate-pulse", isSpike ? "bg-red-500" : "bg-[#00956D]")} />
               <span className="text-[9px] font-mono font-bold leading-none">
                   Live-{currentVal}
               </span>
            </div>
         </div>
      </div>
      
      <div className="flex items-end justify-between gap-2 h-full relative overflow-hidden">
         <div className="flex-1 h-12 pt-1 overflow-hidden">
            <ResponsiveContainer width="100%" height={48} minWidth={0} minHeight={0}>
              <LineChart data={oneMinuteData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <ReferenceLine y={threshold} stroke="#991B1B" strokeWidth={1} strokeDasharray="2 2" />
                <Tooltip 
                  cursor={{ stroke: isSpike ? '#DC2626' : '#00775B', strokeWidth: 1 }}
                  contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '10px', padding: '4px 8px' }}
                  labelStyle={{ display: 'none' }}
                  formatter={(value: any, name: string, props: any) => [`${value}`, `${props.payload.minute}min ago`]}
                />
                <Line 
                  type="monotone" 
                  dataKey="val" 
                  stroke={isSpike ? "#DC2626" : "#00775B"} 
                  strokeWidth={1.5} 
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
         </div>
      </div>
      
      {/* Granularity Indicator */}
      <div className="absolute bottom-0 right-1 text-[8px] text-neutral-400 font-mono">1min</div>
    </div>
  );
};

const AnomalyTable = () => {
    // Derived state for anomalies (simulated)
    const anomalies = CAMERA_PERFORMANCE_DATA.map(c => ({
        ...c,
        current: Math.floor(c.volume / 24 / 60) + (Math.random() > 0.5 ? 5 : -20), // Simulated current minute volume
        baseline: Math.floor(c.volume / 24 / 60),
        status: c.change < -5 ? "Check" : "Normal"
    })).sort((a,b) => a.change - b.change);

    type AnomalyRow = typeof anomalies[0];

    const columns: DataGridColumn<AnomalyRow>[] = [
        {
            key: "camera",
            header: "Camera",
            width: "1fr",
            render: (row, h) => <InterCell hovered={h} isPrimary>{row.camera}</InterCell>,
        },
        {
            key: "app",
            header: "Active App",
            width: "1fr",
            render: (row, h) => <InterCell hovered={h} color="#64748B">{row.app}</InterCell>,
        },
        {
            key: "current",
            header: "Current",
            width: "80px",
            align: "right",
            render: (row, h) => <MonoCell hovered={h}>{String(Math.max(0, row.current))}</MonoCell>,
        },
        {
            key: "diff",
            header: "Diff %",
            width: "80px",
            align: "right",
            render: (row, h) => {
                const diffPercent = ((row.current - row.baseline) / row.baseline) * 100;
                const color = diffPercent < 0 ? "#D97706" : "#00956D";
                return (
                    <MonoCell hovered={h} color={color} hoveredColor={color}>
                        {diffPercent > 0 ? "+" : ""}{diffPercent.toFixed(1)}%
                    </MonoCell>
                );
            },
        },
        {
            key: "status",
            header: "Status",
            width: "80px",
            align: "center",
            render: (row) => {
                const diffPercent = ((row.current - row.baseline) / row.baseline) * 100;
                const isSevereDrop = diffPercent <= -50;
                const isAbnormal = isSevereDrop || row.change < -2;
                if (isSevereDrop) return <StatusCapsule status="critical" label="CRITICAL" />;
                if (isAbnormal) return <StatusCapsule status="warning" label="Check" />;
                return <span className="text-[10px] text-neutral-400">OK</span>;
            },
        },
    ];

    return (
        <div className="rounded-sm border border-neutral-200 bg-white overflow-hidden">
            <div className="bg-neutral-50 px-3 py-2 border-b border-neutral-200 flex justify-between items-center">
                <h3 className="text-[10px] font-bold uppercase text-neutral-600 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-[#00775B]" />
                    Anomaly Detection
                </h3>
            </div>
            <DataGrid
                columns={columns}
                data={anomalies}
                getRowId={(row) => row.camera}
                compact
            />
        </div>
    );
}

const TimeRangeFilter = () => (
  <div className="flex bg-neutral-100 p-0.5 rounded-[4px] border border-neutral-200">
    {["1M", "1H", "1D", "1W", "1MO"].map((range) => (
      <button
        key={range}
        className={cn(
          "px-3 py-1 text-[10px] font-bold rounded-[2px] transition-all",
          range === "1H" 
            ? "bg-white text-[#00775B] shadow-sm" 
            : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50"
        )}
      >
        {range}
      </button>
    ))}
  </div>
);

// New Components for Panel-based Layout

// Shared accent color helper used by both chart and KPI zone cards
const zoneAccent = (status: string | undefined, trend: number) => {
  if (status === 'critical') return { color: '#EF0011', bg: '#FFE5E7', shadow: '239,0,17' };
  if (status === 'warning')  return { color: '#D97706', bg: '#FFF8E1', shadow: '217,119,6' };
  if (trend < 0)             return { color: '#2B7FFF', bg: '#E5F0FF', shadow: '43,127,255' };
  return                            { color: '#00775B', bg: '#E5FFF9', shadow: '0,119,91' };
};

// Type A stat card matching the design system component library style
const ZoneStatCard = ({ metric }: { metric: ApplicationMetric }) => {
  const isNeg = metric.trend < 0;
  const { color: accent, bg, shadow: shadowRgb } = zoneAccent(metric.status, metric.trend);
  const boxShadow = `rgba(${shadowRgb},0.10) 0px 0px 6px 1px, rgba(0,0,0,0.04) 0px 1px 3px`;
  const trendBg = `${accent}1F`;

  return (
    <div className="w-full rounded-[4px] flex flex-col select-none h-full"
      style={{ border: `1px solid ${accent}`, background: bg, boxShadow }}>
      {/* Label + time badge (no severity — color already communicates that) */}
      <div className="px-3 pt-3 flex items-center justify-between flex-shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-[0.5px] leading-none text-[#475569] truncate pr-1">
          {metric.metricName}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-[0.5px] px-1.5 py-[3px] rounded-full flex-shrink-0"
          style={{ backgroundColor: `${accent}24`, color: accent }}>
          CURRENT
        </span>
      </div>
      {/* Value + trend */}
      <div className="px-3 pt-2 pb-3 flex items-end justify-between gap-2 flex-1">
        <div className="flex flex-col gap-[5px]">
          <div className="font-mono font-bold tabular-nums leading-none text-[#0f172a]" style={{ fontSize: 22 }}>
            {typeof metric.currentValue === 'number' && metric.currentValue % 1 !== 0
              ? metric.currentValue.toFixed(1) : metric.currentValue}
          </div>
          <div className="text-[10px] text-[#64748b]">{metric.unit}</div>
        </div>
        <div className="flex flex-col px-[8px] py-[6px] rounded-[6px] flex-shrink-0"
          style={{ backgroundColor: trendBg }}>
          <div className="flex items-center gap-[3px] font-mono font-bold leading-none"
            style={{ fontSize: 11, color: accent }}>
            {isNeg ? '↓' : '↑'} {Math.abs(metric.trend)}%
          </div>
          <div className="text-[9px] font-normal mt-[4px] leading-none text-[#94a3b8]">vs last hr</div>
        </div>
      </div>
      {/* Divider */}
      <div style={{ height: 1, backgroundColor: `${accent}38`, margin: '0 12px' }} />
      {/* Footer */}
      <div className="px-3 py-2 flex items-center gap-1.5">
        <span className="text-[9px] font-bold uppercase tracking-[0.5px] flex-shrink-0" style={{ color: '#94a3b8' }}>Live</span>
        <span className="text-[10px] text-[#475569] truncate">Real-time snapshot</span>
      </div>
    </div>
  );
};

const MetricMiniChart = ({ metric }: { metric: ApplicationMetric }) => {
  const isSmall = metric.data.length <= 5;
  const { color, bg, shadow: shadowRgb } = zoneAccent(metric.status, metric.trend);
  const boxShadow = `rgba(${shadowRgb},0.08) 0px 0px 5px 1px, rgba(0,0,0,0.03) 0px 1px 2px`;
  const gradId = `grad-mmchart-${metric.metricName.replace(/\s+/g, '-')}`;

  // Time range badge: show "HH:00 – HH:00" from data or "Current" for tiny sets
  const timeLabel = isSmall
    ? 'Current'
    : metric.data.length >= 2
      ? `${metric.data[0].time} – ${metric.data[metric.data.length - 1].time}`
      : 'Live';

  const renderChart = () => {
    const commonProps = { data: metric.data, margin: { top: 6, right: 6, left: 6, bottom: 2 } };

    if (metric.chartType === 'bar') {
      return (
        <BarChart {...commonProps} barCategoryGap={isSmall ? '40%' : '20%'}>
          <XAxis dataKey="time" axisLine={false} tickLine={false}
            tick={{ fontSize: 9, fill: '#9ca3af' }} interval={0} height={14} />
          <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '10px', padding: '4px 8px' }}
            labelStyle={{ display: 'none' }} />
          <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]}
            isAnimationActive={false} barSize={isSmall ? 20 : undefined} />
        </BarChart>
      );
    }

    if (isSmall) {
      return (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" axisLine={false} tickLine={false}
            tick={{ fontSize: 9, fill: '#9ca3af' }} interval={0} height={14} />
          <Tooltip cursor={false}
            contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '10px', padding: '4px 8px' }}
            labelStyle={{ display: 'none' }} />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2}
            fill={`url(#${gradId})`} isAnimationActive={false}
            dot={{ r: 4, fill: color, stroke: '#fff', strokeWidth: 2 }}
            label={{ position: 'top', fontSize: 10, fontWeight: 'bold', fill: color }} />
        </AreaChart>
      );
    }

    if (metric.chartType === 'area') {
      return (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip cursor={false}
            contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '10px', padding: '4px 8px' }}
            labelStyle={{ display: 'none' }} />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2}
            fill={`url(#${gradId})`} isAnimationActive={false} />
        </AreaChart>
      );
    }

    return (
      <LineChart {...commonProps}>
        <Tooltip cursor={false}
          contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '10px', padding: '4px 8px' }}
          labelStyle={{ display: 'none' }} />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2}
          dot={false} isAnimationActive={false} />
      </LineChart>
    );
  };

  return (
    <div className="rounded-[4px] flex flex-col transition-all duration-200 h-[130px] overflow-hidden"
      style={{ border: `1px solid ${color}`, background: bg, boxShadow }}>
      {/* Header row: label + time badge */}
      <div className="px-3 pt-3 flex items-center justify-between flex-shrink-0">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#475569] truncate pr-1">
          {metric.metricName}
        </h4>
        <span className="text-[9px] font-bold uppercase tracking-[0.5px] px-1.5 py-[3px] rounded-full flex-shrink-0"
          style={{ backgroundColor: `${color}24`, color }}>
          {timeLabel}
        </span>
      </div>
      {/* Value row */}
      <div className="px-3 pt-1 pb-1 flex items-baseline gap-1.5 flex-shrink-0">
        <span className="text-xl font-mono font-bold leading-none text-[#0f172a]">
          {typeof metric.currentValue === 'number' && metric.currentValue % 1 !== 0
            ? metric.currentValue.toFixed(1) : metric.currentValue}
        </span>
        <span className="text-[10px] font-medium text-[#64748b]">{metric.unit}</span>
        <span className="text-[10px] font-bold font-mono ml-auto" style={{ color }}>
          {metric.trend > 0 ? '+' : ''}{metric.trend}%
        </span>
      </div>
      {/* Chart */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Comprehensive Derived Metrics Components

interface DerivedMetric {
  label: string;
  value: string | number;
  unit?: string;
  trend?: number;
  status?: 'normal' | 'warning' | 'critical';
  subtitle?: string;
}

const DerivedMetricCard = ({ metric }: { metric: DerivedMetric }) => {
  // Assign colors based on metric type/label for variety
  const getBgGradient = (label: string) => {
    if (label.includes('Occupancy')) return 'from-amber-50 to-orange-50';
    if (label.includes('Peak') || label.includes('Hour')) return 'from-purple-50 to-pink-50';
    if (label.includes('Turnover') || label.includes('Efficiency')) return 'from-blue-50 to-cyan-50';
    if (label.includes('Aggregate') || label.includes('Multi')) return 'from-indigo-50 to-purple-50';
    if (label.includes('Count') && label.includes('Year')) return 'from-teal-50 to-emerald-50';
    if (label.includes('Count') && label.includes('Month')) return 'from-green-50 to-lime-50';
    return 'from-slate-50 to-neutral-50';
  };

  return (
    <div className={cn(
      "p-4 rounded border transition-all hover:shadow-md",
      `bg-gradient-to-br ${getBgGradient(metric.label)}`,
      metric.status === 'critical' ? "border-red-300" :
      metric.status === 'warning' ? "border-amber-300" :
      "border-neutral-200"
    )}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{metric.label}</h4>
        {metric.status && metric.status !== 'normal' && (
          <AlertTriangle className={cn(
            "w-3 h-3 animate-pulse",
            metric.status === 'critical' ? "text-red-500" : "text-amber-500"
          )} />
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={cn(
          "text-2xl font-mono font-bold",
          metric.status === 'critical' ? "text-red-600" :
          metric.status === 'warning' ? "text-amber-600" :
          "text-neutral-900"
        )}>
          {metric.value}
        </span>
        {metric.unit && <span className="text-xs text-neutral-500 font-medium">{metric.unit}</span>}
        {metric.trend !== undefined && (
          <span className={cn(
            "text-xs font-bold ml-auto",
            metric.trend > 0 ? "text-green-600" : metric.trend < 0 ? "text-red-500" : "text-neutral-400"
          )}>
            {metric.trend > 0 ? "+" : ""}{metric.trend}%
          </span>
        )}
      </div>
      {metric.subtitle && (
        <p className="text-[9px] text-neutral-500 mt-1">{metric.subtitle}</p>
      )}
    </div>
  );
};

const FlowVisualization = ({ entry, exit }: { entry: number, exit: number }) => {
  const netFlow = entry - exit;
  const maxValue = Math.max(entry, exit);
  const entryPercent = (entry / maxValue) * 100;
  const exitPercent = (exit / maxValue) * 100;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded border border-purple-200" style={{ height: '220px', maxHeight: '220px' }}>
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-3">Entry vs Exit Flow</h4>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-neutral-600">Entry</span>
            <span className="text-sm font-mono font-bold text-purple-600">{entry}</span>
          </div>
          <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all duration-500 rounded-full"
              style={{ width: `${entryPercent}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-neutral-600">Exit</span>
            <span className="text-sm font-mono font-bold text-pink-600">{exit}</span>
          </div>
          <div className="w-full h-2 bg-pink-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-pink-500 transition-all duration-500 rounded-full"
              style={{ width: `${exitPercent}%` }}
            />
          </div>
        </div>
        <div className="pt-2 border-t border-purple-100">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-neutral-600">Net Flow</span>
            <span className={cn(
              "text-lg font-mono font-bold",
              netFlow > 0 ? "text-purple-600" : netFlow < 0 ? "text-red-600" : "text-neutral-500"
            )}>
              {netFlow > 0 ? "+" : ""}{netFlow}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const OccupancyDistributionChart = () => {
  const data = [
    { hour: '00:00', occupancy: 12 },
    { hour: '04:00', occupancy: 8 },
    { hour: '08:00', occupancy: 45 },
    { hour: '12:00', occupancy: 78 },
    { hour: '16:00', occupancy: 92 },
    { hour: '20:00', occupancy: 54 },
    { hour: '24:00', occupancy: 18 }
  ];

  return (
    <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded border border-green-200 flex flex-col" style={{ height: '220px', maxHeight: '220px' }}>
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-3">Occupancy Distribution</h4>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={data} margin={{ top: 2, right: 2, left: -20, bottom: 2 }}>
            <defs>
              <linearGradient id="occupancyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="hour" stroke="#9ca3af" fontSize={9} tickLine={false} />
            <YAxis stroke="#9ca3af" fontSize={9} tickLine={false} />
            <Tooltip 
              cursor={{ stroke: '#10B981', strokeWidth: 1 }}
              contentStyle={{ background: '#fff', border: '1px solid #10B981', borderRadius: '4px', fontSize: '10px', padding: '4px 8px' }}
              labelStyle={{ fontWeight: 'bold', color: '#047857' }}
            />
            <Area type="monotone" dataKey="occupancy" stroke="#10B981" strokeWidth={2} fill="url(#occupancyGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const YearOverYearChart = () => {
  const data = [
    { month: 'Jan', thisYear: 1250, lastYear: 980 },
    { month: 'Feb', thisYear: 1380, lastYear: 1050 },
    { month: 'Mar', thisYear: 1520, lastYear: 1180 },
    { month: 'Apr', thisYear: 1650, lastYear: 1280 },
    { month: 'May', thisYear: 1780, lastYear: 1420 },
    { month: 'Jun', thisYear: 1620, lastYear: 1380 }
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded border border-blue-200 flex flex-col" style={{ height: '220px', maxHeight: '220px' }}>
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-3">Year-over-Year Comparison</h4>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <ComposedChart data={data} margin={{ top: 2, right: 2, left: -20, bottom: 2 }}>
            <XAxis dataKey="month" stroke="#9ca3af" fontSize={9} tickLine={false} />
            <YAxis stroke="#9ca3af" fontSize={9} tickLine={false} />
            <Tooltip 
              cursor={{ fill: 'rgba(96, 165, 250, 0.1)' }}
              contentStyle={{ background: '#fff', border: '1px solid #60A5FA', borderRadius: '4px', fontSize: '10px', padding: '4px 8px' }}
              labelStyle={{ fontWeight: 'bold', color: '#1E40AF' }}
            />
            <Bar dataKey="lastYear" fill="#CBD5E1" radius={[2, 2, 0, 0]} name="Last Year" isAnimationActive={false} />
            <Line type="monotone" dataKey="thisYear" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 3 }} name="This Year" isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-4 mt-2 pt-2 border-t border-blue-100">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
          <span className="text-[9px] text-neutral-600">This Year</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-slate-300"></div>
          <span className="text-[9px] text-neutral-600">Last Year</span>
        </div>
      </div>
    </div>
  );
};

// Camera Metrics for Monitoring Staff - Real-time actionable data
interface CameraMetricData {
  cameraId: string;
  cameraName: string;
  status: 'active' | 'warning' | 'offline';
  metrics: Array<{
    name: string;
    value: number | string;
    unit: string;
    type: 'number' | 'graph';
    status?: 'normal' | 'warning' | 'critical';
    trend?: number;
    data?: Array<{ time: string, value: number }>;
  }>;
}

// Generate mock cameras for a location
const generateCamerasForLocation = (locationName: string): CameraMetricData[] => {
  const cameras = [];
  const cameraCount = 5; // 5 cameras per location as mentioned
  
  for (let i = 1; i <= cameraCount; i++) {
    const cameraId = `CAM-${locationName.substring(0, 2).toUpperCase()}-${String(i).padStart(3, '0')}`;
    const cameraName = `${locationName} - Camera ${i}`;
    const status = i === 3 ? 'warning' : i === 5 ? 'offline' : 'active';
    
    // Generate 10 metrics per camera
    const metrics = [];
    const metricTypes = [
      { name: 'Current Count', type: 'number', unit: 'people', hasGraph: false },
      { name: 'Throughput', type: 'number', unit: '/min', hasGraph: false },
      { name: 'Queue Length', type: 'number', unit: 'people', hasGraph: false },
      { name: '1-Min Trend', type: 'graph', unit: '', hasGraph: true },
      { name: 'FPS', type: 'number', unit: 'fps', hasGraph: false },
      { name: 'Flow Rate', type: 'graph', unit: '', hasGraph: true },
      { name: 'Camera Status', type: 'number', unit: 'ms', hasGraph: false }, // Latency
      { name: 'Dwell Time', type: 'number', unit: 'sec', hasGraph: false },
      { name: 'Alert Count', type: 'number', unit: 'alerts', hasGraph: false },
      { name: 'Anomaly Score', type: 'number', unit: '/100', hasGraph: false },
    ];
    
    metricTypes.forEach((metricType) => {
      if (status === 'offline') {
        metrics.push({
          name: metricType.name,
          value: '--',
          unit: metricType.unit,
          type: metricType.type as 'number' | 'graph',
          status: 'normal' as const
        });
      } else {
        if (metricType.hasGraph) {
          // 1-minute interval data (60 data points for 60 seconds)
          const data = Array.from({ length: 60 }, (_, i) => ({
            time: `${i}s`,
            value: Math.floor(Math.random() * 50) + 20
          }));
          metrics.push({
            name: metricType.name,
            value: data[data.length - 1].value,
            unit: metricType.unit,
            type: 'graph' as const,
            data,
            status: (Math.random() > 0.8 ? 'warning' : 'normal') as 'normal' | 'warning'
          });
        } else {
          const baseValue = Math.floor(Math.random() * 100);
          let value: number | string = baseValue;
          let metricStatus: 'normal' | 'warning' | 'critical' = 'normal';
          
          // Set status based on metric type and value
          if (metricType.name === 'Alert Count' && baseValue > 5) metricStatus = 'critical';
          else if (metricType.name === 'Queue Length' && baseValue > 30) metricStatus = 'warning';
          else if (metricType.name === 'Density' && baseValue > 85) metricStatus = 'warning';
          else if (metricType.name === 'FPS' && baseValue < 25) metricStatus = 'warning';
          
          // Adjust values to be realistic
          if (metricType.name === 'FPS') value = Math.floor(Math.random() * 10) + 25; // 25-35 fps
          else if (metricType.name === 'Dwell Time') value = Math.floor(Math.random() * 120) + 30; // 30-150 sec
          else if (metricType.name === 'Anomaly Score') value = Math.floor(Math.random() * 20); // 0-20
          
          metrics.push({
            name: metricType.name,
            value,
            unit: metricType.unit,
            type: 'number' as const,
            status: metricStatus,
            trend: Math.random() > 0.5 ? Math.floor(Math.random() * 20) - 10 : undefined
          });
        }
      }
    });
    
    cameras.push({
      cameraId,
      cameraName,
      status,
      metrics
    });
  }
  
  return cameras;
};

const CameraMetricCard = ({ metric, cameraStatus }: { metric: CameraMetricData['metrics'][0], cameraStatus?: 'active' | 'warning' | 'offline' }) => {
  if (metric.type === 'graph' && metric.data) {
    const color = metric.status === 'warning' ? '#F59E0B' : '#00775B';
    
    // Find peak hour in the data
    const peakIndex = metric.data.reduce((maxIdx, curr, idx, arr) => 
      curr.value > arr[maxIdx].value ? idx : maxIdx, 0
    );
    
    return (
      <div className="flex-shrink-0 w-[180px] bg-white p-2 rounded border border-neutral-200 hover:border-[#00775B]/30 transition-all overflow-hidden relative">
        {/* Heartbeat animation indicator */}
        <div className="absolute top-1 right-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00775B] animate-pulse shadow-[0_0_4px_rgba(0,119,91,0.6)]" />
        </div>
        <h5 className="text-[9px] font-bold uppercase text-neutral-600 mb-1">{metric.name}</h5>
        <div className="h-[60px] overflow-hidden">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <LineChart data={metric.data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <Tooltip 
                cursor={{ stroke: color, strokeWidth: 1 }}
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '9px', padding: '3px 6px' }}
                labelStyle={{ display: 'none' }}
                formatter={(value: any) => [`${value}`, '']}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={1.5} 
                dot={(props: any) => {
                  // Highlight peak hour with a larger, different colored dot
                  if (props.index === peakIndex) {
                    return <circle cx={props.cx} cy={props.cy} r={3} fill="#DC2626" stroke="#FFF" strokeWidth={1} />;
                  }
                  return null;
                }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="text-[9px] text-neutral-500 mt-1 text-center font-mono">Last 60 seconds • 1min</div>
      </div>
    );
  }
  
  // Number type metric
  const isAlertCount = metric.name === 'Alert Count';
  const alertThreshold = 5;
  const shouldUseMatriceRed = isAlertCount && typeof metric.value === 'number' && metric.value > alertThreshold;
  
  // Dynamic thresholds for FPS and Latency
  const isFPS = metric.name === 'FPS';
  const isLatency = metric.name === 'Camera Status'; // Latency
  const fpsValue = typeof metric.value === 'number' ? metric.value : 30;
  const latencyValue = typeof metric.value === 'number' ? metric.value : 50;
  
  const hasDegradedFPS = isFPS && fpsValue < 25;
  const hasDegradedLatency = isLatency && latencyValue > 200;
  const isDegraded = hasDegradedFPS || hasDegradedLatency;
  
  return (
    <div className={cn(
      "bg-white p-4 rounded border transition-all hover:shadow-md",
      shouldUseMatriceRed ? "border-[#DC2626] bg-red-50 shadow-[0_0_12px_rgba(220,38,38,0.2)]" :
      isDegraded ? "border-amber-500 bg-amber-50" :
      metric.status === 'critical' ? "border-red-500 bg-red-50" :
      metric.status === 'warning' ? "border-amber-500 bg-amber-50" :
      "border-neutral-200 hover:border-[#00775B]/30"
    )}>
      <h5 className="text-[10px] font-bold uppercase text-neutral-600 mb-2">{metric.name}</h5>
      <div className="flex items-baseline gap-2">
        <span className={cn(
          "text-3xl font-mono font-bold",
          shouldUseMatriceRed ? "text-[#DC2626]" :
          isDegraded ? "text-amber-600" :
          metric.status === 'critical' ? "text-red-600" :
          metric.status === 'warning' ? "text-amber-600" :
          "text-[#00775B]"
        )}>
          {metric.value}
        </span>
        {metric.unit && <span className="text-[10px] text-neutral-500 font-mono">{metric.unit}</span>}
      </div>
      {metric.trend !== undefined && (
        <div className={cn(
          "text-[10px] font-bold mt-1",
          metric.trend > 0 ? "text-green-600" : metric.trend < 0 ? "text-red-500" : "text-neutral-400"
        )}>
          {metric.trend > 0 ? "+" : ""}{metric.trend}%
        </div>
      )}
    </div>
  );
};

const CameraSection = ({ camera }: { camera: CameraMetricData }) => {
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Group metrics
  const operationalMetrics = camera.metrics.filter(m => 
    ['Current Count', 'Throughput', 'Queue Length', '1-Min Trend'].includes(m.name)
  );
  const systemHealthMetrics = camera.metrics.filter(m => 
    ['FPS', 'Flow Rate', 'Camera Status'].includes(m.name)
  );
  const otherMetrics = camera.metrics.filter(m => 
    !['Current Count', 'Throughput', 'Queue Length', '1-Min Trend', 'FPS', 'Flow Rate', 'Camera Status'].includes(m.name)
  );
  
  // Get AI confidence (simulated)
  const aiConfidence = useMemo(() => 85 + Math.floor(Math.random() * 14), []);
  
  // Get FPS and Latency for technical health warnings
  const fpsMetric = camera.metrics.find(m => m.name === 'FPS');
  const latencyMetric = camera.metrics.find(m => m.name === 'Camera Status'); // Latency
  const fps = typeof fpsMetric?.value === 'number' ? fpsMetric.value : 30;
  const latency = typeof latencyMetric?.value === 'number' ? latencyMetric.value : 50;
  
  const hasDegradedData = fps < 25 || latency > 200;
  
  // Handle verify action
  const handleVerify = () => {
    setIsVerifying(true);
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setTimeout(() => {
      setVerifiedAt(timestamp);
      setIsVerifying(false);
    }, 800);
  };
  
  return (
    <div className={cn(
      "bg-white rounded border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all",
      isVerifying && "animate-[flash_0.8s_ease-in-out]"
    )}>
      {/* Camera Header with Status */}
      <div className={cn(
        "px-4 py-2.5 border-b flex items-center justify-between",
        camera.status === 'active' ? "bg-teal-50 border-teal-200" :
        camera.status === 'warning' ? "bg-amber-50 border-amber-200" :
        "bg-neutral-100 border-neutral-300"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded border text-[9px] font-bold uppercase",
            camera.status === 'active' ? "bg-teal-100 border-teal-300 text-teal-700" :
            camera.status === 'warning' ? "bg-amber-100 border-amber-300 text-amber-700" :
            "bg-neutral-200 border-neutral-400 text-neutral-600"
          )}>
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              camera.status === 'active' ? "bg-teal-500 animate-pulse shadow-[0_0_6px_rgba(20,184,166,0.6)]" :
              camera.status === 'warning' ? "bg-amber-500 animate-pulse" :
              "bg-neutral-500"
            )} />
            {camera.status}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-neutral-900">{camera.cameraName}</h4>
              {verifiedAt && (
                <span className="text-[8px] text-teal-600 font-mono italic">
                  ✓ Verified at {verifiedAt}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[9px] text-neutral-500 font-mono">{camera.cameraId}</p>
              {/* App Health Status Pill */}
              {camera.status !== 'offline' && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-[#00956D]/10 border border-[#00956D]/30 text-[8px] font-bold text-[#00956D]">
                  <div className="w-1 h-1 rounded-full bg-[#00956D] animate-pulse" />
                  App: People Counting (v2.4) - Active
                </span>
              )}
            </div>
          </div>
        </div>
        {camera.status === 'offline' ? (
          <div className="flex items-center gap-2">
            <ZapOff className="w-3 h-3 text-neutral-400" />
            <span className="text-[9px] text-neutral-500 italic">No data available</span>
          </div>
        ) : hasDegradedData && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-50 border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span className="text-[8px] font-bold text-amber-700 uppercase">Degraded Data</span>
          </div>
        )}
      </div>
      
      {/* Main Content: Thumbnail + Grouped Metrics + Actions */}
      <div className="p-4 space-y-4">
        {/* Top Section: Bigger Thumbnail with AI Overlays */}
        <div className="flex gap-4">
          {/* Left: Bigger Live Thumbnail with AI Overlays */}
          <div className="flex-shrink-0">
            <div className="relative w-[400px] h-[225px] bg-neutral-900 rounded border border-neutral-300 overflow-hidden group cursor-pointer hover:scale-[1.01] hover:shadow-2xl transition-all duration-300">
              {camera.status !== 'offline' ? (
                <>
                  {/* Simulated Live Feed */}
                  <img 
                    src={IMG_CROWD} 
                    alt={`${camera.cameraName} Live Feed`} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity"
                  />
                  
                  {/* AI Bounding Boxes - Enhanced on hover */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className={cn(
                      "absolute top-6 left-12 w-16 h-32 border-2 rounded-sm transition-all duration-300",
                      "border-[#00775B] group-hover:border-[#00956D] group-hover:shadow-[0_0_12px_rgba(0,149,109,0.6)]"
                    )}>
                      <div className="absolute -top-4 left-0 bg-[#00775B] group-hover:bg-[#00956D] text-white text-[9px] font-bold px-1.5 py-0.5 transition-colors">PERSON 98%</div>
                    </div>
                    <div className={cn(
                      "absolute top-8 right-16 w-14 h-28 border-2 rounded-sm transition-all duration-300",
                      "border-[#00775B] group-hover:border-[#00956D] group-hover:shadow-[0_0_12px_rgba(0,149,109,0.6)]"
                    )}>
                      <div className="absolute -top-4 left-0 bg-[#00775B] group-hover:bg-[#00956D] text-white text-[9px] font-bold px-1.5 py-0.5 transition-colors">PERSON 92%</div>
                    </div>
                  </div>
                  
                  {/* Live Indicator */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-white uppercase">LIVE</span>
                  </div>
                  
                  {/* AI Confidence Badge */}
                  <div className="absolute bottom-2 left-2 bg-[#00775B]/90 backdrop-blur-sm px-2 py-1 rounded">
                    <span className="text-[9px] font-bold text-white">AI Confidence: {aiConfidence}%</span>
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-8 h-8 text-white" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <ZapOff className="w-10 h-10 text-neutral-600" />
                  <span className="text-xs text-neutral-500 uppercase font-bold">Offline</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Right: Action Bar */}
          <div className="flex flex-col gap-2">
            <button 
              onClick={handleVerify}
              disabled={isVerifying}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-3 rounded border transition-colors group min-w-[80px]",
                isVerifying 
                  ? "border-teal-500 bg-teal-100 cursor-wait" 
                  : "border-[#00775B] bg-[#00775B]/5 hover:bg-[#00775B]/10"
              )}
              title="Verify AI Detection"
            >
              <Check className={cn(
                "w-5 h-5 transition-transform",
                isVerifying ? "text-teal-600 animate-pulse" : "text-[#00775B] group-hover:scale-110"
              )} />
              <span className={cn(
                "text-[8px] font-bold uppercase",
                isVerifying ? "text-teal-600" : "text-[#00775B]"
              )}>
                {isVerifying ? "Verifying..." : "Verify"}
              </span>
            </button>
            
            <button 
              className="flex flex-col items-center justify-center gap-1 px-3 py-3 rounded border border-amber-500 bg-amber-50 hover:bg-amber-100 transition-colors group min-w-[80px]"
              title="Report False Positive"
            >
              <Flag className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-bold text-amber-600 uppercase">Report</span>
            </button>
            
            <button 
              className="flex flex-col items-center justify-center gap-1 px-3 py-3 rounded border border-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors group min-w-[80px]"
              title="Open Full Stream"
            >
              <Maximize2 className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-bold text-blue-600 uppercase">Stream</span>
            </button>
          </div>
        </div>

        {/* Metrics Section - Bigger and Better Grouped */}
        <div className="space-y-4">
          {/* Operational Metrics Group */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-sm border border-teal-300 p-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#00775B] mb-3 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-[#00775B] rounded-full" />
              Volume Metrics
            </h5>
            <div className="grid grid-cols-4 gap-3">
              {operationalMetrics.map((metric, idx) => (
                <CameraMetricCard key={idx} metric={metric} cameraStatus={camera.status} />
              ))}
            </div>
          </div>
          
          {/* System Health Metrics Group */}
          <div className={cn(
            "rounded-sm border p-4",
            hasDegradedData 
              ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300"
              : "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300"
          )}>
            <h5 className={cn(
              "text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2",
              hasDegradedData ? "text-amber-700" : "text-purple-700"
            )}>
              <div className={cn(
                "w-1.5 h-4 rounded-full",
                hasDegradedData ? "bg-amber-600" : "bg-purple-600"
              )} />
              System Health
              {hasDegradedData && (
                <span className="text-[8px] text-amber-600 font-bold italic ml-1 px-2 py-0.5 bg-amber-200 rounded">
                  • DEGRADED
                </span>
              )}
            </h5>
            <div className="grid grid-cols-3 gap-3">
              {systemHealthMetrics.map((metric, idx) => (
                <CameraMetricCard key={idx} metric={metric} cameraStatus={camera.status} />
              ))}
            </div>
          </div>
          
          {/* Additional Metrics - Compact Display */}
          {otherMetrics.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-sm border border-blue-300 p-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
                Additional Metrics
              </h5>
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {otherMetrics.map((metric, idx) => (
                  <CameraMetricCard key={idx} metric={metric} cameraStatus={camera.status} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LocationDetailModal = ({ 
  location, 
  appName, 
  open, 
  onOpenChange 
}: { 
  location: CameraLocation | null; 
  appName: string; 
  open: boolean; 
  onOpenChange: (open: boolean) => void 
}) => {
  if (!location) return null;
  
  // Generate cameras for this location
  const cameras = useMemo(() => generateCamerasForLocation(location.locationName), [location.locationName]);
  
  // Calculate general real-time metrics
  const activeCameras = cameras.filter(c => c.status === 'active').length;
  const totalCameras = cameras.length;
  const totalLiveCount = cameras
    .filter(c => c.status !== 'offline')
    .reduce((sum, cam) => {
      const countMetric = cam.metrics.find(m => m.name === 'Current Count');
      return sum + (typeof countMetric?.value === 'number' ? countMetric.value : 0);
    }, 0);
  const criticalAlerts = cameras
    .filter(c => c.status !== 'offline')
    .reduce((sum, cam) => {
      const alertMetric = cam.metrics.find(m => m.name === 'Alert Count');
      return sum + (typeof alertMetric?.value === 'number' ? alertMetric.value : 0);
    }, 0);
  const avgDensity = Math.floor(cameras
    .filter(c => c.status !== 'offline')
    .reduce((sum, cam) => {
      const densityMetric = cam.metrics.find(m => m.name === 'Density');
      return sum + (typeof densityMetric?.value === 'number' ? densityMetric.value : 0);
    }, 0) / (activeCameras || 1));

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-50 border border-neutral-300 rounded-sm shadow-2xl z-50 w-[95vw] max-w-[1400px] p-0 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-neutral-300 bg-gradient-to-r from-[#021d18] to-[#003d2e]">
            <div>
              <Dialog.Title className="text-lg font-bold text-white flex items-center gap-2">
                {/* VOLUME Category Tag */}
                <span className="inline-flex items-center px-2 py-1 rounded bg-[#00775B] text-white text-[9px] font-bold uppercase tracking-wider border border-[#00956D] shadow-sm">
                  <BarChart2 className="w-3 h-3 mr-1" />
                  VOLUME
                </span>
                {location.locationName}
                <span className="text-xs font-normal text-white/60 px-2 py-0.5 rounded bg-white/10 border border-white/20">
                  Deep-Dive Triage
                </span>
              </Dialog.Title>
              <Dialog.Description className="text-xs text-white/70 mt-0.5">
                {appName} • Camera-Level Evidence & Verification • {activeCameras}/{totalCameras} Cameras Active
              </Dialog.Description>
            </div>
            <button onClick={() => onOpenChange(false)} className="text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-neutral-50 to-neutral-100">
            {/* General Real-Time Metrics */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00775B]" />
                Operational Readiness Summary
              </h3>
              <p className="text-[10px] text-neutral-500 mb-3 italic">
                Zone health check before drilling into specific cameras
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-5 rounded border-2 border-teal-400 shadow-sm">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-teal-700 mb-2 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Total Live Count
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-mono font-bold text-teal-600">{totalLiveCount}</span>
                    <span className="text-xs text-teal-600 font-medium">people</span>
                  </div>
                </div>
                
                <div className={cn(
                  "p-5 rounded border-2 shadow-sm",
                  avgDensity > 80 ? "bg-gradient-to-br from-red-50 to-orange-50 border-red-400" :
                  avgDensity > 60 ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-400" :
                  "bg-gradient-to-br from-green-50 to-emerald-50 border-green-400"
                )}>
                  <h4 className={cn(
                    "text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1",
                    avgDensity > 80 ? "text-red-700" :
                    avgDensity > 60 ? "text-amber-700" :
                    "text-green-700"
                  )}>
                    <Activity className="w-3 h-3" />
                    Avg Density
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className={cn(
                      "text-4xl font-mono font-bold",
                      avgDensity > 80 ? "text-red-600" :
                      avgDensity > 60 ? "text-amber-600" :
                      "text-green-600"
                    )}>{avgDensity}%</span>
                  </div>
                </div>
                
                <div className={cn(
                  "p-5 rounded border-2 shadow-sm",
                  criticalAlerts > 10 ? "bg-gradient-to-br from-red-50 to-orange-50 border-red-500 animate-pulse-slow" :
                  criticalAlerts > 5 ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-400" :
                  "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-400"
                )}>
                  <h4 className={cn(
                    "text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1",
                    criticalAlerts > 10 ? "text-red-700" :
                    criticalAlerts > 5 ? "text-amber-700" :
                    "text-blue-700"
                  )}>
                    <Bell className="w-3 h-3" />
                    Active Alerts
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className={cn(
                      "text-4xl font-mono font-bold",
                      criticalAlerts > 10 ? "text-red-600" :
                      criticalAlerts > 5 ? "text-amber-600" :
                      "text-blue-600"
                    )}>{criticalAlerts}</span>
                    <span className={cn(
                      "text-xs font-medium",
                      criticalAlerts > 10 ? "text-red-600" :
                      criticalAlerts > 5 ? "text-amber-600" :
                      "text-blue-600"
                    )}>alerts</span>
                  </div>
                  {criticalAlerts > 10 && (
                    <div className="flex items-center gap-1 mt-2 text-red-600">
                      <AlertTriangle className="w-3 h-3" />
                      <span className="text-[9px] font-bold">IMMEDIATE ACTION</span>
                    </div>
                  )}
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded border-2 border-purple-400 shadow-sm">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-purple-700 mb-2 flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    Camera Status
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-mono font-bold text-purple-600">{activeCameras}/{totalCameras}</span>
                    <span className="text-xs text-purple-600 font-medium">online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Camera-Specific Sections */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-3 flex items-center gap-2">
                <Video className="w-4 h-4 text-[#00775B]" />
                Camera-Level Evidence & Diagnostics
              </h3>
              <p className="text-[10px] text-neutral-500 mb-4 italic">
                Visual verification with AI bounding boxes • Grouped metrics for faster triage • Immediate action tools
              </p>
              <div className="space-y-4">
                {cameras.map((camera, idx) => (
                  <CameraSection key={idx} camera={camera} />
                ))}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const LocationCard = ({ 
  location, 
  appName, 
  onExpand 
}: { 
  location: CameraLocation; 
  appName: string; 
  onExpand: () => void 
}) => {
  const getBgColor = () => {
    if (location.status === 'warning') return 'bg-gradient-to-br from-amber-50 to-orange-50';
    if (location.status === 'inactive') return 'bg-gradient-to-br from-neutral-100 to-slate-100';
    return 'bg-gradient-to-br from-green-50 to-teal-50';
  };

  return (
    <div 
      onClick={onExpand}
      className={cn(
        "rounded border p-3 hover:shadow-md transition-all cursor-pointer group h-full",
        getBgColor(),
        location.status === 'active' ? "border-teal-300 hover:border-teal-400" :
        location.status === 'warning' ? "border-amber-300" :
        "border-neutral-300"
      )}
    >
    {/* Location Header */}
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1 min-w-0">
        <h4 className="text-[10px] font-bold text-neutral-900 truncate mb-0.5">{location.locationName}</h4>
        <p className="text-[9px] text-neutral-500 font-mono">{location.cameraId}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        <div className={cn(
          "w-1.5 h-1.5 rounded-full",
          location.status === 'active' ? "bg-teal-500 animate-pulse" :
          location.status === 'warning' ? "bg-amber-500 animate-pulse" :
          "bg-neutral-400"
        )} />
        <ChevronRight className="w-3 h-3 text-neutral-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>

    {/* Mini Metrics Grid - 2x2 */}
    <div className="grid grid-cols-2 gap-2">
      {location.metrics.map((metric, idx) => (
        <MetricMiniChart key={idx} metric={metric} />
      ))}
    </div>
  </div>
  );
};

// Priority Metrics Component - Diverse Metrics with Severity and Customization
const PriorityMetrics = () => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  const allMetrics = [
    // Capacity metrics
    { id: 'cap-1', type: 'capacity', location: 'Food Court', value: 92, unit: '%', threshold: 90, status: 'critical', color: 'red', bgGradient: 'from-red-50 to-orange-50', borderColor: 'border-red-500' },
    { id: 'cap-2', type: 'capacity', location: 'Parking Lot B', value: 91, unit: '%', threshold: 90, status: 'critical', color: 'red', bgGradient: 'from-red-50 to-orange-50', borderColor: 'border-red-500' },
    { id: 'cap-3', type: 'capacity', location: 'North Plaza', value: 86, unit: '%', threshold: 85, status: 'warning', color: 'amber', bgGradient: 'from-amber-50 to-yellow-50', borderColor: 'border-amber-500' },
    
    // Footfall rate metrics
    { id: 'foot-1', type: 'footfall', location: 'Main Entrance', value: 847, unit: '/hr', threshold: 800, status: 'warning', color: 'amber', bgGradient: 'from-amber-50 to-yellow-50', borderColor: 'border-amber-500' },
    { id: 'foot-2', type: 'footfall', location: 'Retail Zone A', value: 342, unit: '/hr', threshold: 500, status: 'normal', color: 'teal', bgGradient: 'from-teal-50 to-cyan-50', borderColor: 'border-teal-400' },
    
    // Dwell time metrics
    { id: 'dwell-1', type: 'dwell', location: 'Exhibition Hall', value: 28, unit: 'min', threshold: 25, status: 'warning', color: 'amber', bgGradient: 'from-amber-50 to-yellow-50', borderColor: 'border-amber-500' },
    { id: 'dwell-2', type: 'dwell', location: 'Lounge Area', value: 15, unit: 'min', threshold: 20, status: 'normal', color: 'purple', bgGradient: 'from-purple-50 to-pink-50', borderColor: 'border-purple-400' },
    
    // Queue length metrics
    { id: 'queue-1', type: 'queue', location: 'Security Check', value: 42, unit: 'people', threshold: 30, status: 'critical', color: 'red', bgGradient: 'from-red-50 to-orange-50', borderColor: 'border-red-500' },
    { id: 'queue-2', type: 'queue', location: 'Ticket Counter', value: 12, unit: 'people', threshold: 15, status: 'normal', color: 'green', bgGradient: 'from-green-50 to-emerald-50', borderColor: 'border-green-400' },
    
    // Anomaly detection metrics
    { id: 'anom-1', type: 'anomaly', location: 'South Wing', value: 3, unit: 'alerts', threshold: 2, status: 'warning', color: 'amber', bgGradient: 'from-amber-50 to-yellow-50', borderColor: 'border-amber-500' },
  ];

  // Sort by severity: critical > warning > normal
  const severityOrder = { critical: 0, warning: 1, normal: 2 };
  const sortedMetrics = [...allMetrics].sort((a, b) => severityOrder[a.status] - severityOrder[b.status]);
  
  // Display top 5 metrics
  const displayedMetrics = sortedMetrics.slice(0, 5);

  const getMetricTypeLabel = (type: string) => {
    switch (type) {
      case 'capacity': return 'Capacity';
      case 'footfall': return 'Footfall Rate';
      case 'dwell': return 'Dwell Time';
      case 'queue': return 'Queue Length';
      case 'anomaly': return 'Anomaly';
      default: return type;
    }
  };

  const getStatCardColors = (status: string) => {
    if (status === 'critical') return {
      border: 'rgb(231,0,11)', bg: 'rgb(255,229,231)',
      shadow: 'rgba(231,0,11,0.1) 0px 0px 6px 1px, rgba(0,0,0,0.04) 0px 1px 3px',
      badge: { bg: 'rgba(231,0,11,0.14)', color: 'rgb(231,0,11)', label: 'CRITICAL' },
      divider: 'rgba(231,0,11,0.22)', value: '#0f172a',
    };
    if (status === 'warning') return {
      border: 'rgb(217,119,6)', bg: 'rgb(255,251,235)',
      shadow: 'rgba(217,119,6,0.1) 0px 0px 6px 1px, rgba(0,0,0,0.04) 0px 1px 3px',
      badge: { bg: 'rgba(217,119,6,0.14)', color: 'rgb(217,119,6)', label: 'WARNING' },
      divider: 'rgba(217,119,6,0.22)', value: '#0f172a',
    };
    return {
      border: 'rgb(20,184,166)', bg: '#ffffff',
      shadow: 'rgba(0,0,0,0.04) 0px 1px 3px',
      badge: { bg: 'rgba(20,184,166,0.14)', color: 'rgb(20,184,166)', label: 'LIVE' },
      divider: '#e5e7eb', value: '#0f172a',
    };
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">Priority Metrics</h3>
          <span className="text-[10px] text-neutral-400 font-mono">Auto-sorted by severity</span>
        </div>
        <button
          onClick={() => setIsCustomizing(!isCustomizing)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors text-[10px] font-bold text-neutral-600"
        >
          <Settings className="w-3 h-3" />
          {isCustomizing ? 'Done' : 'Customize'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {displayedMetrics.map((metric) => {
          const c = getStatCardColors(metric.status);
          const pctDiff = Math.round(((metric.value - metric.threshold) / metric.threshold) * 100);
          const isOver = metric.value > metric.threshold;
          return (
            <div
              key={metric.id}
              className="w-full rounded-[4px] flex flex-col cursor-pointer select-none transition-all duration-200 hover:shadow-md"
              style={{ border: `1px solid ${c.border}`, background: c.bg, boxShadow: c.shadow }}
            >
              {/* Label + badge */}
              <div className="px-4 pt-4 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.5px] leading-none text-[#475569]">
                  {getMetricTypeLabel(metric.type)}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.5px] px-2 py-[3px] rounded-full flex-shrink-0"
                  style={{ backgroundColor: c.badge.bg, color: c.badge.color }}>
                  {c.badge.label}
                </span>
              </div>
              {/* Value + trend */}
              <div className="px-4 pt-3 pb-4 flex items-end justify-between gap-4">
                <div className="flex flex-col gap-[7px]">
                  <div className="font-mono font-bold tabular-nums leading-none" style={{ fontSize: 28, color: c.value }}>
                    {metric.value}
                    <span className="text-[14px] font-medium text-[#64748b] ml-1">{metric.unit}</span>
                  </div>
                  <div className="text-[12px] text-[#64748b]">{metric.location}</div>
                </div>
                <div className="flex flex-col px-[10px] py-[8px] rounded-[6px] flex-shrink-0"
                  style={{ backgroundColor: isOver ? 'rgba(231,0,11,0.12)' : 'rgba(0,149,109,0.12)' }}>
                  <div className="flex items-center gap-[4px] font-mono font-bold leading-none"
                    style={{ fontSize: 13, color: isOver ? 'rgb(231,0,11)' : 'rgb(0,149,109)' }}>
                    {isOver ? '↑' : '↓'} {Math.abs(pctDiff)}%
                  </div>
                  <div className="text-[10px] font-normal mt-[5px] leading-none text-[#94a3b8]">vs Threshold</div>
                </div>
              </div>
              {/* Divider */}
              <div style={{ height: 1, backgroundColor: c.divider, margin: '0 16px' }} />
              {/* Footer */}
              <div className="px-4 py-3 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#94a3b8] flex-shrink-0">Threshold</span>
                <span className="text-[11px] text-[#475569] truncate">{metric.threshold}{metric.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {isCustomizing && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-[10px] text-blue-800">
          <p className="font-bold mb-1">Customization Mode</p>
          <p>Metrics exceeding thresholds appear with alerts, auto-sorted by severity.</p>
        </div>
      )}
    </div>
  );
};

const ApplicationMonitoringPanel = ({ panel }: { panel: ApplicationPanel }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<CameraLocation | null>(null);
  const [selectedCameraPerZone, setSelectedCameraPerZone] = useState<{ [zoneName: string]: number }>({});

  // Group locations by zone
  const zoneGroups = useMemo(() => {
    const groups: { [key: string]: CameraLocation[] } = {};
    panel.locations.forEach(location => {
      // Extract zone name from locationName (e.g., "Main Entrance" -> "Main Entrance Zone")
      const zoneName = location.locationName.includes('Main') ? 'Main Entrance' :
                      location.locationName.includes('Food') ? 'Food Court' :
                      location.locationName.includes('South') ? 'South Wing' :
                      location.locationName.includes('North') ? 'North Plaza' :
                      location.locationName;
      
      if (!groups[zoneName]) {
        groups[zoneName] = [];
      }
      groups[zoneName].push(location);
    });
    return groups;
  }, [panel.locations]);

  // Get up to 4 zones for 2x2 grid
  const zones = Object.entries(zoneGroups).slice(0, 4);

  const handlePrevCamera = (zoneName: string, totalCameras: number) => {
    setSelectedCameraPerZone(prev => ({
      ...prev,
      [zoneName]: ((prev[zoneName] || 0) - 1 + totalCameras) % totalCameras
    }));
  };

  const handleNextCamera = (zoneName: string, totalCameras: number) => {
    setSelectedCameraPerZone(prev => ({
      ...prev,
      [zoneName]: ((prev[zoneName] || 0) + 1) % totalCameras
    }));
  };

  // Check for zero traffic - simulate checking if all locations have 0 count for >30min
  const hasZeroTraffic = useMemo(() => {
    // Simulate: Check if total count across all locations is very low (< 5) indicating potential camera issues
    const totalCount = panel.locations.reduce((sum, loc) => {
      const countMetric = loc.metrics.find(m => m.metricName.includes('Count'));
      return sum + (countMetric?.currentValue || 0);
    }, 0);
    return totalCount < 5;
  }, [panel.locations]);

  return (
    <>
      <LocationDetailModal 
        location={selectedLocation} 
        appName={panel.applicationName}
        open={!!selectedLocation} 
        onOpenChange={(open) => !open && setSelectedLocation(null)} 
      />

      <Collapsible.Root 
        open={isOpen} 
        onOpenChange={setIsOpen}
        className="bg-white border border-neutral-200 rounded-sm shadow-sm overflow-hidden transition-all hover:shadow-md"
      >
        <Collapsible.Trigger asChild>
          <button className="w-full px-4 py-3 flex items-center justify-between bg-neutral-50 hover:bg-neutral-100 transition-colors group">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{panel.icon}</span>
              <div className="text-left">
                <h3 className={cn(
                  "text-sm font-bold transition-colors flex items-center gap-2",
                  hasZeroTraffic ? "text-slate-500" : "text-neutral-900 group-hover:text-[#00775B]"
                )}>
                  {panel.applicationName}
                  {hasZeroTraffic && (
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded border border-slate-300 flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5" />
                      Check Camera
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-neutral-500 mt-0.5">{panel.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {panel.activeAlerts > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-red-100 rounded-sm">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  <span className="text-[10px] font-bold text-red-600">{panel.activeAlerts} Alert{panel.activeAlerts > 1 ? 's' : ''}</span>
                </div>
              )}
              <div className="text-[10px] text-neutral-400 font-mono">
                {panel.totalCameras} Cameras
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 text-neutral-400 transition-transform duration-200",
                isOpen ? "rotate-180" : ""
              )} />
            </div>
          </button>
        </Collapsible.Trigger>

        <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="p-4">
            {/* 2x2 Grid of Zones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {zones.map(([zoneName, cameras]) => {
                const currentCameraIndex = selectedCameraPerZone[zoneName] || 0;
                const currentCamera = cameras[currentCameraIndex];
                const totalCameras = cameras.length;

                return (
                  <div 
                    key={zoneName}
                    onClick={() => setSelectedLocation(currentCamera)}
                    className="rounded border border-teal-300 p-4 bg-gradient-to-br from-green-50 to-teal-50 hover:shadow-md transition-all cursor-pointer hover:border-teal-400 active:scale-[0.98]"
                  >
                    {/* Zone Header with Camera Name */}
                    <div className="mb-3 pb-2 border-b border-teal-200">
                      <h4 className="text-xs font-bold text-neutral-700 mb-1 flex items-center gap-2">
                        <Pin className="w-3.5 h-3.5 text-[#00775B]" />
                        {zoneName}
                      </h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Video className="w-3 h-3 text-neutral-500" />
                          <span className="text-[10px] font-mono text-neutral-600">{currentCamera.cameraId}</span>
                          <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase",
                            currentCamera.status === "active" ? "bg-teal-200 text-teal-800" :
                            currentCamera.status === "warning" ? "bg-amber-200 text-amber-800" :
                            "bg-neutral-300 text-neutral-700"
                          )}>
                            {currentCamera.status}
                          </span>
                        </div>
                        
                        {/* Camera Navigation Chevrons */}
                        {totalCameras > 1 && (
                          <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded border border-teal-300 shadow-sm px-1 py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrevCamera(zoneName, totalCameras);
                              }}
                              className="w-6 h-6 flex items-center justify-center hover:bg-teal-100 rounded transition-colors"
                              title="Previous camera"
                            >
                              <ChevronLeft className="w-4 h-4 text-[#00775B]" strokeWidth={2.5} />
                            </button>
                            <span className="text-[10px] font-mono font-bold text-neutral-700 px-1">
                              {currentCameraIndex + 1}/{totalCameras}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNextCamera(zoneName, totalCameras);
                              }}
                              className="w-6 h-6 flex items-center justify-center hover:bg-teal-100 rounded transition-colors"
                              title="Next camera"
                            >
                              <ChevronRight className="w-4 h-4 text-[#00775B]" strokeWidth={2.5} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 2x2 grid: top row = charts, bottom row = KPI stat cards */}
                    <div className="grid grid-cols-2 gap-2">
                      {currentCamera.metrics.slice(0, 2).map((metric, idx) => (
                        <MetricMiniChart key={idx} metric={metric} />
                      ))}
                      {currentCamera.metrics.slice(2, 4).map((metric, idx) => (
                        <ZoneStatCard key={idx} metric={metric} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    </>
  );
};

const HeatmapGrid = ({ compact = false }: { compact?: boolean }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="w-full overflow-x-auto custom-scrollbar pb-2">
      <div className={cn("min-w-[600px]", compact && "min-w-[400px]")}>
        <div className="flex mb-1">
          <div className="w-8"></div>
          {hours.map(h => (
            <div key={h} className="flex-1 text-[9px] text-neutral-400 text-center font-mono">
              {h}
            </div>
          ))}
        </div>
        <div className="space-y-[2px]">
          {days.map((day, dIdx) => (
            <div key={day} className={cn("flex", compact ? "h-4" : "h-6")}>
              <div className="w-8 text-[9px] font-bold text-neutral-500 flex items-center">{day}</div>
              {hours.map((h) => {
                const dataPoint = VOLUME_HEATMAP_DATA.find(d => d.day === day && d.hour === h);
                const value = dataPoint?.value || 0;
                const suggestedStaff = Math.ceil(value / 50); // 1 staff per 50 people
                
                // Color scale logic
                let bg = "bg-neutral-100";
                if (value > 80) bg = "bg-[#00775B]";
                else if (value > 60) bg = "bg-[#00956D]";
                else if (value > 40) bg = "bg-[#34D399]";
                else if (value > 20) bg = "bg-[#A7F3D0]";
                
                return (
                  <div 
                    key={`${day}-${h}`} 
                    className={cn("flex-1 rounded-[1px] mx-[1px] transition-colors hover:opacity-80 relative group", bg)}
                    // title={`Historical Avg: ${value} people | Suggested Staff: ${suggestedStaff}`}
                  >
                     {/* Custom Tooltip on Hover */}
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-50 pointer-events-none whitespace-nowrap">
                        <div className="bg-neutral-900 text-white text-[10px] py-1 px-2 rounded shadow-lg border border-neutral-700">
                           <div className="font-bold mb-0.5">{day} {h}:00</div>
                           <div className="flex flex-col gap-0.5 font-mono text-neutral-300">
                              <span>Hist. Avg: <span className="text-white font-bold">{value}</span></span>
                              <span>Sugg. Staff: <span className="text-[#34D399] font-bold">{suggestedStaff}</span></span>
                           </div>
                        </div>
                        {/* Arrow */}
                        <div className="w-2 h-2 bg-neutral-900 rotate-45 border-r border-b border-neutral-700 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                     </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CameraPerformanceTable = () => {
  type CamRow = typeof CAMERA_PERFORMANCE_DATA[0];
  const columns: DataGridColumn<CamRow>[] = [
    {
      key: "camera",
      header: "Camera Name",
      width: "2fr",
      render: (row, h) => <MonoCell hovered={h} isPrimary>{row.camera}</MonoCell>,
    },
    {
      key: "app",
      header: "Application",
      width: "1fr",
      render: (row, h) => <InterCell hovered={h} color="#64748B">{row.app}</InterCell>,
    },
    {
      key: "volume",
      header: "Volume (24h)",
      width: "100px",
      align: "right",
      render: (row, h) => <MonoCell hovered={h}>{row.volume.toLocaleString()}</MonoCell>,
    },
    {
      key: "change",
      header: "WoW Change",
      width: "90px",
      align: "right",
      sortable: true,
      render: (row, h) => {
        const color = row.change > 0 ? "#00956D" : "#EF4444";
        return (
          <MonoCell hovered={h} color={color} hoveredColor={color}>
            {(row.change > 0 ? "+" : "") + row.change + "%"}
          </MonoCell>
        );
      },
    },
  ];
  return (
    <div className="overflow-x-auto rounded-sm border border-neutral-200">
      <DataGrid columns={columns} data={CAMERA_PERFORMANCE_DATA} compact />
    </div>
  );
};

const DirectorKPICard = ({ kpi }: { kpi: any }) => (
  <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-sm hover:border-[#00775B]/30 transition-all group relative overflow-hidden">
    <div className="flex justify-between items-start z-10 relative mb-3">
      <div className="flex-1">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 group-hover:text-[#00775B] transition-colors mb-2">
          {kpi.label}
        </h3>
        <span className="text-3xl font-mono font-bold text-neutral-900 tracking-tight block">
          {kpi.value}
        </span>
        <span className="text-[10px] text-neutral-400 mt-1 block">{kpi.subtitle}</span>
      </div>
      <div className={cn(
        "flex items-center gap-1.5 text-[11px] font-bold bg-neutral-50 px-2 py-1 rounded-[2px]",
        kpi.trend === "up" ? "text-[#00956D]" : "text-red-500"
      )}>
        {kpi.trend === "up" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        <span className="font-mono">{kpi.change}</span>
      </div>
    </div>
    
    <div className="absolute bottom-0 left-0 right-0 h-12 w-full opacity-20 group-hover:opacity-30 transition-opacity overflow-hidden">
      <ResponsiveContainer width="100%" height={48} minWidth={0} minHeight={0}>
        <AreaChart data={kpi.sparkline.map((val: number, i: number) => ({ i, val }))} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={`grad-${kpi.label.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00775B" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#00775B" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="val" 
            stroke="#00775B" 
            strokeWidth={2} 
            fill={`url(#grad-${kpi.label.replace(/\s+/g, '-')})`} 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const ApplicationVolumePanel = ({ appData }: { appData: any }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const renderChart = (type: string, data: any[]) => {
    const commonProps = { data, margin: { top: 2, right: 2, left: 2, bottom: 0 } };
    
    // Calculate interval to ensure max 5 ticks
    const interval = data.length > 5 ? Math.ceil(data.length / 5) - 1 : 0;
    
    const xAxis = (
       <XAxis 
          dataKey="time" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 9, fill: '#9ca3af' }} 
          interval={interval}
          height={15}
       />
    );

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={96} minWidth={0} minHeight={0}>
            <LineChart {...commonProps}>
              {xAxis}
              <Tooltip 
                 cursor={{ stroke: '#00775B', strokeWidth: 1, strokeDasharray: '3 3' }}
                 contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '10px', padding: '4px 8px' }}
                 labelStyle={{ display: 'none' }}
                 itemStyle={{ color: '#00775B', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="value" stroke="#00775B" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={96} minWidth={0} minHeight={0}>
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00775B" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00775B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              {xAxis}
              <Tooltip 
                 cursor={{ stroke: '#00775B', strokeWidth: 1 }}
                 contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '10px', padding: '4px 8px' }}
                 labelStyle={{ display: 'none' }}
                 itemStyle={{ color: '#00775B', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="value" stroke="#00775B" fillOpacity={1} fill="url(#colorArea)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height={96} minWidth={0} minHeight={0}>
            <BarChart {...commonProps}>
              {xAxis}
              <Tooltip 
                 cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                 contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '10px', padding: '4px 8px' }}
                 labelStyle={{ display: 'none' }}
                 itemStyle={{ color: '#00775B', fontWeight: 'bold' }}
              />
              <Bar dataKey="value" fill="#00775B" radius={[2, 2, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-sm shadow-sm p-4 animate-in slide-in-from-bottom-2 duration-500 relative group/container">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
            <span className="w-1 h-3 bg-[#00775B] rounded-sm"></span>
            {appData.appName}
        </h3>
        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-neutral-500 hover:text-[#00775B]">
          View All
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      {/* 2x3 Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appData.graphs.map((graph: any, idx: number) => (
            <div key={idx} className="bg-neutral-50 rounded border border-neutral-100 p-3 hover:border-[#00775B]/30 transition-colors group overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-bold text-neutral-700">{graph.title}</span>
                    <span className={cn("text-[10px] font-mono font-bold px-1.5 py-0.5 rounded", graph.trend > 0 ? "text-[#00956D] bg-[#E5FFF9]" : "text-neutral-500 bg-neutral-200/50")}>
                        {graph.trend > 0 ? "+" : ""}{graph.trend}%
                    </span>
                </div>
                <div className="flex items-end justify-between mb-3">
                    <span className="text-2xl font-mono font-bold text-neutral-900 leading-none">
                       {typeof graph.total === 'number' ? graph.total.toLocaleString() : graph.total}
                    </span>
                    <span className="text-[9px] text-neutral-400 uppercase font-bold tracking-wide">Total Volume</span>
                </div>
                <div className="h-24 w-full overflow-hidden">
                    {renderChart(graph.type, graph.data)}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

const ManagerKPICard = ({ title, value, change, trend, subtext }: { title: string, value: string, change: string, trend: "up" | "down" | "neutral", subtext: string }) => (
  <div className="bg-white p-4 rounded-sm border border-neutral-200 shadow-sm hover:border-[#00775B]/30 transition-all group">
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 group-hover:text-[#00775B] transition-colors truncate">{title}</h3>
      <div className={cn(
        "flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-[2px]",
        trend === "up" ? "text-[#00956D] bg-[#E5FFF9]" : 
        trend === "down" ? "text-red-500 bg-red-50" : "text-neutral-500 bg-neutral-100"
      )}>
        {trend === "up" && <TrendingUp className="w-3 h-3" />}
        {trend === "down" && <TrendingDown className="w-3 h-3" />}
        {trend === "neutral" && <Activity className="w-3 h-3" />}
        <span>{change}</span>
      </div>
    </div>
    <div className="flex flex-col">
       <span className="text-2xl font-mono font-bold text-neutral-900 tracking-tight">{value}</span>
       <span className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
          {subtext.includes("vs.") ? (
             <>
                <span className={cn("w-1.5 h-1.5 rounded-full", trend === "up" ? "bg-[#00956D]" : "bg-red-500")} />
                {subtext}
             </>
          ) : subtext}
       </span>
    </div>
  </div>
);

// AI Strategic Insights Bar
const AIInsightBar = () => (
  <div className="bg-[#E5FFF9] border border-[#00775B]/20 rounded-sm p-4 flex items-start gap-3 shadow-sm">
    <div className="flex items-center justify-center w-8 h-8 rounded-sm bg-[#00775B] text-white shrink-0 mt-0.5">
      <Activity className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#00775B]">AI Strategic Insight</span>
        <span className="text-[9px] text-neutral-400 font-mono">Updated 2 min ago</span>
      </div>
      <p className="text-sm text-neutral-700 leading-relaxed">
        <span className="font-bold">Footfall is up 12% across North regional hubs</span>, but Turnover Rate has decreased by 2.1%. 
        Analysis suggests potential bottlenecks in Zone B (Food Court). 
        <span className="text-[#00775B] font-bold"> Recommend labor audit for Site B</span> and review of peak-hour staffing allocations.
      </p>
    </div>
  </div>
);

const ZoneROITable = () => {
   const data = [
      { zone: "Retail Zone A", dwell: "18m 20s", peak: "842", status: "Optimal", trend: [10, 12, 11, 13, 12, 14, 15] },
      { zone: "Lobby Entrance", dwell: "2m 15s", peak: "1,240", status: "Understaffed", trend: [20, 18, 22, 25, 28, 30, 35] },
      { zone: "Food Court", dwell: "24m 10s", peak: "2,100", status: "Overstaffed", trend: [45, 42, 40, 38, 35, 32, 30] },
      { zone: "Premium Lounge", dwell: "42m 30s", peak: "156", status: "Optimal", trend: [5, 6, 5, 8, 7, 9, 10] },
      { zone: "Checkout Line", dwell: "8m 45s", peak: "543", status: "Understaffed", trend: [15, 18, 20, 22, 25, 28, 32] },
      { zone: "North Gate", dwell: "1m 45s", peak: "1,890", status: "Understaffed", trend: [30, 35, 40, 45, 50, 55, 60] },
      { zone: "South Gate", dwell: "2m 10s", peak: "1,120", status: "Optimal", trend: [20, 22, 21, 23, 22, 24, 25] },
   ];
   const gridData = data.map((r, i) => ({ ...r, id: i }));
   type ZoneRow = typeof gridData[0];

   const columns: DataGridColumn<ZoneRow>[] = [
      {
         key: "zone",
         header: "Zone Name",
         width: "2fr",
         render: (row, h) => <MonoCell hovered={h} isPrimary>{row.zone}</MonoCell>,
      },
      {
         key: "dwell",
         header: "Avg Dwell",
         width: "80px",
         align: "right",
         render: (row, h) => <MonoCell hovered={h} color="#64748B">{row.dwell}</MonoCell>,
      },
      {
         key: "peak",
         header: "Peak Count",
         width: "80px",
         align: "right",
         render: (row, h) => <MonoCell hovered={h}>{row.peak}</MonoCell>,
      },
      {
         key: "status",
         header: "Staffing Status",
         width: "110px",
         align: "right",
         render: (row) => {
            const capsuleStatus = row.status === "Optimal" ? "stable" : row.status === "Understaffed" ? "critical" : "warning";
            return <StatusCapsule status={capsuleStatus} label={row.status} />;
         },
      },
      {
         key: "trend",
         header: "7-Day Trend",
         width: "90px",
         render: (row) => (
            <div className="h-6 w-20">
               <LineChart width={80} height={24} data={row.trend.map((v, idx) => ({ idx, v }))} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <Line type="monotone" dataKey="v" stroke="#00956D" strokeWidth={1.5} dot={false} isAnimationActive={false} />
               </LineChart>
            </div>
         ),
      },
      {
         key: "action",
         header: "Action",
         width: "110px",
         align: "center",
         render: () => (
            <Button variant="ghost" size="sm" className="h-6 w-full text-[10px] text-neutral-500 hover:text-[#00775B] hover:bg-[#E5FFF9] border border-transparent hover:border-[#00775B]/20 gap-1.5">
               <Bell className="w-3 h-3" /> Manage Alerts
            </Button>
         ),
      },
   ];

   return (
      <div className="rounded-sm border border-neutral-200 bg-white overflow-hidden shadow-sm h-full flex flex-col">
         <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200 flex justify-between items-center shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-2">
               <Map className="w-3.5 h-3.5 text-[#00775B]" />
               Zone Performance & Staffing
            </h3>
            <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-neutral-500 hover:text-neutral-900">
               <Filter className="w-3 h-3" /> Filter
            </Button>
         </div>
         <div className="overflow-auto min-h-0 flex-1">
            <DataGrid columns={columns} data={gridData} compact />
         </div>
      </div>
   );
};

// --- Main Page Component ---

export const VolumeAnalytics = ({ persona }: { persona: Persona }) => {
  const [showManagerMetrics, setShowManagerMetrics] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<{name: string, zone: string} | null>(null);
  const [showLiveSummary, setShowLiveSummary] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState<string[]>(
    APPLICATION_MONITORING_DATA.map(app => app.applicationId)
  );

  const toggleApplication = (appId: string) => {
    setSelectedApplications(prev => 
      prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const filteredApplications = APPLICATION_MONITORING_DATA.filter(app => 
    selectedApplications.includes(app.applicationId)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full min-w-0">
      <VideoOverlay 
        open={!!selectedCamera} 
        onOpenChange={(open) => !open && setSelectedCamera(null)}
        cameraName={selectedCamera?.name || ""}
        zone={selectedCamera?.zone || ""}
      />

      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
        <AnalyticsHeader title="Volume Analytics" icon={Activity} />
        
        {persona !== "monitoring" && (
           <div className="self-end md:self-auto">
             {/* Custom TimeRangeFilter for Manager/Director */}
             <div className="flex bg-neutral-100 p-0.5 rounded-[4px] border border-neutral-200">
                {(persona === "manager" ? ["1H", "1D", "1W", "1MO"] : ["1W", "1MO", "3MO", "YTD"]).map((range) => (
                  <button
                    key={range}
                    className={cn(
                      "px-3 py-1 text-[10px] font-bold rounded-[2px] transition-all",
                      (range === "1D" || range === "1MO")
                        ? "bg-white text-[#00775B] shadow-sm" 
                        : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50"
                    )}
                  >
                    {range}
                  </button>
                ))}
              </div>
           </div>
        )}
      </div>

      {/* --- Monitoring Staff View --- */}
      {persona === "monitoring" && (
        <div className="space-y-6">
           {/* 1. Status Ticker */}
           <div className="rounded-sm overflow-hidden shadow-sm border border-neutral-200">
              <StatusTicker />
           </div>

           {/* 2. Application Filter */}
           <div className="bg-white p-4 rounded-sm border border-neutral-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5" />
                  Application Filter
                </h3>
                <button 
                  onClick={() => setSelectedApplications(
                    selectedApplications.length === APPLICATION_MONITORING_DATA.length 
                      ? [] 
                      : APPLICATION_MONITORING_DATA.map(app => app.applicationId)
                  )}
                  className="text-[10px] font-bold text-[#00775B] hover:underline"
                >
                  {selectedApplications.length === APPLICATION_MONITORING_DATA.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {APPLICATION_MONITORING_DATA.map((app) => (
                  <button
                    key={app.applicationId}
                    onClick={() => toggleApplication(app.applicationId)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded border text-xs font-bold transition-all",
                      selectedApplications.includes(app.applicationId)
                        ? "bg-[#00775B] border-[#00775B] text-white shadow-sm"
                        : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                    )}
                  >
                    <span className="text-base">{app.icon}</span>
                    <span>{app.applicationName}</span>
                    <span className="text-[10px] opacity-70">({app.totalCameras})</span>
                    {app.activeAlerts > 0 && (
                      <span className={cn(
                        "ml-1 px-1.5 py-0.5 rounded-sm text-[9px] font-bold",
                        selectedApplications.includes(app.applicationId)
                          ? "bg-red-500 text-white"
                          : "bg-red-100 text-red-600"
                      )}>
                        {app.activeAlerts}
                      </span>
                    )}
                  </button>
                ))}
              </div>
           </div>

           {/* 2.5 Priority Metrics - High Priority Occupancy Cards */}
           <PriorityMetrics />

           {/* 3. Application Panels */}
           <div className="space-y-4">
              {filteredApplications.length === 0 ? (
                <div className="bg-neutral-50 border border-neutral-200 rounded-sm p-12 text-center">
                  <Filter className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500">No applications selected. Please select at least one application to view monitoring data.</p>
                </div>
              ) : (
                filteredApplications.map((panel) => (
                  <ApplicationMonitoringPanel key={panel.applicationId} panel={panel} />
                ))
              )}
           </div>
        </div>
      )}

      {/* --- Manager View --- */}
      {persona === "manager" && (
        <div className="space-y-6">
           {/* 1. Manager KPIs */}
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <ManagerKPICard title="Total Footfall" value="142,384" change="8%" trend="up" subtext="vs. Last Month" />
              <ManagerKPICard title="Turnover Rate" value="120/hr" change="5%" trend="up" subtext="Efficiency Score: 92/100" />
              <ManagerKPICard title="Peak Prediction" value="14:00" change="High" trend="down" subtext="Expected Peak (30d avg)" />
              <ManagerKPICard title="Avg Daily Count" value="4,250" change="2%" trend="neutral" subtext="vs. Last Week" />
           </div>

           {/* 2. Operational Planning (Staffing + Heatmap) */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Staffing Optimization */}
              <div className="bg-white p-6 rounded-md border border-neutral-200 shadow-sm lg:col-span-1">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#00775B]" />
                    Resource Sync (Traffic vs. Labor)
                  </h3>
                  <div className="flex flex-col items-end gap-1">
                     <div className="flex items-center gap-2 mb-1">
                        <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1 text-[#00775B] border-[#00775B]/20 hover:bg-[#E5FFF9]">
                           <Settings className="w-3 h-3" /> Export Schedule Suggestion
                        </Button>
                     </div>
                     <div className="flex items-center gap-4 text-[10px]">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-[1px] bg-[#00775B]"></span> Predicted Volume</span>
                        <span className="flex items-center gap-1"><span className="w-4 h-0.5 border-t-2 border-dashed border-[#64748B]"></span> Staffing Level</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-[1px] bg-amber-500"></span> Shortage Risk</span>
                     </div>
                  </div>
                </div>
                
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height={256} minWidth={0} minHeight={0}>
                    <ComposedChart data={VOLUME_STAFFING_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <XAxis dataKey="hour" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '10px' }}
                      />
                      
                      {/* Custom Bar with Cell for Alert Logic - Adjusted threshold multiplier to 50 for demo */}
                      <Bar dataKey="peakCount" radius={[4, 4, 0, 0]} barSize={32} isAnimationActive={false}>
                         {VOLUME_STAFFING_DATA.map((entry) => (
                            <Cell
                               key={`staffing-${entry.hour}`}
                               fill={entry.peakCount > (entry.staffingLevel * 50) ? "#F59E0B" : "#00775B"}
                            />
                         ))}
                      </Bar>
                      
                      {/* Staffing Line as Overlay */}
                      <Line 
                         type="step" 
                         dataKey="staffingLevel" 
                         stroke="#64748B" 
                         strokeWidth={2} 
                         strokeDasharray="5 5"
                         dot={false}
                         yAxisId={0} // Using same axis for visual proxy
                         isAnimationActive={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Hotspot Heatmap */}
              <div className="bg-white p-6 rounded-md border border-neutral-200 shadow-sm lg:col-span-1 flex flex-col">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
                       <Clock className="w-4 h-4 text-[#00775B]" />
                       Weekly Hotspot Heatmap
                    </h3>
                    <span className="text-[10px] text-neutral-400 font-mono">7 Days x 24 Hours</span>
                 </div>
                 <div className="flex-1 flex flex-col justify-center">
                    <HeatmapGrid />
                 </div>
                 <div className="flex items-center justify-end gap-2 mt-4">
                    <span className="text-[9px] text-neutral-400">Low Density</span>
                    <div className="flex gap-0.5">
                       <div className="w-3 h-3 bg-neutral-100 rounded-[1px]"></div>
                       <div className="w-3 h-3 bg-[#A7F3D0] rounded-[1px]"></div>
                       <div className="w-3 h-3 bg-[#34D399] rounded-[1px]"></div>
                       <div className="w-3 h-3 bg-[#00956D] rounded-[1px]"></div>
                       <div className="w-3 h-3 bg-[#00775B] rounded-[1px]"></div>
                    </div>
                    <span className="text-[9px] text-neutral-400">High Density</span>
                 </div>
              </div>
           </div>

           {/* 3. Zone Performance Table */}
           <div className="grid grid-cols-1 gap-6 h-[400px]">
              <ZoneROITable />
           </div>
           
           {/* 4. Staff-View Bridge (Footer) */}
           <div className="border-t border-neutral-200 pt-4 mt-8">
              <div className="group border border-neutral-200 rounded-sm bg-neutral-50 overflow-hidden">
                 <Button 
                   variant="ghost" 
                   className="w-full flex items-center justify-between text-neutral-600 hover:text-neutral-900 hover:bg-white p-4 h-auto"
                   onClick={() => setShowLiveSummary(!showLiveSummary)}
                 >
                    <div className="flex flex-col items-start gap-1">
                       <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-[#00775B]" />
                          Live Monitoring Feed
                       </span>
                       <span className="text-[10px] text-neutral-400 font-normal">
                          Quick audit of current signal status across top zones
                       </span>
                    </div>
                    {showLiveSummary ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                 </Button>
                 
                 {showLiveSummary && (
                    <div className="p-4 bg-white border-t border-neutral-200 animate-in slide-in-from-top-2 duration-300">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Showing a subset in 3 columns for quick audit */}
                          {VOLUME_SPARKLINES.slice(0, 9).map((zone, idx) => (
                             <div key={idx} className="bg-neutral-50 border border-neutral-100 p-2 rounded flex items-center justify-between">
                                <span className="text-[10px] font-bold text-neutral-600 uppercase">{zone.zone}</span>
                                <div className="flex items-center gap-2">
                                   <div className="h-6 w-16">
                                      <LineChart width={64} height={24} data={zone.data.map((v, i) => ({ i, v }))} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                                         <Line type="monotone" dataKey="v" stroke="#00775B" strokeWidth={1} dot={false} isAnimationActive={false} />
                                      </LineChart>
                                   </div>
                                   <span className="text-[10px] font-mono font-bold text-[#00775B]">{Math.round(zone.data[zone.data.length-1])}</span>
                                </div>
                             </div>
                          ))}
                       </div>
                       <div className="mt-3 text-center">
                          <Button variant="link" size="sm" className="text-[10px] text-[#00775B] h-auto p-0">
                             View Full Monitoring Dashboard <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* --- Director View --- */}
      {persona === "director" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
           {/* AI Strategic Insights Bar */}
           <AIInsightBar />
           
           {/* Strategic ROI Scorecards - The Boardroom View */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {DIRECTOR_KPIS.map((kpi, index) => (
                 <DirectorKPICard key={index} kpi={kpi} />
              ))}
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Y-o-Y Growth Comparison Chart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-md border border-neutral-200 shadow-sm flex flex-col h-[420px]">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
                       <TrendingUp className="w-4 h-4 text-[#00775B]" />
                       Year-over-Year Traffic Comparison
                    </h3>
                    <div className="flex items-center gap-4 text-[10px]">
                       <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-[1px] bg-[#00775B]"></span>
                          <span className="font-bold text-neutral-600">This Year</span>
                       </span>
                       <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-[1px] bg-[#E5FFF9] border border-[#00775B]/30"></span>
                          <span className="font-bold text-neutral-600">Last Year</span>
                       </span>
                    </div>
                 </div>
                 
                 <div className="flex-1 w-full" style={{ minHeight: 200 }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                       <AreaChart data={YOY_COMPARISON_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <defs>
                             <linearGradient id="colorThisYear" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00775B" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#00775B" stopOpacity={0}/>
                             </linearGradient>
                             <linearGradient id="colorLastYear" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#E5FFF9" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#E5FFF9" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                             contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '11px', padding: '8px' }}
                             formatter={(value: number) => [value.toLocaleString(), '']}
                             labelFormatter={(label) => `Month: ${label}`}
                          />
                          <Area 
                             type="monotone" 
                             dataKey="lastYear" 
                             stroke="#00775B" 
                             strokeWidth={2}
                             strokeDasharray="5 5"
                             fill="url(#colorLastYear)" 
                             name="Last Year"
                             isAnimationActive={false}
                          />
                          <Area 
                             type="monotone" 
                             dataKey="thisYear" 
                             stroke="#00775B" 
                             strokeWidth={3} 
                             fill="url(#colorThisYear)" 
                             name="This Year"
                             isAnimationActive={false}
                          />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>

                 <div className="mt-4 border-t border-neutral-100 pt-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <div className="text-left">
                          <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Avg Growth Rate</span>
                          <span className="text-lg font-mono font-bold text-[#00956D]">+16.8%</span>
                       </div>
                       <div className="h-8 w-[1px] bg-neutral-200"></div>
                       <div className="text-left">
                          <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Best Month</span>
                          <span className="text-lg font-mono font-bold text-neutral-900">Dec</span>
                       </div>
                    </div>
                    <Button 
                       variant="ghost" 
                       size="sm" 
                       onClick={() => setShowManagerMetrics(!showManagerMetrics)}
                       className="text-xs text-[#00775B] hover:bg-[#00775B]/5 gap-2"
                    >
                       {showManagerMetrics ? "Hide Operational Breakdown" : "View Operational Breakdown"}
                       <ChevronDown className={cn("w-3 h-3 transition-transform", showManagerMetrics && "rotate-180")} />
                    </Button>
                 </div>
                 
                 {/* Drill Down Content */}
                 {showManagerMetrics && (
                    <div className="mt-4 pt-4 border-t border-neutral-100 animate-in slide-in-from-top-2 fade-in space-y-4">
                       <div className="grid grid-cols-3 gap-4">
                          {VOLUME_SPARKLINES.slice(0, 3).map((s, i) => (
                             <div key={i} className="bg-neutral-50 p-2 rounded border border-neutral-100 overflow-hidden">
                                <span className="text-[9px] font-bold text-neutral-500 uppercase">{s.zone}</span>
                                <div className="h-8 w-full overflow-hidden">
                                   <ResponsiveContainer width="100%" height={32} minWidth={0} minHeight={0}>
                                      <LineChart data={s.data.map((v, idx) => ({ idx, v }))} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                                         <Line type="monotone" dataKey="v" stroke="#00775B" dot={false} strokeWidth={1} isAnimationActive={false} />
                                      </LineChart>
                                   </ResponsiveContainer>
                                </div>
                             </div>
                          ))}
                       </div>
                       <div>
                          <h4 className="text-[10px] font-bold text-neutral-500 uppercase mb-2">Weekly Pattern</h4>
                          <HeatmapGrid compact={true} />
                       </div>
                    </div>
                 )}
              </div>

              {/* Regional Performance Map */}
              <div className="lg:col-span-1 bg-[#021d18] p-6 rounded-md border border-[#00775B]/30 shadow-lg relative overflow-hidden flex flex-col">
                 {/* Architectural Grid Background Effect */}
                 <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0" style={{
                       backgroundImage: 'linear-gradient(rgba(0, 119, 91, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 119, 91, 0.3) 1px, transparent 1px)',
                       backgroundSize: '40px 40px'
                    }}></div>
                 </div>
                 
                 <div className="flex items-center justify-between mb-6 z-10">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                       <Map className="w-4 h-4 text-[#00956D]" />
                       Regional Performance
                    </h3>
                 </div>

                 {/* Abstract Map Visualization */}
                 <div className="flex-1 relative border border-white/5 rounded bg-white/5 p-4 flex items-center justify-center">
                    <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-no-repeat bg-center bg-contain opacity-10 grayscale invert" />
                    
                    {/* Map Bubbles with Glow */}
                    {REGIONAL_PERFORMANCE_DATA.map((region) => (
                       <div 
                          key={region.id}
                          className="absolute rounded-full bg-[#00775B]/60 border-2 border-[#00956D] hover:scale-110 transition-transform cursor-pointer flex items-center justify-center group"
                          style={{
                             width: region.size,
                             height: region.size,
                             top: `${50 - region.lat * 0.55}%`,
                             left: `${50 + region.lng * 0.27}%`,
                             boxShadow: '0 0 20px rgba(0, 119, 91, 0.4)'
                          }}
                       >
                          <div className="w-2 h-2 bg-white rounded-full shadow-md animate-pulse" />
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                             <span className="text-[11px] font-bold text-black block">{region.region}</span>
                             <span className="text-[10px] font-mono text-neutral-600">{region.visitors.toLocaleString()} visits</span>
                          </div>
                       </div>
                    ))}
                 </div>
                 
                 <div className="mt-4 z-10 flex flex-col gap-2 text-[10px] text-white/80 font-mono">
                    <div className="flex justify-between items-center">
                       <span>Global Coverage:</span>
                       <span className="font-bold text-[#00956D]">85%</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span>Active Regions:</span>
                       <span className="font-bold text-[#00956D]">4</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                       <span>Top Performer:</span>
                       <span className="font-bold text-white">APAC</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Strategic Overview Panels */}
           <div className="space-y-4 mt-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 pl-1 mb-2 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" />
                Strategic Overview
            </h3>
            
            {/* Grid layout with People Counting comparison in separate column */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main apps - 2 columns */}
              <div className="lg:col-span-2 space-y-4">
                {DIRECTOR_STRATEGIC_DATA && DIRECTOR_STRATEGIC_DATA.map((appData, idx) => (
                  <ApplicationVolumePanel key={idx} appData={appData} />
                ))}
              </div>
              
              {/* People Counting comparison - 1 column */}
              <div className="lg:col-span-1">
                <ApplicationVolumePanel appData={PEOPLE_COUNTING_COMPARISON_DATA} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
