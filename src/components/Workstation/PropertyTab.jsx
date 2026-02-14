import React, { useState } from 'react';

// ══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ══════════════════════════════════════════════════════════════════════════════

const C = {
  bg: '#0f172a',
  bgCard: 'rgba(30,41,59,0.5)',
  borderLight: 'rgba(51,65,85,0.5)',
  borderAccent: 'rgba(99,102,241,0.3)',
  accent: '#6366f1',
  accentLight: '#a5b4fc',
  text: '#e2e8f0',
  textDim: '#94a3b8',
  textMuted: '#64748b',
  green: '#34d399',
  amber: '#fbbf24',
  red: '#f87171',
};

const font = "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif";
const fontMono = "'JetBrains Mono', 'Fira Code', monospace";

// ══════════════════════════════════════════════════════════════════════════════
// FORMATTERS
// ══════════════════════════════════════════════════════════════════════════════

const fmt = {
  money: v => v == null || v === 0 ? '—' : `$${Number(v).toLocaleString()}`,
  sf: v => v == null ? '—' : `${Number(v).toLocaleString()} SF`,
  ac: v => v == null ? '—' : `${Number(v).toFixed(2)} ac`,
  pct: v => v == null ? '—' : `${Number(v).toFixed(1)}%`,
  num: v => v == null ? '—' : Number(v).toLocaleString(),
  text: v => v == null || v === '' ? '—' : v,
};

// ══════════════════════════════════════════════════════════════════════════════
// HELPER: get value with fallback
// ══════════════════════════════════════════════════════════════════════════════

const get = (obj, ...keys) => {
  if (!obj) return null;
  for (const k of keys) {
    if (obj[k] != null && obj[k] !== '') return obj[k];
  }
  return null;
};

// ══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

const DataRow = ({ label, value }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '8px 0',
      borderBottom: `1px solid ${C.borderLight}`,
    }}
  >
    <span style={{ color: C.textDim, fontSize: 13 }}>{label}</span>
    <span style={{ color: '#f1f5f9', fontSize: 13, fontFamily: fontMono }}>{value}</span>
  </div>
);

const SectionHeader = ({ children }) => (
  <div
    style={{
      fontSize: 11,
      fontWeight: 700,
      color: C.accent,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      padding: '12px 0 8px',
      borderBottom: `1px solid ${C.borderAccent}`,
      marginTop: 16,
    }}
  >
    {children}
  </div>
);

