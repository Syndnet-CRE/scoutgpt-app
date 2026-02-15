import React, { useEffect, useState } from 'react';
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
  dist: v => v == null ? '—' : `${Number(v).toFixed(1)} mi`,
  score: v => v == null ? '—' : `${Math.round(Number(v) * 100)}%`,
  date: v => {
    if (!v) return '—';
    return new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },
};

// Helper to get comp field value (handles both snake_case and camelCase)
const getCompField = (comp, snakeKey, camelKey) => {
  return comp[snakeKey] ?? comp[camelKey];
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPS TAB
// ══════════════════════════════════════════════════════════════════════════════

export default function CompsTab({ data }) {
  const { t } = useTheme();
  const [expandedSearch, setExpandedSearch] = useState(false);

  // Fetch comps from intelligence hook
  const { comps, loading, fetchComps } = useIntelligence(data?.attomId);

  // Auto-fetch comps when component mounts or attomId changes
  useEffect(() => {
    if (data?.attomId) {
      fetchComps({ radius: 3, months: 24, limit: 10 });
      setExpandedSearch(false); // Reset expanded state on property change
    }
  }, [data?.attomId, fetchComps]);

  // Handle expand search
  const handleExpandSearch = () => {
    setExpandedSearch(true);
    fetchComps({ radius: 10, months: 36, limit: 20 });
  };

  // Subject property info - use correct camelCase API field names
  const address = data?.addressFull || 'Subject Property';
  const buildingSf = data?.areaBuilding;
  const lotAcres = data?.areaLotAcres;
  const propertyType = data?.propertyUseStandardized || data?.propertyUseGroup || 'Property';

  // Normalize comps data (handle both array and object with comps property)
  const compsArray = Array.isArray(comps) ? comps : (comps?.comps || []);

  // Calculate averages from real data (handle snake_case API fields)
  const hasComps = compsArray.length > 0;
  const avgPsf = hasComps ? compsArray.reduce((sum, c) => sum + (c.price_per_sf || c.pricePerSf || c.psf || 0), 0) / compsArray.length : 0;
  const avgPrice = hasComps ? compsArray.reduce((sum, c) => sum + (c.sale_price || c.salePrice || c.price || 0), 0) / compsArray.length : 0;
  const avgCap = hasComps ? compsArray.filter(c => c.cap || c.capRate || c.cap_rate).reduce((sum, c, _, arr) => sum + (c.cap || c.capRate || c.cap_rate || 0) / arr.length, 0) : 0;

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
            onClick={handleExpandSearch}
            disabled={expandedSearch || loading.comps}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: `1px solid ${expandedSearch ? t.border.default : t.border.strong}`,
              borderRadius: 6,
              color: expandedSearch ? t.text.quaternary : t.text.secondary,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: t.font.display,
              cursor: expandedSearch ? 'default' : 'pointer',
              opacity: expandedSearch ? 0.6 : 1,
            }}
          >
            {expandedSearch ? 'Search Expanded' : 'Expand Search'}
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
            <span>{expandedSearch ? 'No comparable sales found in expanded search' : 'No comparable sales found'}</span>
            {!expandedSearch && (
              <button
                onClick={handleExpandSearch}
                style={{
                  padding: '8px 16px', background: t.accent.green, border: 'none',
                  borderRadius: 6, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Expand Search (10mi, 36mo)
              </button>
            )}
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
              <th style={{ padding: '12px 12px', textAlign: 'left', color: t.text.tertiary, fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${t.border.strong}` }}>#</th>
              <th style={{ padding: '12px 12px', textAlign: 'left', color: t.text.tertiary, fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${t.border.strong}` }}>Address</th>
              <th style={{ padding: '12px 12px', textAlign: 'right', color: t.text.tertiary, fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${t.border.strong}` }}>Sale Price</th>
              <th style={{ padding: '12px 12px', textAlign: 'right', color: t.text.tertiary, fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${t.border.strong}` }}>$/SF</th>
              <th style={{ padding: '12px 12px', textAlign: 'right', color: t.text.tertiary, fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${t.border.strong}` }}>SF</th>
              <th style={{ padding: '12px 12px', textAlign: 'right', color: t.text.tertiary, fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${t.border.strong}` }}>Year</th>
              <th style={{ padding: '12px 12px', textAlign: 'right', color: t.text.tertiary, fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${t.border.strong}` }}>Distance</th>
              <th style={{ padding: '12px 12px', textAlign: 'right', color: t.text.tertiary, fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${t.border.strong}` }}>Score</th>
              <th style={{ padding: '12px 12px', textAlign: 'right', color: t.text.tertiary, fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${t.border.strong}` }}>Sale Date</th>
            </tr>
          </thead>
          <tbody>
            {compsArray.map((comp, i) => {
              // Handle both snake_case (API) and camelCase field names
              const address = comp.address_full || comp.addressFull || comp.address || '—';
              const salePrice = comp.sale_price || comp.salePrice || comp.price;
              const pricePerSf = comp.price_per_sf || comp.pricePerSf || comp.psf;
              const areaBuilding = comp.area_building || comp.areaBuilding || comp.sf;
              const yearBuilt = comp.year_built || comp.yearBuilt || comp.yr;
              const distanceMiles = comp.distance_miles || comp.distanceMiles || comp.distance || comp.dist;
              const similarityScore = comp.similarity_score || comp.similarityScore || comp.score;
              const recordingDate = comp.recording_date || comp.recordingDate || comp.saleDate || comp.date;

              return (
                <tr
                  key={comp.attom_id || comp.attomId || i}
                  style={{
                    background: i % 2 === 0 ? 'transparent' : t.bg.secondary,
                    transition: 'background 0.15s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = t.bg.tertiary}
                  onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : t.bg.secondary}
                >
                  <td style={{ padding: '10px 12px', color: t.text.tertiary, borderBottom: `1px solid ${t.border.strong}`, fontSize: 12 }}>{i + 1}</td>
                  <td style={{ padding: '10px 12px', color: t.text.primary, fontWeight: 500, borderBottom: `1px solid ${t.border.strong}`, fontSize: 12, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{address}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: t.semantic.success, fontFamily: t.font.mono, fontWeight: 600, borderBottom: `1px solid ${t.border.strong}`, fontSize: 12 }}>{fmt.money(salePrice)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: t.semantic.warning, fontFamily: t.font.mono, fontWeight: 600, borderBottom: `1px solid ${t.border.strong}`, fontSize: 12 }}>{fmt.psf(pricePerSf)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: t.text.primary, fontFamily: t.font.mono, borderBottom: `1px solid ${t.border.strong}`, fontSize: 12 }}>{fmt.sf(areaBuilding)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: t.text.secondary, borderBottom: `1px solid ${t.border.strong}`, fontSize: 12 }}>{yearBuilt || '—'}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: t.text.tertiary, borderBottom: `1px solid ${t.border.strong}`, fontSize: 12 }}>{fmt.dist(distanceMiles)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: t.accent.green, fontFamily: t.font.mono, fontWeight: 600, borderBottom: `1px solid ${t.border.strong}`, fontSize: 12 }}>{fmt.score(similarityScore)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: t.text.secondary, borderBottom: `1px solid ${t.border.strong}`, fontSize: 12 }}>{fmt.date(recordingDate)}</td>
                </tr>
              );
            })}
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
