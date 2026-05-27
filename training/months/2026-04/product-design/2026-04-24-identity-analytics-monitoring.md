# Product Design Handoff Report — Identity Analytics · Monitoring View

<!-- meta -->
| Version | Last Modified | Modified By | Maintained By |
|:-------:|:------------:|:-----------:|:-------------:|
| v1.0 | 2026-04-24 | Mohammed Usman | Mohammed Usman |

---

## Metadata

| Field | Value |
|-------|-------|
| **Designer** | Mohammed Usman |
| **Date** | 2026-04-24 |
| **Feature** | Identity Analytics — Monitoring Persona View |
| **Domain** | Inference / ML |
| **Type** | New Feature |
| **Figma Link** | — *(attach when available)* |
| **Target Apps** | Analytics3personas |
| **Frontend Engineer** | — |

---

## Design Summary

**What:** A real-time identity analytics dashboard for the Monitoring persona. The view surfaces live facial recognition and licence-plate-recognition (LPR) events across a facility, organized into a Priority Watchlist, Zone Status grid, and a scrollable Live Feed table. A slide-out panel provides granular zone-level detail including camera feeds and detected individuals.

**Why:** Security operators need to act on threats within seconds. The previous design required navigating multiple screens to correlate camera events, zone status, and individual identities. This single-screen layout puts critical signals — blacklist matches, unknown persons, zone anomalies — in direct view with one-click action paths.

**User Flow:**
1. Operator lands on the Monitoring view and immediately sees the top-row KPI strip (threat counts, compliance rate).
2. Priority Watchlist cards surface the highest-severity individuals; operator clicks **ACT** to open the entity detail modal and choose an action.
3. Zone Status grid shows facility health at a glance; clicking a zone card opens the Zone Detail Slider to review cameras and individual detections per zone.
4. Live Feed table streams all events in real time; operator can filter by severity and click any row to open the same entity detail modal.
5. Operator can add a person or plate to the watchlist via the **Add / Manage** modal accessible from the header.

---

## Screens & States

### Screen 1: Full Monitoring Layout (Default)

**Attached:** `screenshots/01-monitoring-default.png`

**What it shows:**
The complete monitoring view composed of four horizontal sections stacked vertically:
- **KPI Strip** — four stat tiles across the top
- **Row 1** — Priority Watchlist (≈70% width) + Zone Status (≈30% width)
- **Row 2** — Live Feed table (full width)

**States designed:**
- [x] Default (populated with live mock data)
- [x] Empty state — watchlist shows "No active threats / All clear" with a green CheckCircle icon
- [ ] Loading state — *(skeleton placeholder; deferred to v2)*
- [ ] Error state — *(API failure; deferred to v2)*
- [x] LPR mode — toggling the persona to LPR switches all person cards to plate cards, changes labels ("Plate", "BOLO"), and swaps the watchlist form to plate input
- [ ] Mobile / responsive — *(deferred; desktop-first)*

**Notes:**
The layout uses a fixed left sidebar (224 px) outside this view. The main content area is `bg-neutral-50`. The top KPI strip is `bg-white` with a bottom border, sticky at the top of the scrollable area.

---

### Screen 2: KPI Summary Strip

**Attached:** `screenshots/02-kpi-strip.png`

**What it shows:**
Four metric tiles in a horizontal row:

| Tile | Metric | Severity driver |
|------|--------|-----------------|
| Total Identifications | Count of all recognition events in the selected time window | Neutral (always shown in brand green) |
| Active Threats | Count of BLACKLIST + BOLO + UNKNOWN persons currently tracked | Red if > 0, amber if only unknowns |
| Compliance Rate | % of recognized individuals who are registered/authorized | Red < 80 %, amber 80–90 %, green ≥ 90 % |
| High-Risk Zones | Count of zones at CRITICAL or WATCH status | Red if ≥ 1 |

**States designed:**
- [x] Default
- [x] All-clear (0 threats, compliance 100 %, 0 risk zones) — all tiles show green accent
- [x] Critical state — threat tile pulses red