const Badge = ({ children, color = 'slate' }) => {
  const colors = {
    slate: { bg: 'rgba(100,116,139,0.2)', text: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
    purple: { bg: 'rgba(139,92,246,0.2)', text: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
    cyan: { bg: 'rgba(34,211,238,0.2)', text: '#22d3ee', border: 'rgba(34,211,238,0.3)' },
    amber: { bg: 'rgba(251,191,36,0.2)', text: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
    green: { bg: 'rgba(52,211,153,0.2)', text: '#34d399', border: 'rgba(52,211,153,0.3)' },
  };
  const c = colors[color] || colors.slate;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 8px',
        borderRadius: 4,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {children}
    </span>
  );
};

const PlaceholderContent = ({ icon, title }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: 200,
      color: C.textMuted,
      gap: 12,
    }}
  >
    <span style={{ fontSize: 32, opacity: 0.5 }}>{icon}</span>
    <span style={{ fontSize: 14 }}>{title}</span>
    <span style={{ fontSize: 12, opacity: 0.6 }}>Content populated from live API</span>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// OVERVIEW SUB-TAB
// ══════════════════════════════════════════════════════════════════════════════

const OverviewSubTab = ({ data }) => {
  const type = get(data, 'propertyUseStandardized', 'property_use_standardized', 'propertyUseGroup', 'property_use_group', 'propertyType');
  const yearBuilt = get(data, 'yearBuilt', 'year_built');
  const buildingSf = get(data, 'areaBuilding', 'area_building', 'buildingArea');
  const lotAc = get(data, 'areaLotAcres', 'area_lot_acres', 'lotSize');
  const lotSf = get(data, 'areaLotSf', 'area_lot_sf');
  const stories = get(data, 'storiesCount', 'stories_count', 'stories');
  const buildings = get(data, 'buildingsCount', 'buildings_count', 'buildings');
  const units = get(data, 'unitsCount', 'units_count', 'units');
  const zoning = get(data, 'zoning');
  const construction = get(data, 'constructionType', 'construction_type');
  const exterior = get(data, 'exteriorWalls', 'exterior_walls');
  const foundation = get(data, 'foundation');
  const roof = get(data, 'roofMaterial', 'roof_material', 'roofType', 'roof_type');
  const hvacCooling = get(data, 'hvacCooling', 'hvac_cooling');
  const hvacHeating = get(data, 'hvacHeating', 'hvac_heating');
  const pool = get(data, 'hasPool', 'has_pool', 'pool');
  const parking = get(data, 'parkingSpaces', 'parking_spaces');
  const elevator = get(data, 'hasElevator', 'has_elevator', 'elevator');
  const beds = get(data, 'bedroomsCount', 'bedrooms_count');
  const baths = get(data, 'bathCount', 'bath_count');

  const lotDisplay = lotAc ? fmt.ac(lotAc) : lotSf ? fmt.sf(lotSf) : '—';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
      {/* Key Stats Column */}
      <div>
        <SectionHeader>Key Stats</SectionHeader>
        <DataRow label="Property Type" value={fmt.text(type)} />
        <DataRow label="Year Built" value={fmt.text(yearBuilt)} />
        <DataRow label="Building SF" value={fmt.sf(buildingSf)} />
        <DataRow label="Lot Size" value={lotDisplay} />
        <DataRow label="Stories" value={fmt.text(stories)} />
        <DataRow label="Buildings" value={fmt.text(buildings)} />
        <DataRow label="Units" value={fmt.text(units)} />
        <DataRow label="Bedrooms" value={fmt.text(beds)} />
        <DataRow label="Bathrooms" value={fmt.text(baths)} />
        <DataRow label="Zoning" value={fmt.text(zoning)} />
      </div>

      {/* Structure Column */}
      <div>
        <SectionHeader>Structure & Amenities</SectionHeader>
        <DataRow label="Construction" value={fmt.text(construction)} />
        <DataRow label="Exterior Walls" value={fmt.text(exterior)} />
        <DataRow label="Foundation" value={fmt.text(foundation)} />
        <DataRow label="Roof" value={fmt.text(roof)} />
        <DataRow label="HVAC Cooling" value={fmt.text(hvacCooling)} />
        <DataRow label="HVAC Heating" value={fmt.text(hvacHeating)} />
        <DataRow label="Parking Spaces" value={fmt.text(parking)} />
        <DataRow label="Pool" value={pool === true || pool === 'Yes' ? 'Yes' : pool === false ? 'No' : '—'} />
        <DataRow label="Elevator" value={elevator === true || elevator === 'Yes' ? 'Yes' : elevator === false ? 'No' : '—'} />
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// OWNERSHIP SUB-TAB
// ══════════════════════════════════════════════════════════════════════════════

const OwnershipSubTab = ({ data }) => {
  const ownership = data?.ownership || [];
  const owner = ownership[0] || {};

  const ownerName = get(owner, 'owner1NameFull', 'owner1_name_full') ||
    [get(owner, 'owner1NameFirst', 'owner1_name_first'), get(owner, 'owner1NameLast', 'owner1_name_last')].filter(Boolean).join(' ') ||
    get(data, 'owner1Name', 'ownerName') || '—';

  const ownerType = get(owner, 'ownershipType', 'ownership_type', 'ownerType');
  const isCorp = get(owner, 'companyFlag', 'company_flag', 'corporateFlag');
  const isTrust = get(owner, 'trustFlag', 'trust_flag');
  const isAbsentee = get(owner, 'isAbsenteeOwner', 'is_absentee_owner', 'absenteeOwner');
  const mailAddress = get(owner, 'mailAddressFull', 'mail_address_full', 'ownerMailingAddress');
  const transferDate = get(owner, 'ownershipTransferDate', 'ownership_transfer_date');

  return (
    <div>
      <SectionHeader>Owner Information</SectionHeader>
      <div style={{ padding: '16px 0' }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 12 }}>{ownerName}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {isCorp && <Badge color="purple">Corporate</Badge>}
          {isTrust && <Badge color="cyan">Trust</Badge>}
          {isAbsentee && <Badge color="amber">Absentee</Badge>}
          {!isCorp && !isTrust && !isAbsentee && <Badge color="green">Owner Occupied</Badge>}
        </div>
      </div>

      <DataRow label="Owner Type" value={fmt.text(ownerType)} />
      <DataRow label="Transfer Date" value={transferDate ? new Date(transferDate).toLocaleDateString() : '—'} />
      <DataRow label="Mailing Address" value={fmt.text(mailAddress)} />

      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: 'rgba(99,102,241,0.1)',
          borderRadius: 8,
          border: `1px solid ${C.borderAccent}`,
        }}
      >
        <div style={{ fontSize: 12, color: C.accentLight, fontWeight: 500 }}>
          Linked Properties
        </div>
        <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4, fontStyle: 'italic' }}>
          Coming soon - view all properties owned by this entity
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PROPERTY TAB (MAIN)
// ══════════════════════════════════════════════════════════════════════════════

const SUB_TABS = [
  { id: 'overview', label: 'Overview', icon: '🏢' },
  { id: 'ownership', label: 'Ownership', icon: '👤' },
  { id: 'transactions', label: 'Transactions', icon: '🤝' },
  { id: 'financing', label: 'Financing', icon: '💰' },
  { id: 'distress', label: 'Distress', icon: '⚠️' },
  { id: 'valuation', label: 'Valuation', icon: '📊' },
  { id: 'tax', label: 'Tax', icon: '📄' },
  { id: 'permits', label: 'Permits', icon: '🔨' },
  { id: 'risk', label: 'Risk', icon: '🛡️' },
];

