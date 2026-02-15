import React, { useState } from 'react';
import { useTheme } from '../../theme.jsx';

// ══════════════════════════════════════════════════════════════════════════════
// FORMATTERS
// ══════════════════════════════════════════════════════════════════════════════

const fmt = {
  money: v => v == null || v === 0 ? '—' : `$${Number(v).toLocaleString()}`,
  sf: v => v == null ? '—' : `${Number(v).toLocaleString()} SF`,
  ac: v => v == null ? '—' : `${Number(v).toFixed(2)} ac`,
};

// ══════════════════════════════════════════════════════════════════════════════
// DEAL TAB
// ══════════════════════════════════════════════════════════════════════════════

export default function DealTab({ data }) {
  const { t } = useTheme();
  const [activeStage, setActiveStage] = useState('research');

  // Pipeline stages using t.charts.neon colors
  const STAGES = [
    { id: 'prospect', label: 'Prospect', color: t.text.secondary },
    { id: 'research', label: 'Research', color: t.charts.neon[0] },
    { id: 'underwriting', label: 'Underwriting', color: t.charts.neon[4] },
    { id: 'loi', label: 'LOI', color: t.charts.neon[1] },
    { id: 'due-diligence', label: 'Due Diligence', color: t.charts.neon[3] },
    { id: 'closing', label: 'Closing', color: t.semantic.success },
  ];

  // Property info - use correct camelCase API field names
  const address = data?.addressFull || '—';
  const propertyType = data?.propertyUseStandardized || data?.propertyUseGroup || 'Property';
  const buildingSf = data?.areaBuilding;
  const lotAc = data?.areaLotAcres;

  const activeIndex = STAGES.findIndex(s => s.id === activeStage);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Pipeline Stages */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: `1px solid ${t.border.strong}`,
            background: t.bg.primary,
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
                      border: isActive ? `2px solid ${stage.color}` : `1px solid ${t.border.strong}`,
                      background: isActive ? t.accent.greenMuted : 'transparent',
                      color: isActive ? stage.color : isPast ? t.text.primary : t.text.tertiary,
                      fontSize: 12,
                      fontWeight: isActive ? 700 : 500,
                      fontFamily: t.font.display,
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
                        background: isPast ? t.semantic.success : t.border.strong,
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
                background: t.bg.secondary,
                borderRadius: 12,
                border: `1px solid ${t.border.strong}`,
                padding: 20,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: t.accent.green,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 12,
                }}
              >
                Property
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: t.text.primary, marginBottom: 8 }}>{address}</div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: 11, color: t.text.tertiary }}>Type: </span>
                  <span style={{ fontSize: 12, color: t.accent.green }}>{propertyType}</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: t.text.tertiary }}>SF: </span>
                  <span style={{ fontSize: 12, color: t.text.primary, fontFamily: t.font.mono }}>{fmt.sf(buildingSf)}</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: t.text.tertiary }}>Lot: </span>
                  <span style={{ fontSize: 12, color: t.text.primary, fontFamily: t.font.mono }}>{fmt.ac(lotAc)}</span>
                </div>
              </div>
            </div>

            {/* Asking / Offer Card */}
            <div
              style={{
                background: t.bg.secondary,
                borderRadius: 12,
                border: `1px solid ${t.border.strong}`,
                padding: 20,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: t.accent.green,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 12,
                }}
              >
                Deal Terms
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: t.text.tertiary, marginBottom: 4 }}>Asking Price</div>
                  <div style={{ fontSize: 18, color: t.semantic.warning, fontFamily: t.font.mono, fontWeight: 600 }}>TBD</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: t.text.tertiary, marginBottom: 4 }}>Your Offer</div>
                  <div style={{ fontSize: 18, color: t.semantic.success, fontFamily: t.font.mono, fontWeight: 600 }}>TBD</div>
                </div>
              </div>
              <button
                style={{
                  marginTop: 16,
                  padding: '8px 16px',
                  background: t.accent.green,
                  border: 'none',
                  borderRadius: 6,
                  color: t.text.primary,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: t.font.display,
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
              background: t.bg.secondary,
              borderRadius: 12,
              border: `1px solid ${t.border.strong}`,
              padding: 20,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: t.accent.green,
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
                background: t.bg.primary,
                borderRadius: 8,
                border: `1px dashed ${t.border.strong}`,
                color: t.text.tertiary,
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
          borderLeft: `1px solid ${t.border.strong}`,
          display: 'flex',
          flexDirection: 'column',
          background: t.bg.primary,
          flexShrink: 0,
        }}
      >
        {/* Action Buttons */}
        <div style={{ padding: 16, borderBottom: `1px solid ${t.border.strong}` }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: t.accent.green,
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
                  background: btn.primary ? t.accent.green : 'transparent',
                  border: btn.primary ? 'none' : `1px solid ${t.border.strong}`,
                  borderRadius: 6,
                  color: btn.primary ? t.text.primary : t.text.secondary,
                  fontSize: 12,
                  fontWeight: btn.primary ? 600 : 500,
                  fontFamily: t.font.display,
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
              color: t.accent.green,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 12,
            }}
          >
            Activity Log
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { action: 'Deal created', time: 'Just now', color: t.semantic.success },
              { action: 'Moved to Research', time: 'Just now', color: t.accent.green },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: 10,
                  background: t.bg.secondary,
                  borderRadius: 6,
                  borderLeft: `3px solid ${item.color}`,
                }}
              >
                <div style={{ fontSize: 12, color: t.text.primary }}>{item.action}</div>
                <div style={{ fontSize: 10, color: t.text.tertiary, marginTop: 2 }}>{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