**Notes:**
Each tile has a left accent border (3 px) in the severity color. The big number uses `text-2xl font-black`. A small subtitle line beneath gives context (e.g., "2 blacklist · 1 unknown").

---

### Screen 3: Priority Watchlist Panel

**Attached:** `screenshots/03-priority-watchlist.png`

**What it shows:**
A card grid (1 row × 3 columns per page) of the highest-priority individuals currently detected. Paginated; each page shows 3 cards. Cards are sorted BLACKLIST → BOLO → UNKNOWN → UNREGISTERED.

#### Card anatomy

```
┌──────────────────────────────────────────────┐
│  [STATUS BADGE]  ● SEVERITY     14:31        │  ← Dark tactical header (#0c0f0d)
├──────────────────────────────────────────────┤
│  [PHOTO]   Display Name                      │
│            📍 Zone / Camera                  │
│            Status description                │
├──────────────────────────────────────────────┤
│  CAM-LB-01                     [ACT >]       │  ← Footer
└──────────────────────────────────────────────┘
```

| Element | Design spec |
|---------|-------------|
| Card border | 1 px, severity color at 30 % opacity |
| Card shadow | `0 0 0 1px rgba(severity, 0.08), 0 2px 8px rgba(severity, 0.12)` |
| Dark header bg | `#0c0f0d` |
| Status badge | 8 px font-black uppercase, `bg-red-600` (BLACKLIST/BOLO) or `bg-amber-500` (UNKNOWN) |
| Severity dot | 5 px circle, pulses red for CRITICAL |
| Time | 8 px mono, white/70 |
| Photo | 68 × 52 px (face) or 68 × 86 px (plate), `rounded-[2px]` |
| LIVE badge | Overlaid on photo when person is actively tracked |
| ACT button | `h-5`, `rounded-[2px]`, `bg-red-600` or `bg-amber-500`, font-black, "Act ›" |

**Status labels & colors:**

| Status | Badge color | Description text |
|--------|-------------|-----------------|
| BLACKLIST | `bg-red-600` | "Confirmed Blacklist" |
| BOLO | `bg-red-600` | "BOLO Match" |
| UNKNOWN | `bg-amber-500` | "Unknown Individual" |
| UNREGISTERED | `bg-amber-500` | "Unregistered Plate" *(LPR mode)* |

**Pagination:**
Bottom bar with PREV button (outlined) · numbered page dots · NEXT button (green `#00775B`). Shows "Showing 1–3 of N alerts". Only appears when > 3 threats exist.

**Header badge:**
- `● N CRITICAL` — pulsing `bg-red-600` pill when any BLACKLIST/BOLO present
- `N ALERTS` — `bg-amber-100 text-amber-700` when only lower-severity threats

**States designed:**
- [x] Default (populated)
- [x] Empty ("No active threats / All clear" — green CheckCircle2 icon)
- [x] Paginated (> 3 cards)
- [x] LPR mode (plate image, "Unregistered Plate" label)

---

### Screen 4: Zone Status Panel

**Attached:** `screenshots/04-zone-status.png`

**What it shows:**
A 2-column grid of clickable zone cards (8 per page). Zones are sorted CRITICAL → WATCH → ELEVATED → CLEAR.

#### Zone card anatomy

```
● Zone Name          ← 9 px bold, status-colored dot
840 IDs  🚨 1  28 unk  ← 8 px mono: id count, blacklist hits (red), unknowns
```

**Status → color mapping:**

| Status | Card bg | Border | Dot |
|--------|---------|--------|-----|
| CRITICAL | `bg-red-50` | `border-red-300` | `bg-red-600` + `animate-pulse` |
| WATCH | `bg-amber-50` | `border-amber-300` | `bg-amber-500` |
| ELEVATED | `bg-orange-50` | `border-orange-200` | `bg-orange-500` |
| CLEAR | `bg-emerald-50` | `border-emerald-200` | `bg-emerald-600` |

**Header:**
- MapPin icon + "ZONE STATUS" label (11 px bold uppercase, tracking-widest)
- Right-aligned "N zones" count in 9 px mono

