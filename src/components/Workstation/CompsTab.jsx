import React from 'react';
import { useTheme } from '../../theme.jsx';

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
// COMPS TAB
// ══════════════════════════════════════════════════════════════════════════════

export default function CompsTab({ data }) {
  const { t } = useTheme();

  // Subject property info - use correct camelCase API field names
  const address = data?.addressFull || 'Subject Property';
  const buildingSf = data?.areaBuilding;
  const lotAcres = data?.areaLotAcres;
  const propertyType = data?.propertyUseStandardized || data?.propertyUseGroup || 'Property';

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
          background: t.accent.greenMuted,
          borderBottom: `1px solid ${t.accent.greenBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: t.accent.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
              Subject Property
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.text.primary }}>{address}</div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: t.text.tertiary, textTransform: 'uppercase' }}>SF</div>
              <div style={{ fontSize: 13, color: t.text.primary, fontFamily: t.font.mono }}>{fmt.sf(buildingSf)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: t.text.tertiary, textTransform: 'uppercase' }}>Lot</div>
              <div style={{ fontSize: 13, color: t.text.primary, fontFamily: t.font.mono }}>{fmt.ac(lotAcres)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: t.text.tertiary, textTransform: 'uppercase' }}>Type</div>
              <div style={{ fontSize: 13, color: t.accent.green }}>{propertyType}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: `1px solid ${t.border.strong}`,
              borderRadius: 6,
              color: t.text.secondary,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: t.font.display,
              cursor: 'pointer',
            }}
          >
            Adjust Criteria
          </button>
          <button
            style={{
              padding: '8px 16px',
              background: t.accent.green,
              border: 'none',
              borderRadius: 6,
              color: t.text.primary,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: t.font.display,
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
            fontFamily: t.font.display,
          }}
        >
          <thead>
            <tr
              style={{
                background: t.bg.secondary,
                position: 'sticky',
                top: 0,
                zIndex: 1,
              }}
            >
              <th style={{ padding: '12px 16px', textAlign: 'left', color: t.text.tertiary, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${t.border.strong}` }}>#</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: t.text.tertiary, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${t.border.strong}` }}>Address</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: t.text.tertiary, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${t.border.strong}` }}>Sale Price</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: t.text.tertiary, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${t.border.strong}` }}>Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: t.text.tertiary, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${t.border.strong}` }}>$/SF</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: t.text.tertiary, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${t.border.strong}` }}>Size (SF)</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: t.text.tertiary, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${t.border.strong}` }}>Lot (ac)</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: t.text.tertiary, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${t.border.strong}` }}>Built</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: t.text.tertiary, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${t.border.strong}` }}>Type</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: t.text.tertiary, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${t.border.strong}` }}>Cap Rate</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: t.text.tertiary, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${t.border.strong}` }}>Dist.</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_COMPS.map((comp, i) => (
              <tr
                key={i}
                style={{
                  background: i % 2 === 0 ? 'transparent' : t.bg.secondary,
                  transition: 'background 0.15s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = t.bg.tertiary}
                onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : t.bg.secondary}
              >
                <td style={{ padding: '12px 16px', color: t.text.tertiary, borderBottom: `1px solid ${t.border.strong}` }}>{i + 1}</td>
                <td style={{ padding: '12px 16px', color: t.text.primary, fontWeight: 500, borderBottom: `1px solid ${t.border.strong}` }}>{comp.address}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: t.semantic.success, fontFamily: t.font.mono, fontWeight: 600, borderBottom: `1px solid ${t.border.strong}` }}>{fmt.money(comp.price)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: t.text.secondary, borderBottom: `1px solid ${t.border.strong}` }}>{fmt.date(comp.date)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: t.semantic.warning, fontFamily: t.font.mono, fontWeight: 600, borderBottom: `1px solid ${t.border.strong}` }}>{fmt.psf(comp.psf)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: t.text.primary, fontFamily: t.font.mono, borderBottom: `1px solid ${t.border.strong}` }}>{fmt.sf(comp.sf)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: t.text.primary, fontFamily: t.font.mono, borderBottom: `1px solid ${t.border.strong}` }}>{fmt.ac(comp.lot)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: t.text.secondary, borderBottom: `1px solid ${t.border.strong}` }}>{comp.yr}</td>
                <td style={{ padding: '12px 16px', color: t.text.secondary, borderBottom: `1px solid ${t.border.strong}` }}>{comp.type}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: t.accent.green, fontFamily: t.font.mono, fontWeight: 500, borderBottom: `1px solid ${t.border.strong}` }}>{comp.cap}%</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: t.text.tertiary, borderBottom: `1px solid ${t.border.strong}` }}>{comp.dist}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Bar */}
      <div
        style={{
          padding: '14px 20px',
          background: t.bg.secondary,
          borderTop: `1px solid ${t.border.strong}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', gap: 32 }}>
          <div>
            <div style={{ fontSize: 10, color: t.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>AVG $/SF</div>
            <div style={{ fontSize: 16, color: t.semantic.warning, fontFamily: t.font.mono, fontWeight: 700 }}>{fmt.psf(avgPsf)}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: t.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>AVG PRICE</div>
            <div style={{ fontSize: 16, color: t.semantic.success, fontFamily: t.font.mono, fontWeight: 700 }}>{fmt.money(avgPrice)}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: t.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>AVG CAP</div>
            <div style={{ fontSize: 16, color: t.accent.green, fontFamily: t.font.mono, fontWeight: 700 }}>{avgCap.toFixed(1)}%</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: t.text.secondary }}>
          <span style={{ color: t.text.primary, fontWeight: 600 }}>{MOCK_COMPS.length}</span> Comparable Sales
        </div>
      </div>
    </div>
  );
}
