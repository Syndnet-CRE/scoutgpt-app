import React, { useState } from 'react';

// ══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ══════════════════════════════════════════════════════════════════════════════

const C = {
  bg: '#0f172a',
  bgCard: 'rgba(30,41,59,0.5)',
  bgRow: 'rgba(30,41,59,0.3)',
  bgRowHover: 'rgba(51,65,85,0.4)',
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
  cyan: '#22d3ee',
};

const font = "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif";
const fontMono = "'JetBrains Mono', 'Fira Code', monospace";

// ══════════════════════════════════════════════════════════════════════════════
// FORMATTERS
// ══════════════════════════════════════════════════════════════════════════════

const fmt = {
  money: v => (v == null || v === 0 || v === '') ? '—' : `$${Number(v).toLocaleString()}`,
  sf: v => (v == null || v === 0 || v === '') ? '—' : `${Number(v).toLocaleString()} SF`,
  ac: v => (v == null || v === 0 || v === '') ? '—' : `${Number(v).toFixed(2)} ac`,
  pct: v => (v == null || v === '') ? '—' : `${Number(v).toFixed(1)}%`,
  num: v => (v == null || v === 0 || v === '') ? '—' : Number(v).toLocaleString(),
  psf: v => (v == null || v === 0 || v === '') ? '—' : `$${Number(v).toFixed(2)}/SF`,
  date: v => {
    if (!v) return '—';
    const d = new Date(v);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },
  text: v => (v == null || v === '') ? '—' : v,
};

const riskColor = (score) => !score ? C.textMuted : score > 70 ? C.red : score > 40 ? C.amber : C.green;

// ══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

const DataRow = ({ label, value, valueColor }) => (
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
    <span style={{ color: valueColor || '#f1f5f9', fontSize: 13, fontFamily: fontMono }}>{value}</span>
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
    red: { bg: 'rgba(248,113,113,0.2)', text: '#f87171', border: 'rgba(248,113,113,0.3)' },
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

const EmptyState = ({ icon, title, subtitle }) => (
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
    <span style={{ fontSize: 14, fontWeight: 500 }}>{title}</span>
    {subtitle && <span style={{ fontSize: 12, opacity: 0.6 }}>{subtitle}</span>}
  </div>
);

const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: C.bgCard,
      borderRadius: 12,
      border: `1px solid ${C.borderLight}`,
      padding: 20,
      ...style,
    }}
  >
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div
    style={{
      fontSize: 10,
      fontWeight: 700,
      color: C.accent,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: 12,
    }}
  >
    {children}
  </div>
);

// Table styles
const thStyle = {
  padding: '12px 16px',
  textAlign: 'left',
  color: C.textMuted,
  fontWeight: 600,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  borderBottom: `1px solid ${C.borderLight}`,
  background: 'rgba(30,41,59,0.6)',
  position: 'sticky',
  top: 0,
  zIndex: 1,
};

const tdStyle = {
  padding: '12px 16px',
  borderBottom: `1px solid ${C.borderLight}`,
  fontSize: 13,
};

// ══════════════════════════════════════════════════════════════════════════════
// OVERVIEW SUB-TAB
// ══════════════════════════════════════════════════════════════════════════════

