// ══════════════════════════════════════════════════════════════
// ScoutGPT v2 — Intelligence Scorecard Component (Compact)
// File: src/components/Workstation/IntelligenceScorecard.jsx
//
// Compact horizontal strip showing 4 scores + equity bar.
// Max ~80px tall total.
// ══════════════════════════════════════════════════════════════

const scoreConfigs = {
  distress: {
    label: 'DISTRESS',
    getColor: (s) => s >= 60 ? '#ef4444' : s >= 30 ? '#f59e0b' : '#22c55e',
  },
  opportunity: {
    label: 'OPPORTUNITY',
    getColor: (s) => s >= 60 ? '#22c55e' : s >= 30 ? '#f59e0b' : '#64748b',
  },
  motivation: {
    label: 'MOTIVATION',
    getColor: (s) => s >= 60 ? '#f59e0b' : s >= 30 ? '#eab308' : '#64748b',
  },
  vacancy: {
    label: 'VACANCY',
    getColor: (s) => s >= 60 ? '#ef4444' : s >= 30 ? '#f59e0b' : '#64748b',
  },
};

const fmt = {
  currency: (v) => v != null ? '$' + Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 }) : '—',
  pct: (v) => v != null ? v.toFixed(0) + '%' : '—',
};

// ── Compact Score Item ──
function ScoreItem({ value, config }) {
  const score = value ?? 0;
  const color = config.getColor(score);
  const barWidth = Math.min(score, 100);

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      {/* Label */}
      <div style={{
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: '0.05em',
        color: '#64748b',
        marginBottom: 4,
      }}>
        {config.label}
      </div>

      {/* Score + Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 16,
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
          color: color,
          minWidth: 28,
        }}>
          {value != null ? score : '—'}
        </span>
        <div style={{
          flex: 1,
          height: 4,
          background: 'rgba(100,116,139,0.15)',
          borderRadius: 2,
          overflow: 'hidden',
          maxWidth: 60,
        }}>
          <div style={{
            width: `${barWidth}%`,
            height: '100%',
            background: color,
            borderRadius: 2,
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>
    </div>
  );
}

// ── Compact Equity Line ──
function EquityLine({ equity }) {
  if (!equity?.avmValue) return null;

  const avmValue = equity.avmValue;
  const loanBalance = equity.totalLoanBalance || 0;
  const equityAmt = equity.estimatedEquity || (avmValue - loanBalance);
  const ltv = avmValue > 0 ? (loanBalance / avmValue) * 100 : 0;
  const ltvPct = Math.min(ltv, 100);

  // Color based on LTV: green <60%, amber 60-80%, red >80%
  const barColor = ltv > 80 ? '#ef4444' : ltv > 60 ? '#f59e0b' : '#22c55e';

  // Band label
  const bandLabel = equity.equityBand?.replace(/_/g, ' ') ||
    (ltv > 100 ? 'UNDERWATER' : ltv > 80 ? 'HIGH LTV' : ltv > 60 ? 'MODERATE LTV' : ltv > 0 ? 'LOW LTV' : 'FREE & CLEAR');

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginTop: 8,
      paddingTop: 8,
      borderTop: '1px solid rgba(100,116,139,0.15)',
    }}>
      {/* Label */}
      <span style={{
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: '0.05em',
        color: '#64748b',
      }}>
        EQUITY:
      </span>

      {/* Amount + LTV */}
      <span style={{
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
        color: '#94a3b8',
      }}>
        {fmt.currency(equityAmt)} ({fmt.pct(ltv)} LTV)
      </span>

      {/* Thin bar */}
      <div style={{
        width: 120,
        height: 4,
        background: 'rgba(100,116,139,0.15)',
        borderRadius: 2,
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{
          width: `${ltvPct}%`,
          height: '100%',
          background: barColor,
          borderRadius: 2,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Band label */}
      <span style={{
        fontSize: 9,
        fontWeight: 700,
        color: barColor,
        letterSpacing: '0.04em',
      }}>
        {bandLabel}
      </span>
    </div>
  );
}

// ── Main Scorecard (Compact) ──
export default function IntelligenceScorecard({ scores, equity, loading }) {
  if (loading) {
    return (
      <div style={{
        height: 40,
        background: 'rgba(100,116,139,0.08)',
        borderRadius: 6,
        animation: 'pulse 1.4s ease-in-out infinite',
      }} />
    );
  }

  return (
    <div style={{ padding: '8px 0 4px' }}>
      {/* Scores Row */}
      <div style={{
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
      }}>
        <ScoreItem value={scores?.distressScore} config={scoreConfigs.distress} />
        <div style={{ width: 1, height: 28, background: 'rgba(100,116,139,0.2)' }} />
        <ScoreItem value={scores?.opportunityScore} config={scoreConfigs.opportunity} />
        <div style={{ width: 1, height: 28, background: 'rgba(100,116,139,0.2)' }} />
        <ScoreItem value={scores?.motivationScore} config={scoreConfigs.motivation} />
        <div style={{ width: 1, height: 28, background: 'rgba(100,116,139,0.2)' }} />
        <ScoreItem value={scores?.vacancyProbability} config={scoreConfigs.vacancy} />
      </div>

      {/* Equity Line */}
      <EquityLine equity={equity} />
    </div>
  );
}
