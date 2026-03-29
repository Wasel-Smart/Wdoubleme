**COMMAND FOR FIGMA AGENT — MOBILITY OS LIVE STREAM (LIGHT MODE)**

**Objective:**
Design the **Mobility OS – Live Stream Interface** in **Light Mode**, optimized for **real-time city-to-city mobility monitoring**, including rides and package movement. The interface must be clean, data-focused, and mathematically structured.

---

# 1️⃣ Theme Requirements — LIGHT MODE ONLY

**Mode:** Light Mode (Default System Mode)

**Background Color:**

* Primary Canvas: **#F7F9FC** (Ultra-Light Neutral)
* Map Surface: **#FFFFFF**
* Grid/Physics Overlay: **#E6ECF5**

**Primary Colors:**

* Mobility Routes (Ride Sharing): **#0066FF** (Deep Mobility Blue)
* Package Routes: **#00C2FF** (Cyan)
* High Traffic / Congestion: **#FF3B30** (Red Alert)
* Medium Traffic: **#FF9500** (Orange)
* Low Traffic: **#34C759** (Green)

**Text Colors:**

* Primary Text: **#0A2540**
* Secondary Text: **#5B6B7A**
* Disabled Text: **#A0AEC0**

---

# 2️⃣ Core Screen — Live Stream Mobility Map

This is the **main operational screen**.

**Must Include:**

✔ Full-screen **real-time mobility map**
✔ City-to-city route visualization
✔ Dynamic vehicle movement simulation
✔ Package flow visualization
✔ Mathematical traffic density logic
✔ Physics-based motion flow

---

# 3️⃣ Route Visualization Rules

Routes must be displayed as **structured network lines**.

**Ride Routes:**

* Color: Deep Blue (#0066FF)
* Line Type: Solid
* Thickness varies by traffic density

**Package Routes:**

* Color: Cyan (#00C2FF)
* Line Type: Dashed
* Slightly thinner than ride routes

**High-Volume Routes:**

* Glow effect enabled
* Thickness increases dynamically

---

# 4️⃣ Vehicle Movement Simulation

Vehicles must behave like **flow particles**, not icons.

**Rules:**

* Cars = Moving dots
* Size: 6px to 10px
* Motion: Smooth linear physics
* Speed based on real route load
* Must never jump or teleport

Movement logic must simulate:

* Traffic density
* Route congestion
* Travel velocity
* Real-time updates

---

# 5️⃣ Mathematical Grid Overlay (Mandatory)

Enable **light grid system** behind map.

Purpose:

* Represent mathematical structure
* Support flow accuracy
* Show spatial logic

Grid Settings:

* Color: #E6ECF5
* Opacity: 20%
* Spacing: 40px

Must remain subtle but visible.

---

# 6️⃣ City Node Design

Cities must be displayed as **network hubs**.

Node Style:

* Circle Shape
* Base Size: 12px
* Color: #0066FF
* Glow Radius: 6px
* Label appears on hover

City importance controls:

* Node size scaling
* Glow intensity
* Label visibility priority

---

# 7️⃣ Live Data Panels (Right Side)

Add vertical panel for live system data.

Panel Background:

#FFFFFF

Panel Sections:

### A — Route Load Monitor

Display:

* Active Routes
* Vehicles on Route
* Package Count
* Load Percentage

Format:

Numerical + mini bar indicators

---

### B — Traffic Density Monitor

Display:

* Low / Medium / High routes
* Congestion alerts
* Flow rate indicators

Must update dynamically.

---

### C — System Status Panel

Display:

* Active Vehicles
* Total Trips Running
* System Latency
* Estimated Flow Stability

Use:

Green = Stable
Orange = Warning
Red = Critical

---

# 8️⃣ Timeline Control (Bottom Section)

Add **Playback Timeline**.

Functions:

✔ Live Mode
✔ Pause
✔ Rewind
✔ Speed Multiplier (1x / 2x / 5x)

Slider Color:

Primary Blue (#0066FF)

Background:

#E6ECF5

---

# 9️⃣ Zoom & Navigation Controls

Position:

Bottom-right corner

Buttons:

* Zoom In (+)
* Zoom Out (–)
* Reset View
* Center Map

Button Style:

White background
Subtle shadow
Rounded corners

---

# 🔟 Performance Constraints (Strict)

The design must:

✔ Remain readable at high zoom-out
✔ Support thousands of moving objects
✔ Avoid visual clutter
✔ Use minimal icon complexity
✔ Maintain smooth visual hierarchy

---

# 11️⃣ Visual Standard Reference

Design must feel similar in quality to:

* Air Traffic Control Systems
* Smart City Dashboards
* Scientific Simulation Interfaces

NOT:

❌ Game UI
❌ Cartoon UI
❌ Decorative map UI

---

# 12️⃣ Output Requirements

Deliver:

✔ Desktop Layout (1920×1080)
✔ Tablet Layout
✔ Component Library
✔ Light Mode Design Tokens
✔ Prototype Interaction Flow

All elements must be scalable and reusable.

---

# FINAL DIRECTIVE

This is not a standard map UI.
This is a **Mobility Operating System visualization layer**.

Design must feel:

✔ Scientific
✔ Precise
✔ Real-time
✔ Intelligent
✔ Operational
