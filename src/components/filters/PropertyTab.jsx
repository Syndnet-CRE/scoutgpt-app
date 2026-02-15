// ═══════════════════════════════════════════════════════════
// ScoutGPT v2 — Property Tab
// src/components/filters/PropertyTab.jsx
// ═══════════════════════════════════════════════════════════

import { Building2, Ruler, Calendar, Layers } from 'lucide-react';
import MultiSelect from './shared/MultiSelect';
import MinMaxInput from './shared/MinMaxInput';
import Dropdown from './shared/Dropdown';
import FilterSection from './shared/FilterSection';
import { ASSET_CLASSES, STORIES_OPTIONS } from '../../services/filterAPI';

export default function PropertyTab({ filters, setFilter, toggleArrayFilter }) {
  return (
    <div>
      <FilterSection title="Asset Class" icon={Building2}>
        <MultiSelect
          options={ASSET_CLASSES}
          selected={filters.assetClass}
          onToggle={(id) => toggleArrayFilter('assetClass', id)}
          columns={3}
        />
      </FilterSection>

      <FilterSection title="Lot Size" icon={Ruler}>
        <MinMaxInput
          minValue={filters.lotSizeMin}
          maxValue={filters.lotSizeMax}
          onMinChange={(v) => setFilter('lotSizeMin', v)}
          onMaxChange={(v) => setFilter('lotSizeMax', v)}
          minPlaceholder="Min"
          maxPlaceholder="Max"
          suffix="ac"
        />
      </FilterSection>

      <FilterSection title="Building Size" icon={Building2}>
        <MinMaxInput
          minValue={filters.buildingSizeMin}
          maxValue={filters.buildingSizeMax}
          onMinChange={(v) => setFilter('buildingSizeMin', v)}
          onMaxChange={(v) => setFilter('buildingSizeMax', v)}
          minPlaceholder="Min"
          maxPlaceholder="Max"
          suffix="sqft"
        />
      </FilterSection>

      <FilterSection title="Year Built" icon={Calendar}>
        <MinMaxInput
          minValue={filters.yearBuiltMin}
          maxValue={filters.yearBuiltMax}
          onMinChange={(v) => setFilter('yearBuiltMin', v)}
          onMaxChange={(v) => setFilter('yearBuiltMax', v)}
          minPlaceholder="1900"
          maxPlaceholder="2024"
        />
      </FilterSection>

      <FilterSection title="Stories" icon={Layers}>
        <Dropdown
          value={filters.stories}
          options={STORIES_OPTIONS}
          onChange={(v) => setFilter('stories', v)}
          placeholder="Any"
        />
      </FilterSection>
    </div>
  );
}
