import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Monitor, FolderOpen, Network, Cpu, HardDrive, Database,
  Video, Film, Key, UserPlus, Bell, HelpCircle,
  ChevronDown, Search, Columns3, ArrowUpDown, ChevronUp,
  Menu, X, Activity,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = 'cameras'
type CameraStatus = 'Online' | 'Offline' | 'Unknown'
type SortDir = 'asc' | 'desc' | null

interface Camera {
  id: number
  name: string
  status: CameraStatus
  protocolType: string
  feedPath: string
  aspectRatio: string
  dimensions: string
  streamingFps: number
  memoryUsage: string
}

// ─── Util ─────────────────────────────────────────────────────────────────────
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

// ─── Matrice Icon ─────────────────────────────────────────────────────────────
function MatriceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 113.7 109.945" fill="none" className={className}>
      <path d="M9.585 9.564H24.655V0H0v109.932h24.655v-9.565H9.585V9.564Z" fill="#00956D" />
      <path d="M113.7.087L113.426.025H89.046v9.552h15.069V100.38H89.046v9.564H113.7V.373V.075V.087Z" fill="#00956D" />
      <circle cx="21.775" cy="43.356" r="3.428" fill="#00956D" />
      <circle cx="45.109" cy="43.331" r="6.422" fill="#00956D" />
      <circle cx="56.788" cy="31.628" r="5" fill="#00956D" />
      <circle cx="68.429" cy="43.306" r="6.419" fill="#00956D" />
      <circle cx="80.233" cy="31.628" r="5" fill="#00956D" />
      <circle cx="68.417" cy="20.011" r="3.428" fill="#00956D" />
      <circle cx="45.084" cy="66.613" r="6.422" fill="#00956D" />
      <circle cx="56.751" cy="54.935" r="6.419" fill="#00956D" />
      <circle cx="80.233" cy="78.304" r="5" fill="#00956D" />
      <circle cx="45.109" cy="89.92" r="3.428" fill="#00956D" />
      <circle cx="68.554" cy="90.02" r="3.428" fill="#00956D" />
      <circle cx="91.912" cy="66.738" r="3.428" fill="#00956D" />
    </svg>
  )
}

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS: { id: string; label: string; icon: React.ElementType }[] = [
  { id: 'platforms',   label: 'Platforms',   icon: Monitor    },
  { id: 'projects',    label: 'Projects',    icon: FolderOpen },
  { id: 'networking',  label: 'Networking',  icon: Network    },
  { id: 'compute',     label: 'Compute',     icon: Cpu        },
  { id: 'storage',     label: 'Storage',     icon: HardDrive  },
  { id: 'database',    label: 'Database',    icon: Database   },
  { id: 'cameras',     label: 'Cameras',     icon: Video      },
  { id: 'recordings',  label: 'Recordings',  icon: Film       },
  { id: 'access-keys', label: 'Access Keys', icon: Key        },
  { id: 'my-invites',  label: 'My Invites',  icon: UserPlus   },
]

