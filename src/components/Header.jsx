import { Search } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../theme';

export default function Header() {
  const { t, isDark } = useTheme();
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
      {/* Left section — Parcyl.ai logo */}
      <div style={{ display: 'flex', alignItems: 'center', minWidth: 160 }}>
        <img
          src={isDark ? '/parcyl-logo-light.png' : '/parcyl-logo-dark.png'}
          alt="Parcyl.ai"
          style={{ height: 28 }}
        />
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
            }}
          />
        </div>
      </div>

      {/* Right section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 160, justifyContent: 'flex-end' }} />
    </header>
  );
}
