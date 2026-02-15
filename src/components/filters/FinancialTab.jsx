// ═══════════════════════════════════════════════════════════
// ScoutGPT v2 — Financial Tab
// src/components/filters/FinancialTab.jsx
// ═══════════════════════════════════════════════════════════

import { Percent, TrendingUp, PiggyBank } from 'lucide-react';
import MinMaxInput from './shared/MinMaxInput';
import Toggle from './shared/Toggle';
import FilterSection from './shared/FilterSection';

export default function FinancialTab({ filters, setFilter }) {
  return (
    <div>
      <FilterSection title="Loan-to-Value (LTV)" icon={Percent}>
        <MinMaxInput
          minValue={filters.ltvMin}
          maxValue={filters.ltvMax}
          onMinChange={(v) => setFilter('ltvMin', v)}
          onMaxChange={(v) => setFilter('ltvMax', v)}
          minPlaceholder="0"
          maxPlaceholder="100"
          suffix="%"
        />
        <Toggle
          label="High LTV Only"
          description="Properties with LTV > 80%"
          checked={filters.highLtvOnly}
          onChange={(v) => setFilter('highLtvOnly', v)}
        />
      </FilterSection>

      <FilterSection title="Equity Position" icon={TrendingUp}>
        <MinMaxInput
          label="Estimated Equity"
          minValue={filters.equityMin}
          maxValue={filters.equityMax}
          onMinChange={(v) => setFilter('equityMin', v)}
          onMaxChange={(v) => setFilter('equityMax', v)}
          minPlaceholder="Min"
          maxPlaceholder="Max"
          prefix="$"
        />
      </FilterSection>
    </div>
  );
}
