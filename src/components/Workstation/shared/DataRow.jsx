import { useTheme } from '../../../theme.jsx';

export default function DataRow({ label, value, accent, mono = false }) {
  const { t } = useTheme();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '3px 0',
      borderBottom: `1px solid ${t.border.subtle}`,
      gap: 16,
    }}>
      <span style={{
        fontSize: 12,
        color: t.text.secondary,
        fontFamily: t.font.display,
        flexShrink: 0,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 13,
        fontWeight: 600,
        color: accent ? t.accent.green : t.text.primary,
        fontFamily: mono ? t.font.mono : t.font.display,
        textAlign: 'right',
      }}>
        {value ?? '\u2014'}
      </span>
    </div>
  );
}