**Pagination (dot + chevron style):**
Bottom strip: `‹` chevron · dots (active = wide pill `w-4 h-[6px] bg-[#00775B]`, inactive = small circle `w-[6px] h-[6px] bg-neutral-200`) · `›` chevron. Only shown when > 8 zones.

**States designed:**
- [x] Default (≤ 8 zones, no pagination)
- [x] Paginated (> 8 zones — 12 zones in current mock)
- [x] CRITICAL zone (pulsing red dot, red card)
- [x] All-clear (all zones CLEAR, all cards emerald)

---

### Screen 5: Zone Detail Slider

**Attached:** `screenshots/05-zone-detail-slider.png`

**What it shows:**
A 480 px slide-in panel from the right, opening when a zone card is clicked. Contains:

#### 5a — Hero Stats

Three stat tiles in a 3-column grid:

| Stat | What it measures |
|------|-----------------|
| **Identifications** | Total persons/plates recognized in this zone |
| **Unknowns** | Persons detected but not in any database |
| **Avg Dwell** | Average time a person spends in the zone |

Each tile: value in `text-2xl font-black`, label in `9 px uppercase tracking-widest`.

#### 5b — Camera List

Lists every camera assigned to this zone (derived from `CAMERA_NODES` data filtered by `zone_name`). Rows:
- "All Cameras" — resets filter to show all persons
- Individual camera rows: status dot (online/degraded/offline) + camera ID + name + fps badge + event count

Clicking a camera row filters the Detections section to only events from that camera. The active camera name appears in the detections section header.

**Camera status → color:**

| Status | Dot color | fps badge |
|--------|-----------|-----------|
| online | `bg-emerald-500` | `bg-neutral-100 text-neutral-600` |
| degraded | `bg-amber-500` | `bg-amber-100 text-amber-700` |
| offline | `bg-red-500` | `bg-red-100 text-red-700` |

#### 5c — Detections (Recent Events)

Scrollable list of the most recent person/plate events in the zone (filtered by selected camera if applicable). Each row:
- Severity color-coded left border
- Person display name + status badge + timestamp
- Zone + camera info

#### 5d — Sticky Footer (Notify)

Shown for any zone not at CLEAR status. "Notify Team" button opens a group selector (configured via Settings). Only shown when actionable.

**States designed:**
- [x] Default (zone with mixed camera statuses)
- [x] Camera selected (filter applied, header updates)
- [x] All cameras selected (no filter)
- [x] No events in zone ("No detections in this zone")
- [x] CLEAR zone (notify footer hidden)
- [x] Panel closed (slide-out to right)

**Notes:**
Panel uses `createPortal` to render above all other content. Escape key or backdrop click closes it. Body scroll is locked while open.

---

### Screen 6: Entity Detail Modal

**Attached:** `screenshots/06-entity-modal.png`

**What it shows:**
A centered modal (not a slide panel) that opens when clicking a watchlist card (ACT button) or a Live Feed row. Shows full identity detail and available actions.

#### Modal anatomy

**Header:**
- Display name (person) or plate number (LPR)
- Status badge (BLACKLIST / BOLO / UNKNOWN / REGISTERED / UNREGISTERED)
- Severity chip (CRITICAL / HIGH / MEDIUM)
- Close button

**Evidence media:**
- Face photo (person mode): `rounded-[2px]` with LIVE overlay if active
- Plate image (LPR mode): wide plate crop with plate text overlaid

**Identity fields:**
| Field | Description |
|-------|-------------|
| Zone | Current zone name |
| Camera | Camera ID where detected |
| Time | Timestamp of last event |
| Dwell | Time in zone |
| Confidence | AI recognition confidence % |
| Appearances | Count of sightings in window |

**Action buttons (non-watchlist persons):**

| Action | Confirm message | Icon |
|--------|----------------|------|
| Acknowledge | Mark event as reviewed | CheckCircle |
| Alert Security | Dispatch alert to security team | Bell |
| Add to Watchlist | Add to FR watchlist for future alerting | BookmarkPlus |
| Lock Down Zone | Initiate zone lockdown protocol | Lock |
| Escalate to BOLO *(LPR)* | Add plate to BOLO list | AlertTriangle |
| Block Entry *(LPR)* | Prevent vehicle entry | ShieldX |