// ─── Mock camera data ─────────────────────────────────────────────────────────
const CAMERAS: Camera[] = [
  { id:1,  name:'Pedestrian Cam',  status:'Unknown', protocolType:'FILE', feedPath:'https://s3.us-west-2.amazonaws.com/prod.application/feeds/pedestrian.mp4',   aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:30, memoryUsage:'-' },
  { id:2,  name:'Fire',            status:'Unknown', protocolType:'FILE', feedPath:'https://s3.us-west-2.amazonaws.com/prod.application/feeds/fire_detect.mp4',   aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:30, memoryUsage:'-' },
  { id:3,  name:'Weapon',          status:'Unknown', protocolType:'FILE', feedPath:'https://s3.us-west-2.amazonaws.com/prod.application/feeds/weapon_cam.mp4',    aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:30, memoryUsage:'-' },
  { id:4,  name:'Fence Climbing',  status:'Unknown', protocolType:'FILE', feedPath:'https://s3.us-west-2.amazonaws.com/prod.application/feeds/fence_climb.mp4',   aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:30, memoryUsage:'-' },
  { id:5,  name:'m1',              status:'Online',  protocolType:'FILE', feedPath:'https://s3.us-west-2.amazonaws.com/prod.application/feeds/main_entry_1.mp4',  aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:30, memoryUsage:'-' },
  { id:6,  name:'m2',              status:'Online',  protocolType:'FILE', feedPath:'https://s3.us-west-2.amazonaws.com/prod.application/feeds/main_entry_2.mp4',  aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:30, memoryUsage:'-' },
  { id:7,  name:'Crowd Monitor',   status:'Online',  protocolType:'RTSP', feedPath:'rtsp://192.168.1.101:554/stream/crowd_main',                                  aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:25, memoryUsage:'312 MB' },
  { id:8,  name:'Parking Lot A',   status:'Offline', protocolType:'RTSP', feedPath:'rtsp://192.168.1.102:554/stream/parking_a',                                   aspectRatio:'4:3',  dimensions:'1280x960',  streamingFps:15, memoryUsage:'-' },
  { id:9,  name:'Loading Dock',    status:'Online',  protocolType:'RTSP', feedPath:'rtsp://192.168.1.103:554/stream/loading_dock',                                 aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:30, memoryUsage:'287 MB' },
  { id:10, name:'Server Room',     status:'Unknown', protocolType:'FILE', feedPath:'https://s3.us-west-2.amazonaws.com/prod.application/feeds/server_room.mp4',   aspectRatio:'16:9', dimensions:'1280x720',  streamingFps:30, memoryUsage:'-' },
  { id:11, name:'Lobby Cam',       status:'Online',  protocolType:'RTSP', feedPath:'rtsp://192.168.1.104:554/stream/lobby',                                       aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:30, memoryUsage:'256 MB' },
  { id:12, name:'Roof North',      status:'Online',  protocolType:'RTSP', feedPath:'rtsp://192.168.1.105:554/stream/roof_north',                                  aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:30, memoryUsage:'298 MB' },
  { id:13, name:'East Gate',       status:'Unknown', protocolType:'FILE', feedPath:'https://s3.us-west-2.amazonaws.com/prod.application/feeds/east_gate.mp4',    aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:30, memoryUsage:'-' },
  { id:14, name:'West Gate',       status:'Online',  protocolType:'RTSP', feedPath:'rtsp://192.168.1.106:554/stream/west_gate',                                   aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:30, memoryUsage:'301 MB' },
  { id:15, name:'Stairwell B2',    status:'Online',  protocolType:'RTSP', feedPath:'rtsp://192.168.1.107:554/stream/stairwell_b2',                                aspectRatio:'4:3',  dimensions:'1280x960',  streamingFps:15, memoryUsage:'195 MB' },
  { id:16, name:'Canteen',         status:'Online',  protocolType:'RTSP', feedPath:'rtsp://192.168.1.108:554/stream/canteen',                                     aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:25, memoryUsage:'278 MB' },
  { id:17, name:'Emergency Exit',  status:'Unknown', protocolType:'FILE', feedPath:'https://s3.us-west-2.amazonaws.com/prod.application/feeds/emergency_exit.mp4',aspectRatio:'16:9', dimensions:'1280x720',  streamingFps:30, memoryUsage:'-' },
  { id:18, name:'PTZ Main Plaza',  status:'Online',  protocolType:'RTSP', feedPath:'rtsp://192.168.1.109:554/stream/ptz_plaza',                                   aspectRatio:'16:9', dimensions:'3840x2160', streamingFps:30, memoryUsage:'446 MB' },
  { id:19, name:'Warehouse Left',  status:'Online',  protocolType:'RTSP', feedPath:'rtsp://192.168.1.110:554/stream/warehouse_l',                                 aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:30, memoryUsage:'312 MB' },
  { id:20, name:'Warehouse Right', status:'Online',  protocolType:'RTSP', feedPath:'rtsp://192.168.1.111:554/stream/warehouse_r',                                 aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:30, memoryUsage:'309 MB' },
  { id:21, name:'Reception Desk',  status:'Online',  protocolType:'RTSP', feedPath:'rtsp://192.168.1.112:554/stream/reception',                                   aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:30, memoryUsage:'264 MB' },
  { id:22, name:'Elevator Bank',   status:'Unknown', protocolType:'FILE', feedPath:'https://s3.us-west-2.amazonaws.com/prod.application/feeds/elevators.mp4',    aspectRatio:'4:3',  dimensions:'1280x960',  streamingFps:15, memoryUsage:'-' },
  { id:23, name:'South Entrance',  status:'Online',  protocolType:'RTSP', feedPath:'rtsp://192.168.1.113:554/stream/south_entrance',                              aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:30, memoryUsage:'288 MB' },
  { id:24, name:'Guard Post',      status:'Online',  protocolType:'RTSP', feedPath:'rtsp://192.168.1.114:554/stream/guard_post',                                  aspectRatio:'4:3',  dimensions:'1280x960',  streamingFps:15, memoryUsage:'192 MB' },
  { id:25, name:'Roof South',      status:'Online',  protocolType:'RTSP', feedPath:'rtsp://192.168.1.115:554/stream/roof_south',                                  aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:30, memoryUsage:'295 MB' },
  { id:26, name:'Lab Entry',       status:'Unknown', protocolType:'FILE', feedPath:'https://s3.us-west-2.amazonaws.com/prod.application/feeds/lab_entry.mp4',    aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:30, memoryUsage:'-' },
  { id:27, name:'Shipping Bay',    status:'Online',  protocolType:'RTSP', feedPath:'rtsp://192.168.1.116:554/stream/shipping_bay',                                aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:30, memoryUsage:'317 MB' },
  { id:28, name:'Control Room',    status:'Online',  protocolType:'RTSP', feedPath:'rtsp://192.168.1.117:554/stream/control_room',                                aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:30, memoryUsage:'334 MB' },
  { id:29, name:'Perimeter NW',    status:'Online',  protocolType:'RTSP', feedPath:'rtsp://192.168.1.118:554/stream/perimeter_nw',                                aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:30, memoryUsage:'291 MB' },
  { id:30, name:'Perimeter SE',    status:'Online',  protocolType:'RTSP', feedPath:'rtsp://192.168.1.119:554/stream/perimeter_se',                                aspectRatio:'16:9', dimensions:'1920x1080', streamingFps:30, memoryUsage:'297 MB' },
]

