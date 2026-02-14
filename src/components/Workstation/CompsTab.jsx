import React from 'react';

// ══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ══════════════════════════════════════════════════════════════════════════════

const C = {
  bg: '#0f172a',
  bgCard: 'rgba(30,41,59,0.5)',
  bgRow: 'rgba(30,41,59,0.3)',
  bgRowHover: 'rgba(51,65,85,0.4)',
  bgSubject: 'rgba(99,102,241,0.15)',
  borderLight: 'rgba(51,65,85,0.5)',
  borderAccent: 'rgba(99,102,241,0.3)',
  accent: '#6366f1',
  accentLight: '#a5b4fc',
  text: '#e2e8f0',
  textDim: '#94a3b8',
  textMuted: '#64748b',
  green: '#34d399',
  amber: '#fbbf24',
  red: '#f87171',
};

const font = "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif";
const fontMono = "'JetBrains Mono', 'Fira Code', monospace";

// ══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ══════════════════════════════════════════════════════════════════════════════

const MOCK_COMPS = [
  { address: "6800 BURLESON RD", price: 4200000, date: "2024-11-15", sf: 32400, psf: 129.63, lot: 5.2, yr: 1985, type: "Industrial", cap: 7.2, dist: "1.8 mi" },
  { address: "7209 DECKER LN", price: 2850000, date: "2024-08-22", sf: 18900, psf: 150.79, lot: 3.1, yr: 1992, type: "Commercial", cap: 6.8, dist: "0.4 mi" },
  { address: "5600 E MLK BLVD", price: 6100000, date: "2024-06-03", sf: 44200, psf: 138.01, lot: 8.7, yr: 1978, type: "Industrial", cap: 7.5, dist: "3.2 mi" },
  { address: "8100 CAMERON RD", price: 1950000, date: "2025-01-10", sf: 12800, psf: 152.34, lot: 1.8, yr: 2001, type: "Commercial", cap: 6.4, dist: "4.1 mi" },
  { address: "4900 INDUSTRIAL OAKS", price: 3700000, date: "2024-09-28", sf: 28600, psf: 129.37, lot: 4.5, yr: 1988, type: "Industrial", cap: 7.1, dist: "2.6 mi" },
];

// ══════════════════════════════════════════════════════════════════════════════
// FORMATTERS
// ══════════════════════════════════════════════════════════════════════════════

