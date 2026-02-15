// ═══════════════════════════════════════════════════════════
// ScoutGPT v2 — Ownership Tab
// src/components/filters/OwnershipTab.jsx
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import { Users, Search, MapPin } from 'lucide-react';
import MultiSelect from './shared/MultiSelect';
import Toggle from './shared/Toggle';
import FilterSection from './shared/FilterSection';
import { OWNER_TYPES } from '../../services/filterAPI';
import { useTheme } from '../../theme.jsx';

export default function OwnershipTab({ filters, setFilter, toggleArrayFilter }) {
  const { t } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div>
      <FilterSection title="Owner Type" icon={Users}>
        <MultiSelect
          options={OWNER_TYPES}
          selected={filters.ownerType}
          onToggle={(id) => toggleArrayFilter('ownerType', id)}
          columns={2}
        />
      </FilterSection>

      <FilterSection title="Owner Search" icon={Search}>
        <div style={{ marginBottom: 12 }}>
          <label style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 500,
            color: t.text.secondary,
            marginBottom: 6,
          }}>
            Owner Name
          </label>
          <input
            type="text"
            value={filters.ownerName}
            onChange={(e) => setFilter('ownerName', e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search by name..."
            style={{
              width: '100%',
              padding: '8px 10px',
              fontSize: 13,
              fontFamily: t.font.display,
              background: t.bg.secondary,
              border: `1px solid ${searchFocused ? t.accent.green : t.border.default}`,
              borderRadius: 6,
              color: t.text.primary,
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
          />
          <div style={{
            fontSize: 11,
            color: t.text.tertiary,
            marginTop: 4,
          }}>
            Searches owner names (partial match)
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Owner Location" icon={MapPin}>
        <Toggle
          label="Absentee Owner Only"
          description="Owner mailing address differs from property"
          checked={filters.absenteeOnly}
          onChange={(v) => setFilter('absenteeOnly', v)}
        />
      </FilterSection>
    </div>
  );
}
