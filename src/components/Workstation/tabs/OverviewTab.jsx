import { Sparkles, MapPin, ChevronRight, Zap } from 'lucide-react';
import { useTheme } from '../../../theme.jsx';
import MetricCard from '../shared/MetricCard.jsx';
import DataRow from '../shared/DataRow.jsx';
import SectionHeader from '../shared/SectionHeader.jsx';
import ProgressBar from '../shared/ProgressBar.jsx';

function CardShell({ children, style }) {
  const { t } = useTheme();
  return (
    <div style={{
      background: t.bg.secondary,
      border: `1px solid ${t.border.default}`,
      borderRadius: 8,
      padding: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardHeader({ title, linkText, onLinkClick }) {
  const { t } = useTheme();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{
        fontSize: 14,
        fontWeight: 600,
        color: t.text.primary,
        fontFamily: t.font.display,
      }}>
        {title}
      </span>
      {linkText && (
        <button
          onClick={onLinkClick}
          style={{
            fontSize: 12,
            color: t.accent.green,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: t.font.display,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: 0,
          }}
        >
          {linkText}
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

function fmt(val, prefix = '', suffix = '') {
  if (val == null) return '\u2014';
  if (typeof val === 'number') {
    return `${prefix}${val.toLocaleString()}${suffix}`;
  }
  return `${prefix}${val}${suffix}`;
}

function fmtCurrency(val) {
  if (val == null) return '\u2014';
  return `$${Number(val).toLocaleString()}`;
}

function fmtDate(val) {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtPct(val) {
  if (val == null) return null;
  return `${Number(val).toFixed(2)}%`;
}

export default function OverviewTab({ data, onTabChange }) {
  const { t } = useTheme();

  const d = data || {};

  const assessedValue = d.taxAssessments?.[0]?.assessedValueTotal ?? null;
  const avmEstimate = d.valuations?.[0]?.estimatedValue ?? null;
  const lotSf = d.areaLotSf ?? null;
  const lotAcres = d.areaLotAcres ?? null;
  const buildingSf = d.areaBuilding ?? null;
  const yearBuilt = d.yearBuilt ?? null;
  const lastSalePrice = d.lastSalePrice ?? null;
  const lastSaleDate = d.lastSaleDate ?? null;
  const annualTax = d.taxAssessments?.[0]?.taxAmountBilled ?? null;

  const ownership = d.ownership?.[0] ?? {};
  const owner = ownership.owner1NameFull ?? null;
  const ownershipType = ownership.ownershipType ?? null;
  const isAbsentee = ownership.isAbsenteeOwner;
  const mailingAddress = ownership.mailAddressFull ?? null;
  const transferDate = ownership.ownershipTransferDate ?? null;

  const loan = d.currentLoans?.[0] ?? {};
  const lender = loan.lenderNameFirst ?? null;
  const mortgageBalance = loan.estimatedBalance ?? null;
  const mortgageRate = loan.interestRate ?? null;
  const mortgageTerm = loan.loanTerm ?? null;
  const mortgageMaturity = loan.dueDate ?? null;
  const ltv = d.valuations?.[0]?.ltv ?? null;

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* KEY METRICS — full width section header */}
      <SectionHeader title="Key Metrics" count={6} />

      {/* Two-column layout */}
      <div style={{ display: 'flex', gap: 16 }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ flex: 3, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* 3×2 Metric Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <MetricCard label="Assessed Value" value={fmtCurrency(assessedValue)} />
            <MetricCard label="AVM Estimate" value={fmtCurrency(avmEstimate)} />
            <MetricCard
              label="Lot Size"
              value={fmt(lotSf, '', ' sqft')}
              sub={lotAcres != null ? `${lotAcres} acres` : null}
            />
            <MetricCard
              label="Building"
              value={fmt(buildingSf, '', ' SF')}
              sub={yearBuilt ? `Built ${yearBuilt}` : null}
            />
            <MetricCard
              label="Last Sale"
              value={fmtCurrency(lastSalePrice)}
              sub={lastSaleDate ? fmtDate(lastSaleDate) : null}
            />
            <MetricCard label="Annual Tax" value={fmtCurrency(annualTax)} />
          </div>

          {/* Ownership Summary */}
          <CardShell>
            <CardHeader
              title="Ownership Summary"
              linkText="Full History \u2192"
              onLinkClick={() => onTabChange?.('Ownership')}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <DataRow label="Owner" value={owner} />
              <DataRow label="Owner Type" value={ownershipType} />
              <DataRow
                label="Absentee"
                value={isAbsentee != null ? (isAbsentee ? 'Yes' : 'No') : null}
              />
              <DataRow label="Mailing" value={mailingAddress} />
              <DataRow label="Ownership Length" value={fmtDate(transferDate)} />
            </div>
          </CardShell>

          {/* Mortgage Summary */}
          <CardShell>
            <CardHeader
              title="Mortgage Summary"
              linkText="Details \u2192"
              onLinkClick={() => onTabChange?.('Financials')}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <DataRow label="Lender" value={lender} />
              <DataRow label="Balance" value={fmtCurrency(mortgageBalance)} />
              <DataRow
                label="Rate / Term"
                value={
                  mortgageRate != null || mortgageTerm != null
                    ? `${mortgageRate != null ? fmtPct(mortgageRate) : '\u2014'} / ${mortgageTerm ?? '\u2014'}yr`
                    : null
                }
              />
              <DataRow label="Maturity" value={fmtDate(mortgageMaturity)} />
            </div>
            {ltv != null && (
              <div style={{ paddingTop: 4 }}>
                <ProgressBar label="Est. LTV" value={ltv} color={t.accent.primary} />
              </div>
            )}
          </CardShell>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ flex: 2, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* AI Quick Take */}
          <CardShell style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} style={{ color: t.accent.green }} />
              <span style={{
                fontSize: 14,
                fontWeight: 700,
                color: t.accent.green,
                fontFamily: t.font.display,
              }}>
                AI Quick Take
              </span>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              padding: '12px 0',
            }}>
              <span style={{
                fontSize: 12,
                color: t.text.tertiary,
                fontFamily: t.font.display,
                textAlign: 'center',
              }}>
                No analysis generated yet
              </span>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: '#fff',
                background: t.accent.green,
                border: 'none',
                borderRadius: 6,
                padding: '8px 16px',
                cursor: 'pointer',
                fontFamily: t.font.display,
              }}>
                <Zap size={14} />
                Generate Analysis
              </button>
            </div>
          </CardShell>

          {/* Location Snapshot */}
          <CardShell>
            <CardHeader
              title="Location"
              linkText="Map \u2192"
              onLinkClick={() => onTabChange?.('Location')}
            />
            {/* Map placeholder */}
            <div style={{
              width: '100%',
              height: 100,
              borderRadius: 6,
              background: t.bg.tertiary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <MapPin size={20} style={{ color: t.text.quaternary }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <DataRow label="Submarket" value={d.submarket} />
              <DataRow label="Vacancy" value={d.vacancy != null ? `${d.vacancy}%` : null} accent={d.vacancy != null && d.vacancy < 10} />
              <DataRow label="Avg Rent" value={d.avgRent} />
            </div>
          </CardShell>
        </div>
      </div>
    </div>
  );
}
