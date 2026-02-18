import { Search } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../theme';

export default function Header() {
  const { t } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header
      style={{
        height: 48,
        minHeight: 48,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: t.bg.primary,
        borderBottom: `1px solid ${t.border.subtle}`,
        zIndex: 60,
        flexShrink: 0,
        fontFamily: t.font.display,
      }}
    >
      {/* Left section — logo placeholder */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 160 }}>
        <span style={{
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: t.text.primary,
        }}>
          Scout
          <span style={{ color: t.accent.primary }}>GPT</span>
        </span>
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          color: t.text.quaternary,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          v2
        </span>
      </div>

      {/* Center — Search bar */}
      <div style={{
        flex: 1,
        maxWidth: 480,
        margin: '0 24px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 12px',
          height: 32,
          borderRadius: 8,
          background: searchFocused ? t.bg.secondary : t.bg.secondary,
          border: `1px solid ${searchFocused ? t.accent.primaryBorder : t.border.default}`,
          transition: 'border-color 0.15s ease',
        }}>
          <Search size={14} style={{ color: t.text.tertiary, flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search properties by address, APN, or owner..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 13,
              fontFamily: t.font.display,
              color: t.text.primary,
              '::placeholder': { color: t.text.tertiary },
            }}
          />
        </div>
      </div>

      {/* Right section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 160, justifyContent: 'flex-end' }} />
    </header>
  );
}
