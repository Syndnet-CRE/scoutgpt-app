// ══════════════════════════════════════════════════════════════════════════════
// SelectionActionBar — Floating action bar for multi-select mode
// ══════════════════════════════════════════════════════════════════════════════

import { Check, Plus, BarChart3, Save, X } from 'lucide-react';
import { useTheme } from '../theme.jsx';

const SelectionActionBar = ({
  count,
  isMultiSelectMode,
  onSelectMore,
  onCompReport,
  onSave,
  onClear,
  onExitMultiSelect,
}) => {
  const { t } = useTheme();

  if (count === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: t.bg.secondary,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${t.border.default}`,
        borderRadius: '12px',
        padding: '9px 16px',
        boxShadow: '0 -4px 40px rgba(0,0,0,0.45)',
        animation: 'slideUp 0.25s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Count badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          minWidth: '24px',
          height: '24px',
          padding: '0 8px',
          borderRadius: '6px',
          background: `${t.semantic.success}15`,
          border: `1px solid ${t.semantic.success}40`,
        }}
      >
        <span
          style={{
            fontFamily: t.font.mono,
            fontWeight: 700,
            fontSize: '12px',
            color: t.semantic.success,
          }}
        >
          {count}
        </span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: t.text.secondary,
          }}
        >
          {count === 1 ? 'Property' : 'Properties'}
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          width: '1px',
          height: '22px',
          background: t.border.subtle,
        }}
      />

      {/* Select More / Done button */}
      <button
        onClick={isMultiSelectMode ? onExitMultiSelect : onSelectMore}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '6px 12px',
          borderRadius: '6px',
          border: `1px solid ${t.semantic.success}30`,
          background: `${t.semantic.success}15`,
          color: t.semantic.success,
          fontSize: '11px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        {isMultiSelectMode ? (
          <>
            <Check size={12} />
            Done
          </>
        ) : (
          <>
            <Plus size={12} />
            Select More
          </>
        )}
      </button>

      {/* Divider */}
      <div
        style={{
          width: '1px',
          height: '22px',
          background: t.border.subtle,
        }}
      />

      {/* Comp Report */}
      <button
        onClick={onCompReport}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '6px 12px',
          borderRadius: '6px',
          border: 'none',
          background: t.accent.primaryMuted,
          color: t.accent.primary,
          fontSize: '11px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <BarChart3 size={12} />
        Comp Report
      </button>

      {/* Save Group */}
      <button
        onClick={onSave}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '6px 12px',
          borderRadius: '6px',
          border: 'none',
          background: t.accent.primaryMuted,
          color: t.accent.primary,
          fontSize: '11px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <Save size={12} />
        Save Group
      </button>

      {/* Clear */}
      <button
        onClick={onClear}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '6px 12px',
          borderRadius: '6px',
          border: 'none',
          background: `${t.semantic.error}06`,
          color: t.semantic.error,
          fontSize: '11px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <X size={12} />
        Clear
      </button>
    </div>
  );
};

// CounterBadge — Compact selection counter
const CounterBadge = ({ count, onClick }) => {
  const { t } = useTheme();

  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '24px',
        background: t.bg.secondary,
        border: `1px solid ${t.semantic.success}40`,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      <Check size={12} style={{ color: t.semantic.success }} />
      <span
        style={{
          fontFamily: t.font.mono,
          fontWeight: 700,
          fontSize: '12px',
          color: t.text.primary,
        }}
      >
        {count}
      </span>
      <span
        style={{
          fontSize: '11px',
          fontWeight: 500,
          color: t.text.tertiary,
        }}
      >
        selected
      </span>
    </button>
  );
};

export { SelectionActionBar, CounterBadge };
