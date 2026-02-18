import { useMemo } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useTheme } from '../../../theme.jsx';
import SectionHeader from '../shared/SectionHeader.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';
import MetricCard from '../shared/MetricCard.jsx';
import DataRow from '../shared/DataRow.jsx';
import DataTable from '../shared/DataTable.jsx';

function fmtCurrency(val) {
  if (val == null) return '\u2014';
  return `$${Number(val).toLocaleString()}`;
}

function fmtDate(val) {
  if (!val) return '\u2014';
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtPct(val) {
  if (val == null) return null;
  return `${Number(val).toFixed(2)}%`;
}

function recordTypeBadge(type) {
  if (!type) return 'neutral';
  const t = type.toUpperCase();
  if (t === 'NTS' || t === 'LIS') return 'error';
  if (t === 'NOD') return 'warning';
  if (t === 'REO') return 'info';
  return 'neutral';
}

function isFutureDate(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) > new Date();
}

function ForeclosureCard({ record, t }) {
  const recType = record.recordType ?? null;
  const status = record.status ?? null;
  const filingDate = record.foreclosureRecordingDate ?? null;
  const defaultAmt = record.defaultAmount ?? null;
  const loanBalance = record.loanBalance ?? null;
  const estimatedValue = record.estimatedValue ?? null;

  const auctionDate = record.auctionDate ?? null;
  const auctionBid = record.auctionOpeningBid ?? null;
  const auctionAddr = record.auctionAddress ?? null;
  const isFutureAuction = isFutureDate(auctionDate);

  return (
    <div style={{
      background: t.bg.primary,
      border: `1px solid ${t.border.default}`,
      borderLeft: `3px solid ${t.semantic.error}`,
      borderRadius: 8,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}>
      {/* Header: badges + date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {recType && <StatusBadge label={recType.toUpperCase()} variant={recordTypeBadge(recType)} />}
        {status && <StatusBadge label={status} variant="neutral" />}
        {filingDate && (
          <span style={{ fontSize: 11, color: t.text.tertiary, fontFamily: t.font.mono, marginLeft: 'auto' }}>
            Filed {fmtDate(filingDate)}
          </span>
        )}
      </div>

      {/* Key metrics */}
      <div style={{ display: 'flex', gap: 8 }}>
        <MetricCard label="Default Amount" value={fmtCurrency(defaultAmt)} />
        <MetricCard label="Loan Balance" value={fmtCurrency(loanBalance)} />
        <MetricCard label="Est. Value" value={fmtCurrency(estimatedValue)} />
      </div>

      {/* Detail rows */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <DataRow label="Case #" value={record.caseNumber} />
          <DataRow label="Document #" value={record.documentNumber} />
          <DataRow label="Original Loan" value={fmtCurrency(record.originalLoanAmount)} />
          <DataRow label="Orig. Loan Date" value={fmtDate(record.originalLoanRecordingDate)} />
          <DataRow label="Orig. Rate" value={fmtPct(record.originalLoanInterestRate)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <DataRow label="Maturity" value={fmtDate(record.loanMaturityDate)} />
          <DataRow label="Borrower" value={record.borrowerName} mono={false} />
          <DataRow label="Lender" value={record.lenderNameStandardized} mono={false} />
          <DataRow label="Trustee" value={record.trusteeName} mono={false} />
        </div>
      </div>

      {/* Auction section */}
      {auctionDate && (
        <div style={{
          background: isFutureAuction ? t.accent.greenMuted : t.bg.secondary,
          border: `1px solid ${isFutureAuction ? t.accent.green : t.border.default}`,
          borderRadius: 6,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: isFutureAuction ? t.accent.green : t.text.tertiary, fontFamily: t.font.display }}>
              Auction {isFutureAuction ? '(Upcoming)' : '(Past)'}
            </span>
          </div>
          <DataRow label="Auction Date" value={fmtDate(auctionDate)} accent={isFutureAuction} />
          <DataRow label="Opening Bid" value={fmtCurrency(auctionBid)} />
          <DataRow label="Auction Address" value={auctionAddr} mono={false} />
        </div>
      )}
    </div>
  );
}

export default function DistressTab({ data }) {
  const { t } = useTheme();

  const assessments = data?.taxAssessments ?? [];
  const current = assessments[0] ?? {};
  const delinquentYear = current.taxDelinquentYear ?? null;
  const taxBilled = current.taxAmountBilled ?? null;

  const foreclosures = data?.foreclosureRecords ?? [];

  const sales = data?.salesTransactions ?? [];
  const distressedSales = useMemo(
    () => sales.filter((s) => s.isDistressed || s.isForeclosureAuction),
    [sales]
  );

  const hasAnyDistress = delinquentYear || foreclosures.length > 0 || distressedSales.length > 0;

  const distressedColumns = [
    { key: 'recordingDate', label: 'Date', format: (v) => fmtDate(v) },
    { key: 'salePrice', label: 'Price', align: 'right', format: (v) => fmtCurrency(v) },
    {
      key: '_type', label: 'Type', format: (_, row) => {
        return <StatusBadge label={row.isForeclosureAuction ? 'Auction' : 'Distressed'} variant="error" />;
      },
    },
    { key: 'grantor1NameFull', label: 'Grantor' },
    { key: 'grantee1NameFull', label: 'Grantee' },
  ];

  const distressedRows = distressedSales.map((s, i) => ({
    id: s.transactionId ?? i,
    recordingDate: s.recordingDate,
    salePrice: s.salePrice,
    grantor1NameFull: s.grantor1NameFull ?? '\u2014',
    grantee1NameFull: s.grantee1NameFull ?? '\u2014',
    isForeclosureAuction: s.isForeclosureAuction,
    isDistressed: s.isDistressed,
  }));

  /* \u2500\u2500 No Distress \u2500\u2500 */
  if (!hasAnyDistress) {
    return (
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{
          background: t.bg.primary,
          border: `1px solid ${t.accent.green}`,
          borderRadius: 8,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}>
          <CheckCircle size={28} style={{ color: t.accent.green }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: t.accent.green, fontFamily: t.font.display }}>
            No Distress Signals
          </span>
          <span style={{ fontSize: 12, color: t.text.tertiary, fontFamily: t.font.display, textAlign: 'center' }}>
            No tax delinquencies, foreclosures, or distressed sales found for this property.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Tax Delinquency Banner */}
      {delinquentYear && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          borderRadius: 8,
          background: t.bg.secondary,
          border: `1px solid ${t.semantic.error}`,
        }}>
          <AlertTriangle size={20} style={{ color: t.semantic.error, flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <StatusBadge label={`DELINQUENT \u2014 ${delinquentYear}`} variant="error" />
            {taxBilled != null && (
              <span style={{ fontSize: 11, color: t.text.tertiary, fontFamily: t.font.mono, marginTop: 4 }}>
                Tax billed: {fmtCurrency(taxBilled)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Active Foreclosures */}
      {foreclosures.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionHeader title="Active Foreclosures" count={foreclosures.length} />
          {foreclosures.map((rec, i) => (
            <ForeclosureCard key={rec.caseNumber ?? i} record={rec} t={t} />
          ))}
        </div>
      )}

      {/* Distressed Sales */}
      {distressedRows.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionHeader title="Distressed Sales" count={distressedRows.length} />
          <DataTable columns={distressedColumns} rows={distressedRows} />
        </div>
      )}
    </div>
  );
}
