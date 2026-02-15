// ═══════════════════════════════════════════════════════════
// ScoutGPT v2 — Risk Tab
// src/components/filters/RiskTab.jsx
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import { AlertTriangle, Gavel, Droplets, Gauge } from 'lucide-react';
import MultiSelect from './shared/MultiSelect';
import Toggle from './shared/Toggle';
import FilterSection from './shared/FilterSection';
import { FORECLOSURE_TYPES } from '../../services/filterAPI';
import { useTheme } from '../../theme.jsx';

export default function RiskTab({ filters, setFilter, toggleArrayFilter }) {
  const { t } = useTheme();

  const inputStyle = {
    width: '100%',
    padding: '8px 10px',
    fontSize: 13,
    fontFamily: t.font.display,
    background: t.bg.secondary,
    border: `1px solid ${t.border.default}`,
    borderRadius: 6,
    color: t.text.primary,
    outline: 'none',
    transition: 'border-color 0.15s ease',
  };

  return (
    <div>
      <FilterSection title="Foreclosure Status" icon={AlertTriangle}>
        <Toggle
          label="Has Foreclosure Filing"
          description="Any active foreclosure notice"
          checked={filters.hasForeclosure}
          onChange={(v) => setFilter('hasForeclosure', v)}
        />
        {filters.hasForeclosure && (
          <>
            <div style={{ marginTop: 8, marginBottom: 12 }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: t.text.secondary,
                marginBottom: 6,
              }}>
                Foreclosure Type
              </label>
              <MultiSelect
                options={FORECLOSURE_TYPES}
                selected={filters.foreclosureType}
                onToggle={(id) => toggleArrayFilter('foreclosureType', id)}
                columns={3}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: t.text.secondary,
                marginBottom: 6,
              }}>
                Filed Within (days)
              </label>
              <input
                type="number"
                value={filters.foreclosureFiledDays}
                onChange={(e) => setFilter('foreclosureFiledDays', e.target.value)}
                placeholder="e.g. 90"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = t.accent.green}
                onBlur={(e) => e.target.style.borderColor = t.border.default}
              />
            </div>
          </>
        )}
      </FilterSection>

      <FilterSection title="Auction" icon={Gavel}>
        <div style={{ marginBottom: 12 }}>
          <label style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 500,
            color: t.text.secondary,
            marginBottom: 6,
          }}>
            Auction Within (days)
          </label>
          <input
            type="number"
            value={filters.auctionWithinDays}
            onChange={(e) => setFilter('auctionWithinDays', e.target.value)}
            placeholder="e.g. 30"
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = t.accent.green}
            onBlur={(e) => e.target.style.borderColor = t.border.default}
          />
        </div>
      </FilterSection>

      <FilterSection title="Risk Scores" icon={Gauge}>
        <div style={{ marginBottom: 12 }}>
          <label style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 500,
            color: t.text.secondary,
            marginBottom: 6,
          }}>
            Minimum Distress Score (0-100)
          </label>
          <input
            type="number"
            value={filters.distressScoreMin}
            onChange={(e) => setFilter('distressScoreMin', e.target.value)}
            placeholder="e.g. 50"
            min="0"
            max="100"
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = t.accent.green}
            onBlur={(e) => e.target.style.borderColor = t.border.default}
          />
        </div>
      </FilterSection>

      <FilterSection title="Flood Risk" icon={Droplets}>
        <Toggle
          label="In Flood Zone"
          description="Property in FEMA flood zone"
          checked={filters.inFloodZone}
          onChange={(v) => setFilter('inFloodZone', v)}
        />
        <div style={{ marginTop: 8 }}>
          <label style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 500,
            color: t.text.secondary,
            marginBottom: 6,
          }}>
            Minimum Flood Risk Score (0-100)
          </label>
          <input
            type="number"
            value={filters.floodRiskMin}
            onChange={(e) => setFilter('floodRiskMin', e.target.value)}
            placeholder="e.g. 25"
            min="0"
            max="100"
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = t.accent.green}
            onBlur={(e) => e.target.style.borderColor = t.border.default}
          />
        </div>
      </FilterSection>
    </div>
  );
}
