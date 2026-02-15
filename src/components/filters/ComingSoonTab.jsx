// ═══════════════════════════════════════════════════════════
// ScoutGPT v2 — Coming Soon Tab
// src/components/filters/ComingSoonTab.jsx
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { useTheme } from '../../theme.jsx';

// Define future filter categories
const COMING_SOON_TABS = {
  location: {
    title: 'Location Filters',
    description: 'Filter by geographic and demographic criteria',
    features: [
      'Neighborhood boundaries',
      'School district ratings',
      'Walk score & transit score',
      'Distance to amenities',
      'Census tract demographics',
      'Opportunity zones',
    ],
  },
  infrastructure: {
    title: 'Infrastructure',
    description: 'Utilities and development potential',
    features: [
      'Water & sewer availability',
      'Electric capacity',
      'Road frontage',
      'Utility easements',
      'Internet/fiber access',
      'Gas line proximity',
    ],
  },
  tenants: {
    title: 'Tenant Data',
    description: 'Occupancy and tenant information',
    features: [
      'Current occupancy status',
      'Lease expiration dates',
      'Tenant credit ratings',
      'Rent roll analysis',
      'Vacancy duration',
      'Section 8 eligibility',
    ],
  },
  capital: {
    title: 'Capital Markets',
    description: 'Financing and investment metrics',
    features: [
      'Cap rate estimates',
      'Recent debt placements',
      'Lender preferences',
      'Interest rate assumptions',
      'Refinance potential',
      'Cash-on-cash projections',
    ],
  },
  building: {
    title: 'Building Details',
    description: 'Physical characteristics and condition',
    features: [
      'Construction type',
      'Roof condition & age',
      'HVAC system type',
      'Energy efficiency rating',
      'ADA compliance',
      'Parking ratio',
    ],
  },
};

export default function ComingSoonTab({ tabKey }) {
  const { t } = useTheme();
  const [notifyClicked, setNotifyClicked] = useState(false);

  const tab = COMING_SOON_TABS[tabKey];
  if (!tab) return null;

  const handleNotify = () => {
    setNotifyClicked(true);
    // In production, this would trigger an API call to subscribe
    setTimeout(() => setNotifyClicked(false), 3000);
  };

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{
          fontSize: 15,
          fontWeight: 600,
          color: t.text.primary,
          marginBottom: 4,
        }}>
          {tab.title}
        </h3>
        <p style={{
          fontSize: 13,
          color: t.text.tertiary,
          lineHeight: 1.5,
        }}>
          {tab.description}
        </p>
      </div>

      {/* Feature list */}
      <div style={{
        background: t.bg.secondary,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: t.text.tertiary,
          marginBottom: 10,
        }}>
          Planned Features
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tab.features.map((feature, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                color: t.text.secondary,
              }}
            >
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: t.accent.green,
                opacity: 0.5,
              }} />
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Notify button */}
      <button
        onClick={handleNotify}
        disabled={notifyClicked}
        style={{
          width: '100%',
          padding: '10px 16px',
          fontSize: 13,
          fontWeight: 500,
          fontFamily: t.font.display,
          background: notifyClicked ? t.accent.greenMuted : 'transparent',
          border: `1px solid ${notifyClicked ? t.accent.green : t.border.default}`,
          borderRadius: 8,
          color: notifyClicked ? t.accent.green : t.text.secondary,
          cursor: notifyClicked ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'all 0.2s ease',
        }}
      >
        {notifyClicked ? (
          <>
            <Check size={16} />
            We'll notify you!
          </>
        ) : (
          <>
            <Bell size={16} />
            Notify me when available
          </>
        )}
      </button>
    </div>
  );
}
