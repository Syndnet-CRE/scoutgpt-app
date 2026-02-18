import { Sparkles, MapPin, ArrowRight, ChevronRight, Zap } from 'lucide-react';
import { useTheme } from '../../../theme.jsx';
import MetricCard from '../shared/MetricCard.jsx';
import DataRow from '../shared/DataRow.jsx';
import SectionHeader from '../shared/SectionHeader.jsx';
import ProgressBar from '../shared/ProgressBar.jsx';

function CardShell({ children, style }) {
  const { t } = useTheme();
  return (
    <div style={{
      background: t.bg.primary,
      border: `1px solid ${t.border.default}`,
      borderRadius: 8,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
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

function ActivityDot({ color }) {
  return (
    <div style={{
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: color,
      flexShrink: 0,
      marginTop: 4,
    }} />
  );
}

function ActivityItem({ dot, text, time }) {
  const { t } = useTheme();
  return (
    <div style={{ display: 'flex', gap: 10, paddingTop: 3 }}>
      <ActivityDot color={dot} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 12, color: t.text.primary, fontFamily: t.font.display }}>
          {text}
        </span>
        <span style={{ fontSize: 11, color: t.text.quaternary, fontFamily: t.font.display }}>
          {time}
        </span>
      </div>
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

export default function OverviewTab({ data, onTabChange }) {
  const { t } = useTheme();

  const d = data || {};

  const assessedValue = d.assessed_value ?? d.assessedValue;
  const avmEstimate = d.avm_estimate ?? d.avmEstimate;
  const lotSize = d.lot_size ?? d.lotSize ?? d.lot_sqft;
  const buildingSf = d.building_sf ?? d.buildingSf ?? d.building_sqft;
  const lastSalePrice = d.last_sale_price ?? d.lastSalePrice;
  const lastSaleDate = d.last_sale_date ?? d.lastSaleDate;
  const annualTax = d.annual_tax ?? d.annualTax ?? d.tax_amount;

  const owner = d.owner ?? d.owner_name ?? d.ownerName;
  const ownerType = d.owner_type ?? d.ownerType;
  const mailingAddress = d.mailing_address ?? d.mailingAddress;
  const ownershipYears = d.ownership_years ?? d.ownershipYears;
  const ownerSince = d.owner_since ?? d.ownerSince;

  const lender = d.lender ?? d.mortgage_lender;
  const mortgageBalance = d.mortgage_balance ?? d.mortgageBalance;
  const mortgageRate = d.mortgage_rate ?? d.mortgageRate;
  const mortgageTerm = d.mortgage_term ?? d.mortgageTerm;
  const mortgageYear = d.mortgage_year ?? d.mortgageYear;
  const mortgageMaturity = d.mortgage_maturity ?? d.mortgageMaturity;
  const ltv = d.ltv ?? d.loan_to_value;

  return (
    <div style={{
      display: 'flex',
      padding: 20,
      gap: 20,
    }}>
      {/* ── LEFT COLUMN ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Key Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionHeader title="Key Metrics" count={6} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <MetricCard label="Assessed Value" value={fmtCurrency(assessedValue)} />
              <MetricCard label="AVM Estimate" value={fmtCurrency(avmEstimate)} />
              <MetricCard label="Lot Size" value={fmt(lotSize, '', ' sqft')} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <MetricCard label="Building" value={fmt(buildingSf, '', ' SF')} />
              <MetricCard
                label="Last Sale"
                value={fmtCurrency(lastSalePrice)}
                sub={lastSaleDate ?? null}
              />
              <MetricCard label="Annual Tax" value={fmtCurrency(annualTax)} />
            </div>
          </div>
        </div>

        {/* Ownership Summary */}
        <CardShell>
          <CardHeader
            title="Ownership Summary"
            linkText="Full History"
            onLinkClick={() => onTabChange?.('Ownership')}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <DataRow label="Owner" value={owner} mono={false} />
            <DataRow label="Owner Type" value={ownerType} mono={false} />
            <DataRow label="Mailing" value={mailingAddress} mono={false} />
            <DataRow
              label="Ownership Length"
              value={
                ownershipYears != null
                  ? `${ownershipYears} years${ownerSince ? ` (since ${ownerSince})` : ''}`
                  : null
              }
              mono={false}
            />
          </div>
        </CardShell>

        {/* Mortgage Summary */}
        <CardShell>
          <CardHeader
            title="Mortgage Summary"
            linkText="Details"
            onLinkClick={() => onTabChange?.('Financials')}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <DataRow label="Lender" value={lender} mono={false} />
            <DataRow label="Balance" value={fmtCurrency(mortgageBalance)} />
            <DataRow
              label="Rate / Term"
              value={
                mortgageRate != null || mortgageTerm != null
                  ? `${mortgageRate ?? '\u2014'}% / ${mortgageTerm ?? '\u2014'}yr${mortgageYear ? ` (${mortgageYear})` : ''}`
                  : null
              }
            />
            <DataRow label="Maturity" value={mortgageMaturity} mono={false} />
          </div>
          {ltv != null && (
            <div style={{ paddingTop: 4 }}>
              <ProgressBar label="Est. LTV" value={ltv} color={t.accent.primary} />
            </div>
          )}
        </CardShell>
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* AI Quick Take */}
        <CardShell style={{
          background: t.accent.primaryMuted,
          border: `1px solid ${t.accent.primaryBorder}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} style={{ color: t.semantic.info }} />
            <span style={{
              fontSize: 14,
              fontWeight: 600,
              color: t.semantic.info,
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
              AI analysis not yet generated for this property.
            </span>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: t.semantic.info,
              background: 'none',
              border: `1px solid ${t.accent.primaryBorder}`,
              borderRadius: 6,
              padding: '6px 12px',
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
            linkText="Map"
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
            <DataRow label="Submarket" value={d.submarket} mono={false} />
            <DataRow label="Vacancy" value={d.vacancy != null ? `${d.vacancy}%` : null} accent={d.vacancy != null && d.vacancy < 10} />
            <DataRow label="Avg Rent" value={d.avg_rent ?? d.avgRent} />
          </div>
        </CardShell>

        {/* Recent Activity */}
        <CardShell>
          <CardHeader title="Recent Activity" linkText="View All" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ActivityItem
              dot={t.accent.primary}
              text="Added to Pipeline: Underwriting"
              time="2 hours ago"
            />
            <ActivityItem
              dot={t.accent.green}
              text="AI Analysis Completed"
              time="5 hours ago"
            />
            <ActivityItem
              dot={t.semantic.warning}
              text="Owner Contact Info Found"
              time="Yesterday"
            />
            <ActivityItem
              dot={t.text.quaternary}
              text="Property Bookmarked"
              time="3 days ago"
            />
          </div>
        </CardShell>
      </div>
    </div>
  );
}
