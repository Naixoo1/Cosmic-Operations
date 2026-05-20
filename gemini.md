# SYSTEM BLUEPRINT & CONTEXT ANCHOR
# PROJECT: Cosmic Ops: Ground Control // Core Game Architecture

## 1. PROJECT OBJECTIVE & AGENT ROLES
The user is a high-level Priority Specialist appointed by NASA. Their prime directive is to maintain the earth's final three advanced observatory enclosures, secure space routes for future human traversal, and ultimately discover a habitable exoplanet to secure human civilization.

This document serves as the absolute structural and contextual reference map for Antigravity's code editor. All subsequent feature expansions, code modifications, or UI styling loops must conform to the systems and folder hierarchies defined below.

## 2. MODULAR PATHWAY & REPOSITORY DIRECTORY
The application uses a strict single-repository multi-page web architecture. Interactive routing between nodes depends entirely on standard relative folder paths.

stitch-cosmic-ops/
├── .gitignore
├── README.md
├── DESIGN.md                                   <-- Design Token Rules (Root Level)
├── gemini.md                                   <-- This Core Gameplay Anchor Blueprint
├── index.html                                  <-- HQ Command Hub Navigation & Launch Deck
├── assets/
│   └── shared-styles.css                       <-- Global Structural Layout Styles
├── core/                                       <-- CENTRAL GAME LOGIC ENGINE
│   ├── game-state.js                           <-- Global LocalStorage Save System
│   ├── mission-engine.js                       <-- Threat Generator & Ticking Clocks
│   └── player-progression.js                   <-- Upgrade Shop & Attribute Calculators
├── mauna_kea_operations_split_view/
│   ├── code.html                               <-- Viewport Module: Hawaii Terminal
│   └── screen.png
├── atacama_desert_operations_split_view/
│   ├── code.html                               <-- Viewport Module: ALMA Terminal
│   └── screen.png
└── bosscha_observatory_operations_split_view/
    ├── code.html                               <-- Viewport Module: Zeiss Terminal
    └── screen.png

## 3. CORE GAMEPLAY LOOPS & SYSTEMS
The workflow alternates between the centralized command platform and regional station viewport terminals.

### A. The HQ Command Hub (`index.html`)
- **Global Mission Selector:** Provides a changing roster of tactical deployment options.
- **Orbital Threat Grid:** A continuous real-time safety monitoring grid. If threats breach the system, HQ security/health decreases.
- **Victory Condition:** Keeping the Global Safety Rating strictly above 80% through successful mission completions.
- **Defeat Condition:** Failing tactical station objectives, allowing orbital debris waves to overwhelm sectors, or letting the threat safety deck fall below 80%.

### B. Regional Enclosure Viewports
Each of the three global tracking arrays runs distinct operations:
1. **Mauna Kea Terminal:** Atmospheric clearing and planetary/orbital pollution cleansing loops.
2. **Atacama Desert Terminal (ALMA):** Radar telemetry, wave interference correction, and orbital threat containment tracking.
3. **Bosscha Observatory Terminal:** Deep-space coordinate analysis targeting habitable earth-like exoplanets.

## 4. CORE REPOSITORY ENGINE SCRIPTS (`/core`)

### A. Global Save System (`core/game-state.js`)
- **State Persistence:** Captures, syncs, and serializes all global currencies, character level ratings, and enclosure structural integrity points to browser `localStorage`.
- **Inter-Page Synchronic Data:** Runs an active synchronization initialization hook whenever an individual page view loads (`index.html` or a station's `code.html`). This pulls current numbers from the state repository to prevent data loss or score resets during relative page transitions.

### B. Mission & Threat Engine (`core/mission-engine.js`)
- **Threat Vector Calculations:** Dictates the randomized decay math for the Global Orbital Threat Grid. If left unmanaged, it ticks downward automatically over time.
- **Mission Matrix:** Handles dynamic generation of regional assignment cards (Exoplanet coordinate hunting, Space junk sweeping, Atmospheric aerosol extraction).

### C. Player Progression & Upgrade Shop (`core/player-progression.js`)
- **Credit Transactions:** Deducts earned Credits upon purchasing companion support droids, enhanced enclosure hardware layers, or UI measurement tools.
- **Science Intelligence Progression:** Translates collected scientific insight points into hard attribute points—directly increasing character stats like Max Health, Base Defense, IQ, and structural Exoplanet Radar detection radiuses.

## 5. STRICT ENGINEERING DESIGN RULES
To align with the interface layout and existing assets, all file generation scripts must enforce the visual system parameters specified in `DESIGN.md`:
- **Typography Matrix:** Numeric readouts, logs, and system data parameters use `font-data` (JetBrains Mono). Structural headings and descriptive metadata use `font-headline` (Inter).
- **Corner Boundaries:** All interactive triggers, tracking panels, control cards, and buttons use a strict `rounded-sm` utility (exactly 4px). Rounded edge pills or fluid shapes are prohibited.
- **Zebra Grouping:** Tabular system lists must feature 2% opacity white row background highlights to guarantee legible horizontal scan tracking across high-density panels.
