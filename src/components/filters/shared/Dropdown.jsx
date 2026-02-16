// ═══════════════════════════════════════════════════════════
// ScoutGPT v2 — Dropdown Select Component
// src/components/filters/shared/Dropdown.jsx
// ═══════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '../../../theme.jsx';

export default function Dropdown({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select...',
}) {
  const { t } = useTheme();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div style={{ marginBottom: 12 }} ref={ref}>
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
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(!open)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: '100%',
            padding: '8px 32px 8px 10px',
            fontSize: 13,
            fontFamily: t.font.display,
            background: t.bg.secondary,
            border: `1px solid ${open ? t.accent.primary : hovered ? t.border.strong : t.border.default}`,
            borderRadius: 6,
            color: selectedOption ? t.text.primary : t.text.tertiary,
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease',
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronDown
            size={14}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
              color: t.text.tertiary,
              transition: 'transform 0.15s ease',
            }}
          />
        </button>

        {open && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            background: t.bg.secondary,
            border: `1px solid ${t.border.default}`,
            borderRadius: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 100,
            maxHeight: 200,
            overflowY: 'auto',
          }}>
            {/* Clear option */}
            <div
              onClick={() => { onChange(''); setOpen(false); }}
              style={{
                padding: '8px 10px',
                fontSize: 13,
                color: t.text.tertiary,
                cursor: 'pointer',
                borderBottom: `1px solid ${t.border.subtle}`,
              }}
              onMouseEnter={(e) => e.target.style.background = t.bg.tertiary}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              Clear
            </div>
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => { onChange(option.value); setOpen(false); }}
                style={{
                  padding: '8px 10px',
                  fontSize: 13,
                  color: option.value === value ? t.accent.primary : t.text.primary,
                  cursor: 'pointer',
                  background: option.value === value ? t.accent.primaryMuted : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (option.value !== value) e.target.style.background = t.bg.tertiary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = option.value === value ? t.accent.primaryMuted : 'transparent';
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
