// ═══════════════════════════════════════════════════════════
// ScoutGPT v2 — Filter Section Component
// src/components/filters/shared/FilterSection.jsx
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '../../../theme.jsx';

export default function FilterSection({
  title,
  children,
  defaultOpen = true,
  icon: Icon,
}) {
  const { t } = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{
      borderBottom: `1px solid ${t.border.subtle}`,
    }}>
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 0',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: hovered ? t.text.primary : t.text.secondary,
          transition: 'color 0.15s ease',
        }}
      >
        {Icon && <Icon size={14} style={{ color: t.text.tertiary }} />}
        <span style={{
          flex: 1,
          textAlign: 'left',
          fontSize: 12,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontFamily: t.font.display,
        }}>
          {title}
        </span>
        <ChevronDown
          size={14}
          style={{
            color: t.text.tertiary,
            transform: `rotate(${open ? 180 : 0}deg)`,
            transition: 'transform 0.15s ease',
          }}
        />
      </button>
      {open && (
        <div style={{ paddingBottom: 12 }}>
          {children}
        </div>
      )}
    </div>
  );
}
