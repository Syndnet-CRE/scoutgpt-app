import { useTheme } from '../../../theme.jsx';

export default function MetricCard({ label, value, sub, accent }) {
  const { t } = useTheme();

  return (
    <div style={{
      flex: 1,
      minWidth: 0,
      background: t.bg.secondary,
      border: `1px solid ${t.border.default}`,
      borderRadius: 8,
      padding: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}>
      <span style={{
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: t.text.secondary,
        fontFamily: t.font.display,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 16,
        fontWeight: 800,
        color: t.text.primary,
        fontFamily: t.font.display,
      }}>
        {value ?? '\u2014'}
      </span>
      {sub && (
        <span style={{
          fontSize: 11,
          color: accent ? t.accent.green : t.text.tertiary,
          fontFamily: t.font.display,
        }}>
          {sub}
        </span>
      )}
    </div>
  );
}
