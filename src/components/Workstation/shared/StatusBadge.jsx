import { useTheme } from '../../../theme.jsx';

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getVariant(t, variant) {
  switch (variant) {
    case 'success': return { bg: hexToRgba(t.semantic.success, 0.12), text: t.semantic.success };
    case 'warning': return { bg: hexToRgba(t.semantic.warning, 0.12), text: t.semantic.warning };
    case 'error':   return { bg: hexToRgba(t.semantic.error, 0.12), text: t.semantic.error };
    case 'info':    return { bg: hexToRgba(t.semantic.info, 0.12), text: t.semantic.info };
    default:        return { bg: t.bg.tertiary, text: t.text.tertiary };
  }
}

export default function StatusBadge({ label, variant = 'neutral' }) {
  const { t } = useTheme();
  const v = getVariant(t, variant);

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: 10,
      padding: '3px 8px',
      fontSize: 11,
      fontWeight: 600,
      fontFamily: t.font.display,
      background: v.bg,
      color: v.text,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}
