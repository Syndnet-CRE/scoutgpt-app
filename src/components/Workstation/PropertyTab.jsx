import React, { useState } from 'react';
import { Building, User, Handshake, DollarSign, AlertTriangle, BarChart3, FileText, Hammer, Shield, ShieldCheck, Home, Globe, Waves, Flame, CloudLightning, Sun } from 'lucide-react';
import { useTheme } from '../../theme.jsx';
import useIntelligence from '../../hooks/useIntelligence';
import IntelligenceScorecard from './IntelligenceScorecard';

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

// ══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

const DataRow = ({ label, value, valueColor, t }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '8px 0',
      borderBottom: `1px solid ${t.border.strong}`,
    }}
  >
    <span style={{ color: t.text.secondary, fontSize: 13 }}>{label}</span>
    <span style={{ color: valueColor || t.text.primary, fontSize: 13, fontFamily: t.font.mono }}>{value}</span>
  </div>
);

const SectionHeader = ({ children, t }) => (
  <div
    style={{
      fontSize: 11,
      fontWeight: 700,
      color: t.accent.green,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      padding: '12px 0 8px',
      borderBottom: `1px solid ${t.accent.greenBorder}`,
      marginTop: 16,
    }}
  >
    {children}
  </div>
);

const Badge = ({ children, color = 'slate', t }) => {
  const colors = {
    slate: { bg: t.bg.tertiary, text: t.text.secondary, border: t.border.strong },
    purple: { bg: t.accent.greenMuted, text: t.accent.green, border: t.accent.greenBorder },
    cyan: { bg: t.accent.greenMuted, text: t.semantic.info, border: t.accent.greenBorder },
    amber: { bg: t.accent.greenMuted, text: t.semantic.warning, border: t.accent.greenBorder },
    green: { bg: t.accent.greenMuted, text: t.semantic.success, border: t.accent.greenBorder },
    red: { bg: t.accent.greenMuted, text: t.semantic.error, border: t.accent.greenBorder },
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

const EmptyState = ({ icon: IconComponent, title, subtitle, t }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: 200,
      color: t.text.tertiary,
      gap: 12,
    }}
  >
    <span style={{ opacity: 0.5 }}>{IconComponent && <IconComponent size={32} />}</span>
    <span style={{ fontSize: 14, fontWeight: 500 }}>{title}</span>
    {subtitle && <span style={{ fontSize: 12, opacity: 0.6 }}>{subtitle}</span>}
  </div>
);

const Card = ({ children, style = {}, t }) => (
  <div
    style={{
      background: t.bg.secondary,
      borderRadius: 12,
      border: `1px solid ${t.border.strong}`,
      padding: 20,
      ...style,
    }}
  >
    {children}
  </div>
);