Each action requires a confirmation step ("Are you sure?") before executing, then shows a success message and auto-closes.

**Watchlist mode:**
If opened via "Add to Watchlist" from the drawer, the modal body is replaced with the `WatchlistForm` inline.

**States designed:**
- [x] Person mode (face photo, person-specific actions)
- [x] LPR mode (plate image, vehicle-specific actions)
- [x] Confirmation state (action selected, confirm/cancel buttons)
- [x] Success state (action completed, auto-dismiss message)
- [x] Watchlist form state (inline form, name/reason/emails)

---

### Screen 7: Live Feed Table

**Attached:** `screenshots/07-live-feed.png`

**What it shows:**
A full-width scrollable event log showing every identity recognition event in the selected time window, newest first.

#### Table columns

| Column | Content |
|--------|---------|
| **ID** | Auto-incrementing event ID (`EVT-001` format) |
| **Severity** | Color-coded chip: CRITICAL / HIGH / MEDIUM / INFO |
| **Event** | Event name (e.g., "Blacklist Match — Marcus Webb") |
| **Type** | Identity type label (e.g., "Facial Recognition") |
| **Camera** | Camera ID where event occurred |
| **Zone** | Zone name |
| **Time** | HH:MM:SS timestamp |
| **Confidence** | AI confidence % (`--` if not available) |

**Severity → row styling:**

| Severity | Chip style | Row bg |
|----------|-----------|--------|
| CRITICAL | `bg-red-600 text-white` | `bg-red-50/40` (first critical only) |
| HIGH | `bg-amber-500 text-black` | none |
| MEDIUM | `bg-blue-500 text-white` | none |
| INFO | `bg-neutral-400 text-white` | none |

All rows: `hover:bg-[#E5FFF9]` (brand green tint).

**Filter bar:**
Pill buttons for All / Critical / High / Medium / Info. Active filter: `bg-[#00775B] text-white`. Inactive: `bg-neutral-100 text-neutral-500`.

**Pagination (table):**
PREV · numbered pages · NEXT (same pattern as Priority Watchlist). Shows "Showing X–Y of Z events". Page size: 10 rows.

**Row click:** Opens Entity Detail Modal for the relevant person/plate.

**States designed:**
- [x] Default (populated, paginated)
- [x] Filtered by severity (one filter active)
- [x] Empty (no events match current filter) — "No events" placeholder row
- [x] LPR mode (event names and types reflect plate events)

---

### Screen 8: Add / Manage Watchlist Modal

**Attached:** `screenshots/08-watchlist-manage.png`

**What it shows:**
A wide modal for adding persons (FR mode) or licence plates (LPR mode) to the monitoring watchlist.

**FR mode fields:**
- Name / identifier
- Watchlist reason (dropdown: Blacklist / BOLO / Person of Interest / Custom)
- Custom reason text (shown when "Custom" selected)
- Notification emails (repeatable email inputs with add/remove)
- Notes (optional textarea)

**LPR mode fields:**
- Bulk plate entry (one plate per line or comma-separated)
- Reason (dropdown)
- Notification emails
- Notes

**States designed:**
- [x] FR mode (default)
- [x] LPR mode
- [x] Submitting (button disabled, processing state)
- [x] Success ("Person added — alerts active" / "Plates processed — watchlist updated")
- [x] Validation error (empty required fields highlighted)

---

## Design System Compliance

### Colors

| Check | Status | Notes |
|-------|--------|-------|
| Primary brand color `#00775B` used correctly | ✅ Pass | Used for NEXT button, active filter pills, active page dot, zone card hover ring, section icons |
| Semantic colors match tokens | ✅ Pass | CRITICAL=red-600, HIGH=amber-500, MEDIUM=blue-500, INFO=neutral-400 |
| Dark mode version | N/A | Desktop monitoring — no dark mode requirement for this view |
| Light mode version | ✅ Pass | All panels use white / neutral-50 backgrounds |
| No custom colors outside palette | ⚠️ Partial | `#0c0f0d` (tactical card header) is a custom near-black; justified for tactical/security aesthetic |
| WCAG AA contrast | ✅ Pass | All text pairs verified (white on red-600, black on amber-500, neutral-900 on white) |

