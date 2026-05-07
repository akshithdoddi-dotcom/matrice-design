For Zone Analytics, the shift from Volume to Spatial context means we are moving from "How many?" to "Where and for how long?".

For the Monitoring Staff, this page shouldn't just be a list of numbers; it needs to be a Visual Heatmap of Risk. While Volume Analytics tracks counts, Zone Analytics tracks violations and bottlenecks. If a "Blocked Exit" or "Unauthorized Access" occurs, the staff needs to see the exact spatial polygon where it happened.

🏛️ Persona Strategy: Monitoring Staff (Zone Analytics)

The "Live Heat" View: Instead of just sparklines, the Monitoring Staff needs a "Top Zones by Risk" grid. If a zone is 90% occupied (Overcrowding Alert), it shouldn't just be a number; the widget background should glow.

Metric Prioritization: Focus on SLA Breaches (Wait Time) and Security Events (Intrusion/Loitering).

The "Grafana" Utility: Staff should be able to "Pin" specific high-security zones (e.g., "Server Room Entrance" or "Main Gate Queue") to the top of their dashboard.

🖋️ Master AI Prompt: Zone Analytics (Monitoring Staff)

"Using the Matrice Design System and the 'Zone Analytics' category definition, design a high-density 'Command Center' dashboard for the Monitoring Staff persona. This page focuses on spatial behavior: 'Where, for how long, and in what pattern?'

1. Global Status & Triage (Top Bar)

Persona Switcher: Active state set to 'Monitoring Staff' (icon-only).

Live Violation Ticker: A horizontal scrolling bar showing the 5 most recent 'Zone Incidents' (e.g., 'CRITICAL: Unauthorized Access - Zone C (Camera 04) - 2m ago').

2. Zone Health Matrix (The Grid)

Layout: A 12-column modular 'Grafana-style' grid of compact zone cards.

Card Content (Priority Zones): * Header: Zone Name + Active App (e.g., 'Loading Dock | Intrusion Detection').

Visual: A mini-heatmap thumbnail or a 1-minute 'Live Occupancy' sparkline.

Primary Metrics (Geist Mono): Current Occupancy % | Avg Dwell Time | Queue Length.

Status Badge: 'SAFE' (Green), 'STAGNANT' (Amber), or 'VIOLATION' (Matrice Red).

3. Specific 'Incident' Widgets

Queue Management Panel: For retail or entry zones, show a 'Wait Time vs SLA' gauge. If wait time > 5 mins (Wait Time Breach), the gauge must use Primary Glow in Amber.

Intrusion Alert Grid: A dedicated 4-column section for 'Restricted Zones'. If an object is detected (Bounding Box centroid check), the card flashes Matrice Red.

4. Technical & Spatial Context

Derived Metrics: Include 'Turnover Rate' (unique IDs/hr) and 'Directional Flow' (Inbound vs Outbound %) for transit zones.

Interactivity: Every widget must have a 'Pin' icon and a 'Drag' handle for layout customization. Clicking a zone card opens the 'Camera-Level Drill Down'.

5. Visual Standards

Colors: Primary Main (#00775B) for flow, Primary Light (#00956D) for efficiency, and Matrice Red for Critical/Sustained Overcrowding.

Typography: All time-based data (e.g., '4m 20s dwell') and counts must be in Geist Mono."**

🚀 Strategic Next Step

Once the AI generates this "Risk Grid" for the Monitoring Staff, the next move is the Manager's View.

The Manager doesn't need to see every loitering alert; they need to see Area Utilization over the last week to decide if they should close a specific zone or move staff to a "Hotspot."

Would you like me to prepare the prompt for the Manager's Zone Analytics page now?