const CardHeader = ({ children, t }) => (
  <div
    style={{
      fontSize: 10,
      fontWeight: 700,
      color: t.accent.green,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: 12,
    }}
  >
    {children}
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// OVERVIEW SUB-TAB
// ══════════════════════════════════════════════════════════════════════════════

const OverviewSubTab = ({ data, t }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
      {/* Key Stats Column */}
      <div>
        <SectionHeader t={t}>Key Stats</SectionHeader>
        <DataRow t={t} label="Property Type" value={fmt.text(data.propertyUseStandardized || data.propertyUseGroup)} />
        <DataRow t={t} label="Year Built" value={fmt.text(data.yearBuilt)} />
        <DataRow t={t} label="Effective Year" value={fmt.text(data.effectiveYearBuilt)} />
        <DataRow t={t} label="Building SF" value={fmt.sf(data.areaBuilding)} />
        <DataRow t={t} label="Gross Area" value={fmt.sf(data.grossArea)} />
        <DataRow t={t} label="Lot Size (SF)" value={fmt.num(data.areaLotSf)} />
        <DataRow t={t} label="Lot Size (Acres)" value={fmt.ac(data.areaLotAcres)} />
        <DataRow t={t} label="Stories" value={fmt.text(data.storiesCount)} />
        <DataRow t={t} label="Buildings" value={fmt.text(data.buildingsCount)} />
        <DataRow t={t} label="Units" value={fmt.text(data.unitsCount)} />
        <DataRow t={t} label="Bedrooms" value={fmt.text(data.bedroomsCount)} />
        <DataRow t={t} label="Bathrooms" value={fmt.text(data.bathCount)} />
        <DataRow t={t} label="Rooms" value={fmt.text(data.roomsCount)} />
        <DataRow t={t} label="Zoning" value={fmt.text(data.zoning)} />
        <DataRow t={t} label="Census Tract" value={fmt.text(data.censusTract)} />
        <DataRow t={t} label="APN" value={fmt.text(data.parcelNumberFormatted)} />
      </div>

      {/* Structure Column */}
      <div>
        <SectionHeader t={t}>Structure</SectionHeader>
        <DataRow t={t} label="Construction" value={fmt.text(data.constructionType)} />
        <DataRow t={t} label="Exterior Walls" value={fmt.text(data.exteriorWalls)} />
        <DataRow t={t} label="Interior Walls" value={fmt.text(data.interiorWalls)} />
        <DataRow t={t} label="Foundation" value={fmt.text(data.foundation)} />
        <DataRow t={t} label="Roof Type" value={fmt.text(data.roofType)} />
        <DataRow t={t} label="Roof Material" value={fmt.text(data.roofMaterial)} />
        <DataRow t={t} label="Floor Type" value={fmt.text(data.floorType)} />
        <DataRow t={t} label="HVAC Cooling" value={fmt.text(data.hvacCooling)} />
        <DataRow t={t} label="HVAC Heating" value={fmt.text(data.hvacHeating)} />
        <DataRow t={t} label="HVAC Fuel" value={fmt.text(data.hvacFuel)} />
        <DataRow t={t} label="Quality Grade" value={fmt.text(data.qualityGrade)} />
        <DataRow t={t} label="Condition" value={fmt.text(data.condition)} />

        <SectionHeader t={t}>Amenities</SectionHeader>
        <DataRow t={t} label="Parking Spaces" value={fmt.text(data.parkingSpaces)} />
        <DataRow t={t} label="Garage Type" value={fmt.text(data.garageType)} />
        <DataRow t={t} label="Garage Area" value={fmt.sf(data.garageArea)} />
        <DataRow t={t} label="Pool" value={data.hasPool ? (data.poolType || 'Yes') : 'No'} />
        <DataRow t={t} label="Spa" value={data.hasSpa ? 'Yes' : 'No'} />
        <DataRow t={t} label="Elevator" value={data.hasElevator ? 'Yes' : 'No'} />
        <DataRow t={t} label="Fireplace" value={data.hasFireplace ? `Yes (${data.fireplaceCount || 1})` : 'No'} />
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// OWNERSHIP SUB-TAB
// ══════════════════════════════════════════════════════════════════════════════

const OwnershipSubTab = ({ data, t }) => {
  // Extract from nested ownership array
  const owner = data.ownership?.[0] || {};
  const ownerName = owner.owner1NameFull || '—';
  const owner2 = owner.owner2NameFull;

  return (
    <div>
      <SectionHeader t={t}>Owner Information</SectionHeader>
      <div style={{ padding: '16px 0' }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: t.text.primary, marginBottom: 8 }}>{ownerName}</div>
        {owner2 && <div style={{ fontSize: 14, color: t.text.secondary, marginBottom: 12 }}>{owner2}</div>}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {owner.companyFlag && <Badge t={t} color="purple">Corporate</Badge>}
          {owner.trustFlag && <Badge t={t} color="cyan">Trust</Badge>}
          {owner.isAbsenteeOwner && <Badge t={t} color="amber">Absentee</Badge>}
          {owner.isOwnerOccupied && <Badge t={t} color="green">Owner Occupied</Badge>}
        </div>
      </div>

      <DataRow t={t} label="Ownership Type" value={fmt.text(owner.ownershipType)} />
      <DataRow t={t} label="Owner Occupied" value={owner.isOwnerOccupied ? 'Yes' : (owner.isAbsenteeOwner ? 'No (Absentee)' : '—')} />
      <DataRow t={t} label="Transfer Date" value={fmt.date(owner.ownershipTransferDate)} />

      <SectionHeader t={t}>Mailing Address</SectionHeader>
      <DataRow t={t} label="Address" value={fmt.text(owner.mailAddressFull)} />
      <DataRow t={t} label="City/State/Zip" value={owner.mailAddressCity ? `${owner.mailAddressCity}, ${owner.mailAddressState || ''} ${owner.mailAddressZip || ''}` : '—'} />

      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: t.accent.greenMuted,
          borderRadius: 8,
          border: `1px solid ${t.accent.greenBorder}`,
        }}
      >
        <div style={{ fontSize: 12, color: t.accent.green, fontWeight: 500 }}>
          Linked Properties
        </div>
        <div style={{ fontSize: 13, color: t.text.tertiary, marginTop: 4, fontStyle: 'italic' }}>
          Coming soon - view all properties owned by this entity
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// TRANSACTIONS SUB-TAB
// ══════════════════════════════════════════════════════════════════════════════

const TransactionsSubTab = ({ data, t }) => {
  const sales = data.salesTransactions || [];

  if (sales.length === 0) {
    return <EmptyState t={t} icon={Handshake} title="No transaction records found" />;
  }

  const thStyle = {
    padding: '12px 16px',
    textAlign: 'left',
    color: t.text.tertiary,
    fontWeight: 600,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderBottom: `1px solid ${t.border.strong}`,
    background: t.bg.secondary,
    position: 'sticky',
    top: 0,
    zIndex: 1,
  };

  const tdStyle = {
    padding: '12px 16px',
    borderBottom: `1px solid ${t.border.strong}`,
    fontSize: 13,
  };

  return (
    <div style={{ overflow: 'auto', maxHeight: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.font.display }}>
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
              style={{ background: i % 2 === 0 ? 'transparent' : t.bg.secondary }}
              onMouseEnter={(e) => e.currentTarget.style.background = t.bg.tertiary}
              onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : t.bg.secondary}
            >
              <td style={tdStyle}>{fmt.date(sale.recordingDate)}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: t.semantic.success, fontFamily: t.font.mono, fontWeight: 600 }}>{fmt.money(sale.salePrice)}</td>
              <td style={{ ...tdStyle, color: t.text.secondary }}>{sale.documentType || '—'}</td>
              <td style={{ ...tdStyle, color: t.text.primary }}>{sale.grantor1NameFull || '—'}</td>
              <td style={{ ...tdStyle, color: t.text.primary }}>{sale.grantee1NameFull || '—'}</td>
              <td style={tdStyle}>{sale.isArmsLength ? <Badge t={t} color="green">Yes</Badge> : <Badge t={t} color="slate">No</Badge>}</td>
              <td style={tdStyle}>{sale.isDistressed || sale.isForeclosureAuction ? <Badge t={t} color="red">Yes</Badge> : <Badge t={t} color="slate">No</Badge>}</td>
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

