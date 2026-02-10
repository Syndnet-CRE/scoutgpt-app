# CLAUDE.md — scoutgpt-app (Frontend)

## What This Is
React + Vite + Tailwind frontend for ScoutGPT v2. Three-panel layout: left (layers/filters), center (Mapbox map), right (Claude chat).

## Tech
- React 18 + Vite 5
- Tailwind CSS (dark theme, custom `scout-*` color palette)
- Mapbox GL JS v3.3 (dark-v11 style)
- Lucide React for icons

## Current State
- **Mock data mode** — all API calls return mock data from `src/data/mockData.js`
- Flip `USE_MOCK = false` in `src/services/api.js` when backend is ready
- Mapbox token needed in `.env` as `VITE_MAPBOX_TOKEN`

## File Structure
```
src/
├── App.jsx                      # Main layout, state management
├── components/
│   ├── Map/MapContainer.jsx     # Mapbox init, layers, click handlers
│   ├── LeftPanel/
│   │   ├── LeftPanel.jsx        # Container
│   │   ├── LayerToggles.jsx     # GIS layer on/off (parcels, flood, schools)
│   │   └── DataFilters.jsx      # Property filters (absentee, corporate, etc.)
│   ├── RightPanel/
│   │   ├── RightPanel.jsx       # Container
│   │   └── ChatPanel.jsx        # Claude chat UI with quick prompts
│   └── PropertyCard/
│       ├── PropertyCard.jsx     # Summary card on parcel click
│       ├── ExpandableSection.jsx # Reusable accordion wrapper
│       ├── OwnerSection.jsx
│       ├── TaxSection.jsx
│       ├── SalesSection.jsx
│       ├── LoanSection.jsx
│       ├── ValuationSection.jsx
│       ├── ClimateSection.jsx
│       └── PermitSection.jsx
├── hooks/                       # Data fetching hooks
├── services/api.js              # API layer (mock/real toggle)
└── data/mockData.js             # Mock ATTOM data
```

## Commands
```bash
npm run dev      # Start dev server on :3000
npm run build    # Production build
npm run preview  # Preview production build
```

## Rules
- One component per file
- Functional components only
- Tailwind for all styling (no CSS modules)
- Parameterized queries only when backend is wired
- camelCase in JS, scout-* prefix for custom theme colors
