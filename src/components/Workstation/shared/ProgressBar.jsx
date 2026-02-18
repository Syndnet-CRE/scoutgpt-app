import { useTheme } from '../../../theme.jsx';

function autoColor(t, value) {
  if (value <= 30) return t.accent.green;
  if (value <= 50) return t.semantic.warning;
  return t.semantic.error;
}

export default function ProgressBar({ value, label, showValue = true, color, max = 100 }) {
  const { t } = useTheme();
  const pct = Math.min(Math.max((value ?? 0) / max * 100, 0), 100);
  const fill = color || autoColor(t, pct);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          {label && (
            <span style={{ fontSize: 11, color: t.text.secondary, fontFamily: t.font.display }}>
              {label}
            </span>
          )}
          {showValue && (
            <span style={{ fontSize: 11, fontWeight: 600, color: t.text.primary, fontFamily: t.font.mono }}>
              {value != null ? `${Math.round(pct)}%` : '\u2014'}
            </span>
          )}
        </div>
      )}
      <div style={{
        height: 6,
        borderRadius: 3,
        background: t.bg.tertiary,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 3,
          background: fill,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
}