// ─── Usage Button ─────────────────────────────────────────────────────────────
// Shows CPU % + Memory consumption. forceOpen keeps the overlay always visible
// (used to demo the hovered state side-by-side with the inactive state).
function UsageButton({ forceOpen = false }: { forceOpen?: boolean }) {
  const [open, setOpen] = useState(forceOpen)
  const [hovered, setHovered] = useState(forceOpen)
  const ref = useRef<HTMLDivElement>(null)

  // Simulated live metrics that drift slightly each tick
  const [cpu, setCpu] = useState(23.4)
  const [memMb, setMemMb] = useState(446)
  const totalMemMb = 8192 // 8 GB

  useEffect(() => {
    if (forceOpen) return // keep frozen for the demo instance
    const id = setInterval(() => {
      setCpu(v => Math.min(95, Math.max(5, v + (Math.random() - 0.5) * 4)))
      setMemMb(v => Math.min(totalMemMb - 100, Math.max(200, v + (Math.random() - 0.5) * 20)))
    }, 1800)
    return () => clearInterval(id)
  }, [forceOpen])

  // Close on outside click (only for real interactive instance)
  useEffect(() => {
    if (forceOpen) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [forceOpen])

  const memGb   = (memMb / 1024).toFixed(1)
  const memPct  = (memMb / totalMemMb) * 100

  // Bar fill: #00775B (Matrice Teal) for normal; severity colours for warn/critical
  // Text values: lighter tones that clear 4.5:1 on #021D18 dark background
  const cpuBarColor  = cpu    > 75 ? '#E7000B' : cpu    > 50 ? '#E19A04' : '#00775B'
  const memBarColor  = memPct > 75 ? '#E7000B' : memPct > 50 ? '#E19A04' : '#00775B'
  const cpuTextColor = cpu    > 75 ? '#FF8B8F' : cpu    > 50 ? '#FFD47E' : '#00D4AA'
  const memTextColor = memPct > 75 ? '#FF8B8F' : memPct > 50 ? '#FFD47E' : '#00D4AA'

  const isOpen = forceOpen || open

  // ── Button visual state ──────────────────────────────────────────────────────
  const active = isOpen || hovered
  const btnStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex', alignItems: 'center', gap: 6,
    height: 32, padding: '0 12px',
    borderRadius: 4,
    border: active
      ? '1px solid rgba(0,119,91,0.4)'
      : '1px solid rgba(255,255,255,0.1)',
    background: active
      ? 'rgba(0,119,91,0.15)'
      : 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px) saturate(200%)',
    WebkitBackdropFilter: 'blur(20px) saturate(200%)',
    color: active ? '#00D4AA' : 'rgba(255,255,255,0.55)',
    fontSize: 12, fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
    transition: 'all 250ms ease-in-out',
    boxShadow: active
      ? '0 0 16px rgba(0,119,91,0.28), inset 0 0 8px rgba(0,119,91,0.06)'
      : 'none',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  }

  // ── Metric row inside overlay ────────────────────────────────────────────────
  // barColor  → progress fill (UI component, WCAG AA non-text 3:1 min)
  // textColor → numerical label (text, WCAG AA 4.5:1 min against #021D18)
  const MetricRow = ({
    icon: Icon, label, value, pct, barColor, textColor,
  }: { icon: React.ElementType; label: string; value: string; pct: number; barColor: string; textColor: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.45)', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {label}
          </span>
        </div>
        {/* Value text — must clear 4.5:1 on #021D18 */}
        <span style={{ fontSize: 12, fontWeight: 700, color: textColor, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.01em' }}>
          {value}
        </span>
      </div>
      {/* Progress track */}
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          borderRadius: 2,
          background: barColor,
          boxShadow: `0 0 8px ${barColor}99`,
          transition: 'width 250ms ease-in-out',
        }} />
      </div>
    </div>
  )

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        style={btnStyle}
        onMouseEnter={() => { setHovered(true); if (!forceOpen) setOpen(true) }}
        onMouseLeave={() => { setHovered(false) }}
        onClick={() => { if (!forceOpen) setOpen(v => !v) }}
      >
        {/* Subtle animated pulse dot — shows it's live */}
        <span style={{
          width: 5, height: 5, borderRadius: '50%',
          background: isOpen || hovered ? '#00D4AA' : 'rgba(255,255,255,0.3)',
          boxShadow: isOpen || hovered ? '0 0 6px #00D4AA' : 'none',
          flexShrink: 0,
          animation: 'vmsPulse 2s ease-in-out infinite',
        }} />
        <Activity style={{ width: 13, height: 13, flexShrink: 0 }} />
        Usage
      </button>

      {/* ── Overlay panel — Level 3 HUD ─────────────────────────────────────── */}
      {/* base: rgba(15,23,42,0.85) | blur(24px) | top-rim rgba(255,255,255,0.2) */}
      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 224, zIndex: 200,
          background: 'rgba(15,23,42,0.85)',
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderTop: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.50), 0 0 0 1px rgba(0,119,91,0.12)',
          padding: '8px',
          display: 'flex', flexDirection: 'column', gap: 8,
          animation: 'vmsDropIn 180ms cubic-bezier(0.22,1,0.36,1)',
          transition: 'all 250ms ease-in-out',
        }}>
          {/* Header row — 8px inner padding */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
              System Usage
            </span>
            {/* Live indicator */}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: '#00D4AA', fontFamily: 'Inter, sans-serif' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00D4AA', boxShadow: '0 0 5px #00D4AA', display: 'inline-block' }} />
              LIVE
            </span>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />

          {/* CPU */}
          <div style={{ padding: '0 4px' }}>
            <MetricRow
              icon={Cpu}
              label="CPU"
              value={`${cpu.toFixed(1)}%`}
              pct={cpu}
              barColor={cpuBarColor}
              textColor={cpuTextColor}
            />
          </div>

          {/* Memory */}
          <div style={{ padding: '0 4px' }}>
            <MetricRow
              icon={HardDrive}
              label="Memory"
              value={`${memMb} MB`}
              pct={memPct}
              barColor={memBarColor}
              textColor={memTextColor}
            />
          </div>

          {/* Sub-label: total */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 4px', marginTop: -4 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: "'JetBrains Mono', monospace" }}>
              {memGb} GB / 8.0 GB
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Status Capsule ───────────────────────────────────────────────────────────
function StatusCapsule({ status }: { status: CameraStatus }) {
  const cfg = {
    Online:  { dot: '#00A63E', color: '#475569', border: '#E2E8F0' },
    Offline: { dot: '#64748B', color: '#475569', border: '#E2E8F0' },
    Unknown: { dot: '#64748B', color: '#475569', border: '#E2E8F0' },
  }[status]

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 100,
      border: `1px solid ${cfg.border}`,
      fontSize: 12, fontWeight: 500, color: cfg.color,
      fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        backgroundColor: cfg.dot, flexShrink: 0,
      }} />
      {status}
    </span>
  )
}

