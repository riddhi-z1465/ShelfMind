# ShelfMind — RFID Library Automation & Digital Lending Platform

> A production-ready academic library automation system featuring high-throughput RFID circulation, multi-handheld inventory audits across 340,000 tagged volumes, and controlled concurrent digital lending with atomic mutex arbitration.

---

## 📌 Architecture Overview

ShelfMind is engineered for university libraries handling high-density collections and concurrent digital demands. The platform operates on a dual-pipeline model:

1. **Physical RFID Circulation & EAS Surveillance**:
   * Multi-tag self-service issue and return workstation.
   * Real-time Electronic Article Surveillance (EAS) security bit toggling.
   * Perimeter pedestrian gate monitoring detecting active tags in under 40ms.
   * Multi-handheld audit dashboard supporting 6 readers operating at 180 tags/minute/device (~5h 15m for 340,000 volumes).

2. **Controlled Digital Lending (CDL) Engine**:
   * Strict 5-slot concurrent digital licence pool.
   * Atomic test-and-set race condition prevention during simultaneous patron checkouts.
   * 20-minute idle session release watchdogs preventing licence hoarding.

---

## 🛠️ Technology Stack

* **Frontend**: Pure Semantic HTML5, Vanilla Modern CSS3, Vanilla Modular JavaScript (ES6+).
* **State Management**: Reactive Local Storage Store with automatic initialization and cross-tab event synchronization.
* **Data Visualization**: Native HTML5 Canvas charts with 0 external dependencies.
* **Icons & Typography**: Clean SVG iconography with Inter and JetBrains Mono typography.

---

## 📂 Project Structure

```text
ShelfMind/
├── index.html                # Product Landing Page & System Architecture Preview
├── dashboard.html            # Main Librarian Operations Dashboard & Live Telemetry
├── books.html                # Catalog Inventory & Right-Side Details Drawer
├── issue-return.html         # RFID Circulation Workstation (Issue/Return Flow)
├── reservations.html         # Priority Queue Hold Pipeline
├── digital-library.html      # Controlled Digital Lending & Concurrency Demonstration
├── stock-verification.html   # 6-Handheld Audit Fleet & Progress Engine
├── gate-security.html        # 4-Zone EAS Portal Surveillance Monitor
├── fines.html                # Patron Overdue Fine Ledger & Policy Service
├── reports.html              # Canvas-Powered Collection & Circulation Analytics
├── users.html                # Campus Directory & Role Management
├── login.html                # Institutional Authentication & Persona Switcher
├── css/
│   ├── style.css             # Unified Enterprise Design System (Tokens, Themes, Drawers)
│   └── responsive.css        # Breakpoints for Desktop, Tablet, and Mobile Drawers
└── js/
    ├── app.js                # Command Palette (⌘ K), Drawers, Toasts, Sync Handlers
    ├── mock-data.js          # Unified Local Data Layer (Books, Users, Events, Settings)
    ├── dashboard.js          # Live Telemetry & Animated Metric Counters
    ├── books.js              # Multi-Filter Search & Inspection Drawer Controller
    ├── lending.js            # Workstation Circulation & RFID Scan Simulator
    ├── digital.js            # 5-Slot CDL Watchdog & Atomic Mutex Test
    ├── stock.js              # Multi-Reader Verification Engine (180 tags/min)
    ├── gate.js               # Perimeter EAS Gate Event Monitor
    ├── fines.js              # Overdue Fine Calculator (₹5/day)
    ├── reservations.js       # Priority Hold Allocation
    ├── reports.js            # HTML5 Canvas Chart Renderers
    └── users.js              # Patron & Staff Account Management
```

---

## 🚀 Getting Started

No build tools, bundlers, or backend runtime required. Open any file in your browser or run a lightweight local static server:

```bash
# Python 3
python3 -m http.server 8080

# Or Node.js
npx serve .
```

Then visit:
`http://localhost:8080`

### Keyboard Shortcuts
* `⌘ K` or `Ctrl + K`: Open Global Command Palette & Navigation Switcher.
* `Esc`: Close open drawers, modals, and overlays.

---

## 📊 Preserved System Metrics

* **340,000** Total Library Volumes (100% RFID Tagged)
* **4,100** Untraceable Books (Flagged for audit reconciliation)
* **6** Connected RFID Handhelds (180 tags/min/device)
* **5h 15m** Theoretical Audit Duration ($340{,}000 \div (6 \times 180) \approx 314.8\text{ min}$)
* **5** Concurrent E-Book Licences (Atomic Mutex Enforced)
* **20-Minute** Idle Session Timeout
* **14-Day** Standard Circulation Period
* **₹5 / Day** Overdue Fine Rate
* **15 KLOC** Modular Codebase
* **3 Developers + Part-time Designer** (B.Tech Computer Science & Engineering)

---

## 📄 License

Academic evaluation and research project. Released under the MIT License.