### Typography

| Check | Status | Notes |
|-------|--------|-------|
| Font: Inter (UI) | ✅ Pass | All UI text uses Inter via Tailwind default |
| Font: JetBrains Mono (code/data) | ✅ Pass | Camera IDs, timestamps, confidence values, event IDs use `font-mono` |
| Heading hierarchy | ✅ Pass | Section labels 11 px, card titles 12–13 px, stat numbers 24–30 px |
| Body text 14–16 px | ⚠️ Partial | Monitoring uses compact 9–12 px for data density; justified by dashboard context |
| Letter spacing | ✅ Pass | Section labels use `tracking-widest`; headings use default |

### Spacing & Layout

| Check | Status | Notes |
|-------|--------|-------|
| 8px grid base | ✅ Pass | All spacing values are multiples of 4 px or 8 px |
| Sidebar width 240 px | ✅ Pass | Sidebar is 224 px (14rem) — slight deviation, consistent across all views |
| Consistent padding/margins | ✅ Pass | Cards use `px-3 py-2.5`, panels use `px-4 py-3` throughout |

### Components

| Check | Status | Notes |
|-------|--------|-------|
| Border radius 4 px (small) | ✅ Pass | `rounded-[4px]` used on all cards, badges, action buttons |
| Border radius 4–8 px (medium/large) | ✅ Pass | Modal uses `rounded-xl`; slide panel is square-edged (intentional — feels like a system pane) |
| Status chips correct semantic colors | ✅ Pass | See severity table above |
| Tables follow header/row/hover styling | ✅ Pass | `border-b border-neutral-100`, `hover:bg-[#E5FFF9]` |
| Hover states defined | ✅ Pass | All buttons, cards, table rows, zone cards, camera rows have hover styles |
| Focus states | ⚠️ Partial | Keyboard focus rings not explicitly styled; uses browser default — needs explicit focus-visible ring in v2 |
| Transitions 200 ms snappy | ✅ Pass | All transitions use `transition-colors` / `transition-all` (Tailwind default 150–200 ms) |
| No animations > 400 ms | ✅ Pass | Slide panel uses 300 ms ease-out; all others ≤ 200 ms |

---

## Accessibility Checklist

| Check | Status | Notes |
|-------|--------|-------|
| Color contrast WCAG AA | ✅ Pass | Verified all primary text/bg pairs |
| No info conveyed by color alone | ⚠️ Partial | Zone status relies on color + dot; status label text is present on cards so icon+text pairs exist |
| Touch targets 44 × 44 px (mobile) | N/A | Desktop-only view |
| Focus order follows reading order | ✅ Pass | DOM order matches visual layout (left→right, top→bottom) |
| Alt text / labels for icons | ⚠️ Partial | Lucide icons are `aria-hidden` by default; interactive icon-only buttons need `aria-label` in v2 |
| Escape closes modals/panels | ✅ Pass | Both slide panel and modal handle `keydown.Escape` |
| Body scroll locked when panel/modal open | ✅ Pass | `document.body.style.overflow = "hidden"` applied |

---

## Handoff Specifications

### Spacing Redlines

| Element | Property | Value |
|---------|----------|-------|
| Main content area padding | padding | `px-6 py-4` (24 px / 16 px) |
| KPI strip tile gap | gap | `gap-3` (12 px) |
| Row 1 (watchlist + zone) gap | gap | `gap-3` (12 px) |
| Row 2 (feed) margin-top | margin-top | `gap-3` from Row 1 (12 px) |
| Watchlist card inner padding | padding | `px-2.5 pt-2.5 pb-2` |
| Watchlist card header padding | padding | `px-2.5 py-[7px]` |
| Zone card padding | padding | `px-2 py-1.5` |
| Zone grid padding | padding | `p-2` with `gap-1.5` |
| Slide panel width | width | `480 px` (`w-[480px]`) |
| Slide panel header padding | padding | `px-6 py-4` |
| Slide panel section padding | padding | `px-6 py-4` |
| Feed table header padding | padding | `px-4 py-2.5` |
| Feed table row padding | padding | `px-3 py-2` |

