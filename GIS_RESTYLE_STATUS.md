# GIS Layer Restyle Status

## Phase 5+ Task: Restyle GIS Layers to Match Official Style Guide

### Overview
Surgical edits to `src/config/gisLayers.js` and `src/components/Map/MapContainer.jsx` to align GIS layer colors with industry standards.

---

## 1. FLOOD COLORS — FEMA Blue Scheme (CRITICAL)

**Issue:** Current red-based colors are bleeding across viewport, confusing users (red = danger ≠ water).

**Current (gisLayers.js:184-197):**
```js
export const FLOOD_COLORS = {
  'A': '#dc2626', 'AE': '#dc2626', ...  // red-600
  'V': '#991b1b', 'VE': '#991b1b',       // red-800
  'X_SHADED': '#f59e0b',                 // amber-500
  'X': '#3b82f6',                        // blue-500
  'UNKNOWN': '#475569',                  // slate-600
};
```

**Target — FEMA Blue Gradient:**
```js
export const FLOOD_COLORS = {
  // High risk - 100-year floodplain (dark blue)
  'A': '#1e40af', 'AE': '#1e40af', 'AH': '#1e40af', 'AO': '#1e40af', 'AR': '#1e40af', 'A99': '#1e40af',
  // Coastal high hazard (navy)
  'V': '#1e3a8a', 'VE': '#1e3a8a',
  // Moderate risk - 500-year / shaded X (sky blue)
  'X_SHADED': '#0ea5e9', 'B': '#0ea5e9',
  // Undetermined (gray-blue)
  'D': '#64748b',
  // Minimal risk - outside floodplain (light blue, low visibility)
  'X': '#7dd3fc', 'C': '#7dd3fc',
  // Unknown (slate)
  'UNKNOWN': '#475569',
};
```

**Target — FLOOD_OPACITY (reduce intensity):**
```js
export const FLOOD_OPACITY = {
  'A': 0.35, 'AE': 0.35, 'AH': 0.35, 'AO': 0.35, 'AR': 0.35, 'A99': 0.35,
  'V': 0.40, 'VE': 0.40,
  'X_SHADED': 0.25, 'B': 0.25,
  'D': 0.15,
  'X': 0.08, 'C': 0.08,  // Minimal zones nearly invisible
  'UNKNOWN': 0.15,
};
```

---

## 2. ZONING COLORS — APA Standard Palette

**Current (gisLayers.js:29-40):**
```js
export const ZONING_CATEGORY_COLORS = {
  single_family: '#fbbf24',   // amber
  multi_family: '#f97316',    // orange
  office: '#8b5cf6',          // violet
  commercial: '#ef4444',      // red
  industrial: '#6b7280',      // gray
  mixed_use: '#ec4899',       // pink
  planned: '#14b8a6',         // teal
  parks: '#22c55e',           // green
  agricultural: '#a3e635',    // lime
  other: '#475569',           // slate
};
```

**Target — APA Standard (tweaked for dark map visibility):**
```js
export const ZONING_CATEGORY_COLORS = {
  single_family: '#facc15',   // yellow-400 (APA: yellow)
  multi_family: '#fb923c',    // orange-400 (APA: orange/tan)
  office: '#60a5fa',          // blue-400 (APA: blue)
  commercial: '#f87171',      // red-400 (APA: red)
  industrial: '#a78bfa',      // violet-400 (APA: purple)
  mixed_use: '#f472b6',       // pink-400 (APA: pink/magenta)
  planned: '#2dd4bf',         // teal-400 (APA: teal hatched)
  parks: '#4ade80',           // green-400 (APA: green)
  agricultural: '#a3e635',    // lime-400 (APA: light green)
  other: '#94a3b8',           // slate-400 (neutral)
};
```

**Also update ZONING_LEGEND (lines 142-153) to match.**

---

## 3. UTILITY LINE OPACITY

**Current (MapContainer.jsx:503):**
```js
'line-opacity': 0.85
```

**Target:** Reduce to `0.75` for better layer stacking with flood/zoning beneath.

---

## Implementation Order

1. **[CRITICAL] Flood colors** — `gisLayers.js` lines 184-207
2. **Zoning colors** — `gisLayers.js` lines 29-40, 142-153
3. **Utility opacity** — `MapContainer.jsx` line 503
4. **Test build** after each group

---

## Files Modified

| File | Lines | Change |
|------|-------|--------|
| `src/config/gisLayers.js` | 184-197 | FLOOD_COLORS → blue scheme |
| `src/config/gisLayers.js` | 199-207 | FLOOD_OPACITY → reduced |
| `src/config/gisLayers.js` | 29-40 | ZONING_CATEGORY_COLORS → APA |
| `src/config/gisLayers.js` | 117-139 | ZONING_COLORS → APA (legacy) |
| `src/config/gisLayers.js` | 142-153 | ZONING_LEGEND → APA |
| `src/components/Map/MapContainer.jsx` | 503 | line-opacity: 0.75 |

---

## Checklist

- [x] Flood colors updated (FEMA blue)
- [x] Flood opacity reduced
- [x] Zoning colors updated (APA)
- [x] Zoning legend updated
- [x] Utility opacity reduced
- [x] Build tested
