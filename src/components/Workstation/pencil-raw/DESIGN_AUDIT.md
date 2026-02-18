# DESIGN AUDIT — Pencil Overview Tab

Source: `OverviewFromPencil.jsx`
Pulled from: Pencil MCP → "Property Workstation" → "Overview Tab Content"

---

## 1. Hardcoded Colors

### Backgrounds
| Hex | Usage |
|-----|-------|
| `#FFFFFF` | Page / card background (white) |
| `#F8FAFC` | Metric card fill, off-white surface |
| `#F1F5F9` | Zoning badge background (gray-50) |
| `#EFF6FF` | AI Quick Take card bg, Industrial badge bg |
| `#DCFCE7` | Flood badge bg, Pipeline badge bg (green-light) |
| `#FFF7ED` | Absentee Owner badge bg (orange-light) |
| `#BFDBFE` | AI confidence bar track, AI card border (blue-muted) |

### Text Colors
| Hex | Usage |
|-----|-------|
| `#0F172A` | Primary headings, metric values, body text, data row values |
| `#64748B` | Data labels, inactive tab text, section subtitles |
| `#94A3B8` | Timestamps, muted subtitles, APN text, bookmark dot |
| `#1E3A5F` | AI Quick Take bullet body text |
| `#1E40AF` | AI Quick Take title text |

### Accent / Semantic
| Hex | Usage |
|-----|-------|
| `#2563EB` | Links, active tab border, AI dots, LTV fill, pipeline dot, confidence % |
| `#16A34A` | Positive values, flood zone badge, pipeline badge, AI activity dot |
| `#EA580C` | Absentee Owner badge text |
| `#DC2626` | Map pin (red) |
| `#CA8A04` | Contact activity dot (yellow) |

### Borders
| Hex | Usage |
|-----|-------|
| `#E2E8F0` | Card borders (1px), metric card borders, tab underline, LTV track, icon buttons |

### Overlays (8-digit hex with alpha)
| Hex | Opacity | Usage |
|-----|---------|-------|
| `#0F172ACC` | 80% | Street View badge background |
| `#0F172A99` | 60% | Camera button background |
| `#0F172A66` | 40% | Close/expand button backgrounds |

**Total unique colors: 20** (17 opaque + 3 with alpha)

---

## 2. Font Families

| Font | Usage |
|------|-------|
| `Inter` | All UI text (headings, labels, values, body) |
| `Material Symbols Rounded` | Icons (stars icon in AI Quick Take, other icon glyphs) |

---

## 3. Typography Scale

| Role | Size | Weight | Color |
|------|------|--------|-------|
| Page heading | 20px | 700 | `#0F172A` |
| Section title | 14px | 600 | `#0F172A` |
| Metric value | 16px | 700 | `#0F172A` |
| Metric label | 11px | normal | `#64748B` |
| Metric subtitle | 11px | normal | `#94A3B8` (or `#16A34A` for positive) |
| Body text | 12px | normal | `#0F172A` |
| Body bold | 12px | 500 | `#0F172A` |
| Link | 12px | normal | `#2563EB` |
| Badge | 11px | 600 | varies by variant |
| Tab active | 12px | 600 | `#0F172A` |
| Tab inactive | 12px | 500 | `#64748B` |
| Timestamp | 11px | normal | `#94A3B8` |
| APN | 12px | — | `#94A3B8` |
| AI title | 14px | 600 | `#1E40AF` |
| AI bullet | 12px | normal | `#1E3A5F` (lineHeight 1.4) |
| Confidence label | 11px | normal | `#64748B` |
| Confidence value | 11px | 600 | `#2563EB` |
| LTV label | 11px | normal | `#64748B` |
| LTV value | 11px | 600 | `#0F172A` |

---

## 4. Layout Patterns

### Two-Column Overview
- Container: `padding: 24`, `gap: 24`, horizontal layout
- Left column: `flex: fill` (stretches), `gap: 20` between cards
- Right column: `width: 300px` fixed, `gap: 20` between cards

### Card Style (standard)
- `fill: #FFFFFF` (white)
- `border: 1px solid #E2E8F0`
- `cornerRadius: 8`
- `padding: 16`
- `gap: 12` (between internal elements)

### Card Style (metric)
- `fill: #F8FAFC` (off-white)
- `border: 1px solid #E2E8F0`
- `cornerRadius: 6`
- `padding: [10px, 12px]` (top/bottom, left/right)
- `gap: 2` (between label, value, subtitle)

### Card Style (AI Quick Take — special)
- `fill: #EFF6FF` (light blue)
- `border: 1px solid #BFDBFE`
- `cornerRadius: 8`
- `padding: 16`
- Footer separator: `1px solid #BFDBFE`, `padding-top: 8`

### Metric Grid
- Vertical wrapper: `gap: 8`
- Each row: horizontal, `gap: 8`
- 3 cards per row, 2 rows = 6 metric cards total
- Cards use `flex: fill` to share row width equally

