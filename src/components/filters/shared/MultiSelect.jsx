// ═══════════════════════════════════════════════════════════
// ScoutGPT v2 — Multi-Select Chips Component
// src/components/filters/shared/MultiSelect.jsx
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import { useTheme } from '../../../theme.jsx';

export default function MultiSelect({
  label,
  options,
  selected = [],
  onToggle,
  columns = 3,
}) {
  const { t } = useTheme();
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 500,
          color: t.text.secondary,
          marginBottom: 8,
        }}>
          {label}
        </label>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 6,
      }}>
        {options.map((option) => {
          const isSelected = selected.includes(option.id);
          const isHovered = hoveredId === option.id;
          const chipColor = option.color || t.accent.green;

          return (
            <button
              key={option.id}
              onClick={() => onToggle(option.id)}
              onMouseEnter={() => setHoveredId(option.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                padding: '5px 6px',
                fontSize: 10,
                fontWeight: 500,
                fontFamily: t.font.display,
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                border: isSelected
                  ? `1px solid ${chipColor}`
                  : `1px solid ${isHovered ? t.border.strong : t.border.default}`,
                background: isSelected
                  ? `${chipColor}20`
                  : isHovered
                    ? t.bg.tertiary
                    : t.bg.secondary,
                color: isSelected ? chipColor : t.text.secondary,
                textAlign: 'center',
                lineHeight: 1.3,
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
