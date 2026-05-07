You are absolutely right. The current view is treating "Zone" as a single metric (occupancy/dwell), but your **Category System** defines 16+ distinct applications, from **Intrusion Detection** to **Wrong-way Driving** and **Mustering Point Management**.

If a Monitoring Staff member is looking at a "Hazardous Zone," they don't care about "Average Dwell Time"—they care about **"Unauthorized Access Incidents."** If they are looking at a "Parking Lot," they care about **"Spot Occupancy %."**

### 🏛️ The "App-Centric" Zone Architecture

We need to shift from a "One-Size-Fits-All" graph to an **Application-Filtered Grid**. This allows the UI to morph its metrics based on what the specific AI model is actually measuring.

#### **How the UI should Morph per App:**

| **Application Type** | **Primary Visual/Graph** | **Critical "Staff" Metric** |
| --- | --- | --- |
| **Intrusion / Hazardous** | **Live Alert List** (5-col grid) | Time since breach / Object Class |
| **Queue / Waiting** | **SLA Trend Line** (Wait vs Limit) | Current Wait Time / Queue Length |
| **Mustering / Overcrowding** | **Occupancy Gauge** (0-100%) | Headcount vs Safe Capacity |
| **Wrong-way / Directional** | **Violation Counter** (Hourly) | Wrong-way events / Net Flow |
| **Heatmaps / Utilization** | **Accumulated Density Map** | Peak Dwell / Most-visited "Cold" spots |

---

### 🖋️ "The Multi-App Zone Engine" — Refinement Prompt

**"Redesign the Zone Analytics (Monitoring Staff) page to be an 'App-First' environment. The dashboard must dynamically swap metrics and chart types based on the selected Application Category.**

#### **1. Global App Filter Bar (The Navigator)**

* Add a horizontal, scrollable pill-filter bar at the top: **'All Zones | Intrusion | Queue & Wait | Directional Flow | Mustering | Parking'**.
* **Logic:** Clicking a pill filters the grid below to only show zones running that specific application.

#### **2. Adaptive 'Zone Cards' (The Signal Matrix)**

* **Intrusion Zones:** Display a high-contrast 'Live Entry Log'. If a breach is active, the card border must pulse in **Matrice Red**. Primary Metric: 'Time in Restricted Area'.
* **Queue Zones:** Display a dual-line chart: **'Current Wait' vs 'SLA Limit'**. If Wait > SLA, show an Amber 'SLA Breach' tag.
* **Directional Zones:** Display a 'Violation Bar' showing **'Wrong-Way Events'** in the last 60 mins. Use a Sankey-style arrow to show flow direction.

#### **3. Spatial Context (The 'Evidence' Layer)**

* **Mustering/Overcrowding:** Instead of a simple bar chart, show a **Live Polygon Thumbnail** with the current headcount overlaid in **Geist Mono**.
* **Utilization:** For 'Area Utilization', show a mini-heatmap thumbnail (Green to Red density).

#### **4. Technical Density & Triage**

* **Interactivity:** Maintain the 'Pin' and 'Action' buttons (Verify/Flag/Full Stream) for every card.
* **Alert Ticker:** Ensure the top-bar ticker reflects the *filtered* view (e.g., if 'Intrusion' is selected, only show intrusion incidents).

#### **5. Branding & Typography**

* Ensure all technical data (counts, timestamps, % occupancy) remains in **Geist Mono**.
* Backgrounds should use **Primary Subtle (#E5FFF9)** for normal states and **Primary Main (#00775B)** for active headers."**

---

### 🚀 Strategic Next Step

The **Manager** persona is going to love this "App-First" view because they can flip to "Queue & Wait" to see if their checkout speed is improving, then flip to "Area Utilization" to see which aisles in the warehouse are being ignored.

**Would you like me to create the prompt for the Manager's Zone Analytics, focusing on 'SLA Compliance Trends' and 'Spatial ROI'?**