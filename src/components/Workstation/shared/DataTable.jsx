import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useTheme } from '../../../theme.jsx';

export default function DataTable({ columns = [], rows = [], onRowClick, expandable }) {
  const { t } = useTheme();
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [hoveredRow, setHoveredRow] = useState(null);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = sortKey
    ? [...rows].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal));
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : rows;

  return (
    <div style={{ borderRadius: 8, border: `1px solid ${t.border.default}`, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                style={{
                  position: 'sticky',
                  top: 0,
                  background: t.bg.secondary,
                  padding: '8px 12px',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: t.text.tertiary,
                  fontFamily: t.font.display,
                  textAlign: col.align || 'left',
                  borderBottom: `1px solid ${t.border.default}`,
                  cursor: 'pointer',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {col.label}
                  {sortKey === col.key && (
                    sortDir === 'asc'
                      ? <ChevronUp size={12} style={{ color: t.accent.green }} />
                      : <ChevronDown size={12} style={{ color: t.accent.green }} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: 24,
                  textAlign: 'center',
                  fontSize: 12,
                  color: t.text.tertiary,
                  fontFamily: t.font.display,
                }}
              >
                No data available
              </td>
            </tr>
          ) : (
            sorted.map((row, i) => (
              <tr
                key={row.id ?? i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  background: hoveredRow === i
                    ? t.bg.tertiary
                    : i % 2 === 0
                      ? t.bg.primary
                      : t.bg.secondary,
                  transition: 'background 0.1s ease',
                }}
              >
                {columns.map((col) => {
                  const raw = row[col.key];
                  const display = col.format ? col.format(raw, row) : (raw ?? '\u2014');
                  const isNum = col.align === 'right' || typeof raw === 'number';
                  return (
                    <td
                      key={col.key}
                      style={{
                        padding: '8px 12px',
                        fontSize: 12,
                        fontFamily: t.font.display,
                        color: t.text.primary,
                        textAlign: col.align || 'left',
                        borderBottom: `1px solid ${t.border.subtle}`,
                      }}
                    >
                      {display}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
