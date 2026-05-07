To optimize the Zone Analytics for a monitoring staff persona, we must align the layout with their primary goal: instant spatial triage and forensic verification. The staff is not here to analyze trends; they are here to answer "Where is the trouble, and how bad is it right now?".

🏛️ Purpose of Monitoring Staff on Zone Analytics

The monitoring persona uses this page as a Reactive Command Center. Their tasks are focused on:

Immediate Localization: Identifying which specific polygon or physical area is flashing red.

Visual Verification: Using live thumbnails to see if an "Intrusion" is a person or a shadow.

App-Specific Response: Treating a "Mustering" alert (safety) differently than a "Queue" alert (service speed).

🗺️ Proposed Information Architecture

Moving the Application Filters below the "Risk Map" creates a logical flow: Top-down from "Global Risk" to "Local Action."

Level 1: The Global Triage (Top Fold)

Live Zone Occupancy Map: This remains the primary tool for spatial orientation. It tells the user "Where" globally.

Top 5 At-Risk Zones: This is the staff's "To-Do" list, sorted by incident severity. Each card here should have a "View Camera" shortcut for instant visual proof.

Level 2: The Logic Bridge (New Application Filters)

The Switch: By placing the Application Filters (Intrusion, Queue, etc.) here, the user understands they are filtering the type of data they want to monitor in the matrix below.

Zone Search/Pinning: Add a "Pin to Top" or "Zone Search" bar next to these filters. This allows the staff to keep critical zones (e.g., "Main Vault") at the top of their matrix regardless of the application selected.

Level 3: The Action Matrix (All Zones Matrix)

Dynamic Card Morphing: When "Queue" is filtered, every card in the matrix displays Wait Time vs. SLA. When "Intrusion" is selected, the cards switch to "Detection Events" and "Time Since Breach".

Forensic Detail: Each card should show the Live Occupancy count in Geist Mono for technical precision.

🖋️ AI Refinement Prompt: The "Spatial Response" Dashboard

"Redesign the Zone Analytics Monitoring Page to prioritize reactive speed and spatial clarity. Follow this specific hierarchy:

1. The Situational Awareness Fold (Header)

Map & Risk Sidebar: Keep the Live Zone Occupancy Map (Left) and Top 5 At-Risk Zones (Right) as the persistent primary view.

Auto-Sync: Clicking a zone on the map must automatically scroll the 'All Zones Matrix' to that zone's card and give it a Primary Glow border.

2. The Functional Filter Bar (New Position)

App Filter Pills: Move the 'Application Filters' (Intrusion, Queue, etc.) directly below the Map fold.

Zone Multi-Select: Add a secondary 'Filter by Zone' dropdown. If a user selects 'Zone A' and 'Zone C', the matrix below collapses to only those two zones across all selected apps.

3. High-Density Response Matrix

Persona-First Widgets: For the monitoring persona, every card in the 'All Zones Matrix' must be a Compact Response Card.

Visual Evidence: Include a 1-minute 'Live Pulse' sparkline and a small 'Camera Icon' on every card.

Immediate Action: If an 'Unauthorized Access' incident is detected (Tier 0), the card must turn Matrice Red and display a 'DISPATCH/REPORT' button.

4. Technical UI Specs

Granularity: Default all data to Tier 0 (1-minute) for real-time accuracy.

Typography: Use Geist Mono for all counts and occupancy percentages.

Status Badges: Use the defined Severity Colors: Red (Critical), Amber (Medium), Green (Safe)."