export default function PropertyTab({ data }) {
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Extract property info for sidebar
  const address = get(data, 'addressFull', 'address_full', 'propertyAddress') || '—';
  const city = get(data, 'addressCity', 'address_city', 'city');
  const state = get(data, 'addressState', 'address_state', 'state');
  const zip = get(data, 'addressZip', 'address_zip', 'zip');
  const cityStateZip = [city, state].filter(Boolean).join(', ') + (zip ? ` ${zip}` : '');

  const propertyType = get(data, 'propertyUseStandardized', 'property_use_standardized', 'propertyUseGroup', 'property_use_group', 'propertyType') || 'Property';

  // Valuation
  const valuation = data?.valuations?.[0] || data?.valuation;
  const avm = get(valuation, 'estimatedValue', 'estimated_value') || get(data, 'avmValue');
  const taxRecord = data?.taxAssessments?.[0];
  const assessed = get(taxRecord, 'assessedValueTotal', 'assessed_value_total') || get(data, 'assessedValue');
  const market = get(taxRecord, 'marketValueTotal', 'market_value_total') || get(data, 'marketValue');
  const taxBilled = get(taxRecord, 'taxAmountBilled', 'tax_amount_billed') || get(data, 'taxBilled');
  const taxRate = get(data, 'taxRate');

  // Climate
  const climate = data?.climateRisk || data?.climate_risk;
  const climateTotal = get(climate, 'totalRiskScore', 'total_risk_score') || get(data, 'climateRiskTotal');

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return <OverviewSubTab data={data} />;
      case 'ownership':
        return <OwnershipSubTab data={data} />;
      case 'transactions':
        return <PlaceholderContent icon="🤝" title="Transaction History" />;
      case 'financing':
        return <PlaceholderContent icon="💰" title="Financing & Debt" />;
      case 'distress':
        return <PlaceholderContent icon="⚠️" title="Distress Signals" />;
      case 'valuation':
        return <PlaceholderContent icon="📊" title="Valuation & Equity" />;
      case 'tax':
        return <PlaceholderContent icon="📄" title="Tax Profile" />;
      case 'permits':
        return <PlaceholderContent icon="🔨" title="Building Permits" />;
      case 'risk':
        return <PlaceholderContent icon="🛡️" title="Climate & Risk" />;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left Sidebar */}
      <div
        style={{
          width: 250,
          borderRight: `1px solid ${C.borderLight}`,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(15,23,42,0.5)',
          flexShrink: 0,
        }}
      >
        {/* Street View Placeholder */}
        <div
          style={{
            height: 140,
            background: 'linear-gradient(135deg, rgba(30,41,59,0.8), rgba(51,65,85,0.4))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${C.borderLight}`,
            color: C.textMuted,
            fontSize: 12,
          }}
        >
          Street View Coming Soon
        </div>

        {/* Address Block */}
        <div style={{ padding: 16, borderBottom: `1px solid ${C.borderLight}` }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{address}</div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>{cityStateZip}</div>
          <div style={{ marginTop: 10 }}>
            <Badge color="purple">{propertyType}</Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ padding: 16, flex: 1, overflow: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Quick Stats
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: C.textDim }}>AVM</span>
              <span style={{ fontSize: 12, color: C.green, fontFamily: fontMono }}>{fmt.money(avm)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: C.textDim }}>Assessed</span>
              <span style={{ fontSize: 12, color: C.text, fontFamily: fontMono }}>{fmt.money(assessed)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: C.textDim }}>Market</span>
              <span style={{ fontSize: 12, color: C.text, fontFamily: fontMono }}>{fmt.money(market)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: C.textDim }}>Tax Billed</span>
              <span style={{ fontSize: 12, color: C.amber, fontFamily: fontMono }}>{fmt.money(taxBilled)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: C.textDim }}>Tax Rate</span>
              <span style={{ fontSize: 12, color: C.text, fontFamily: fontMono }}>{fmt.pct(taxRate)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: C.textDim }}>Climate Risk</span>
              <span style={{ fontSize: 12, color: climateTotal >= 50 ? C.red : C.green, fontFamily: fontMono }}>
                {climateTotal != null ? `${climateTotal}/100` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ padding: 12, borderTop: `1px solid ${C.borderLight}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            style={{
              padding: '10px 0',
              background: C.accent,
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: font,
              cursor: 'pointer',
            }}
          >
            Save to Deal Room
          </button>
          <button
            style={{
              padding: '10px 0',
              background: 'transparent',
              border: `1px solid ${C.borderLight}`,
              borderRadius: 6,
              color: C.textDim,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: font,
              cursor: 'pointer',
            }}
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Right Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Sub-Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: `1px solid ${C.borderLight}`,
            background: 'rgba(15,23,42,0.3)',
            padding: '0 16px',
            overflowX: 'auto',
            flexShrink: 0,
          }}
        >
          {SUB_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                padding: '12px 16px',
                border: 'none',
                borderBottom: activeSubTab === tab.id ? `2px solid ${C.accent}` : '2px solid transparent',
                background: 'transparent',
                color: activeSubTab === tab.id ? C.text : C.textMuted,
                fontSize: 12,
                fontWeight: 500,
                fontFamily: font,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: 14 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sub-Tab Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {renderSubTabContent()}
        </div>
      </div>
    </div>
  );
}