const FinancingSubTab = ({ data, t }) => {
  const loans = data.currentLoans || [];

  if (loans.length === 0) {
    return <EmptyState t={t} icon={DollarSign} title="No active loan records" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {loans.map((loan, i) => (
        <Card t={t} key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: t.text.tertiary, textTransform: 'uppercase', marginBottom: 4 }}>Loan Amount</div>
              <div style={{ fontSize: 24, color: t.semantic.success, fontFamily: t.font.mono, fontWeight: 700 }}>{fmt.money(loan.loanAmount)}</div>
            </div>
            <Badge t={t} color="purple">{loan.loanType || loan.mortgageType || 'Loan'}</Badge>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <DataRow t={t} label="Lender" value={fmt.text(loan.lenderNameStandardized)} />
            <DataRow t={t} label="Interest Rate" value={loan.interestRate ? `${loan.interestRate}% ${loan.interestRateType || ''}` : '—'} />
            <DataRow t={t} label="Term" value={loan.loanTerm ? `${loan.loanTerm} months` : '—'} />
            <DataRow t={t} label="Due Date" value={fmt.date(loan.dueDate)} />
            <DataRow t={t} label="Est. Balance" value={fmt.money(loan.estimatedBalance)} valueColor={t.semantic.warning} />
            <DataRow t={t} label="Est. Monthly" value={fmt.money(loan.estimatedMonthlyPayment)} />
          </div>
        </Card>
      ))}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// DISTRESS SUB-TAB
// ══════════════════════════════════════════════════════════════════════════════

