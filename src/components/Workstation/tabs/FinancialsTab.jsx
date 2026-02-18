import { useTheme } from '../../../theme.jsx';
import SectionHeader from '../shared/SectionHeader.jsx';
import DataRow from '../shared/DataRow.jsx';
import MetricCard from '../shared/MetricCard.jsx';
import ProgressBar from '../shared/ProgressBar.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';

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

function LoanCard({ loan, t }) {
  const pos = loan.loan_position ?? loan.loanPosition ?? null;
  const amount = loan.loan_amount ?? loan.loanAmount ?? null;
  const lender = loan.lender_name_first ?? loan.lenderNameFirst ?? loan.lender_name_standardized ?? loan.lenderNameStandardized ?? null;
  const lenderCode = loan.lender_code ?? loan.lenderCode ?? null;
  const rate = loan.interest_rate ?? loan.interestRate ?? null;
  const rateType = loan.interest_rate_type ?? loan.interestRateType ?? null;
  const loanType = loan.loan_type ?? loan.loanType ?? null;
  const mortgageType = loan.mortgage_type ?? loan.mortgageType ?? null;
  const term = loan.loan_term ?? loan.loanTerm ?? null;
  const dueDate = loan.due_date ?? loan.dueDate ?? null;
  const recordDate = loan.recording_date ?? loan.recordingDate ?? null;
  const docNum = loan.document_number ?? loan.documentNumber ?? null;
  const estBalance = loan.estimated_balance ?? loan.estimatedBalance ?? null;
  const estPayment = loan.estimated_monthly_payment ?? loan.estimatedMonthlyPayment ?? null;

  return (
    <div style={{
      background: t.bg.secondary,
      border: `1px solid ${t.border.default}`,
      borderRadius: 12,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      marginBottom: 12,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: t.text.secondary, fontFamily: t.font.display, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Position {pos ?? '\u2014'}
        </span>
        <span style={{ fontSize: 20, fontWeight: 700, color: t.text.primary, fontFamily: t.font.mono }}>
          {fmtCurrency(amount)}
        </span>
      </div>

      {/* 2-col detail grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <DataRow label="Lender" value={lender} mono={false} />
          <DataRow label="Lender Code" value={lenderCode} />
          <DataRow label="Interest Rate" value={fmtPct(rate)} />
          <DataRow label="Rate Type" value={rateType} mono={false} />
          <DataRow label="Loan Type" value={loanType} mono={false} />
          <DataRow label="Mortgage Type" value={mortgageType} mono={false} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <DataRow label="Term" value={term} />
          <DataRow label="Due Date" value={fmtDate(dueDate)} />
          <DataRow label="Recording Date" value={fmtDate(recordDate)} />
          <DataRow label="Document #" value={docNum} />
          <DataRow label="Est. Balance" value={fmtCurrency(estBalance)} accent />
          <DataRow label="Est. Monthly" value={fmtCurrency(estPayment)} />
        </div>
      </div>
    </div>
  );
}

export default function FinancialsTab({ data }) {
  const { t } = useTheme();

  const loans = data?.currentLoans ?? data?.current_loans ?? [];
  const val = Array.isArray(data?.valuations) ? data.valuations[0] : (data?.valuations ?? data?.valuation ?? {});

  const estimatedValue = val?.estimated_value ?? val?.estimatedValue ?? null;
  const estMin = val?.estimated_min_value ?? val?.estimatedMinValue ?? null;
  const estMax = val?.estimated_max_value ?? val?.estimatedMaxValue ?? null;
  const confidence = val?.confidence_score ?? val?.confidenceScore ?? null;
  const valDate = val?.valuation_date ?? val?.valuationDate ?? null;
  const rentalValue = val?.estimated_rental_value ?? val?.estimatedRentalValue ?? null;

  const ltv = val?.ltv ?? data?.ltv ?? data?.loan_to_value ?? null;
  const availableEquity = val?.available_equity ?? val?.availableEquity ?? null;
  const lendableEquity = val?.lendable_equity ?? val?.lendableEquity ?? null;

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Current Loans */}
      <div>
        <SectionHeader title="Current Loans" count={loans.length} />
        {loans.length === 0 ? (
          <div style={{
            background: t.bg.secondary,
            border: `1px solid ${t.border.default}`,
            borderRadius: 8,
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <StatusBadge label="No Active Loans on Record" variant="neutral" />
          </div>
        ) : (
          loans.map((loan, i) => (
            <LoanCard key={loan.document_number ?? loan.documentNumber ?? i} loan={loan} t={t} />
          ))
        )}
      </div>

      {/* Valuation & Equity */}
      <div>
        <SectionHeader title="Valuation & Equity" />

        {/* AVM center */}
        <div style={{
          background: t.bg.secondary,
          border: `1px solid ${t.border.default}`,
          borderRadius: 12,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          marginBottom: 16,
        }}>
          <span style={{ fontSize: 11, color: t.text.tertiary, fontFamily: t.font.display }}>
            AVM Estimated Value
          </span>
          <span style={{ fontSize: 28, fontWeight: 700, color: t.accent.green, fontFamily: t.font.mono }}>
            {fmtCurrency(estimatedValue)}
          </span>
          {(estMin != null || estMax != null) && (
            <span style={{ fontSize: 11, color: t.text.quaternary, fontFamily: t.font.mono }}>
              {fmtCurrency(estMin)} \u2014 {fmtCurrency(estMax)}
            </span>
          )}
        </div>

        {/* Confidence + Valuation Date */}
        {confidence != null && (
          <div style={{ marginBottom: 12 }}>
            <ProgressBar label="Confidence Score" value={confidence} color={t.accent.primary} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <DataRow label="Valuation Date" value={fmtDate(valDate)} />
          <DataRow label="Est. Rental Value" value={rentalValue != null ? `${fmtCurrency(rentalValue)}/yr` : null} />
        </div>

        {/* Equity metrics */}
        {ltv != null && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ProgressBar label="Loan-to-Value (LTV)" value={ltv} />
            <DataRow label="Available Equity" value={fmtCurrency(availableEquity)} accent />
            <DataRow label="Lendable Equity" value={fmtCurrency(lendableEquity)} accent />
          </div>
        )}
      </div>
    </div>
  );
}
