// ══════════════════════════════════════════════════════════════════════════════
// ScoutGPT v2 — Overview Tab from Pencil Design
// Source: Pencil MCP → "Property Workstation" → "Overview Tab Content"
//
// This is a RAW EXPORT of the Pencil design spec, NOT production code.
// All colors, fonts, spacing, and layout are preserved exactly as designed.
// Convert to theme tokens + real data bindings before shipping.
// ══════════════════════════════════════════════════════════════════════════════

// ─── DESIGN TOKENS (extracted from Pencil) ──────────────────────────────────

const PENCIL_COLORS = {
  // Backgrounds
  white: '#FFFFFF',
  offWhite: '#F8FAFC',       // metric card bg
  gray50: '#F1F5F9',         // zoning badge bg
  aiBlue: '#EFF6FF',         // AI Quick Take card bg
  greenLight: '#DCFCE7',     // flood badge bg, pipeline badge bg
  orangeLight: '#FFF7ED',    // absentee owner badge bg
  blueMuted: '#BFDBFE',      // AI confidence bar track, AI card border

  // Text
  heading: '#0F172A',        // primary headings, values, body text
  label: '#64748B',          // data labels, inactive tab text
  muted: '#94A3B8',          // subtitles, timestamps, APN
  aiBody: '#1E3A5F',         // AI bullet text
  aiHeading: '#1E40AF',      // AI Quick Take title

  // Accent / Semantic
  blue: '#2563EB',           // links, active tab border, AI bullet dots, activity dot, LTV fill
  green: '#16A34A',          // positive values, flood zone, pipeline status
  orange: '#EA580C',         // absentee owner badge text
  red: '#DC2626',            // map pin
  yellow: '#CA8A04',         // activity dot (owner contact)
  grayDot: '#94A3B8',        // activity dot (bookmarked)

  // Borders
  border: '#E2E8F0',         // card borders, metric card borders, tab underline, icon button borders

  // Overlay (hero image badges)
  heroBadgeDark: '#0F172ACC', // street view badge (80% opacity)
  heroBadgeMid: '#0F172A99',  // camera button (60% opacity)
  heroBadgeLight: '#0F172A66', // close/expand buttons (40% opacity)
};

const PENCIL_FONTS = {
  family: 'Inter',
  icon: 'Material Symbols Rounded',
};

const PENCIL_SIZES = {
  heading: { fontSize: 20, fontWeight: '700' },
  sectionTitle: { fontSize: 14, fontWeight: '600' },
  metricValue: { fontSize: 16, fontWeight: '700' },
  metricLabel: { fontSize: 11, fontWeight: 'normal' },
  metricSub: { fontSize: 11, fontWeight: 'normal' },
  bodyText: { fontSize: 12, fontWeight: 'normal' },
  bodyBold: { fontSize: 12, fontWeight: '500' },
  link: { fontSize: 12, fontWeight: 'normal' },
  badge: { fontSize: 11, fontWeight: '600' },
  tabActive: { fontSize: 12, fontWeight: '600' },
  tabInactive: { fontSize: 12, fontWeight: '500' },
  timestamp: { fontSize: 11, fontWeight: 'normal' },
  apn: { fontSize: 12 },
};

const PENCIL_SPACING = {
  overviewPadding: 24,
  overviewGap: 24,          // gap between left and right columns
  sectionGap: 20,           // gap between cards in a column
  cardPadding: 16,
  cardRadius: 8,
  cardBorder: { fill: '#E2E8F0', thickness: 1 },
  metricCardPadding: [10, 12],
  metricCardRadius: 6,
  metricGridGap: 8,
  badgeRadius: 10,
  badgePadding: [3, 8],
  rowGap: 12,               // gap between data rows in summary cards
  bulletGap: 8,
  activityGap: 10,
  rightColumnWidth: 300,
};

// ─── OVERVIEW TAB CONTENT (two-column layout) ──────────────────────────────

