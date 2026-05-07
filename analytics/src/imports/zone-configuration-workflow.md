Designing a **Zone Configuration Interface** is a critical step in moving from raw camera metadata to the high-level **Zonal Intelligence** seen in your existing dashboards. To ensure accurate metrics like **Avg Dwell Time** and **Total Count**, the system must bridge the gap between "what the camera sees" and "where the zone is".

### 🏛️ The "Zonal Architect" Workflow

To handle complex scenarios like multi-floor locations and overlapping camera coverage, the configuration flow should be divided into **Spatial Definition** and **Data Mapping**.

#### **1. Entry Point: The "Configure" Trigger**

* **Placement:** Add a high-contrast **"Configure Areas"** button with a settings icon directly next to the **Live Zone Occupancy Map** heading.
* **Floor Navigation:** Beside the heading, include a **Floor Switcher** (e.g., L1, L2, B1). This ensures the 10x10 grid is contextually tied to a specific architectural level of the building.

#### **2. The Universal Grid (Spatial Definition)**

When the user clicks "Configure," the "Live Occupancy Map" transitions into an interactive **Drafting Canvas**.

* **The 10x10 Logic:** Overlay a light, magnetic grid across the entire canvas.
* **Selection Mechanism:** * The user clicks a starting box and drags to create a **Rectangular Polygon**.
* **Visual Feedback:** As they drag, the area is filled with a translucent "Drafting Blue." Once released, a modal pops up to **Name the Zone** (e.g., "Main Entrance").


* **Collision Detection:** The system should prevent zones from overlapping on the 2D grid to maintain the clean visual hierarchy of the final dashboard.

#### **3. The "Smart Metadata" Mapping (The Intelligence Layer)**

Once a zone is drawn, the user must "power" it with data. A side panel should appear with the following configuration options:

* **Camera Assignment:** A multi-select list of all 10 cameras. The user checks the cameras that "look" at this specific zone.
* **Role-Based Camera Logic:** This solves your "accurate metrics" problem. For each assigned camera, the user defines its primary role for that zone:
* **Camera A:** Primary for **Entry/Exit Flow** (Directional Flow).
* **Camera B:** Primary for **Occupancy/Density** (Mustering).
* **Camera C:** Primary for **Forensic Verification** (Live Thumbnails).


* **Deduplication Engine:** If Camera A and Camera B both see "Zone 1," the Matrice backend uses a **"Master Tracker ID"** to ensure a person walking between the two cameras isn't counted as two people.

---

### 🎨 UI Improvements for the Configuration Screen

To maintain the "Matrice" brand identity (high-tech, precision, and clarity), consider these UI elements:

| Feature | Configuration UI Behavior | Benefit |
| --- | --- | --- |
| **Zone Colors** | Users can assign a color (Green, Amber, Red) to a zone. | Matches the **Violation/Status** logic of the live map. |
| **Thumbnail Preview** | Hovering over an assigned camera in the config list shows a small live crop of that zone. | Ensures the user has mapped the correct camera to the correct grid area. |
| **Grid Snap** | Boxes "snap" to the 10x10 grid. | Prevents messy, misaligned boxes, keeping the final dashboard polished. |
| **Floor Sync** | "Floor 1" zones can be copied as a template for "Floor 2." | Speeds up setup for multi-story buildings with identical layouts (e.g., office blocks). |

### 🚀 Strategic Next Step

The user has now drawn their zones and mapped their cameras. The final step is defining **Zone Rules**.

**Would you like me to design the "Rules Configuration" modal, where the user can set the "SLA Wait Time" for a Queue zone or the "Restricted Hours" for an Intrusion zone?**