const fmt = {
  money: v => v == null || v === 0 ? '—' : `$${Number(v).toLocaleString()}`,
  sf: v => v == null ? '—' : `${Number(v).toLocaleString()}`,
  ac: v => v == null ? '—' : Number(v).toFixed(2),
  pct: v => v == null ? '—' : `${Number(v).toFixed(1)}%`,
  psf: v => v == null ? '—' : `$${Number(v).toFixed(2)}`,
  date: v => {
    if (!v) return '—';
    return new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// HELPER: get value with fallback
// ══════════════════════════════════════════════════════════════════════════════

const get = (obj, ...keys) => {
  if (!obj) return null;
  for (const k of keys) {
    if (obj[k] != null && obj[k] !== '') return obj[k];
  }
  return null;
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPS TAB
// ══════════════════════════════════════════════════════════════════════════════

export default function CompsTab({ data }) {
  // Subject property info
  const address = get(data, 'addressFull', 'address_full', 'propertyAddress') || 'Subject Property';
  const buildingSf = get(data, 'areaBuilding', 'area_building', 'buildingArea');
  const propertyType = get(data, 'propertyUseStandardized', 'property_use_standardized', 'propertyUseGroup', 'property_use_group', 'propertyType') || 'Property';

  // Calculate averages from mock data
  const avgPsf = MOCK_COMPS.reduce((sum, c) => sum + c.psf, 0) / MOCK_COMPS.length;
  const avgPrice = MOCK_COMPS.reduce((sum, c) => sum + c.price, 0) / MOCK_COMPS.length;
  const avgCap = MOCK_COMPS.reduce((sum, c) => sum + c.cap, 0) / MOCK_COMPS.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Subject Property Bar */}
      <div
        style={{
          padding: '12px 20px',
          background: C.bgSubject,
          borderBottom: `1px solid ${C.borderAccent}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: C.accentLight, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
              Subject Property
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{address}</div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase' }}>SF</div>
              <div style={{ fontSize: 13, color: C.text, fontFamily: fontMono }}>{fmt.sf(buildingSf)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase' }}>Type</div>
              <div style={{ fontSize: 13, color: C.accentLight }}>{propertyType}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: `1px solid ${C.borderLight}`,
              borderRadius: 6,
              color: C.textDim,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: font,
              cursor: 'pointer',
            }}
          >
            Adjust Criteria
          </button>
          <button
            style={{
              padding: '8px 16px',
              background: C.accent,
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: font,
              cursor: 'pointer',
            }}
          >
            Show on Map
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 13,
            fontFamily: font,
          }}
        >
          <thead>
            <tr
              style={{
                background: 'rgba(30,41,59,0.6)',
                position: 'sticky',
                top: 0,
                zIndex: 1,
              }}
            >
              <th style={{ padding: '12px 16px', textAlign: 'left', color: C.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${C.borderLight}` }}>#</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: C.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${C.borderLight}` }}>Address</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: C.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${C.borderLight}` }}>Sale Price</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: C.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${C.borderLight}` }}>Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: C.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${C.borderLight}` }}>$/SF</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: C.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${C.borderLight}` }}>Size (SF)</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: C.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${C.borderLight}` }}>Lot (ac)</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: C.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${C.borderLight}` }}>Built</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: C.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${C.borderLight}` }}>Type</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: C.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${C.borderLight}` }}>Cap Rate</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: C.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${C.borderLight}` }}>Dist.</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_COMPS.map((comp, i) => (
              <tr
                key={i}
                style={{
                  background: i % 2 === 0 ? 'transparent' : C.bgRow,
                  transition: 'background 0.15s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = C.bgRowHover}
                onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : C.bgRow}
              >
                <td style={{ padding: '12px 16px', color: C.textMuted, borderBottom: `1px solid ${C.borderLight}` }}>{i + 1}</td>
                <td style={{ padding: '12px 16px', color: C.text, fontWeight: 500, borderBottom: `1px solid ${C.borderLight}` }}>{comp.address}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: C.green, fontFamily: fontMono, fontWeight: 600, borderBottom: `1px solid ${C.borderLight}` }}>{fmt.money(comp.price)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: C.textDim, borderBottom: `1px solid ${C.borderLight}` }}>{fmt.date(comp.date)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: C.amber, fontFamily: fontMono, fontWeight: 600, borderBottom: `1px solid ${C.borderLight}` }}>{fmt.psf(comp.psf)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: C.text, fontFamily: fontMono, borderBottom: `1px solid ${C.borderLight}` }}>{fmt.sf(comp.sf)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: C.text, fontFamily: fontMono, borderBottom: `1px solid ${C.borderLight}` }}>{fmt.ac(comp.lot)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: C.textDim, borderBottom: `1px solid ${C.borderLight}` }}>{comp.yr}</td>
                <td style={{ padding: '12px 16px', color: C.textDim, borderBottom: `1px solid ${C.borderLight}` }}>{comp.type}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: C.accentLight, fontFamily: fontMono, fontWeight: 500, borderBottom: `1px solid ${C.borderLight}` }}>{comp.cap}%</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: C.textMuted, borderBottom: `1px solid ${C.borderLight}` }}>{comp.dist}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Bar */}
      <div
        style={{
          padding: '14px 20px',
          background: 'rgba(30,41,59,0.6)',
          borderTop: `1px solid ${C.borderLight}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', gap: 32 }}>
          <div>
            <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>AVG $/SF</div>
            <div style={{ fontSize: 16, color: C.amber, fontFamily: fontMono, fontWeight: 700 }}>{fmt.psf(avgPsf)}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>AVG PRICE</div>
            <div style={{ fontSize: 16, color: C.green, fontFamily: fontMono, fontWeight: 700 }}>{fmt.money(avgPrice)}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>AVG CAP</div>
            <div style={{ fontSize: 16, color: C.accentLight, fontFamily: fontMono, fontWeight: 700 }}>{avgCap.toFixed(1)}%</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: C.textDim }}>
          <span style={{ color: C.text, fontWeight: 600 }}>{MOCK_COMPS.length}</span> Comparable Sales
        </div>
      </div>
    </div>
  );
}