const DistressSubTab = ({ data, t }) => {
  const foreclosures = data.foreclosureRecords || [];
  // Extract from nested taxAssessments array for delinquency
  const tax = data.taxAssessments?.[0] || {};
  const taxDelinquent = tax.taxDelinquentYear;
  const distressedSales = (data.salesTransactions || []).filter(s => s.isDistressed || s.isForeclosureAuction);

  const hasDistress = foreclosures.length > 0 || taxDelinquent || distressedSales.length > 0;

  const thStyle = {
    padding: '12px 16px',
    textAlign: 'left',
    color: t.text.tertiary,
    fontWeight: 600,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderBottom: `1px solid ${t.border.strong}`,
    background: t.bg.secondary,
    position: 'sticky',
    top: 0,
    zIndex: 1,
  };

  const tdStyle = {
    padding: '12px 16px',
    borderBottom: `1px solid ${t.border.strong}`,
    fontSize: 13,
  };

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
          background: t.accent.greenMuted,
          borderRadius: 12,
          border: `1px solid ${t.accent.greenBorder}`,
        }}
      >
        <ShieldCheck size={48} style={{ marginBottom: 16 }} />
        <span style={{ fontSize: 16, fontWeight: 600, color: t.semantic.success }}>No distress signals detected</span>
        <span style={{ fontSize: 13, color: t.text.secondary, marginTop: 8 }}>This property has no foreclosures, tax delinquencies, or distressed sales on record</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Tax Delinquent */}
      {taxDelinquent && (
        <Card t={t} style={{ borderColor: t.semantic.error }}>
          <CardHeader t={t}>Tax Delinquency</CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={24} />
            <div>
              <div style={{ fontSize: 14, color: t.semantic.error, fontWeight: 600 }}>Tax Delinquent Year: {taxDelinquent}</div>
              <div style={{ fontSize: 12, color: t.text.secondary, marginTop: 4 }}>Property has unpaid taxes from this year</div>
            </div>
          </div>
        </Card>
      )}

      {/* Foreclosure Records */}
      {foreclosures.length > 0 && (
        <div>
          <SectionHeader t={t}>Foreclosure Records</SectionHeader>
          <div style={{ overflow: 'auto', marginTop: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.font.display }}>
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
                  <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : t.bg.secondary }}>
                    <td style={{ ...tdStyle, color: t.semantic.error }}>{f.foreclosureType || '—'}</td>
                    <td style={tdStyle}>{fmt.date(f.recordingDate)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontFamily: t.font.mono, color: t.semantic.warning }}>{fmt.money(f.defaultAmount)}</td>
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
          <SectionHeader t={t}>Distressed Sales History</SectionHeader>
          <div style={{ overflow: 'auto', marginTop: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.font.display }}>
              <thead>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Price</th>
                  <th style={thStyle}>Type</th>
                </tr>
              </thead>
              <tbody>
                {distressedSales.map((s, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : t.bg.secondary }}>
                    <td style={tdStyle}>{fmt.date(s.recordingDate)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontFamily: t.font.mono, color: t.semantic.warning }}>{fmt.money(s.salePrice)}</td>
                    <td style={tdStyle}>{s.isForeclosureAuction ? <Badge t={t} color="red">Foreclosure Auction</Badge> : <Badge t={t} color="amber">Distressed</Badge>}</td>
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

const ValuationSubTab = ({ data, t }) => {
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
      <Card t={t}>
        <CardHeader t={t}>AVM Estimate</CardHeader>
        <div style={{ fontSize: 28, color: t.semantic.success, fontFamily: t.font.mono, fontWeight: 700, marginBottom: 16 }}>
          {fmt.money(avm)}
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: t.text.tertiary, marginBottom: 4 }}>Low</div>
            <div style={{ fontSize: 14, color: t.text.secondary, fontFamily: t.font.mono }}>{fmt.money(avmLow)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: t.text.tertiary, marginBottom: 4 }}>High</div>
            <div style={{ fontSize: 14, color: t.text.secondary, fontFamily: t.font.mono }}>{fmt.money(avmHigh)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: t.text.tertiary, marginBottom: 4 }}>Confidence</div>
            <div style={{ fontSize: 14, color: t.accent.green, fontFamily: t.font.mono }}>{confidence ? `${confidence}/100` : '—'}</div>
          </div>
        </div>
      </Card>

      {/* Assessment Card */}
      <Card t={t}>
        <CardHeader t={t}>Tax Assessment</CardHeader>
        <DataRow t={t} label="Assessed Value" value={fmt.money(tax.assessedValueTotal || data.taxAssessedValueTotal)} valueColor={t.semantic.warning} />
        <DataRow t={t} label="Market Value" value={fmt.money(tax.marketValueTotal)} />
        <DataRow t={t} label="Land Value" value={fmt.money(tax.assessedValueLand || tax.marketValueLand)} />
        <DataRow t={t} label="Improvement Value" value={fmt.money(tax.assessedValueImprovements || tax.marketValueImprovements)} />
      </Card>

      {/* Last Sale Card */}
      <Card t={t} style={{ gridColumn: 'span 2' }}>
        <CardHeader t={t}>Last Sale</CardHeader>
        <div style={{ display: 'flex', gap: 48 }}>
          <div>
            <div style={{ fontSize: 11, color: t.text.tertiary, marginBottom: 4 }}>Sale Price</div>
            <div style={{ fontSize: 20, color: t.semantic.info, fontFamily: t.font.mono, fontWeight: 600 }}>{fmt.money(data.lastSalePrice)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: t.text.tertiary, marginBottom: 4 }}>Sale Date</div>
            <div style={{ fontSize: 16, color: t.text.primary, fontFamily: t.font.mono }}>{fmt.date(data.lastSaleDate)}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// TAX SUB-TAB
