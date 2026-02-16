// ═══════════════════════════════════════════════════════════
// ScoutGPT v2 — Filter Panel
// src/components/filters/FilterPanel.jsx
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import {
  Building2, Users, TrendingUp, DollarSign, AlertTriangle,
  MapPin, Zap, UserCheck, Landmark, Wrench, X, Loader2
} from 'lucide-react';
import { useTheme } from '../../theme.jsx';
import PropertyTab from './PropertyTab';
import OwnershipTab from './OwnershipTab';
import SalesTab from './SalesTab';
import FinancialTab from './FinancialTab';
import RiskTab from './RiskTab';
import ComingSoonTab from './ComingSoonTab';

const TABS = [
  { id: 'property', label: 'Property', icon: Building2, active: true },
  { id: 'ownership', label: 'Ownership', icon: Users, active: true },
  { id: 'sales', label: 'Sales', icon: TrendingUp, active: true },
  { id: 'financial', label: 'Financial', icon: DollarSign, active: true },
  { id: 'risk', label: 'Risk', icon: AlertTriangle, active: true },
  { id: 'location', label: 'Location', icon: MapPin, active: false },
  { id: 'infrastructure', label: 'Infra', icon: Zap, active: false },
  { id: 'tenants', label: 'Tenants', icon: UserCheck, active: false },
  { id: 'capital', label: 'Capital', icon: Landmark, active: false },
  { id: 'building', label: 'Building', icon: Wrench, active: false },
];

export default function FilterPanel({
  filters,
  setFilter,
  toggleArrayFilter,
  clearFilters,
  count,
  hasActiveFilters,
  loading,
  error,
}) {
  const { t } = useTheme();
  const [activeTab, setActiveTab] = useState('property');
  const [hoveredTab, setHoveredTab] = useState(null);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'property':
        return <PropertyTab filters={filters} setFilter={setFilter} toggleArrayFilter={toggleArrayFilter} />;
      case 'ownership':
        return <OwnershipTab filters={filters} setFilter={setFilter} toggleArrayFilter={toggleArrayFilter} />;
      case 'sales':
        return <SalesTab filters={filters} setFilter={setFilter} />;
      case 'financial':
        return <FinancialTab filters={filters} setFilter={setFilter} />;
      case 'risk':
        return <RiskTab filters={filters} setFilter={setFilter} toggleArrayFilter={toggleArrayFilter} />;
      case 'location':
      case 'infrastructure':
      case 'tenants':
      case 'capital':
      case 'building':
        return <ComingSoonTab tabKey={activeTab} />;
      default:
        return null;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      fontFamily: t.font.display,
    }}>
      {/* Result count header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${t.border.subtle}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {loading ? (
            <Loader2 size={14} style={{ color: t.accent.green, animation: 'spin 1s linear infinite' }} />
          ) : (
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: hasActiveFilters ? t.accent.green : t.text.quaternary,
            }} />
          )}
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: t.text.primary,
          }}>
            {count !== null ? (
              <>
                {count.toLocaleString()} {count === 1 ? 'property' : 'properties'}
              </>
            ) : (
              'Set filters to search'
            )}
          </span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              fontSize: 11,
              fontWeight: 500,
              color: t.text.tertiary,
              background: 'transparent',
              border: `1px solid ${t.border.default}`,
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.color = t.text.primary;
              e.target.style.borderColor = t.border.strong;
            }}
            onMouseLeave={(e) => {
              e.target.style.color = t.text.tertiary;
              e.target.style.borderColor = t.border.default;
            }}
          >
            <X size={12} />
            Clear All
          </button>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div style={{
          padding: '8px 16px',
          background: 'rgba(255, 69, 58, 0.1)',
          borderBottom: `1px solid rgba(255, 69, 58, 0.2)`,
          fontSize: 12,
          color: '#FF453A',
        }}>
          {error}
        </div>
      )}

      {/* Tab navigation */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 4,
        padding: '12px 16px',
        borderBottom: `1px solid ${t.border.subtle}`,
        flexShrink: 0,
      }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isHovered = hoveredTab === tab.id;
          const isDisabled = !tab.active;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 10px',
                fontSize: 11,
                fontWeight: 500,
                fontFamily: t.font.display,
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                border: isActive
                  ? `1px solid ${t.accent.green}`
                  : `1px solid ${isHovered ? t.border.strong : t.border.default}`,
                background: isActive
                  ? t.accent.greenMuted
                  : isHovered
                    ? t.bg.tertiary
                    : 'transparent',
                color: isActive
                  ? t.accent.green
                  : isDisabled
                    ? t.text.quaternary
                    : t.text.secondary,
                opacity: isDisabled && !isActive ? 0.6 : 1,
              }}
            >
              <Icon size={12} />
              {tab.label}
              {isDisabled && (
                <span style={{
                  fontSize: 8,
                  padding: '1px 3px',
                  borderRadius: 2,
                  background: t.bg.tertiary,
                  color: t.text.quaternary,
                  marginLeft: 2,
                }}>
                  SOON
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        padding: '0 16px',
      }} className="scout-scroll">
        {renderTabContent()}
      </div>

      {/* Spin animation */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