### Grid Layout

| Region | Columns | Notes |
|--------|---------|-------|
| Row 1 | `70% / 1fr` | Priority Watchlist takes 70%, Zone Status takes remainder |
| Watchlist cards | `grid-cols-3` | 3 per row, 1 row per page |
| Zone cards | `grid-cols-2` | 2 per row, 4 rows per page (8 total) |
| KPI strip | `grid-cols-4` | Equal widths |
| Feed table | Full width | — |

### Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|---------------|
| Desktop | ≥ 1200 px | Full layout as designed |
| Tablet | 768–1199 px | *(not designed — deferred to v2)* |
| Mobile | < 768 px | *(not designed — deferred to v2)* |

### Interaction Notes

| Interaction | Behavior | Duration | Easing |
|-------------|----------|----------|--------|
| Zone card click | Opens Zone Detail Slider from right | 300 ms | `ease-out` |
| Watchlist card / Feed row click | Opens Entity Detail Modal (fade + scale) | 200 ms | default |
| Slide panel close (Escape / backdrop) | Slides out to right | 300 ms | `ease-out` |
| Page navigation (watchlist/feed) | Instant re-render, no animation | — | — |
| Zone dot animation (CRITICAL) | `animate-pulse` on status dot | 2 s | CSS pulse |
| Camera row hover | `bg-[#E5FFF9]` tint | 150 ms | `ease` |
| Action button hover | Color shift (darkens) | 150 ms | `ease` |
| Feed row hover | `bg-[#E5FFF9]` tint | 150 ms | `ease` |
| Backdrop (modal/panel) | `bg-black/40 backdrop-blur-[2px]` | 300 ms | `ease` |

### z-Index Stack

| Layer | z-index | Element |
|-------|---------|---------|
| Base content | 0 | Main grid, panels |
| Sticky header | 10 | KPI strip |
| Zone slide panel backdrop | 998 | Dark overlay |
| Zone slide panel | 999 | Slide-in pane |
| Entity modal | 9999 | Centered modal |

---

## Component Data Contracts

### FeedPerson (identity event object)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique event ID |
| `displayName` | string | Person name or plate number |
| `status` | `"BLACKLIST" \| "BOLO" \| "UNKNOWN" \| "REGISTERED" \| "UNREGISTERED"` | Recognition status |
| `severity` | `"CRITICAL" \| "HIGH" \| "MEDIUM" \| "INFO"` | Alert severity |
| `zone` | string | Zone name where detected |
| `camera` | string | Camera ID (e.g., `CAM-LB-01`) |
| `time` | string | `HH:MM:SS` timestamp |
| `confidence` | number \| undefined | AI confidence 0–100 |
| `imageSrc` | string \| undefined | Photo URL or data URI |
| `plateText` | string \| undefined | Plate number (LPR mode) |
| `identType` | `"FACE" \| "PLATE"` | Recognition type |
| `dwellSec` | number | Seconds in zone |

### ZoneMetric (zone status object)

| Field | Type | Description |
|-------|------|-------------|
| `zone_id` | string | Unique zone identifier |
| `zone_name` | string | Display name (e.g., "Main Lobby") |
| `status` | `"CRITICAL" \| "WATCH" \| "ELEVATED" \| "CLEAR"` | Zone risk level |
| `identifications` | number | Total ID events in zone |
| `blacklist_hits` | number | Count of blacklist matches |
| `unknown` | number | Count of unknown individuals |

### CameraNode (camera hardware object)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Camera ID (e.g., `CAM-LB-01`) |
| `zone` | string | Zone name this camera covers |
| `status` | `"online" \| "degraded" \| "offline"` | Hardware status |
| `fps` | number | Current frames per second |
| `detections` | number | Events logged by this camera |

---

## Edge Cases & Known Limitations

