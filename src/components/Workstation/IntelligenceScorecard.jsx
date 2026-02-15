// ══════════════════════════════════════════════════════════════
// ScoutGPT v2 — Intelligence Scorecard Component
// File: src/components/Workstation/IntelligenceScorecard.jsx
//
// Drop into ~/scoutgpt-app/src/components/Workstation/
// Renders 4 composite score gauges at the top of Property Detail.
//
// Usage in PropertyTab.jsx:
//   import IntelligenceScorecard from './IntelligenceScorecard';
//   <IntelligenceScorecard scores={intelligence?.scores} equity={intelligence?.equity} loading={loading} />
// ══════════════════════════════════════════════════════════════

const scoreConfigs = {
  distress: {
    label: 'Distress',
    description: 'Financial distress severity',
    getColor: (s) => s >= 60 ? '#ef4444' : s >= 40 ? '#f97316' : s >= 20 ? '#eab308' : '#22c55e',
    getBg: (s) => s >= 60 ? 'rgba(239,68,68,0.12)' : s >= 40 ? 'rgba(249,115,22,0.12)' : s >= 20 ? 'rgba(234,179,8,0.12)' : 'rgba(34,197,94,0.12)',
    getLabel: (s) => s >= 80 ? 'CRITICAL' : s >= 60 ? 'HIGH' : s >= 40 ? 'MODERATE' : s >= 20 ? 'LOW' : 'MINIMAL',
  },
  opportunity: {
    label: 'Opportunity',
    description: 'Investment potential',
    getColor: (s) => s >= 60 ? '#22c55e' : s >= 40 ? '#eab308' : s >= 20 ? '#f97316' : '#64748b',
    getBg: (s) => s >= 60 ? 'rgba(34,197,94,0.12)' : s >= 40 ? 'rgba(234,179,8,0.12)' : 'rgba(100,116,139,0.08)',
    getLabel: (s) => s >= 80 ? 'PRIME' : s >= 60 ? 'HIGH' : s >= 40 ? 'MODERATE' : s >= 20 ? 'LOW' : 'MINIMAL',
  },
  motivation: {
    label: 'Motivation',
    description: 'Seller likelihood',
    getColor: (s) => s >= 60 ? '#a855f7' : s >= 40 ? '#8b5cf6' : s >= 20 ? '#6366f1' : '#64748b',
    getBg: (s) => s >= 60 ? 'rgba(168,85,247,0.12)' : s >= 40 ? 'rgba(139,92,246,0.12)' : 'rgba(100,116,139,0.08)',
    getLabel: (s) => s >= 80 ? 'VERY HIGH' : s >= 60 ? 'HIGH' : s >= 40 ? 'MODERATE' : s >= 20 ? 'LOW' : 'MINIMAL',
  },
  vacancy: {
    label: 'Vacancy',
    description: 'Abandonment probability',
    getColor: (s) => s >= 60 ? '#ef4444' : s >= 40 ? '#f97316' : '#64748b',
    getBg: (s) => s >= 60 ? 'rgba(239,68,68,0.12)' : s >= 40 ? 'rgba(249,115,22,0.12)' : 'rgba(100,116,139,0.08)',
    getLabel: (s) => s >= 60 ? 'LIKELY VACANT' : s >= 40 ? 'POSSIBLE' : s >= 20 ? 'UNLIKELY' : 'OCCUPIED',
  },
};

const fmt = {
  currency: (v) => v != null ? '$' + Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 }) : '—',
  pct: (v) => v != null ? v.toFixed(1) + '%' : '—',
};

// ── Score Gauge Component ──
function ScoreGauge({ value, config }) {
  const score = value ?? 0;
  const color = config.getColor(score);
  const bg = config.getBg(score);
  const label = config.getLabel(score);
  const circumference = 2 * Math.PI * 36;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div style={{
      background: bg,
      borderRadius: 12,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      flex: 1,
      minWidth: 0,
      border: `1px solid ${color}22`,
    }}>
      {/* Circular gauge */}
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(100,116,139,0.15)" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="36" fill="none"
            stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={value != null ? dashOffset : circumference}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 22, fontWeight: 800, color,
            lineHeight: 1,
          }}>
            {value != null ? score : '—'}
          </span>
        </div>
      </div>

      {/* Label */}
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
        color, textTransform: 'uppercase',
      }}>
        {value != null ? label : 'N/A'}
      </span>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>
        {config.label}
      </span>
    </div>
  );
}

