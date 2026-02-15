import React, { useEffect } from 'react';
import { useTheme } from '../../theme.jsx';
import useIntelligence from '../../hooks/useIntelligence';

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

  // Fetch comps from intelligence hook
  const { comps, loading, fetchComps } = useIntelligence(data?.attomId);

  // Auto-fetch comps when component mounts or attomId changes
  useEffect(() => {
    if (data?.attomId) {
      fetchComps({ radius: 3, months: 24, limit: 10 });
    }
  }, [data?.attomId, fetchComps]);

  // Subject property info - use correct camelCase API field names
  const address = data?.addressFull || 'Subject Property';
  const buildingSf = data?.areaBuilding;
  const lotAcres = data?.areaLotAcres;
  const propertyType = data?.propertyUseStandardized || data?.propertyUseGroup || 'Property';

  // Normalize comps data (handle both array and object with comps property)
  const compsArray = Array.isArray(comps) ? comps : (comps?.comps || []);

  // Calculate averages from real data
  const hasComps = compsArray.length > 0;
  const avgPsf = hasComps ? compsArray.reduce((sum, c) => sum + (c.psf || c.pricePerSf || 0), 0) / compsArray.length : 0;
  const avgPrice = hasComps ? compsArray.reduce((sum, c) => sum + (c.price || c.salePrice || 0), 0) / compsArray.length : 0;
  const avgCap = hasComps ? compsArray.filter(c => c.cap || c.capRate).reduce((sum, c, _, arr) => sum + (c.cap || c.capRate || 0) / arr.length, 0) : 0;

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
        {loading.comps ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', color: t.text.tertiary, fontSize: 13,
          }}>
            Loading comparable sales...
          </div>
        ) : !hasComps ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100%', color: t.text.tertiary, fontSize: 13, gap: 8,
          }}>
            <span>No comparable sales found</span>
            <button
              onClick={() => fetchComps({ radius: 5, months: 36, limit: 10 })}
              style={{
                padding: '8px 16px', background: t.accent.green, border: 'none',
                borderRadius: 6, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Expand Search
            </button>
          </div>
        ) : (
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
              <th style={{ padding: '12px 16px', textAlign: 'right', color: t.text.tertiary, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${t.border.strong}` }}>Dist.</th>
            </tr>
          </thead>
          <tbody>
            {compsArray.map((comp, i) => (
              <tr
                key={comp.attomId || i}
                style={{
                  background: i % 2 === 0 ? 'transparent' : t.bg.secondary,
                  transition: 'background 0.15s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = t.bg.tertiary}
                onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : t.bg.secondary}
              >
                <td style={{ padding: '12px 16px', color: t.text.tertiary, borderBottom: `1px solid ${t.border.strong}` }}>{i + 1}</td>
                <td style={{ padding: '12px 16px', color: t.text.primary, fontWeight: 500, borderBottom: `1px solid ${t.border.strong}` }}>{comp.address || comp.addressFull || '—'}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: t.semantic.success, fontFamily: t.font.mono, fontWeight: 600, borderBottom: `1px solid ${t.border.strong}` }}>{fmt.money(comp.price || comp.salePrice)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: t.text.secondary, borderBottom: `1px solid ${t.border.strong}` }}>{fmt.date(comp.date || comp.saleDate)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: t.semantic.warning, fontFamily: t.font.mono, fontWeight: 600, borderBottom: `1px solid ${t.border.strong}` }}>{fmt.psf(comp.psf || comp.pricePerSf)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: t.text.primary, fontFamily: t.font.mono, borderBottom: `1px solid ${t.border.strong}` }}>{fmt.sf(comp.sf || comp.areaBuilding)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: t.text.primary, fontFamily: t.font.mono, borderBottom: `1px solid ${t.border.strong}` }}>{fmt.ac(comp.lot || comp.areaLotAcres)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: t.text.secondary, borderBottom: `1px solid ${t.border.strong}` }}>{comp.yr || comp.yearBuilt || '—'}</td>
                <td style={{ padding: '12px 16px', color: t.text.secondary, borderBottom: `1px solid ${t.border.strong}` }}>{comp.type || comp.propertyUseStandardized || '—'}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: t.text.tertiary, borderBottom: `1px solid ${t.border.strong}` }}>{comp.dist || comp.distance || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
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
            <div style={{ fontSize: 16, color: t.accent.green, fontFamily: t.font.mono, fontWeight: 700 }}>{avgCap > 0 ? `${avgCap.toFixed(1)}%` : '—'}</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: t.text.secondary }}>
          <span style={{ color: t.text.primary, fontWeight: 600 }}>{compsArray.length}</span> Comparable Sales
        </div>
      </div>
    </div>
  );
}
