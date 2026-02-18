import { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTheme } from '../../theme.jsx';
import WorkstationHeader from './WorkstationHeader.jsx';
import OverviewTab from './tabs/OverviewTab.jsx';
import OwnershipTab from './tabs/OwnershipTab.jsx';
import PhysicalTab from './tabs/PhysicalTab.jsx';
import TaxTab from './tabs/TaxTab.jsx';
import TransactionsTab from './tabs/TransactionsTab.jsx';
import PermitsTab from './tabs/PermitsTab.jsx';
import DistressTab from './tabs/DistressTab.jsx';
import FinancialsTab from './tabs/FinancialsTab.jsx';
import RiskTab from './tabs/RiskTab.jsx';
import LocationTab from './tabs/LocationTab.jsx';
import InfrastructureTab from './tabs/InfrastructureTab.jsx';
import AIInsightsTab from './tabs/AIInsightsTab.jsx';

const TABS = [
  'Overview',
  'Ownership',
  'Financials',
  'Physical',
  'Tax',
  'Location',
  'Infrastructure',
  'Transactions',
  'Distress',
  'Permits',
  'Risk',
  'AI Insights',
];

function TabPlaceholder({ name }) {
  const { t } = useTheme();
  return (
    <div style={{
      padding: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 200,
    }}>
      <span style={{ fontSize: 13, color: t.text.quaternary, fontFamily: t.font.display }}>
        {name} tab coming soon
      </span>
    </div>
  );
}

export default function WorkstationPanel({ isOpen, onClose, propertyData, activeTab, onTabChange, infrastructureData, aiInsights, aiLoading, onGenerateInsights, onOpenChat }) {
  const { t } = useTheme();
  const tabBarRef = useRef(null);
  const activeTabRef = useRef(null);
  const [handleHovered, setHandleHovered] = useState(false);

  const currentTab = activeTab ?? 'Overview';

  useEffect(() => {
    if (activeTabRef.current && tabBarRef.current) {
      const bar = tabBarRef.current;
      const tab = activeTabRef.current;
      const scrollLeft = tab.offsetLeft - bar.offsetWidth / 2 + tab.offsetWidth / 2;
      bar.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [currentTab]);

  const renderTab = () => {
    switch (currentTab) {
      case 'Overview':
        return <OverviewTab data={propertyData} onTabChange={onTabChange} />;
      case 'Ownership':
        return <OwnershipTab data={propertyData} />;
      case 'Physical':
        return <PhysicalTab data={propertyData} />;
      case 'Tax':
        return <TaxTab data={propertyData} />;
      case 'Transactions':
        return <TransactionsTab data={propertyData} />;
      case 'Permits':
        return <PermitsTab data={propertyData} />;
      case 'Distress':
        return <DistressTab data={propertyData} />;
      case 'Financials':
        return <FinancialsTab data={propertyData} />;
      case 'Risk':
        return <RiskTab data={propertyData} />;
      case 'Location':
        return <LocationTab data={propertyData} />;
      case 'Infrastructure':
        return <InfrastructureTab data={propertyData} infrastructureData={infrastructureData} />;
      case 'AI Insights':
        return (
          <AIInsightsTab
            data={propertyData}
            aiInsights={aiInsights}
            aiLoading={aiLoading}
            onGenerateInsights={onGenerateInsights}
            onOpenChat={onOpenChat}
          />
        );
      default:
        return <TabPlaceholder name={currentTab} />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '45vw',
        minWidth: 480,
        maxWidth: 960,
        zIndex: 65,
        background: t.bg.primary,
        borderLeft: `1px solid ${t.border.default}`,
        display: 'flex',
        flexDirection: 'row',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 300ms ease',
        boxShadow: isOpen ? `-4px 0 24px rgba(0,0,0,0.25)` : 'none',
      }}
    >
      {/* Close Handle — left edge */}
      <div
        onClick={onClose}
        onMouseEnter={() => setHandleHovered(true)}
        onMouseLeave={() => setHandleHovered(false)}
        style={{
          width: 28,
          flexShrink: 0,
          background: handleHovered ? t.bg.elevated : t.bg.tertiary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          borderRight: `1px solid ${t.border.default}`,
          transition: 'background 0.15s ease',
        }}
      >
        <ChevronRight size={16} style={{ color: t.text.tertiary }} />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Sticky Header */}
        <WorkstationHeader data={propertyData} onClose={onClose} />

        {/* Sticky Tab Bar */}
        <div
          ref={tabBarRef}
          style={{
            display: 'flex',
            height: 40,
            flexShrink: 0,
            borderBottom: `1px solid ${t.border.default}`,
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollbarWidth: 'none',
            padding: '0 20px',
          }}
        >
          {TABS.map((tab) => {
            const isActive = tab === currentTab;
            return (
              <button
                key={tab}
                ref={isActive ? activeTabRef : undefined}
                onClick={() => onTabChange?.(tab)}
                style={{
                  height: '100%',
                  padding: '0 12px',
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 500,
                  fontFamily: t.font.display,
                  color: isActive ? t.accent.green : t.text.tertiary,
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? `2px solid ${t.accent.green}` : '2px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'color 0.15s ease, border-color 0.15s ease',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>
          {renderTab()}
        </div>
      </div>
    </div>
  );
}