// ─── Sort icon ────────────────────────────────────────────────────────────────
function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active || !dir) return <ArrowUpDown style={{ width: 12, height: 12, color: '#94A3B8', flexShrink: 0 }} />
  return dir === 'asc'
    ? <ChevronUp style={{ width: 12, height: 12, color: '#00775B', flexShrink: 0 }} />
    : <ChevronDown style={{ width: 12, height: 12, color: '#00775B', flexShrink: 0 }} />
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ value, label, subLabel, valueColor, onClick }: {
  value: number; label: string; subLabel: string; valueColor: string; onClick?: () => void
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 6, border: '1px solid #E2E8F0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1,
    }}>
      <span style={{ fontSize: 40, fontWeight: 700, lineHeight: 1, color: valueColor, fontFamily: 'Inter, sans-serif' }}>
        {value}
      </span>
      <span style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>
        {label}
      </span>
      <button onClick={onClick} style={{
        fontSize: 12, color: '#64748B', fontFamily: 'Inter, sans-serif',
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        textAlign: 'left', width: 'fit-content',
      }}
        onMouseEnter={e => (e.currentTarget.style.color = '#00775B')}
        onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}
      >
        {subLabel}
      </button>
    </div>
  )
}

// ─── Cameras Page ─────────────────────────────────────────────────────────────
function CamerasPage() {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<CameraStatus | null>(null)

  const onlineCount  = CAMERAS.filter(c => c.status === 'Online').length
  const offlineCount = CAMERAS.filter(c => c.status === 'Offline').length
  const unknownCount = CAMERAS.filter(c => c.status === 'Unknown').length

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc')
      else { setSortKey(null); setSortDir(null) }
    } else { setSortKey(key); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    let data = CAMERAS.filter(c => {
      if (statusFilter && c.status !== statusFilter) return false
      const q = search.toLowerCase()
      if (!q) return true
      return c.name.toLowerCase().includes(q) || c.status.toLowerCase().includes(q) ||
        c.protocolType.toLowerCase().includes(q) || c.feedPath.toLowerCase().includes(q)
    })
    if (sortKey && sortDir) {
      data = [...data].sort((a, b) => {
        let av: string | number = '', bv: string | number = ''
        if (sortKey === 'name')     { av = a.name;          bv = b.name }
        if (sortKey === 'status')   { av = a.status;        bv = b.status }
        if (sortKey === 'protocol') { av = a.protocolType;  bv = b.protocolType }
        if (sortKey === 'fps')      { av = a.streamingFps;  bv = b.streamingFps }
        if (sortKey === 'aspect')   { av = a.aspectRatio;   bv = b.aspectRatio }
        if (sortKey === 'dims')     { av = a.dimensions;    bv = b.dimensions }
        const cmp = typeof av === 'number' ? av - (bv as number) : String(av).localeCompare(String(bv))
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return data
  }, [search, sortKey, sortDir, statusFilter])

  const allSelected = selected.size === filtered.length && filtered.length > 0
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(filtered.map(c => c.id)))
  const toggleRow = (id: number) => {
    const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n)
  }

  const TH = ({ label, colKey, align = 'left' }: { label: string; colKey: string; align?: 'left' | 'center' | 'right' }) => {
    const isActive = sortKey === colKey
    return (
      <button
        onClick={() => handleSort(colKey)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 11, fontWeight: 700, fontFamily: 'Inter, sans-serif',
          letterSpacing: '0.05em', textTransform: 'uppercase',
          color: isActive ? '#00775B' : '#94A3B8',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
          width: '100%',
          transition: 'color 120ms ease',
        }}
        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#64748B' }}
        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#94A3B8' }}
      >
        {label}
        <SortIcon active={isActive} dir={isActive ? sortDir : null} />
      </button>
    )
  }

  const COLS = [
    { key: 'select',   w: '44px',   align: 'center' as const },
    { key: 'name',     w: '160px',  align: 'left'   as const },
    { key: 'status',   w: '120px',  align: 'left'   as const },
    { key: 'protocol', w: '128px',  align: 'left'   as const },
    { key: 'feedPath', w: '1fr',    align: 'left'   as const },
    { key: 'aspect',   w: '120px',  align: 'center' as const },
    { key: 'dims',     w: '120px',  align: 'center' as const },
    { key: 'fps',      w: '128px',  align: 'center' as const },
    { key: 'mem',      w: '128px',  align: 'center' as const },
  ]
  const colTemplate = COLS.map(c => c.w).join(' ')

  const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 16 }}>
        <StatCard value={onlineCount}  label="Cameras Online"       subLabel="Click to filter" valueColor="#00775B" onClick={() => setStatusFilter(v => v === 'Online'  ? null : 'Online')} />
        <StatCard value={offlineCount} label="Cameras Offline"      subLabel="Click to filter" valueColor="#E7000B" onClick={() => setStatusFilter(v => v === 'Offline' ? null : 'Offline')} />
        <StatCard value={unknownCount} label="No Recent Heartbeat"  subLabel="Status unknown"  valueColor="#1E293B" onClick={() => setStatusFilter(v => v === 'Unknown' ? null : 'Unknown')} />
      </div>

      {/* Table card */}
      <div style={{
        background: '#fff', borderRadius: 6, border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden',
      }}>

        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid #F1F5F9', gap: 10, flexWrap: 'wrap',
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
            All Cameras
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              height: 20, minWidth: 20, padding: '0 6px', borderRadius: 2,
              background: '#00775B', color: '#fff', fontSize: 10, fontWeight: 700,
            }}>{filtered.length}</span>
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Columns btn */}
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 32, padding: '0 12px', borderRadius: 4,
              border: '1px solid #E2E8F0', background: '#fff',
              fontSize: 12, fontWeight: 600, color: '#334155', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}>
              <Columns3 style={{ width: 14, height: 14, color: '#64748B' }} />
              Columns
            </button>

            {/* Search */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search style={{ position: 'absolute', left: 10, width: 14, height: 14, color: '#94A3B8', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search cameras"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  height: 32, paddingLeft: 32, paddingRight: 12,
                  borderRadius: 4, border: '1px solid #E2E8F0', background: '#fff',
                  fontSize: 12, color: '#0F172A', fontFamily: 'Inter, sans-serif',
                  outline: 'none', width: 180, boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
                onFocus={e => { e.target.style.borderColor = '#00775B'; e.target.style.boxShadow = '0 0 0 2px rgba(0,119,91,0.12)' }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)' }}
              />
            </div>

            {/* Cameras by File */}
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 32, padding: '0 14px', borderRadius: 4,
              background: '#00775B', border: 'none', color: '#fff',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', transition: 'background 200ms',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = '#004E3D')}
              onMouseLeave={e => (e.currentTarget.style.background = '#00775B')}
            >
              <Video style={{ width: 14, height: 14 }} />
              Cameras by File
            </button>

            {/* Add Camera(s) */}
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 32, padding: '0 14px', borderRadius: 4,
              background: '#00775B', border: 'none', color: '#fff',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', transition: 'background 200ms',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = '#004E3D')}
              onMouseLeave={e => (e.currentTarget.style.background = '#00775B')}
            >
              <Video style={{ width: 14, height: 14 }} />
              Add Camera(s)
            </button>
          </div>
        </div>

        {/* Status filter chip */}
        {statusFilter && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', background: '#E5FFF9', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: 12, color: '#475569' }}>Filtering by:</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 10px',
              borderRadius: 100, background: '#00775B', color: '#fff', fontSize: 11, fontWeight: 600,
            }}>
              {statusFilter}
              <button onClick={() => setStatusFilter(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
            </span>
          </div>
        )}

        {/* Scrollable table */}
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 900 }}>

            {/* Header row */}
            <div style={{
              display: 'grid', gridTemplateColumns: colTemplate,
              alignItems: 'center', height: 40,
              background: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
            }}>
              {/* Checkbox */}
              <div style={{ padding: '0 8px', display: 'flex', justifyContent: 'center' }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  style={{ width: 15, height: 15, accentColor: '#00775B', cursor: 'pointer' }} />
              </div>
              <div style={{ padding: '0 8px' }}><TH label="Camera Name" colKey="name" /></div>
              <div style={{ padding: '0 8px' }}><TH label="Status" colKey="status" /></div>
              <div style={{ padding: '0 8px' }}><TH label="Protocol Type" colKey="protocol" /></div>
              <div style={{ padding: '0 8px' }}><TH label="Feed Path" colKey="feedPath" /></div>
              <div style={{ padding: '0 8px' }}><TH label="Aspect Ratio" colKey="aspect" align="center" /></div>
              <div style={{ padding: '0 8px' }}><TH label="Dimensions" colKey="dims" align="center" /></div>
              <div style={{ padding: '0 8px' }}><TH label="Streaming FPS" colKey="fps" align="center" /></div>
              <div style={{ padding: '0 8px' }}><TH label="Memory Usage" colKey="mem" align="center" /></div>
            </div>

            {/* Data rows */}
            {filtered.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '48px 0', color: '#94A3B8' }}>
                <Video style={{ width: 32, height: 32, opacity: 0.4 }} />
                <span style={{ fontSize: 13 }}>No cameras match your search</span>
              </div>
            ) : filtered.map(cam => {
              const hov = hoveredId === cam.id
              return (
                <div
                  key={cam.id}
                  onMouseEnter={() => setHoveredId(cam.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    display: 'grid', gridTemplateColumns: colTemplate,
                    alignItems: 'center', minHeight: 48, position: 'relative',
                    background: hov ? 'rgba(0,119,91,0.03)' : '#fff',
                    borderBottom: '1px solid #F1F5F9',
                    transition: 'background 120ms ease', cursor: 'default',
                  }}
                >
                  {/* Left accent bar on hover */}
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                    background: '#00775B', opacity: hov ? 1 : 0,
                    borderRadius: '0 1px 1px 0', transition: 'opacity 120ms ease',
                  }} />

                  {/* Checkbox */}
                  <div style={{ padding: '0 8px', display: 'flex', justifyContent: 'center' }}>
                    <input type="checkbox" checked={selected.has(cam.id)} onChange={() => toggleRow(cam.id)}
                      style={{ width: 15, height: 15, accentColor: '#00775B', cursor: 'pointer' }} />
                  </div>

                  {/* Camera Name */}
                  <div style={{ padding: '0 8px' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: hov ? '#00775B' : '#1E293B', fontFamily: 'Inter, sans-serif', transition: 'color 120ms ease' }}>
                      {cam.name}
                    </span>
                  </div>

                  {/* Status */}
                  <div style={{ padding: '0 8px' }}>
                    <StatusCapsule status={cam.status} />
                  </div>

                  {/* Protocol */}
                  <div style={{ padding: '0 8px' }}>
                    <span style={{ ...mono, color: hov ? '#1E293B' : '#475569', transition: 'color 120ms ease' }}>
                      {cam.protocolType}
                    </span>
                  </div>

                  {/* Feed path */}
                  <div style={{ padding: '0 8px', overflow: 'hidden' }}>
                    <span title={cam.feedPath} style={{
                      ...mono, fontSize: 10, color: hov ? '#1E293B' : '#64748B',
                      display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      transition: 'color 120ms ease',
                    }}>
                      {cam.feedPath}
                    </span>
                  </div>

                  {/* Aspect */}
                  <div style={{ padding: '0 8px', textAlign: 'center' }}>
                    <span style={{ ...mono, color: hov ? '#1E293B' : '#475569', transition: 'color 120ms ease' }}>
                      {cam.aspectRatio}
                    </span>
                  </div>

                  {/* Dims */}
                  <div style={{ padding: '0 8px', textAlign: 'center' }}>
                    <span style={{ ...mono, color: hov ? '#1E293B' : '#475569', transition: 'color 120ms ease' }}>
                      {cam.dimensions}
                    </span>
                  </div>

                  {/* FPS */}
                  <div style={{ padding: '0 8px', textAlign: 'center' }}>
                    <span style={{ ...mono, color: hov ? '#1E293B' : '#475569', transition: 'color 120ms ease' }}>
                      {cam.streamingFps}
                    </span>
                  </div>

                  {/* Memory */}
                  <div style={{ padding: '0 8px', textAlign: 'center' }}>
                    <span style={{ ...mono, color: cam.memoryUsage === '-' ? '#CBD5E1' : hov ? '#1E293B' : '#475569', transition: 'color 120ms ease' }}>
                      {cam.memoryUsage}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 20px', borderTop: '1px solid #F1F5F9', background: '#FAFAFA',
        }}>
          <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
            {selected.size > 0 ? `${selected.size} of ${filtered.length} selected` : `${filtered.length} camera${filtered.length !== 1 ? 's' : ''}`}
          </span>
          <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: "'JetBrains Mono', monospace" }}>
            VMS · {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [activePage] = useState<Page>('cameras')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Live clock
  const [clock, setClock] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  )
  useEffect(() => {
    const id = setInterval(() =>
      setClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F1F5F9' }}>

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside style={{
        width: sidebarOpen ? 224 : 0,
        minWidth: sidebarOpen ? 224 : 0,
        background: '#021d18',
        display: 'flex', flexDirection: 'column',
        transition: 'width 250ms cubic-bezier(0.22,1,0.36,1), min-width 250ms cubic-bezier(0.22,1,0.36,1)',
        overflow: 'hidden', flexShrink: 0,
        borderRight: '1px solid rgba(0,119,91,0.15)',
      }}>
        {/* Logo */}
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(0,119,91,0.12)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: '#001410',
              border: '1px solid rgba(0,119,91,0.3)', padding: 6, flexShrink: 0,
            }}>
              <MatriceIcon className="w-full h-full" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, overflow: 'hidden' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', lineHeight: 1.2 }}>Matrice AI</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>VMS Platform</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(item => {
            const isActive = activePage === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: isActive ? '#00775B' : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  fontFamily: 'Inter, sans-serif', textAlign: 'left', width: '100%',
                  transition: 'background 150ms ease, color 150ms ease',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' } }}
              >
                <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Header */}
        <header style={{
          height: 48, flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '0 20px',
          background: '#021d18',
          borderBottom: '1px solid rgba(0,119,91,0.15)',
        }}>
          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer',
              color: 'rgba(255,255,255,0.6)', transition: 'color 150ms, background 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
          >
            {sidebarOpen ? <X style={{ width: 16, height: 16 }} /> : <Menu style={{ width: 16, height: 16 }} />}
          </button>

          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />

          {/* Account switcher */}
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#fff', fontSize: 13, fontWeight: 500, fontFamily: 'Inter, sans-serif',
            padding: '4px 8px', borderRadius: 6,
            transition: 'background 150ms',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Demo Setup Account
            <ChevronDown style={{ width: 14, height: 14, opacity: 0.6 }} />
          </button>

          <div style={{ flex: 1 }} />

          {/* Clock */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            height: 32, padding: '0 12px', borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(255,255,255,0.55)',
          }}>
            {clock}
          </div>

          {/* Usage buttons — inactive + hovered demo side by side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <UsageButton />
            <UsageButton forceOpen />
          </div>

          {/* Bell */}
          <button style={{
            position: 'relative', width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', cursor: 'pointer',
            color: 'rgba(255,255,255,0.55)', transition: 'color 150ms, background 150ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
          >
            <Bell style={{ width: 15, height: 15 }} />
            <span style={{
              position: 'absolute', top: 7, right: 7, width: 6, height: 6,
              background: '#E7000B', borderRadius: '50%', border: '1.5px solid #021d18',
            }} />
          </button>

          {/* Help */}
          <button style={{
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', cursor: 'pointer',
            color: 'rgba(255,255,255,0.55)', transition: 'color 150ms, background 150ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
          >
            <HelpCircle style={{ width: 15, height: 15 }} />
          </button>

          {/* Avatar */}
          <button style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#00775B', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'Inter, sans-serif',
            transition: 'background 150ms',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#004E3D')}
            onMouseLeave={e => (e.currentTarget.style.background = '#00775B')}
          >
            EA
          </button>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {activePage === 'cameras' && <CamerasPage />}
        </main>
      </div>
    </div>
  )
}