### Tab Navigation
- Height: `40px`
- Padding: `[0, 24]`
- Border-bottom: `1px solid #E2E8F0`
- Active: `border-bottom: 2px solid #2563EB` (inside)
- 9 tabs: Overview, Ownership, Financials, Physical, Location, Transactions, Docs, Activity, AI Insights

---

## 5. Component Patterns

### Data Row (Ownership / Mortgage cards)
```
horizontal layout, justify: space_between, width: fill
├─ Label:  fontSize=12, color=#64748B
└─ Value:  fontSize=12, fontWeight=500, color=#0F172A
```

### Badge (pill)
```
cornerRadius: 10 (pill shape)
padding: [3px, 8px]
fontSize: 11, fontWeight: 600

Variants:
  Industrial      → bg=#EFF6FF  text=#2563EB
  Zoning (LI)     → bg=#F1F5F9  text=#64748B
  Flood (Zone X)  → bg=#DCFCE7  text=#16A34A
  Absentee Owner  → bg=#FFF7ED  text=#EA580C
  Pipeline Status → bg=#DCFCE7  text=#16A34A  (+ 6px green dot)
```

### Metric Card
```
frame: fill=#F8FAFC, cornerRadius=6, border=#E2E8F0 1px, padding=[10,12], gap=2
├─ Label:    fontSize=11, color=#64748B
├─ Value:    fontSize=16, fontWeight=700, color=#0F172A
└─ Subtitle: fontSize=11, color=#94A3B8 (or #16A34A for positive)
```

### AI Quick Take (special card)
```
frame: fill=#EFF6FF, border=#BFDBFE 1px, cornerRadius=8, padding=16, gap=12
├─ Header:  Material Symbols "stars" (#2563EB) + "AI Quick Take" (#1E40AF, 14px, 600)
├─ Bullets: "•" dot=#2563EB + text=#1E3A5F (12px, lineHeight 1.4)
└─ Footer:  separator=#BFDBFE 1px, paddingTop=8
    ├─ "Confidence Score" (#64748B, 11px)
    ├─ Progress bar: track=#BFDBFE h=4 r=2, fill=#2563EB (width %)
    └─ "78%" (#2563EB, 11px, 600)
```

### LTV Progress Bar
```
header row: "Est. LTV" (#64748B, 11px) — "43%" (#0F172A, 11px, 600)
track:  height=6, cornerRadius=3, fill=#E2E8F0, width=fill
fill:   height=6, cornerRadius=3, fill=#2563EB, width=percentage
```

### Activity Item
```
horizontal, gap=10, paddingTop=3
├─ Dot:  ellipse 8×8, color by type:
│         Pipeline=#2563EB  AI=#16A34A  Contact=#CA8A04  Bookmark=#94A3B8
└─ Content: vertical, gap=2
    ├─ Text:      fontSize=12, color=#0F172A
    └─ Timestamp: fontSize=11, color=#94A3B8
```

### Section Card Header
```
horizontal, justify: space_between
├─ Title: fontSize=14, fontWeight=600, color=#0F172A
└─ Link:  fontSize=12, color=#2563EB ("Full History →", "Details →", etc.)
```

---

## 6. Styling Method

**100% inline styles.** The Pencil design uses no Tailwind classes — all values are pixel-based CSS properties applied directly to frames. This matches our theme conversion approach of `style={{}}` with `useTheme()` tokens.

---

## 7. Theme Compatibility Notes

The Pencil design is **light-theme only**. Before building production components:

| Pencil Token | Maps To (light theme) | Dark Theme Equivalent |
|---|---|---|
| `#FFFFFF` (white bg) | `t.bg.primary` | auto (dark surface) |
| `#F8FAFC` (off-white) | `t.bg.secondary` | auto |
| `#0F172A` (heading) | `t.text.primary` | auto |
| `#64748B` (label) | `t.text.tertiary` | auto |
| `#94A3B8` (muted) | `t.text.quaternary` | auto |
| `#E2E8F0` (border) | `t.border.default` | auto |
| `#2563EB` (blue) | `t.accent.primary` | auto |
| `#16A34A` (green) | `t.semantic.success` | auto |
| `#EA580C` (orange) | `t.semantic.warning` | auto |
| `#DC2626` (red) | `t.semantic.error` | auto |
| `#EFF6FF` (AI bg) | `t.accent.primaryMuted` | auto |
| `#BFDBFE` (AI border) | `t.accent.primaryBorder` | auto |
| `#1E40AF` (AI heading) | custom / `t.accent.primary` | needs dark variant |
| `#1E3A5F` (AI body) | custom | needs dark variant |
| `#CA8A04` (yellow) | `t.semantic.warning` or custom | needs dark variant |
| `#FFF7ED` (orange bg) | computed muted from warning | auto |
| `#DCFCE7` (green bg) | computed muted from success | auto |
| `#F1F5F9` (gray bg) | `t.bg.tertiary` | auto |
| Overlays | keep as-is (alpha hex) | may need adjustment |

**3 colors need custom dark-mode variants:** `#1E40AF`, `#1E3A5F`, `#CA8A04`