/*
  Layout structure from Pencil:

  Overview Tab Content (EfIEc)
  ├─ padding: 24
  ├─ gap: 24
  │
  ├─ Overview Left (BPtSh) — flex: fill, gap: 20
  │   ├─ Key Metrics (yzPHx) — gap: 12
  │   │   ├─ "Key Metrics" title
  │   │   └─ Metrics Grid (sgwFJ) — vertical, gap: 8
  │   │       ├─ Row 1 (wp6uq) — horizontal, gap: 8
  │   │       │   ├─ Assessed Value card
  │   │       │   ├─ AVM Estimate card
  │   │       │   └─ Lot Size card
  │   │       └─ Row 2 (6cjsE) — horizontal, gap: 8
  │   │           ├─ Building card
  │   │           ├─ Last Sale card
  │   │           └─ Annual Tax card
  │   │
  │   ├─ Ownership Summary (Omj69) — card, gap: 12
  │   │   ├─ Header: "Ownership Summary" + "Full History →" link
  │   │   ├─ Row: Owner / Cameron Industrial LLC
  │   │   ├─ Row: Owner Type / Absentee — Out of State
  │   │   ├─ Row: Mailing / PO Box 4412, Dallas TX 75201
  │   │   └─ Row: Ownership Length / 12 years (since Mar 2012)
  │   │
  │   └─ Mortgage Summary (3hvS6) — card, gap: 12
  │       ├─ Header: "Mortgage Summary" + "Details →" link
  │       ├─ Row: Lender / Wells Fargo
  │       ├─ Row: Balance / $620,000
  │       ├─ Row: Rate / Term / 4.25% / 30yr (2012)
  │       ├─ Row: Maturity / Mar 2042
  │       └─ LTV Bar: "Est. LTV" — 43% — [progress bar]
  │
  └─ Overview Right (pQXjk) — width: 300, gap: 20
      ├─ AI Quick Take (9GX3I) — special blue card, gap: 12
      │   ├─ Header: ★ icon + "AI Quick Take"
      │   ├─ Bullets (3 items with blue dots)
      │   └─ Footer: "Confidence Score" — [bar] — 78%
      │
      ├─ Location Snapshot (klAnh) — card, gap: 12
      │   ├─ Header: "Location Snapshot" + "Open Map →" link
      │   ├─ Mini Map (120px, clipped, with red pin)
      │   └─ Details:
      │       ├─ Submarket / Northeast Austin Industrial
      │       ├─ Vacancy / 4.2% (green)
      │       └─ Avg Rent / $8.50/sqft NNN
      │
      └─ Recent Activity (FLtke) — card, gap: 12
          ├─ Header: "Recent Activity" + "View All →" link
          └─ Activity items (colored dot + text + timestamp):
              ├─ 🔵 Added to Pipeline: Underwriting — 2 hours ago
              ├─ 🟢 AI Analysis Completed — 5 hours ago
              ├─ 🟡 Owner Contact Info Found — Yesterday
              └─ ⚪ Property Bookmarked — 3 days ago
*/

// ─── METRIC CARD PATTERN ────────────────────────────────────────────────────

/*
  Each metric card:
  - Frame: fill=#F8FAFC, cornerRadius=6, border=#E2E8F0 1px, padding=[10,12], gap=2
  - Label: fontSize=11, color=#64748B
  - Value: fontSize=16, fontWeight=700, color=#0F172A
  - Subtitle: fontSize=11, color=#94A3B8 (or #16A34A for positive values)
*/

// ─── DATA ROW PATTERN ───────────────────────────────────────────────────────

/*
  Each data row (Ownership / Mortgage):
  - Frame: horizontal, justify=space_between, width=fill
  - Left label: fontSize=12, color=#64748B
  - Right value: fontSize=12, fontWeight=500, color=#0F172A
*/

// ─── BADGE PATTERN ──────────────────────────────────────────────────────────

/*
  Property badges (header):
  - cornerRadius: 10 (pill)
  - padding: [3, 8]
  - fontSize: 11, fontWeight: 600

  Variants:
  - Industrial:      bg=#EFF6FF  text=#2563EB
  - Zoning (LI):     bg=#F1F5F9  text=#64748B
  - Flood (Zone X):  bg=#DCFCE7  text=#16A34A
  - Absentee Owner:  bg=#FFF7ED  text=#EA580C
  - Pipeline Status: bg=#DCFCE7  text=#16A34A  (with 6px green dot)
*/

// ─── AI QUICK TAKE PATTERN ──────────────────────────────────────────────────

/*
  Special card:
  - bg: #EFF6FF (light blue)
  - border: #BFDBFE 1px
  - cornerRadius: 8
  - padding: 16

  Header: Material Symbols "stars" icon (#2563EB) + "AI Quick Take" (#1E40AF, 14px, 600)

  Bullets:
  - "•" dot: #2563EB, fontSize 12
  - Text: #1E3A5F, fontSize 12, lineHeight 1.4

  Footer (separated by 1px #BFDBFE top border, padding-top 8):
  - "Confidence Score" label: #64748B, 11px
  - Progress bar: track=#BFDBFE h=4 r=2, fill=#2563EB w=38/48
  - "78%" value: #2563EB, 11px, 600
*/

// ─── ACTIVITY ITEM PATTERN ──────────────────────────────────────────────────

/*
  Each activity item:
  - Frame: horizontal, gap=10, padding-top=3
  - Dot: ellipse 8x8, colored by type:
    - Pipeline:  #2563EB (blue)
    - AI:        #16A34A (green)
    - Contact:   #CA8A04 (yellow)
    - Bookmark:  #94A3B8 (gray)
  - Content: vertical, gap=2
    - Text: #0F172A, fontSize 12
    - Time: #94A3B8, fontSize 11
*/

// ─── LTV PROGRESS BAR PATTERN ───────────────────────────────────────────────

/*
  LTV Bar:
  - Header: "Est. LTV" (#64748B, 11px) — "43%" (#0F172A, 11px, 600)
  - Track: height=6, cornerRadius=3, fill=#E2E8F0, width=fill
  - Fill:  height=6, cornerRadius=3, fill=#2563EB, width=180px (43% of track)
*/

// ─── TAB NAVIGATION PATTERN ─────────────────────────────────────────────────

/*
  Tab bar:
  - height: 40, padding: [0, 24]
  - border-bottom: 1px #E2E8F0

  Active tab:
  - text: #0F172A, 12px, 600
  - border-bottom: 2px #2563EB (inside)

  Inactive tab:
  - text: #64748B, 12px, 500
  - no border

  Tabs: Overview | Ownership | Financials | Physical | Location | Transactions | Docs | Activity | AI Insights
*/

export {
  PENCIL_COLORS,
  PENCIL_FONTS,
  PENCIL_SIZES,
  PENCIL_SPACING,
};
