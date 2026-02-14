import React, { useState } from 'react';

// ══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ══════════════════════════════════════════════════════════════════════════════

const C = {
  bg: '#0f172a',
  bgCard: 'rgba(30,41,59,0.5)',
  bgCardHover: 'rgba(51,65,85,0.4)',
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
  cyan: '#22d3ee',
  purple: '#a78bfa',
};

const font = "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif";
const fontMono = "'JetBrains Mono', 'Fira Code', monospace";

// ══════════════════════════════════════════════════════════════════════════════
// PIPELINE STAGES
// ══════════════════════════════════════════════════════════════════════════════

const STAGES = [
  { id: 'prospect', label: 'Prospect', color: '#94a3b8' },
  { id: 'research', label: 'Research', color: '#6366f1' },
  { id: 'underwriting', label: 'Underwriting', color: '#8b5cf6' },
  { id: 'loi', label: 'LOI', color: '#f59e0b' },
  { id: 'due-diligence', label: 'Due Diligence', color: '#22d3ee' },
  { id: 'closing', label: 'Closing', color: '#34d399' },
];

// ══════════════════════════════════════════════════════════════════════════════
// FORMATTERS
// ══════════════════════════════════════════════════════════════════════════════

const fmt = {
  money: v => v == null || v === 0 ? '—' : `$${Number(v).toLocaleString()}`,
  sf: v => v == null ? '—' : `${Number(v).toLocaleString()} SF`,
  ac: v => v == null ? '—' : `${Number(v).toFixed(2)} ac`,
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
// DEAL TAB
// ══════════════════════════════════════════════════════════════════════════════

export default function DealTab({ data }) {
  const [activeStage, setActiveStage] = useState('research');

  // Property info
  const address = get(data, 'addressFull', 'address_full', 'propertyAddress') || '—';
  const propertyType = get(data, 'propertyUseStandardized', 'property_use_standardized', 'propertyUseGroup', 'property_use_group', 'propertyType') || 'Property';
  const buildingSf = get(data, 'areaBuilding', 'area_building', 'buildingArea');
  const lotAc = get(data, 'areaLotAcres', 'area_lot_acres', 'lotSize');

  const activeIndex = STAGES.findIndex(s => s.id === activeStage);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Pipeline Stages */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: `1px solid ${C.borderLight}`,
            background: 'rgba(15,23,42,0.5)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {STAGES.map((stage, i) => {
              const isActive = stage.id === activeStage;
              const isPast = i < activeIndex;
              const isFuture = i > activeIndex;

              return (
                <React.Fragment key={stage.id}>
                  <button
                    onClick={() => setActiveStage(stage.id)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 8,
                      border: isActive ? `2px solid ${stage.color}` : `1px solid ${C.borderLight}`,
                      background: isActive ? `${stage.color}20` : 'transparent',
                      color: isActive ? stage.color : isPast ? C.text : C.textMuted,
                      fontSize: 12,
                      fontWeight: isActive ? 700 : 500,
                      fontFamily: font,
                      cursor: 'pointer',
                      opacity: isFuture ? 0.5 : 1,
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {stage.label}
                  </button>
                  {i < STAGES.length - 1 && (
                    <div
                      style={{
                        width: 24,
                        height: 2,
                        background: isPast ? C.green : C.borderLight,
                        borderRadius: 1,
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Cards Area */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Property Card */}
            <div
              style={{
                background: C.bgCard,
                borderRadius: 12,
                border: `1px solid ${C.borderLight}`,
                padding: 20,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.accent,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 12,
                }}
              >
                Property
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 8 }}>{address}</div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: 11, color: C.textMuted }}>Type: </span>
                  <span style={{ fontSize: 12, color: C.accentLight }}>{propertyType}</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: C.textMuted }}>SF: </span>
                  <span style={{ fontSize: 12, color: C.text, fontFamily: fontMono }}>{fmt.sf(buildingSf)}</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: C.textMuted }}>Lot: </span>
                  <span style={{ fontSize: 12, color: C.text, fontFamily: fontMono }}>{fmt.ac(lotAc)}</span>
                </div>
              </div>
            </div>

            {/* Asking / Offer Card */}
            <div
              style={{
                background: C.bgCard,
                borderRadius: 12,
                border: `1px solid ${C.borderLight}`,
                padding: 20,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.accent,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 12,
                }}
              >
                Deal Terms
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Asking Price</div>
                  <div style={{ fontSize: 18, color: C.amber, fontFamily: fontMono, fontWeight: 600 }}>TBD</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Your Offer</div>
                  <div style={{ fontSize: 18, color: C.green, fontFamily: fontMono, fontWeight: 600 }}>TBD</div>
                </div>
              </div>
              <button
                style={{
                  marginTop: 16,
                  padding: '8px 16px',
                  background: C.accent,
                  border: 'none',
                  borderRadius: 6,
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: font,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Enter Deal Terms
              </button>
            </div>
          </div>

          {/* Notes Section */}
          <div
            style={{
              marginTop: 20,
              background: C.bgCard,
              borderRadius: 12,
              border: `1px solid ${C.borderLight}`,
              padding: 20,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: C.accent,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 12,
              }}
            >
              Notes
            </div>
            <div
              style={{
                minHeight: 100,
                padding: 12,
                background: 'rgba(15,23,42,0.5)',
                borderRadius: 8,
                border: `1px dashed ${C.borderLight}`,
                color: C.textMuted,
                fontSize: 13,
                fontStyle: 'italic',
              }}
            >
              Click to add notes about this deal...
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div
        style={{
          width: 240,
          borderLeft: `1px solid ${C.borderLight}`,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(15,23,42,0.5)',
          flexShrink: 0,
        }}
      >
        {/* Action Buttons */}
        <div style={{ padding: 16, borderBottom: `1px solid ${C.borderLight}` }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: C.accent,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 12,
            }}
          >
            Actions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Save Deal', primary: true },
              { label: 'Share with Team', primary: false },
              { label: 'Export PDF', primary: false },
              { label: 'Run Analysis', primary: false },
              { label: 'Find Comps', primary: false },
            ].map((btn, i) => (
              <button
                key={i}
                style={{
                  padding: '10px 0',
                  background: btn.primary ? C.accent : 'transparent',
                  border: btn.primary ? 'none' : `1px solid ${C.borderLight}`,
                  borderRadius: 6,
                  color: btn.primary ? '#fff' : C.textDim,
                  fontSize: 12,
                  fontWeight: btn.primary ? 600 : 500,
                  fontFamily: font,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div style={{ flex: 1, padding: 16, overflow: 'auto' }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: C.accent,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 12,
            }}
          >
            Activity Log
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { action: 'Deal created', time: 'Just now', color: C.green },
              { action: 'Moved to Research', time: 'Just now', color: C.accent },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: 10,
                  background: 'rgba(30,41,59,0.4)',
                  borderRadius: 6,
                  borderLeft: `3px solid ${item.color}`,
                }}
              >
                <div style={{ fontSize: 12, color: C.text }}>{item.action}</div>
                <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
