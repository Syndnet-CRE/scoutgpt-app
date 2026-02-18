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
    <div style={{
      display: 'flex',
      padding: 20,
      gap: 20,
    }}>
      {/* \u2500\u2500 LEFT COLUMN \u2500\u2500 */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Key Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionHeader title="Key Metrics" count={6} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <MetricCard label="Assessed Value" value={fmtCurrency(assessedValue)} />
              <MetricCard label="AVM Estimate" value={fmtCurrency(avmEstimate)} />
              <MetricCard
                label="Lot Size"
                value={fmt(lotSf, '', ' sqft')}
                sub={lotAcres != null ? `${lotAcres} acres` : null}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
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
            <DataRow label="Owner Type" value={ownershipType} mono={false} />
            <DataRow
              label="Absentee"
              value={isAbsentee != null ? (isAbsentee ? 'Yes' : 'No') : null}
              mono={false}
            />
            <DataRow label="Mailing" value={mailingAddress} mono={false} />
            <DataRow label="Transfer Date" value={fmtDate(transferDate)} mono={false} />
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
                  ? `${mortgageRate != null ? fmtPct(mortgageRate) : '\u2014'} / ${mortgageTerm ?? '\u2014'}yr`
                  : null
              }
            />
            <DataRow label="Due Date" value={fmtDate(mortgageMaturity)} mono={false} />
          </div>
          {ltv != null && (
            <div style={{ paddingTop: 4 }}>
              <ProgressBar label="Est. LTV" value={ltv} color={t.accent.primary} />
            </div>
          )}
        </CardShell>
      </div>

      {/* \u2500\u2500 RIGHT COLUMN \u2500\u2500 */}
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
            <DataRow label="Avg Rent" value={d.avgRent} />
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
