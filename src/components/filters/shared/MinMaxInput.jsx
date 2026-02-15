// ═══════════════════════════════════════════════════════════
// ScoutGPT v2 — Min/Max Input Component
// src/components/filters/shared/MinMaxInput.jsx
// ═══════════════════════════════════════════════════════════

import { useTheme } from '../../../theme.jsx';

export default function MinMaxInput({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minPlaceholder = 'Min',
  maxPlaceholder = 'Max',
  prefix = '',
  suffix = '',
}) {
  const { t } = useTheme();

  const inputStyle = {
    flex: 1,
    minWidth: 0,
    padding: '8px 10px',
    fontSize: 13,
    fontFamily: t.font.display,
    background: t.bg.secondary,
    border: `1px solid ${t.border.default}`,
    borderRadius: 6,
    color: t.text.primary,
    outline: 'none',
    transition: 'border-color 0.15s ease',
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = t.accent.green;
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = t.border.default;
  };

  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 500,
          color: t.text.secondary,
          marginBottom: 6,
        }}>
          {label}
        </label>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          {prefix && (
            <span style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: t.text.tertiary,
              fontSize: 13,
              pointerEvents: 'none',
            }}>
              {prefix}
            </span>
          )}
          <input
            type="number"
            value={minValue}
            onChange={(e) => onMinChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={minPlaceholder}
            style={{
              ...inputStyle,
              paddingLeft: prefix ? 22 : 10,
            }}
          />
        </div>
        <span style={{ color: t.text.quaternary, fontSize: 12 }}>to</span>
        <div style={{ flex: 1, position: 'relative' }}>
          {prefix && (
            <span style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: t.text.tertiary,
              fontSize: 13,
              pointerEvents: 'none',
            }}>
              {prefix}
            </span>
          )}
          <input
            type="number"
            value={maxValue}
            onChange={(e) => onMaxChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={maxPlaceholder}
            style={{
              ...inputStyle,
              paddingLeft: prefix ? 22 : 10,
            }}
          />
          {suffix && (
            <span style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: t.text.tertiary,
              fontSize: 11,
              pointerEvents: 'none',
            }}>
              {suffix}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
