import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, FileX } from 'lucide-react';
import { useTheme } from '../../../theme.jsx';
import SectionHeader from '../shared/SectionHeader.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';

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
  if (val == null) return '\u2014';
  return `${Number(val).toFixed(2)}%`;
}

function DetailRow({ label, value, t, mono = true }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', gap: 12 }}>
      <span style={{ fontSize: 11, color: t.text.tertiary, fontFamily: t.font.display, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 500, color: t.text.secondary, fontFamily: t.font.display, textAlign: 'right' }}>
        {value ?? '\u2014'}
      </span>
    </div>
  );
}

function MortgageSection({ mortgages, t }) {
  const [expanded, setExpanded] = useState(false);

  if (!mortgages || mortgages.length === 0) return null;

  return (
    <div style={{ borderTop: `1px solid ${t.border.subtle}`, paddingTop: 8, marginTop: 4 }}>
      <button
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: t.text.tertiary,
          fontFamily: t.font.display,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          marginBottom: expanded ? 8 : 0,
        }}
      >
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        Mortgage ({mortgages.length})
      </button>

      {expanded && mortgages.map((m, mi) => (
        <div
          key={mi}
          style={{
            paddingLeft: 12,
            marginBottom: mi < mortgages.length - 1 ? 8 : 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <DetailRow label="Lender" value={m.lenderNameStandardized} t={t} mono={false} />
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <DetailRow label="Amount" value={fmtCurrency(m.loanAmount)} t={t} />
            </div>
            <div style={{ flex: 1 }}>
              <DetailRow label="Rate" value={m.interestRate != null ? `${m.interestRate}%` : null} t={t} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <DetailRow
                label="Term"
                value={m.loanTerm != null ? `${m.loanTerm}${m.loanTermType ? ` ${m.loanTermType}` : 'yr'}` : null}
                t={t}
              />
            </div>
            <div style={{ flex: 1 }}>
              <DetailRow label="Type" value={m.interestRateType} t={t} mono={false} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TransactionCard({ sale, t }) {
  return (
    <div style={{
      background: t.bg.secondary,
      border: `1px solid ${t.border.default}`,
      borderRadius: 8,
      padding: 12,
    }}>
      {/* Header: Date + Price */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: t.text.secondary, fontFamily: t.font.display }}>
          {fmtDate(sale.recordingDate)}
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: t.text.primary, fontFamily: t.font.display }}>
          {fmtCurrency(sale.salePrice)}
        </span>
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <DetailRow label="Document Type" value={sale.documentType} t={t} mono={false} />
        <DetailRow label="Grantor" value={sale.grantor1NameFull} t={t} mono={false} />
        <DetailRow label="Grantee" value={sale.grantee1NameFull} t={t} mono={false} />
      </div>

      {/* Flags row */}
      <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
        <div style={{ flex: 1 }}>
          <DetailRow
            label="Arms Length"
            value={sale.isArmsLength != null ? (sale.isArmsLength ? 'Yes' : 'No') : null}
            t={t}
            mono={false}
          />
        </div>
        <div style={{ flex: 1 }}>
          <DetailRow
            label="Distressed"
            value={sale.isDistressed != null ? (sale.isDistressed ? 'Yes' : 'No') : null}
            t={t}
            mono={false}
          />
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
        {sale.granteeInvestorFlag && <StatusBadge label="Investor" variant="info" />}
        {sale.isForeclosureAuction && <StatusBadge label="Foreclosure" variant="error" />}
        {sale.isDistressed && <StatusBadge label="Distressed" variant="error" />}
      </div>

      {/* Mortgage sub-section */}
      <MortgageSection mortgages={sale.mortgages} t={t} />
    </div>
  );
}

export default function TransactionsTab({ data }) {
  const { t } = useTheme();

  const sales = data?.salesTransactions ?? [];

  const sorted = useMemo(() => {
    return [...sales].sort((a, b) => {
      const ad = a.recordingDate ?? '';
      const bd = b.recordingDate ?? '';
      return bd.localeCompare(ad);
    });
  }, [sales]);

  if (sorted.length === 0) {
    return (
      <div style={{
        padding: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}>
        <FileX size={32} style={{ color: t.text.quaternary }} />
        <span style={{ fontSize: 13, color: t.text.tertiary, fontFamily: t.font.display }}>
          No recorded transactions
        </span>
      </div>
    );
  }

  return (
    <div style={{
      overflowY: 'auto',
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <SectionHeader title="Sales History" count={sorted.length} />

      {sorted.map((sale, i) => (
        <TransactionCard
          key={sale.transactionId ?? i}
          sale={sale}
          t={t}
        />
      ))}
    </div>
  );
}
