import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../../theme.jsx';
import DataRow from '../shared/DataRow.jsx';
import SectionHeader from '../shared/SectionHeader.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';
import DataTable from '../shared/DataTable.jsx';

function fmtCurrency(val) {
  if (val == null) return '\u2014';
  return `$${Number(val).toLocaleString()}`;
}

function fmtPct(val) {
  if (val == null) return null;
  return `${Number(val).toFixed(3)}%`;
}

function buildHistoryRows(assessments) {
  if (!assessments || assessments.length === 0) return [];
  const sorted = [...assessments].sort((a, b) => {
    const ya = a.tax_year ?? a.taxYear ?? 0;
    const yb = b.tax_year ?? b.taxYear ?? 0;
    return yb - ya;
  });

  return sorted.map((row, i) => {
    const assessed = row.assessed_value_total ?? row.assessedValueTotal ?? null;
    const prev = sorted[i + 1];
    const prevAssessed = prev ? (prev.assessed_value_total ?? prev.assessedValueTotal ?? null) : null;
    let yoyChange = null;
    if (assessed != null && prevAssessed != null && prevAssessed !== 0) {
      yoyChange = ((assessed - prevAssessed) / prevAssessed) * 100;
    }
    return {
      id: row.tax_year ?? row.taxYear ?? i,
      tax_year: row.tax_year ?? row.taxYear,
      assessed_value_total: assessed,
      market_value_total: row.market_value_total ?? row.marketValueTotal ?? null,
      tax_amount_billed: row.tax_amount_billed ?? row.taxAmountBilled ?? null,
      yoy_change: yoyChange,
    };
  });
}

function YoyCell({ value, t }) {
  if (value == null) return <span style={{ color: t.text.quaternary }}>{'\u2014'}</span>;
  const isUp = value >= 0;
  const Icon = isUp ? TrendingUp : TrendingDown;
  const color = isUp ? t.accent.green : t.semantic.error;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color, fontFamily: t.font.mono, fontSize: 12 }}>
      <Icon size={12} />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export default function TaxTab({ data }) {
  const { t } = useTheme();

  const assessments = data?.taxAssessments ?? data?.tax_assessments ?? [];
  const current = assessments[0] ?? {};

  const taxYear = current.tax_year ?? current.taxYear ?? null;
  const assessedTotal = current.assessed_value_total ?? current.assessedValueTotal ?? null;
  const assessedLand = current.assessed_value_land ?? current.assessedValueLand ?? null;
  const assessedImpr = current.assessed_value_improvements ?? current.assessedValueImprovements ?? null;
  const marketTotal = current.market_value_total ?? current.marketValueTotal ?? null;
  const marketLand = current.market_value_land ?? current.marketValueLand ?? null;
  const marketImpr = current.market_value_improvements ?? current.marketValueImprovements ?? null;
  const taxBilled = current.tax_amount_billed ?? current.taxAmountBilled ?? null;
  const taxRate = current.tax_rate ?? current.taxRate ?? null;

  const delinquentYear = current.tax_delinquent_year ?? current.taxDelinquentYear
    ?? data?.tax_delinquent_year ?? data?.taxDelinquentYear ?? null;

  const homeExempt = current.has_homeowner_exemption ?? current.hasHomeownerExemption ?? false;
  const seniorExempt = current.has_senior_exemption ?? current.hasSeniorExemption ?? false;
  const vetExempt = current.has_veteran_exemption ?? current.hasVeteranExemption ?? false;
  const disabledExempt = current.has_disabled_exemption ?? current.hasDisabledExemption ?? false;
  const hasAnyExemption = homeExempt || seniorExempt || vetExempt || disabledExempt;

  const historyRows = buildHistoryRows(assessments);

  const tableColumns = [
    { key: 'tax_year', label: 'Year', align: 'left' },
    { key: 'assessed_value_total', label: 'Assessed', align: 'right', format: (v) => fmtCurrency(v) },
    { key: 'market_value_total', label: 'Market', align: 'right', format: (v) => fmtCurrency(v) },
    { key: 'tax_amount_billed', label: 'Tax Billed', align: 'right', format: (v) => fmtCurrency(v) },
    {
      key: 'yoy_change',
      label: 'YoY',
      align: 'right',
      format: (v) => <YoyCell value={v} t={t} />,
    },
  ];

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Tax Delinquency Warning */}
      {delinquentYear && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          borderRadius: 8,
          background: t.bg.secondary,
          border: `1px solid ${t.semantic.error}`,
        }}>
          <AlertTriangle size={18} style={{ color: t.semantic.error, flexShrink: 0 }} />
          <StatusBadge label={`DELINQUENT \u2014 ${delinquentYear}`} variant="error" />
        </div>
      )}

      {/* Current Assessment */}
      <div>
        <SectionHeader title="Current Assessment" />

        {/* Large assessed total */}
        {assessedTotal != null && (
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            color: t.text.primary,
            fontFamily: t.font.mono,
            padding: '4px 0 12px',
          }}>
            {fmtCurrency(assessedTotal)}
            {taxYear && (
              <span style={{
                fontSize: 12,
                fontWeight: 400,
                color: t.text.quaternary,
                marginLeft: 8,
                fontFamily: t.font.display,
              }}>
                ({taxYear})
              </span>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <DataRow label="Tax Year" value={taxYear} />
          <DataRow label="Assessed Total" value={fmtCurrency(assessedTotal)} />
          <DataRow label="Assessed Land" value={fmtCurrency(assessedLand)} />
          <DataRow label="Assessed Improvements" value={fmtCurrency(assessedImpr)} />
          <DataRow label="Market Total" value={fmtCurrency(marketTotal)} />
          <DataRow label="Market Land" value={fmtCurrency(marketLand)} />
          <DataRow label="Market Improvements" value={fmtCurrency(marketImpr)} />
          <DataRow label="Tax Billed" value={fmtCurrency(taxBilled)} />
          <DataRow label="Tax Rate" value={fmtPct(taxRate)} />
        </div>
      </div>

      {/* Exemptions */}
      {hasAnyExemption && (
        <div>
          <SectionHeader title="Exemptions" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {homeExempt && <StatusBadge label="Homeowner" variant="success" />}
            {seniorExempt && <StatusBadge label="Senior" variant="success" />}
            {vetExempt && <StatusBadge label="Veteran" variant="success" />}
            {disabledExempt && <StatusBadge label="Disabled" variant="success" />}
          </div>
        </div>
      )}

      {/* Tax History */}
      {historyRows.length > 0 && (
        <div>
          <SectionHeader title="Tax History" count={historyRows.length} />
          <DataTable columns={tableColumns} rows={historyRows} />
        </div>
      )}
    </div>
  );
}
