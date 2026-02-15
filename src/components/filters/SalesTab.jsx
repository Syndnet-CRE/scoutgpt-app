// ═══════════════════════════════════════════════════════════
// ScoutGPT v2 — Sales Tab
// src/components/filters/SalesTab.jsx
// ═══════════════════════════════════════════════════════════

import { Clock, DollarSign, Filter } from 'lucide-react';
import Dropdown from './shared/Dropdown';
import MinMaxInput from './shared/MinMaxInput';
import Toggle from './shared/Toggle';
import FilterSection from './shared/FilterSection';
import { SOLD_WITHIN_OPTIONS } from '../../services/filterAPI';

export default function SalesTab({ filters, setFilter }) {
  return (
    <div>
      <FilterSection title="Recent Sales" icon={Clock}>
        <Dropdown
          label="Sold Within"
          value={filters.soldWithinDays}
          options={SOLD_WITHIN_OPTIONS}
          onChange={(v) => setFilter('soldWithinDays', v)}
          placeholder="Any time"
        />
      </FilterSection>

      <FilterSection title="Sale Price" icon={DollarSign}>
        <MinMaxInput
          minValue={filters.salePriceMin}
          maxValue={filters.salePriceMax}
          onMinChange={(v) => setFilter('salePriceMin', v)}
          onMaxChange={(v) => setFilter('salePriceMax', v)}
          minPlaceholder="Min"
          maxPlaceholder="Max"
          prefix="$"
        />
      </FilterSection>

      <FilterSection title="Sale Type" icon={Filter}>
        <Toggle
          label="Arms Length Only"
          description="Exclude non-market transactions"
          checked={filters.armsLengthOnly}
          onChange={(v) => setFilter('armsLengthOnly', v)}
        />
        <Toggle
          label="Investor Purchases Only"
          description="Corporate or LLC buyers"
          checked={filters.investorOnly}
          onChange={(v) => setFilter('investorOnly', v)}
        />
        <Toggle
          label="Distressed Sales Only"
          description="Foreclosure, short sale, REO"
          checked={filters.distressedSalesOnly}
          onChange={(v) => setFilter('distressedSalesOnly', v)}
        />
      </FilterSection>
    </div>
  );
}