| Case | How It's Handled |
|------|-----------------|
| Zero threats in watchlist | Empty state: CheckCircle2 icon + "No active threats / All clear" |
| Zone with no cameras assigned | Camera section omitted from zone slider |
| Zone with no events | "No detections in this zone" placeholder text |
| Camera at OFFLINE status | Red dot, `fps` shown as 0, badge `bg-red-100 text-red-700` |
| Very long zone name | `truncate` class on zone card name, full name visible in slider header |
| Very long person name | `truncate` on watchlist card display name |
| High event volume (> 100 rows) | Feed is paginated at 10 rows/page with numbered pagination |
| LPR mode toggle | All person-specific labels, images, actions swap to plate equivalents without page reload |
| Blacklist hit count > 9 | `🚨 N` badge still renders inline; no overflow |
| Unknown count = 0 | Unknown count span is conditionally hidden (`{zone.unknown > 0 && ...}`) |
| Panel open on narrow viewport | `max-w-[95vw]` cap prevents panel from overflowing screen |
| Escape key while modal open | Modal closes; underlying panel (if open) stays open |

---

## Screenshots

> Screenshots should be captured from the browser at 1440 × 900 viewport (desktop default).
> Export as PNG at 2× resolution and place in the `screenshots/` folder alongside this document.
> Use this markdown syntax to embed them:

```md
![Screen name](screenshots/01-monitoring-default.png)
```

**Yes — screenshots can be embedded directly in this Markdown file** using standard `![alt](path)` syntax. Relative paths work when the file is viewed in any Markdown renderer (VS Code, GitHub, Notion import, etc.). Place all PNGs in `months/2026-04/product-design/screenshots/` and reference them with relative paths as shown above.

**Required screenshots checklist:**
- [ ] `screenshots/01-monitoring-default.png` — Full view, populated state
- [ ] `screenshots/02-kpi-strip.png` — KPI strip close-up, critical state
- [ ] `screenshots/03-priority-watchlist.png` — Watchlist with 2 BLACKLIST + 1 UNKNOWN cards
- [ ] `screenshots/03b-watchlist-empty.png` — Empty watchlist state
- [ ] `screenshots/03c-watchlist-lpr.png` — LPR mode watchlist (plate cards)
- [ ] `screenshots/04-zone-status.png` — Zone grid page 1 (8 cards, mixed severity)
- [ ] `screenshots/04b-zone-status-page2.png` — Zone grid page 2 (4 remaining cards)
- [ ] `screenshots/05-zone-slider.png` — Zone detail slider open (with camera list + events)
- [ ] `screenshots/05b-zone-slider-camera-filter.png` — Camera selected, events filtered
- [ ] `screenshots/06-entity-modal.png` — Entity modal, person mode, default state
- [ ] `screenshots/06b-entity-modal-confirm.png` — Action selected, confirm step visible
- [ ] `screenshots/06c-entity-modal-lpr.png` — LPR mode modal (plate image + vehicle actions)
- [ ] `screenshots/07-live-feed.png` — Live feed table, all events, page 1
- [ ] `screenshots/07b-live-feed-filtered.png` — Feed filtered to CRITICAL only
- [ ] `screenshots/08-watchlist-modal.png` — Add/manage watchlist modal, FR mode

---

## Reviewer Feedback

| Criteria | Rating (1–5) | Feedback |
|----------|-------------|----------|
| Visual quality | | |
| UX clarity | | |
| Design system adherence | | |
| State coverage | | |
| Handoff completeness | | |

**Approved for handoff:** [ ] Yes / [ ] No — needs revision

**Revision notes:** —

---

## Claude Code Quality Analysis

> **DO NOT FILL THIS SECTION.** Claude Code populates this automatically during evaluation.

---

## Related Documents

| Document | Relationship |
|----------|-------------|
| `guidelines/Guidelines.md` | Project-level design and coding guidelines |
| `src/app/components/pages/identity/IdentityMonitoringView.tsx` | Full implementation source |
| `src/app/components/pages/IdentityAnalytics.tsx` | Entry point / persona router |
| `months/2026-04/product-design/2026-04-24-quality-analytics-monitoring.md` | Sister handoff — Quality Analytics Monitoring view |