// ══════════════════════════════════════════════════════════════════════════════

const TaxSubTab = ({ data, t }) => {
  // Extract from nested taxAssessments array
  const tax = data.taxAssessments?.[0] || {};

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <Card t={t}>
        <CardHeader t={t}>Assessment Details</CardHeader>
        <DataRow t={t} label="Tax Year" value={fmt.text(tax.taxYear)} />
        <DataRow t={t} label="Total Assessed" value={fmt.money(tax.assessedValueTotal || data.taxAssessedValueTotal)} valueColor={t.semantic.warning} />
        <DataRow t={t} label="Land Assessed" value={fmt.money(tax.assessedValueLand)} />
        <DataRow t={t} label="Improvement Assessed" value={fmt.money(tax.assessedValueImprovements)} />
      </Card>

      <Card t={t}>
        <CardHeader t={t}>Market Values</CardHeader>
        <DataRow t={t} label="Total Market Value" value={fmt.money(tax.marketValueTotal)} valueColor={t.semantic.success} />
        <DataRow t={t} label="Land Market Value" value={fmt.money(tax.marketValueLand)} />
        <DataRow t={t} label="Improvement Market Value" value={fmt.money(tax.marketValueImprovements)} />
      </Card>

      <Card t={t} style={{ gridColumn: 'span 2' }}>
        <CardHeader t={t}>Tax Bill</CardHeader>
        <div style={{ display: 'flex', gap: 48, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: t.text.tertiary, marginBottom: 4 }}>Tax Billed</div>
            <div style={{ fontSize: 24, color: t.semantic.warning, fontFamily: t.font.mono, fontWeight: 700 }}>{fmt.money(tax.taxAmountBilled)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: t.text.tertiary, marginBottom: 4 }}>Tax Rate</div>
            <div style={{ fontSize: 20, color: t.text.primary, fontFamily: t.font.mono }}>{fmt.pct(tax.taxRate)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div>
            <span style={{ fontSize: 12, color: t.text.secondary }}>Delinquent Year: </span>
            <span style={{ fontSize: 12, color: tax.taxDelinquentYear ? t.semantic.error : t.semantic.success, fontWeight: 600 }}>
              {tax.taxDelinquentYear || 'None'}
            </span>
          </div>
          <div>
            <span style={{ fontSize: 12, color: t.text.secondary }}>Homeowner Exemption: </span>
            <span style={{ fontSize: 12, color: t.text.primary }}>{tax.hasHomeownerExemption ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PERMITS SUB-TAB
// ══════════════════════════════════════════════════════════════════════════════

const PermitsSubTab = ({ data, t }) => {
  const permits = data.buildingPermits || [];

  if (permits.length === 0) {
    return <EmptyState t={t} icon={Hammer} title="No building permits on record" />;
  }

  const thStyle = {
    padding: '12px 16px',
    textAlign: 'left',
    color: t.text.tertiary,
    fontWeight: 600,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderBottom: `1px solid ${t.border.strong}`,
    background: t.bg.secondary,
    position: 'sticky',
    top: 0,
    zIndex: 1,
  };

  const tdStyle = {
    padding: '12px 16px',
    borderBottom: `1px solid ${t.border.strong}`,
    fontSize: 13,
  };

  return (
    <div style={{ overflow: 'auto', maxHeight: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.font.display }}>
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
              style={{ background: i % 2 === 0 ? 'transparent' : t.bg.secondary }}
              onMouseEnter={(e) => e.currentTarget.style.background = t.bg.tertiary}
              onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : t.bg.secondary}
            >
              <td style={{ ...tdStyle, fontFamily: t.font.mono, color: t.accent.green }}>{permit.permitNumber || '—'}</td>
              <td style={{ ...tdStyle, color: t.text.primary }}>{permit.permitType || '—'}</td>
              <td style={tdStyle}>
                <Badge t={t} color={permit.permitStatus === 'Completed' || permit.permitStatus === 'Final' ? 'green' : 'amber'}>
                  {permit.permitStatus || 'Unknown'}
                </Badge>
              </td>
              <td style={{ ...tdStyle, color: t.text.secondary }}>{fmt.date(permit.issueDate || permit.effectiveDate)}</td>
              <td style={{ ...tdStyle, textAlign: 'right', fontFamily: t.font.mono, color: t.semantic.success }}>{fmt.money(permit.estimatedValue)}</td>
              <td style={{ ...tdStyle, color: t.text.secondary, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

const RiskSubTab = ({ data, t }) => {
  // Handle climateRisk as array or object
  const climate = Array.isArray(data.climateRisk) ? data.climateRisk[0] || {} : data.climateRisk || {};
  const totalRisk = climate.riskScoreTotal || climate.totalRiskScore;

  // Use t.charts.traffic for risk colors: [green, yellow, orange, red]
  const getRiskColor = (score) => {
    if (!score) return t.text.tertiary;
    if (score > 70) return t.charts.traffic[3]; // red
    if (score > 40) return t.charts.traffic[1]; // yellow
    return t.charts.traffic[0]; // green
  };

  const riskItems = [
    { label: 'Total Risk', score: totalRisk, icon: Globe },
    { label: 'Flood Risk', score: climate.floodRiskScore, icon: Waves },
    { label: 'Heat Risk', score: climate.heatRiskScore, icon: Flame },
    { label: 'Storm Risk', score: climate.stormRiskScore, icon: CloudLightning },
    { label: 'Drought Risk', score: climate.droughtRiskScore, icon: Sun },
    { label: 'Wildfire Risk', score: climate.wildfireRiskScore, icon: Flame },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {riskItems.map((item, i) => {
        const color = getRiskColor(item.score);
        const isTotal = i === 0;
        return (
          <Card t={t} key={i} style={isTotal ? { gridColumn: 'span 3', borderColor: color } : {}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <item.icon size={isTotal ? 32 : 24} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: t.text.tertiary, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: isTotal ? 28 : 20, fontFamily: t.font.mono, fontWeight: 700, color }}>
                    {item.score != null ? item.score : '—'}
                  </span>
                  {item.score != null && <span style={{ fontSize: 12, color: t.text.tertiary }}>/100</span>}
                </div>
              </div>
              {item.score != null && (
                <div
                  style={{
                    width: isTotal ? 80 : 60,
                    height: 8,
                    background: t.bg.tertiary,
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
  { id: 'overview', label: 'Overview', icon: Building },
  { id: 'ownership', label: 'Ownership', icon: User },
  { id: 'transactions', label: 'Transactions', icon: Handshake },
  { id: 'financing', label: 'Financing', icon: DollarSign },
  { id: 'distress', label: 'Distress', icon: AlertTriangle },
  { id: 'valuation', label: 'Valuation', icon: BarChart3 },
  { id: 'tax', label: 'Tax', icon: FileText },
  { id: 'permits', label: 'Permits', icon: Hammer },
  { id: 'risk', label: 'Risk', icon: Shield },
];

export default function PropertyTab({ data }) {
  const { t } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Fetch intelligence scores from backend
  const { intelligence, loading } = useIntelligence(data?.attomId);

  if (!data) return <EmptyState t={t} icon={Home} title="No property selected" />;

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

  // Risk color function using t.charts.traffic
  const getRiskColor = (score) => {
    if (!score) return t.text.tertiary;
    if (score > 70) return t.charts.traffic[3];
    if (score > 40) return t.charts.traffic[1];
    return t.charts.traffic[0];
  };

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'overview': return <OverviewSubTab data={data} t={t} />;
      case 'ownership': return <OwnershipSubTab data={data} t={t} />;
      case 'transactions': return <TransactionsSubTab data={data} t={t} />;
      case 'financing': return <FinancingSubTab data={data} t={t} />;
      case 'distress': return <DistressSubTab data={data} t={t} />;
      case 'valuation': return <ValuationSubTab data={data} t={t} />;
      case 'tax': return <TaxSubTab data={data} t={t} />;
      case 'permits': return <PermitsSubTab data={data} t={t} />;
      case 'risk': return <RiskSubTab data={data} t={t} />;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left Sidebar */}
      <div
        style={{
          width: 250,
          borderRight: `1px solid ${t.border.strong}`,
          display: 'flex',
          flexDirection: 'column',
          background: t.bg.primary,
          flexShrink: 0,
        }}
      >
        {/* Street View Placeholder */}
        <div
          style={{
            height: 140,
            background: t.bg.secondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${t.border.strong}`,
            color: t.text.tertiary,
            fontSize: 12,
          }}
        >
          Street View Coming Soon
        </div>

        {/* Address Block */}
        <div style={{ padding: 16, borderBottom: `1px solid ${t.border.strong}` }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.text.primary, lineHeight: 1.3 }}>{address}</div>
          <div style={{ fontSize: 12, color: t.text.secondary, marginTop: 4 }}>{cityStateZip}</div>
          <div style={{ marginTop: 10 }}>
            <Badge t={t} color="purple">{propertyType}</Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ padding: 16, flex: 1, overflow: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.accent.green, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Quick Stats
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: t.text.secondary }}>AVM Estimate</span>
              <span style={{ fontSize: 12, color: t.semantic.success, fontFamily: t.font.mono }}>{fmt.money(avm)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: t.text.secondary }}>Assessed Value</span>
              <span style={{ fontSize: 12, color: t.text.primary, fontFamily: t.font.mono }}>{fmt.money(assessed)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: t.text.secondary }}>Market Value</span>
              <span style={{ fontSize: 12, color: t.text.primary, fontFamily: t.font.mono }}>{fmt.money(market)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: t.text.secondary }}>Last Sale</span>
              <span style={{ fontSize: 12, color: t.semantic.info, fontFamily: t.font.mono }}>{fmt.money(lastSale)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: t.text.secondary }}>Tax Billed</span>
              <span style={{ fontSize: 12, color: t.semantic.warning, fontFamily: t.font.mono }}>{fmt.money(taxBilled)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: t.text.secondary }}>Tax Rate</span>
              <span style={{ fontSize: 12, color: t.text.primary, fontFamily: t.font.mono }}>{fmt.pct(taxRate)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: t.text.secondary }}>Climate Risk</span>
              <span style={{ fontSize: 12, color: getRiskColor(climateTotal), fontFamily: t.font.mono }}>
                {climateTotal != null ? `${climateTotal}/100` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ padding: 12, borderTop: `1px solid ${t.border.strong}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            style={{
              padding: '10px 0',
              background: t.accent.green,
              border: 'none',
              borderRadius: 6,
              color: t.text.primary,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: t.font.display,
              cursor: 'pointer',
            }}
          >
            Save to Deal Room
          </button>
          <button
            style={{
              padding: '10px 0',
              background: 'transparent',
              border: `1px solid ${t.border.strong}`,
              borderRadius: 6,
              color: t.text.secondary,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: t.font.display,
              cursor: 'pointer',
            }}
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Right Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Intelligence Scorecard */}
        <div style={{ padding: '16px 24px 0', flexShrink: 0 }}>
          <IntelligenceScorecard
            scores={intelligence?.scores}
            equity={intelligence?.equity}
            loading={loading.intelligence}
          />
        </div>

        {/* Sub-Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: `1px solid ${t.border.strong}`,
            background: t.bg.primary,
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
                borderBottom: activeSubTab === tab.id ? `2px solid ${t.accent.green}` : '2px solid transparent',
                background: 'transparent',
                color: activeSubTab === tab.id ? t.text.primary : t.text.tertiary,
                fontSize: 12,
                fontWeight: 500,
                fontFamily: t.font.display,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              {tab.icon && <tab.icon size={14} />}
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
