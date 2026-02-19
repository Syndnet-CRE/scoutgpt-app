import { useState, useRef, useEffect, useCallback } from 'react';
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

const MIN_WIDTH = 400;
const MAX_WIDTH_RATIO = 0.7;
const HEADER_HEIGHT = 104; // Layout top bar (56px) + nav bar (48px)

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
  const [panelWidth, setPanelWidth] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [handleHovered, setHandleHovered] = useState(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  const currentTab = activeTab ?? 'Overview';

  useEffect(() => {
    if (activeTabRef.current && tabBarRef.current) {
      const bar = tabBarRef.current;
      const tab = activeTabRef.current;
      const scrollLeft = tab.offsetLeft - bar.offsetWidth / 2 + tab.offsetWidth / 2;
      bar.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [currentTab]);

  // Drag resize handlers
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    const currentW = panelWidth || window.innerWidth * 0.45;
    dragStartX.current = e.clientX;
    dragStartWidth.current = currentW;
    setDragging(true);
  }, [panelWidth]);

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e) => {
      const dx = dragStartX.current - e.clientX;
      const maxW = window.innerWidth * MAX_WIDTH_RATIO;
      const newW = Math.min(Math.max(dragStartWidth.current + dx, MIN_WIDTH), maxW);
      setPanelWidth(newW);
    };

    const handleMouseUp = () => {
      setDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  const handleDoubleClick = useCallback(() => {
    onClose?.();
  }, [onClose]);

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

  const widthStyle = panelWidth ? `${panelWidth}px` : '45vw';

  return (
    <>
      {/* Hide scrollbar CSS */}
      <style>{`
        .ws-tab-bar::-webkit-scrollbar { display: none; }
        .scout-scroll::-webkit-scrollbar { width: 6px; }
        .scout-scroll::-webkit-scrollbar-track { background: transparent; }
        .scout-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
        .scout-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }
      `}</style>

      <div
        style={{
          position: 'fixed',
          top: HEADER_HEIGHT,
          right: 0,
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
          width: widthStyle,
          minWidth: MIN_WIDTH,
          maxWidth: '70vw',
          zIndex: 65,
          background: t.bg.primary,
          borderLeft: `1px solid ${t.border.default}`,
          display: 'flex',
          flexDirection: 'row',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: dragging ? 'none' : 'transform 300ms ease',
          boxShadow: isOpen ? `-4px 0 24px rgba(0,0,0,0.25)` : 'none',
          userSelect: dragging ? 'none' : 'auto',
        }}
      >
        {/* Drag Handle — left edge */}
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          onMouseEnter={() => setHandleHovered(true)}
          onMouseLeave={() => setHandleHovered(false)}
          style={{
            width: 8,
            flexShrink: 0,
            background: handleHovered || dragging ? t.border.default : t.bg.tertiary,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'col-resize',
            transition: 'background 150ms ease',
            gap: 4,
          }}
        >
          {/* Three horizontal grip lines */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 16,
                height: 3,
                background: handleHovered || dragging ? t.text.tertiary : t.text.quaternary,
                borderRadius: 2,
                transition: 'background 150ms ease',
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Sticky Header */}
          <WorkstationHeader data={propertyData} onClose={onClose} />

          {/* Sticky Tab Bar */}
          <div
            ref={tabBarRef}
            className="ws-tab-bar"
            style={{
              display: 'flex',
              height: 40,
              flexShrink: 0,
              borderBottom: `1px solid ${t.border.default}`,
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
              padding: '0 12px',
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
                    padding: '8px 12px',
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 500,
                    fontFamily: t.font.display,
                    color: isActive ? t.accent.green : t.text.secondary,
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
          <div
            className="scout-scroll"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            {renderTab()}
          </div>
        </div>
      </div>
    </>
  );
}
