import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
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
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', gap: 12 }}>
      <span style={{ fontSize: 11, color: t.text.tertiary, fontFamily: t.font.display, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 500, color: t.text.secondary, fontFamily: mono ? t.font.mono : t.font.display, textAlign: 'right' }}>
        {value ?? '\u2014'}
      </span>
    </div>
  );
}

const COLS = [
  { key: 'recording_date', label: 'Date', w: '15%' },
  { key: 'sale_price', label: 'Price', w: '16%', align: 'right' },
  { key: 'document_type', label: 'Doc Type', w: '14%' },
  { key: 'grantor1_name_full', label: 'Grantor', w: '18%' },
  { key: 'grantee1_name_full', label: 'Grantee', w: '18%' },
  { key: 'is_arms_length', label: 'Arms Length', w: '10%', align: 'center' },
  { key: 'is_distressed', label: 'Distressed', w: '9%', align: 'center' },
];

export default function TransactionsTab({ data }) {
  const { t } = useTheme();
  const [expandedId, setExpandedId] = useState(null);
  const [sortKey, setSortKey] = useState('recording_date');
  const [sortDir, setSortDir] = useState('desc');
  const [hoveredRow, setHoveredRow] = useState(null);

  const sales = data?.salesTransactions ?? data?.sales_transactions ?? [];
  const mortgages = data?.mortgageRecords ?? data?.mortgage_records ?? [];

  const sorted = useMemo(() => {
    if (!sortKey) return sales;
    return [...sales].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [sales, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const getMortgagesForTx = (txId) => {
    if (!txId) return [];
    return mortgages.filter((m) =>
      (m.transactionId ?? m.transaction_id) === txId
    );
  };

  const thStyle = (col) => ({
    position: 'sticky', top: 0, background: t.bg.secondary,
    padding: '8px 10px', fontSize: 10, fontWeight: 600,
    letterSpacing: '0.05em', textTransform: 'uppercase',
    color: t.text.tertiary, fontFamily: t.font.display,
    textAlign: col.align || 'left', borderBottom: `1px solid ${t.border.default}`,
    cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', width: col.w,
  });

  const SortIcon = ({ col }) => {
    if (sortKey !== col.key) return null;
    const I = sortDir === 'asc' ? ChevronUp : ChevronDown;
    return <I size={12} style={{ color: t.accent.green, marginLeft: 2, verticalAlign: 'middle' }} />;
  };

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader title="Sales History" count={sales.length} />

      <div style={{ borderRadius: 8, border: `1px solid ${t.border.default}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {COLS.map((col) => (
                <th key={col.key} onClick={() => handleSort(col.key)} style={thStyle(col)}>
                  {col.label}<SortIcon col={col} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={COLS.length} style={{ padding: 24, textAlign: 'center', fontSize: 12, color: t.text.tertiary, fontFamily: t.font.display }}>
                  No transaction records
                </td>
              </tr>
            ) : sorted.map((row, i) => {
              const txId = row.transactionId ?? row.transaction_id ?? i;
              const isExpanded = expandedId === txId;
              const linkedMortgages = getMortgagesForTx(row.transactionId ?? row.transaction_id);

              return (
                <tbody key={txId}>
                  <tr
                    onClick={() => setExpandedId(isExpanded ? null : txId)}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      cursor: 'pointer',
                      background: isExpanded ? t.bg.tertiary : hoveredRow === i ? t.bg.tertiary : i % 2 === 0 ? t.bg.primary : t.bg.secondary,
                      transition: 'background 0.1s ease',
                    }}
                  >
                    <td style={{ padding: '8px 10px', fontSize: 12, fontFamily: t.font.mono, color: t.text.primary, borderBottom: `1px solid ${t.border.subtle}` }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {isExpanded ? <ChevronDown size={12} style={{ color: t.text.tertiary }} /> : <ChevronRight size={12} style={{ color: t.text.tertiary }} />}
                        {fmtDate(row.recording_date ?? row.recordingDate)}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: 12, fontFamily: t.font.mono, color: t.text.primary, textAlign: 'right', borderBottom: `1px solid ${t.border.subtle}` }}>
                      {fmtCurrency(row.sale_price ?? row.salePrice)}
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: 12, fontFamily: t.font.display, color: t.text.primary, borderBottom: `1px solid ${t.border.subtle}` }}>
                      {row.document_type ?? row.documentType ?? '\u2014'}
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: 12, fontFamily: t.font.display, color: t.text.primary, borderBottom: `1px solid ${t.border.subtle}` }}>
                      {row.grantor1_name_full ?? row.grantor1NameFull ?? '\u2014'}
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: 12, fontFamily: t.font.display, color: t.text.primary, borderBottom: `1px solid ${t.border.subtle}` }}>
                      {row.grantee1_name_full ?? row.grantee1NameFull ?? '\u2014'}
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: 12, textAlign: 'center', borderBottom: `1px solid ${t.border.subtle}` }}>
                      {(row.is_arms_length ?? row.isArmsLength) != null
                        ? <StatusBadge label={(row.is_arms_length ?? row.isArmsLength) ? 'Yes' : 'No'} variant={(row.is_arms_length ?? row.isArmsLength) ? 'success' : 'neutral'} />
                        : <span style={{ color: t.text.quaternary }}>{'\u2014'}</span>}
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: 12, textAlign: 'center', borderBottom: `1px solid ${t.border.subtle}` }}>
                      {(row.is_distressed ?? row.isDistressed)
                        ? <StatusBadge label="Yes" variant="error" />
                        : <span style={{ color: t.text.quaternary }}>{'\u2014'}</span>}
                    </td>
                  </tr>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={COLS.length} style={{ padding: 0, borderBottom: `1px solid ${t.border.default}` }}>
                        <div style={{ padding: '12px 16px', background: t.bg.secondary, display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {/* Full details */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                            <div>
                              <DetailRow label="Transaction ID" value={row.transactionId ?? row.transaction_id} t={t} />
                              <DetailRow label="Document #" value={row.document_number ?? row.documentNumber} t={t} />
                              <DetailRow label="Price Description" value={row.sale_price_description ?? row.salePriceDescription} t={t} mono={false} />
                              <DetailRow label="Grantor 2" value={row.grantor2 ?? row.grantor2_name_full} t={t} mono={false} />
                              <DetailRow label="Grantee 2" value={row.grantee2 ?? row.grantee2_name_full} t={t} mono={false} />
                            </div>
                            <div>
                              {(row.grantee_investor_flag ?? row.granteeInvestorFlag) && (
                                <div style={{ padding: '4px 0' }}><StatusBadge label="INVESTOR" variant="info" /></div>
                              )}
                              <DetailRow label="Multi-Parcel" value={row.is_multi_parcel ?? row.isMultiParcel ? 'Yes' : 'No'} t={t} mono={false} />
                              <DetailRow label="Foreclosure Auction" value={row.is_foreclosure_auction ?? row.isForeclosureAuction ? 'Yes' : 'No'} t={t} mono={false} />
                              <DetailRow label="Down Payment" value={fmtCurrency(row.down_payment ?? row.downPayment)} t={t} />
                              <DetailRow label="Purchase LTV" value={fmtPct(row.purchase_ltv ?? row.purchaseLtv)} t={t} />
                            </div>
                          </div>

                          {/* Linked Mortgages */}
                          {linkedMortgages.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.text.tertiary, fontFamily: t.font.display }}>
                                Linked Mortgages ({linkedMortgages.length})
                              </span>
                              <div style={{ borderRadius: 6, border: `1px solid ${t.border.default}`, overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                  <thead>
                                    <tr>
                                      {['Pos', 'Amount', 'Lender', 'Rate', 'Type', 'Term', 'Due'].map((h) => (
                                        <th key={h} style={{ padding: '6px 8px', fontSize: 9, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: t.text.quaternary, fontFamily: t.font.display, background: t.bg.tertiary, borderBottom: `1px solid ${t.border.default}`, textAlign: h === 'Amount' || h === 'Rate' ? 'right' : 'left' }}>
                                          {h}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {linkedMortgages.map((m, mi) => (
                                      <tr key={mi} style={{ background: mi % 2 === 0 ? t.bg.primary : t.bg.secondary }}>
                                        <td style={{ padding: '5px 8px', fontSize: 11, fontFamily: t.font.mono, color: t.text.primary, borderBottom: `1px solid ${t.border.subtle}` }}>
                                          {m.mortgage_position ?? m.mortgagePosition ?? '\u2014'}
                                        </td>
                                        <td style={{ padding: '5px 8px', fontSize: 11, fontFamily: t.font.mono, color: t.text.primary, textAlign: 'right', borderBottom: `1px solid ${t.border.subtle}` }}>
                                          {fmtCurrency(m.loan_amount ?? m.loanAmount)}
                                        </td>
                                        <td style={{ padding: '5px 8px', fontSize: 11, fontFamily: t.font.display, color: t.text.primary, borderBottom: `1px solid ${t.border.subtle}` }}>
                                          {m.lender_name_standardized ?? m.lenderNameStandardized ?? '\u2014'}
                                        </td>
                                        <td style={{ padding: '5px 8px', fontSize: 11, fontFamily: t.font.mono, color: t.text.primary, textAlign: 'right', borderBottom: `1px solid ${t.border.subtle}` }}>
                                          {m.interest_rate ?? m.interestRate != null ? `${m.interest_rate ?? m.interestRate}%` : '\u2014'}
                                        </td>
                                        <td style={{ padding: '5px 8px', fontSize: 11, fontFamily: t.font.display, color: t.text.secondary, borderBottom: `1px solid ${t.border.subtle}` }}>
                                          {m.interest_rate_type ?? m.interestRateType ?? '\u2014'}
                                        </td>
                                        <td style={{ padding: '5px 8px', fontSize: 11, fontFamily: t.font.mono, color: t.text.primary, borderBottom: `1px solid ${t.border.subtle}` }}>
                                          {(m.loan_term ?? m.loanTerm) != null ? `${m.loan_term ?? m.loanTerm} ${m.loan_term_type ?? m.loanTermType ?? ''}`.trim() : '\u2014'}
                                        </td>
                                        <td style={{ padding: '5px 8px', fontSize: 11, fontFamily: t.font.mono, color: t.text.primary, borderBottom: `1px solid ${t.border.subtle}` }}>
                                          {fmtDate(m.due_date ?? m.dueDate)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