const OverviewSubTab = ({ data }) => {
  const lotDisplay = data.areaLotAcres ? fmt.ac(data.areaLotAcres) : data.areaLotSf ? fmt.num(data.areaLotSf) + ' SF' : '—';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
      {/* Key Stats Column */}
      <div>
        <SectionHeader>Key Stats</SectionHeader>
        <DataRow label="Property Type" value={fmt.text(data.propertyUseStandardized || data.propertyUseGroup)} />
        <DataRow label="Year Built" value={fmt.text(data.yearBuilt)} />
        <DataRow label="Effective Year" value={fmt.text(data.effectiveYearBuilt)} />
        <DataRow label="Building SF" value={fmt.sf(data.areaBuilding)} />
        <DataRow label="Gross Area" value={fmt.sf(data.grossArea)} />
        <DataRow label="Lot Size (SF)" value={fmt.num(data.areaLotSf)} />
        <DataRow label="Lot Size (Acres)" value={fmt.ac(data.areaLotAcres)} />
        <DataRow label="Stories" value={fmt.text(data.storiesCount)} />
        <DataRow label="Buildings" value={fmt.text(data.buildingsCount)} />
        <DataRow label="Units" value={fmt.text(data.unitsCount)} />
        <DataRow label="Bedrooms" value={fmt.text(data.bedroomsCount)} />
        <DataRow label="Bathrooms" value={fmt.text(data.bathCount)} />
        <DataRow label="Rooms" value={fmt.text(data.roomsCount)} />
        <DataRow label="Zoning" value={fmt.text(data.zoning)} />
        <DataRow label="Census Tract" value={fmt.text(data.censusTract)} />
        <DataRow label="APN" value={fmt.text(data.parcelNumberFormatted)} />
      </div>

      {/* Structure Column */}
      <div>
        <SectionHeader>Structure</SectionHeader>
        <DataRow label="Construction" value={fmt.text(data.constructionType)} />
        <DataRow label="Exterior Walls" value={fmt.text(data.exteriorWalls)} />
        <DataRow label="Interior Walls" value={fmt.text(data.interiorWalls)} />
        <DataRow label="Foundation" value={fmt.text(data.foundation)} />
        <DataRow label="Roof Type" value={fmt.text(data.roofType)} />
        <DataRow label="Roof Material" value={fmt.text(data.roofMaterial)} />
        <DataRow label="Floor Type" value={fmt.text(data.floorType)} />
        <DataRow label="HVAC Cooling" value={fmt.text(data.hvacCooling)} />
        <DataRow label="HVAC Heating" value={fmt.text(data.hvacHeating)} />
        <DataRow label="HVAC Fuel" value={fmt.text(data.hvacFuel)} />
        <DataRow label="Quality Grade" value={fmt.text(data.qualityGrade)} />
        <DataRow label="Condition" value={fmt.text(data.condition)} />

        <SectionHeader>Amenities</SectionHeader>
        <DataRow label="Parking Spaces" value={fmt.text(data.parkingSpaces)} />
        <DataRow label="Garage Type" value={fmt.text(data.garageType)} />
        <DataRow label="Garage Area" value={fmt.sf(data.garageArea)} />
        <DataRow label="Pool" value={data.hasPool ? (data.poolType || 'Yes') : 'No'} />
        <DataRow label="Spa" value={data.hasSpa ? 'Yes' : 'No'} />
        <DataRow label="Elevator" value={data.hasElevator ? 'Yes' : 'No'} />
        <DataRow label="Fireplace" value={data.hasFireplace ? `Yes (${data.fireplaceCount || 1})` : 'No'} />
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// OWNERSHIP SUB-TAB
// ══════════════════════════════════════════════════════════════════════════════

const OwnershipSubTab = ({ data }) => {
  // Extract from nested ownership array
  const owner = data.ownership?.[0] || {};
  const ownerName = owner.owner1NameFull || '—';
  const owner2 = owner.owner2NameFull;

  return (
    <div>
      <SectionHeader>Owner Information</SectionHeader>
      <div style={{ padding: '16px 0' }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 8 }}>{ownerName}</div>
        {owner2 && <div style={{ fontSize: 14, color: C.textDim, marginBottom: 12 }}>{owner2}</div>}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {owner.companyFlag && <Badge color="purple">Corporate</Badge>}
          {owner.trustFlag && <Badge color="cyan">Trust</Badge>}
          {owner.isAbsenteeOwner && <Badge color="amber">Absentee</Badge>}
          {owner.isOwnerOccupied && <Badge color="green">Owner Occupied</Badge>}
        </div>
      </div>

      <DataRow label="Ownership Type" value={fmt.text(owner.ownershipType)} />
      <DataRow label="Owner Occupied" value={owner.isOwnerOccupied ? 'Yes' : (owner.isAbsenteeOwner ? 'No (Absentee)' : '—')} />
      <DataRow label="Transfer Date" value={fmt.date(owner.ownershipTransferDate)} />

      <SectionHeader>Mailing Address</SectionHeader>
      <DataRow label="Address" value={fmt.text(owner.mailAddressFull)} />
      <DataRow label="City/State/Zip" value={owner.mailAddressCity ? `${owner.mailAddressCity}, ${owner.mailAddressState || ''} ${owner.mailAddressZip || ''}` : '—'} />

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
// TRANSACTIONS SUB-TAB
// ══════════════════════════════════════════════════════════════════════════════

const TransactionsSubTab = ({ data }) => {
  const sales = data.salesTransactions || [];

  if (sales.length === 0) {
    return <EmptyState icon="🤝" title="No transaction records found" />;
  }

  return (
    <div style={{ overflow: 'auto', maxHeight: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font }}>
        <thead>
          <tr>
            <th style={thStyle}>Date</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Price</th>
            <th style={thStyle}>Doc Type</th>
            <th style={thStyle}>Grantor</th>
            <th style={thStyle}>Grantee</th>
            <th style={thStyle}>Arms Length</th>
            <th style={thStyle}>Distressed</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale, i) => (
            <tr
              key={i}
              style={{ background: i % 2 === 0 ? 'transparent' : C.bgRow }}
              onMouseEnter={(e) => e.currentTarget.style.background = C.bgRowHover}
              onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : C.bgRow}
            >
              <td style={tdStyle}>{fmt.date(sale.recordingDate)}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: C.green, fontFamily: fontMono, fontWeight: 600 }}>{fmt.money(sale.salePrice)}</td>
              <td style={{ ...tdStyle, color: C.textDim }}>{sale.documentType || '—'}</td>
              <td style={{ ...tdStyle, color: C.text }}>{sale.grantor1NameFull || '—'}</td>
              <td style={{ ...tdStyle, color: C.text }}>{sale.grantee1NameFull || '—'}</td>
              <td style={tdStyle}>{sale.isArmsLength ? <Badge color="green">Yes</Badge> : <Badge color="slate">No</Badge>}</td>
              <td style={tdStyle}>{sale.isDistressed || sale.isForeclosureAuction ? <Badge color="red">Yes</Badge> : <Badge color="slate">No</Badge>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// FINANCING SUB-TAB
// ══════════════════════════════════════════════════════════════════════════════

const FinancingSubTab = ({ data }) => {
  const loans = data.currentLoans || [];

  if (loans.length === 0) {
    return <EmptyState icon="💰" title="No active loan records" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {loans.map((loan, i) => (
        <Card key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>Loan Amount</div>
              <div style={{ fontSize: 24, color: C.green, fontFamily: fontMono, fontWeight: 700 }}>{fmt.money(loan.loanAmount)}</div>
            </div>
            <Badge color="purple">{loan.loanType || loan.mortgageType || 'Loan'}</Badge>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <DataRow label="Lender" value={fmt.text(loan.lenderNameStandardized)} />
            <DataRow label="Interest Rate" value={loan.interestRate ? `${loan.interestRate}% ${loan.interestRateType || ''}` : '—'} />
            <DataRow label="Term" value={loan.loanTerm ? `${loan.loanTerm} months` : '—'} />
            <DataRow label="Due Date" value={fmt.date(loan.dueDate)} />
            <DataRow label="Est. Balance" value={fmt.money(loan.estimatedBalance)} valueColor={C.amber} />
            <DataRow label="Est. Monthly" value={fmt.money(loan.estimatedMonthlyPayment)} />
          </div>
        </Card>
      ))}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// DISTRESS SUB-TAB
// ══════════════════════════════════════════════════════════════════════════════

const DistressSubTab = ({ data }) => {
  const foreclosures = data.foreclosureRecords || [];
  // Extract from nested taxAssessments array for delinquency
  const tax = data.taxAssessments?.[0] || {};
  const taxDelinquent = tax.taxDelinquentYear;
  const distressedSales = (data.salesTransactions || []).filter(s => s.isDistressed || s.isForeclosureAuction);

  const hasDistress = foreclosures.length > 0 || taxDelinquent || distressedSales.length > 0;

  if (!hasDistress) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: 200,
          padding: 32,
          background: 'rgba(52,211,153,0.1)',
          borderRadius: 12,
          border: `1px solid rgba(52,211,153,0.3)`,
        }}
      >
        <span style={{ fontSize: 48, marginBottom: 16 }}>🛡️</span>
        <span style={{ fontSize: 16, fontWeight: 600, color: C.green }}>No distress signals detected</span>
        <span style={{ fontSize: 13, color: C.textDim, marginTop: 8 }}>This property has no foreclosures, tax delinquencies, or distressed sales on record</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Tax Delinquent */}
      {taxDelinquent && (
        <Card style={{ borderColor: 'rgba(248,113,113,0.3)' }}>
          <CardHeader>Tax Delinquency</CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 14, color: C.red, fontWeight: 600 }}>Tax Delinquent Year: {taxDelinquent}</div>
              <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>Property has unpaid taxes from this year</div>
            </div>
          </div>
        </Card>
      )}

      {/* Foreclosure Records */}
      {foreclosures.length > 0 && (
        <div>
          <SectionHeader>Foreclosure Records</SectionHeader>
          <div style={{ overflow: 'auto', marginTop: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font }}>
              <thead>
                <tr>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Recording Date</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Default Amount</th>
                  <th style={thStyle}>Auction Date</th>
                </tr>
              </thead>
              <tbody>
                {foreclosures.map((f, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : C.bgRow }}>
                    <td style={{ ...tdStyle, color: C.red }}>{f.foreclosureType || '—'}</td>
                    <td style={tdStyle}>{fmt.date(f.recordingDate)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontFamily: fontMono, color: C.amber }}>{fmt.money(f.defaultAmount)}</td>
                    <td style={tdStyle}>{fmt.date(f.auctionDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Distressed Sales */}
      {distressedSales.length > 0 && (
        <div>
          <SectionHeader>Distressed Sales History</SectionHeader>
          <div style={{ overflow: 'auto', marginTop: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font }}>
              <thead>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Price</th>
                  <th style={thStyle}>Type</th>
                </tr>
              </thead>
              <tbody>
                {distressedSales.map((s, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : C.bgRow }}>
                    <td style={tdStyle}>{fmt.date(s.recordingDate)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontFamily: fontMono, color: C.amber }}>{fmt.money(s.salePrice)}</td>
                    <td style={tdStyle}>{s.isForeclosureAuction ? <Badge color="red">Foreclosure Auction</Badge> : <Badge color="amber">Distressed</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// VALUATION SUB-TAB
// ══════════════════════════════════════════════════════════════════════════════

const ValuationSubTab = ({ data }) => {
  // Extract nested data
  const valuation = data.valuations?.[0] || {};
  const tax = data.taxAssessments?.[0] || {};
  const avm = valuation.avmValue || valuation.estimatedValue;
  const avmHigh = valuation.avmHigh;
  const avmLow = valuation.avmLow;
  const confidence = valuation.confidenceScore;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {/* AVM Card */}
      <Card>
        <CardHeader>AVM Estimate</CardHeader>
        <div style={{ fontSize: 28, color: C.green, fontFamily: fontMono, fontWeight: 700, marginBottom: 16 }}>
          {fmt.money(avm)}
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Low</div>
            <div style={{ fontSize: 14, color: C.textDim, fontFamily: fontMono }}>{fmt.money(avmLow)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>High</div>
            <div style={{ fontSize: 14, color: C.textDim, fontFamily: fontMono }}>{fmt.money(avmHigh)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Confidence</div>
            <div style={{ fontSize: 14, color: C.accentLight, fontFamily: fontMono }}>{confidence ? `${confidence}/100` : '—'}</div>
          </div>
        </div>
      </Card>

      {/* Assessment Card */}
      <Card>
        <CardHeader>Tax Assessment</CardHeader>
        <DataRow label="Assessed Value" value={fmt.money(tax.assessedValueTotal || data.taxAssessedValueTotal)} valueColor={C.amber} />
        <DataRow label="Market Value" value={fmt.money(tax.marketValueTotal)} />
        <DataRow label="Land Value" value={fmt.money(tax.assessedValueLand || tax.marketValueLand)} />
        <DataRow label="Improvement Value" value={fmt.money(tax.assessedValueImprovements || tax.marketValueImprovements)} />
      </Card>

      {/* Last Sale Card */}
      <Card style={{ gridColumn: 'span 2' }}>
        <CardHeader>Last Sale</CardHeader>
        <div style={{ display: 'flex', gap: 48 }}>
          <div>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Sale Price</div>
            <div style={{ fontSize: 20, color: C.cyan, fontFamily: fontMono, fontWeight: 600 }}>{fmt.money(data.lastSalePrice)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Sale Date</div>
            <div style={{ fontSize: 16, color: C.text, fontFamily: fontMono }}>{fmt.date(data.lastSaleDate)}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// TAX SUB-TAB
// ══════════════════════════════════════════════════════════════════════════════

const TaxSubTab = ({ data }) => {
  // Extract from nested taxAssessments array
  const tax = data.taxAssessments?.[0] || {};

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <Card>
        <CardHeader>Assessment Details</CardHeader>
        <DataRow label="Tax Year" value={fmt.text(tax.taxYear)} />
        <DataRow label="Total Assessed" value={fmt.money(tax.assessedValueTotal || data.taxAssessedValueTotal)} valueColor={C.amber} />
        <DataRow label="Land Assessed" value={fmt.money(tax.assessedValueLand)} />
        <DataRow label="Improvement Assessed" value={fmt.money(tax.assessedValueImprovements)} />
      </Card>

      <Card>
        <CardHeader>Market Values</CardHeader>
        <DataRow label="Total Market Value" value={fmt.money(tax.marketValueTotal)} valueColor={C.green} />
        <DataRow label="Land Market Value" value={fmt.money(tax.marketValueLand)} />
        <DataRow label="Improvement Market Value" value={fmt.money(tax.marketValueImprovements)} />
      </Card>

      <Card style={{ gridColumn: 'span 2' }}>
        <CardHeader>Tax Bill</CardHeader>
        <div style={{ display: 'flex', gap: 48, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Tax Billed</div>
            <div style={{ fontSize: 24, color: C.amber, fontFamily: fontMono, fontWeight: 700 }}>{fmt.money(tax.taxAmountBilled)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Tax Rate</div>
            <div style={{ fontSize: 20, color: C.text, fontFamily: fontMono }}>{fmt.pct(tax.taxRate)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div>
            <span style={{ fontSize: 12, color: C.textDim }}>Delinquent Year: </span>
            <span style={{ fontSize: 12, color: tax.taxDelinquentYear ? C.red : C.green, fontWeight: 600 }}>
              {tax.taxDelinquentYear || 'None'}
            </span>
          </div>
          <div>
            <span style={{ fontSize: 12, color: C.textDim }}>Homeowner Exemption: </span>
            <span style={{ fontSize: 12, color: C.text }}>{tax.hasHomeownerExemption ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PERMITS SUB-TAB
// ══════════════════════════════════════════════════════════════════════════════

const PermitsSubTab = ({ data }) => {
  const permits = data.buildingPermits || [];

  if (permits.length === 0) {
    return <EmptyState icon="🔨" title="No building permits on record" />;
  }

  return (
    <div style={{ overflow: 'auto', maxHeight: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font }}>
        <thead>
          <tr>
            <th style={thStyle}>Permit #</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Issue Date</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Est. Value</th>
            <th style={thStyle}>Description</th>
          </tr>
        </thead>
        <tbody>
          {permits.map((permit, i) => (
            <tr
              key={i}
              style={{ background: i % 2 === 0 ? 'transparent' : C.bgRow }}
              onMouseEnter={(e) => e.currentTarget.style.background = C.bgRowHover}
              onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : C.bgRow}
            >
              <td style={{ ...tdStyle, fontFamily: fontMono, color: C.accentLight }}>{permit.permitNumber || '—'}</td>
              <td style={{ ...tdStyle, color: C.text }}>{permit.permitType || '—'}</td>
              <td style={tdStyle}>
                <Badge color={permit.permitStatus === 'Completed' || permit.permitStatus === 'Final' ? 'green' : 'amber'}>
                  {permit.permitStatus || 'Unknown'}
                </Badge>
              </td>
              <td style={{ ...tdStyle, color: C.textDim }}>{fmt.date(permit.issueDate || permit.effectiveDate)}</td>
              <td style={{ ...tdStyle, textAlign: 'right', fontFamily: fontMono, color: C.green }}>{fmt.money(permit.estimatedValue)}</td>
              <td style={{ ...tdStyle, color: C.textDim, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {permit.description || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// RISK SUB-TAB
// ══════════════════════════════════════════════════════════════════════════════

const RiskSubTab = ({ data }) => {
  // Handle climateRisk as array or object
  const climate = Array.isArray(data.climateRisk) ? data.climateRisk[0] || {} : data.climateRisk || {};
  const totalRisk = climate.riskScoreTotal || climate.totalRiskScore;

  const riskItems = [
    { label: 'Total Risk', score: totalRisk, icon: '🌍' },
    { label: 'Flood Risk', score: climate.floodRiskScore, icon: '🌊' },
    { label: 'Heat Risk', score: climate.heatRiskScore, icon: '🔥' },
    { label: 'Storm Risk', score: climate.stormRiskScore, icon: '⛈️' },
    { label: 'Drought Risk', score: climate.droughtRiskScore, icon: '☀️' },
    { label: 'Wildfire Risk', score: climate.wildfireRiskScore, icon: '🔥' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {riskItems.map((item, i) => {
        const color = riskColor(item.score);
        const isTotal = i === 0;
        return (
          <Card key={i} style={isTotal ? { gridColumn: 'span 3', borderColor: color } : {}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: isTotal ? 32 : 24 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: isTotal ? 28 : 20, fontFamily: fontMono, fontWeight: 700, color }}>
                    {item.score != null ? item.score : '—'}
                  </span>
                  {item.score != null && <span style={{ fontSize: 12, color: C.textMuted }}>/100</span>}
                </div>
              </div>
              {item.score != null && (
                <div
                  style={{
                    width: isTotal ? 80 : 60,
                    height: 8,
                    background: 'rgba(100,116,139,0.3)',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${item.score}%`,
                      height: '100%',
                      background: color,
                      borderRadius: 4,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              )}
            </div>
          </Card>
        );
      })}
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

  if (!data) return <EmptyState icon="🏠" title="No property selected" />;

  // Extract property info for sidebar
  const address = data.addressFull || '—';
  const cityStateZip = [data.addressCity, data.addressState].filter(Boolean).join(', ') + (data.addressZip ? ` ${data.addressZip}` : '');
  const propertyType = (data.propertyUseStandardized || data.propertyUseGroup || 'Property').toUpperCase();

  // Extract nested data for sidebar
  const valuation = data.valuations?.[0] || {};
  const tax = data.taxAssessments?.[0] || {};
  const avm = valuation.avmValue || valuation.estimatedValue;
  const assessed = tax.assessedValueTotal || data.taxAssessedValueTotal;
  const market = tax.marketValueTotal;
  const lastSale = data.lastSalePrice;
  const taxBilled = tax.taxAmountBilled;
  const taxRate = tax.taxRate;

  // Climate for sidebar (handle array or object)
  const climate = Array.isArray(data.climateRisk) ? data.climateRisk[0] || {} : data.climateRisk || {};
  const climateTotal = climate.riskScoreTotal || climate.totalRiskScore;

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'overview': return <OverviewSubTab data={data} />;
      case 'ownership': return <OwnershipSubTab data={data} />;
      case 'transactions': return <TransactionsSubTab data={data} />;
      case 'financing': return <FinancingSubTab data={data} />;
      case 'distress': return <DistressSubTab data={data} />;
      case 'valuation': return <ValuationSubTab data={data} />;
      case 'tax': return <TaxSubTab data={data} />;
      case 'permits': return <PermitsSubTab data={data} />;
      case 'risk': return <RiskSubTab data={data} />;
      default: return null;
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
              <span style={{ fontSize: 12, color: C.textDim }}>AVM Estimate</span>
              <span style={{ fontSize: 12, color: C.green, fontFamily: fontMono }}>{fmt.money(avm)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: C.textDim }}>Assessed Value</span>
              <span style={{ fontSize: 12, color: C.text, fontFamily: fontMono }}>{fmt.money(assessed)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: C.textDim }}>Market Value</span>
              <span style={{ fontSize: 12, color: C.text, fontFamily: fontMono }}>{fmt.money(market)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: C.textDim }}>Last Sale</span>
              <span style={{ fontSize: 12, color: C.cyan, fontFamily: fontMono }}>{fmt.money(lastSale)}</span>
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
              <span style={{ fontSize: 12, color: riskColor(climateTotal), fontFamily: fontMono }}>
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
