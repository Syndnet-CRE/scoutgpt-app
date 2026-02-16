// ═══════════════════════════════════════════════════════════
// ScoutGPT v2 — Toggle Switch Component
// src/components/filters/shared/Toggle.jsx
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import { useTheme } from '../../../theme.jsx';

export default function Toggle({
  label,
  checked,
  onChange,
  description,
}) {
  const { t } = useTheme();
  const [hovered, setHovered] = useState(false);

  const trackWidth = 36;
  const trackHeight = 20;
  const thumbSize = 16;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0',
        cursor: 'pointer',
      }}
      onClick={() => onChange(!checked)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 13,
          fontWeight: 500,
          color: hovered ? t.text.primary : t.text.secondary,
          transition: 'color 0.15s ease',
        }}>
          {label}
        </div>
        {description && (
          <div style={{
            fontSize: 11,
            color: t.text.tertiary,
            marginTop: 2,
          }}>
            {description}
          </div>
        )}
      </div>
      <div
        style={{
          position: 'relative',
          width: trackWidth,
          height: trackHeight,
          borderRadius: trackHeight / 2,
          background: checked ? t.accent.primary : t.bg.tertiary,
          border: `1px solid ${checked ? t.accent.primary : t.border.default}`,
          transition: 'all 0.2s ease',
          flexShrink: 0,
          marginLeft: 12,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: (trackHeight - thumbSize) / 2 - 1,
            left: checked ? trackWidth - thumbSize - 3 : 2,
            width: thumbSize,
            height: thumbSize,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            transition: 'left 0.2s ease',
          }}
        />
      </div>
    </div>
  );
}