// ── Equity Bar Component ──
function EquityBar({ equity }) {
  if (!equity?.avmValue) return null;

  const avmValue = equity.avmValue;
  const loanBalance = equity.totalLoanBalance || 0;
  const equityAmt = equity.estimatedEquity || (avmValue - loanBalance);
  const equityPct = avmValue > 0 ? ((equityAmt / avmValue) * 100) : 0;
  const loanPct = avmValue > 0 ? Math.min((loanBalance / avmValue) * 100, 100) : 0;

  const bandColor = equity.equityBand === 'UNDERWATER' ? '#ef4444'
    : equity.equityBand === 'THIN_EQUITY' ? '#f97316'
    : equity.equityBand === 'LOW_EQUITY' ? '#eab308'
    : equity.equityBand === 'HIGH_EQUITY' || equity.equityBand === 'FREE_AND_CLEAR' ? '#22c55e'
    : '#6366f1';

  return (
    <div style={{
      background: 'rgba(30,41,59,0.5)',
      borderRadius: 10,
      padding: '12px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Equity Position
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700, color: bandColor,
          background: bandColor + '1a', padding: '2px 8px',
          borderRadius: 4, letterSpacing: '0.04em',
        }}>
          {equity.equityBand?.replace(/_/g, ' ') || 'UNKNOWN'}
        </span>
      </div>

      {/* Stacked bar */}
      <div style={{ height: 20, borderRadius: 6, background: 'rgba(100,116,139,0.1)', overflow: 'hidden', position: 'relative' }}>
        {/* Loan portion */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${Math.min(loanPct, 100)}%`,
          background: 'rgba(239,68,68,0.35)',
          borderRadius: '6px 0 0 6px',
          transition: 'width 0.6s ease',
        }} />
        {/* Equity portion */}
        <div style={{
          position: 'absolute', left: `${Math.min(loanPct, 100)}%`, top: 0, bottom: 0,
          width: `${Math.max(100 - loanPct, 0)}%`,
          background: `${bandColor}44`,
          borderRadius: loanPct > 0 ? '0 6px 6px 0' : 6,
          transition: 'width 0.6s ease, left 0.6s ease',
        }} />
      </div>

      {/* Numbers */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
        <div>
          <span style={{ color: '#94a3b8' }}>AVM: </span>
          <span style={{ color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
            {fmt.currency(avmValue)}
          </span>
        </div>
        <div>
          <span style={{ color: '#94a3b8' }}>Debt: </span>
          <span style={{ color: '#f87171', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
            {fmt.currency(loanBalance)}
          </span>
        </div>
        <div>
          <span style={{ color: '#94a3b8' }}>Equity: </span>
          <span style={{ color: bandColor, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
            {fmt.currency(equityAmt)} ({fmt.pct(equityPct)})
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main Scorecard ──
export default function IntelligenceScorecard({ scores, equity, loading }) {
  if (loading) {
    return (
      <div style={{
        display: 'flex', gap: 10, padding: '12px 0',
        justifyContent: 'center', alignItems: 'center',
        minHeight: 130, color: '#64748b', fontSize: 13,
      }}>
        Computing intelligence scores...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0 12px' }}>
      {/* Score Gauges Row */}
      <div style={{ display: 'flex', gap: 10 }}>
        <ScoreGauge value={scores?.distressScore} config={scoreConfigs.distress} />
        <ScoreGauge value={scores?.opportunityScore} config={scoreConfigs.opportunity} />
        <ScoreGauge value={scores?.motivationScore} config={scoreConfigs.motivation} />
        <ScoreGauge value={scores?.vacancyProbability} config={scoreConfigs.vacancy} />
      </div>

      {/* Equity Bar */}
      <EquityBar equity={equity} />
    </div>
  );
}
