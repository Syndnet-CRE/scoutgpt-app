import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import { useTheme } from '../../../theme.jsx';
import SectionHeader from '../shared/SectionHeader.jsx';
import MetricCard from '../shared/MetricCard.jsx';
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

function statusVariant(status) {
  if (!status) return 'neutral';
  const s = status.toLowerCase();
  if (['active', 'issued', 'final', 'complete', 'approved'].some((k) => s.includes(k))) return 'success';
  if (['pending', 'applied', 'review', 'submitted'].some((k) => s.includes(k))) return 'warning';
  if (['expired', 'cancelled', 'denied', 'revoked', 'void'].some((k) => s.includes(k))) return 'error';
  return 'neutral';
}

function truncate(str, max) {
  if (!str) return '\u2014';
  return str.length > max ? str.slice(0, max) + '\u2026' : str;
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
  { key: 'permitNumber', label: 'Permit #', w: '25%' },
  { key: 'effectiveDate', label: 'Date', w: '20%' },
  { key: 'permitType', label: 'Type', w: '20%' },
  { key: 'status', label: 'Status', w: '15%', align: 'center' },
  { key: 'jobValue', label: 'Value', w: '20%', align: 'right' },
];

export default function PermitsTab({ data }) {
  const { t } = useTheme();
  const [expandedId, setExpandedId] = useState(null);
  const [sortKey, setSortKey] = useState('effectiveDate');
  const [sortDir, setSortDir] = useState('desc');
  const [hoveredRow, setHoveredRow] = useState(null);

  const permits = data?.buildingPermits ?? [];

  const sorted = useMemo(() => {
    if (!sortKey) return permits;
    return [...permits].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [permits, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const totalValue = permits.reduce((sum, p) => sum + (p.jobValue ?? 0), 0);
  const mostRecent = permits.length > 0
    ? permits.reduce((latest, p) => {
        const d = p.effectiveDate;
        return d && (!latest || d > latest) ? d : latest;
      }, null)
    : null;

  const thStyle = (col) => ({
    position: 'sticky', top: 0, zIndex: 1, background: t.bg.primary,
    padding: '8px 10px', fontSize: 11, fontWeight: 600,
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
    <div style={{ overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Summary Stats */}
      <div style={{ display: 'flex', gap: 8 }}>
        <MetricCard label="Total Permits" value={permits.length} />
        <MetricCard label="Total Job Value" value={totalValue > 0 ? fmtCurrency(totalValue) : '\u2014'} />
        <MetricCard label="Most Recent" value={mostRecent ? fmtDate(mostRecent) : '\u2014'} />
      </div>

      <SectionHeader title="Building Permits" count={permits.length} />

      <div style={{ borderRadius: 8, border: `1px solid ${t.border.default}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: '0 4px' }}>
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
                  No building permits on record
                </td>
              </tr>
            ) : sorted.map((row, i) => {
              const rowId = row.permitNumber ?? i;
              const isExpanded = expandedId === rowId;
              const status = row.status ?? null;
              const desc = row.description ?? null;

              return (
                <tbody key={rowId}>
                  <tr
                    onClick={() => setExpandedId(isExpanded ? null : rowId)}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      cursor: 'pointer',
                      background: isExpanded ? t.bg.tertiary : hoveredRow === i ? t.bg.tertiary : i % 2 === 0 ? t.bg.primary : t.bg.secondary,
                      transition: 'background 0.1s ease',
                    }}
                  >
                    <td style={{ padding: '8px 10px', fontSize: 12, fontFamily: t.font.mono, color: t.text.primary, borderBottom: `1px solid ${t.border.subtle}`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {isExpanded ? <ChevronDown size={12} style={{ color: t.text.tertiary }} /> : <ChevronRight size={12} style={{ color: t.text.tertiary }} />}
                        {row.permitNumber ?? '\u2014'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: 12, fontFamily: t.font.mono, color: t.text.primary, borderBottom: `1px solid ${t.border.subtle}` }}>
                      {fmtDate(row.effectiveDate)}
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: 12, fontFamily: t.font.display, color: t.text.primary, borderBottom: `1px solid ${t.border.subtle}` }}>
                      {row.permitType ?? '\u2014'}
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: 12, textAlign: 'center', borderBottom: `1px solid ${t.border.subtle}` }}>
                      {status ? (
                        <span style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 4,
                          whiteSpace: 'nowrap',
                          background: statusVariant(status) === 'success' ? `rgba(52,199,89,0.15)`
                            : statusVariant(status) === 'warning' ? `rgba(255,214,10,0.15)`
                            : statusVariant(status) === 'error' ? `rgba(255,69,58,0.15)`
                            : t.bg.tertiary,
                          color: statusVariant(status) === 'success' ? t.semantic.success
                            : statusVariant(status) === 'warning' ? t.semantic.warning
                            : statusVariant(status) === 'error' ? t.semantic.error
                            : t.text.tertiary,
                        }}>
                          {status}
                        </span>
                      ) : <span style={{ color: t.text.quaternary }}>{'\u2014'}</span>}
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: 12, fontFamily: t.font.mono, color: t.text.primary, textAlign: 'right', borderBottom: `1px solid ${t.border.subtle}` }}>
                      {fmtCurrency(row.jobValue)}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={COLS.length} style={{ padding: 0, borderBottom: `1px solid ${t.border.default}` }}>
                        <div style={{ padding: '12px 16px', background: t.bg.secondary, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <DetailRow label="Sub Type" value={row.permitSubType} t={t} mono={false} />
                          <DetailRow label="Fees" value={fmtCurrency(row.fees)} t={t} />
                          <DetailRow label="Project Name" value={row.projectName} t={t} mono={false} />
                          <DetailRow label="Business Name" value={row.businessName} t={t} mono={false} />
                          <DetailRow label="Status Date" value={fmtDate(row.statusDate)} t={t} />
                          <DetailRow label="Address" value={row.addressFull} t={t} mono={false} />
                          {desc && (
                            <div style={{ paddingTop: 6 }}>
                              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.text.tertiary, fontFamily: t.font.display }}>
                                Description
                              </span>
                              <p style={{ fontSize: 12, color: t.text.primary, fontFamily: t.font.display, lineHeight: 1.5, margin: '4px 0 0', wordBreak: 'break-word' }}>
                                {desc}
                              </p>
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
