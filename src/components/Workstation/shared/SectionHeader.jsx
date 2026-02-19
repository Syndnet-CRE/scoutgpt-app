import { useTheme } from '../../../theme.jsx';

export default function SectionHeader({ title, count }) {
  const { t } = useTheme();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      paddingBottom: 8,
      borderBottom: `2px solid ${t.accent.green}`,
      marginBottom: 12,
    }}>
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: t.accent.green,
        fontFamily: t.font.display,
      }}>
        {title}
      </span>
      {count != null && (
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          color: t.accent.green,
          background: t.accent.greenMuted,
          borderRadius: 10,
          padding: '2px 7px',
          fontFamily: t.font.display,
        }}>
          {count}
        </span>
      )}
    </div>
  );
}
