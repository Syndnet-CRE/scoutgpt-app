import { Sparkles, Zap, MessageSquare } from 'lucide-react';
import { useTheme } from '../../../theme.jsx';
import SectionHeader from '../shared/SectionHeader.jsx';
import ProgressBar from '../shared/ProgressBar.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';

function scoreColor(t, score) {
  if (score == null) return t.text.quaternary;
  if (score <= 30) return t.accent.green;
  if (score <= 50) return t.semantic.warning;
  return t.semantic.error;
}

function scoreBgColor(t, score) {
  if (score == null) return t.bg.tertiary;
  if (score <= 30) return t.accent.greenMuted;
  if (score <= 50) return `${t.semantic.warning}1a`;
  return `${t.semantic.error}1a`;
}

function Skeleton({ width, height, t }) {
  return (
    <div style={{
      width: width || '100%',
      height: height || 14,
      borderRadius: 6,
      background: t.bg.tertiary,
      animation: 'pulse 1.4s ease-in-out infinite',
    }} />
  );
}

function SkeletonCard({ t }) {
  return (
    <div style={{
      background: t.bg.secondary,
      border: `1px solid ${t.border.default}`,
      borderRadius: 8,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <Skeleton width="40%" height={12} t={t} />
      <Skeleton height={14} t={t} />
      <Skeleton width="80%" height={14} t={t} />
      <Skeleton width="60%" height={14} t={t} />
    </div>
  );
}

function NarrativeCard({ title, content, placeholder, t }) {
  return (
    <div style={{
      background: t.bg.secondary,
      border: `1px solid ${t.border.default}`,
      borderRadius: 8,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <SectionHeader title={title} />
      {content ? (
        <p style={{ fontSize: 12, color: t.text.primary, fontFamily: t.font.display, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
          {content}
        </p>
      ) : (
        <span style={{ fontSize: 12, color: t.text.quaternary, fontFamily: t.font.display, fontStyle: 'italic' }}>
          {placeholder}
        </span>
      )}
    </div>
  );
}

export default function AIInsightsTab({ data, aiInsights, aiLoading, onGenerateInsights, onOpenChat }) {
  const { t } = useTheme();

  const insights = aiInsights ?? null;
  const investmentScore = insights?.investmentScore ?? insights?.investment_score ?? null;
  const bullets = insights?.quickTake ?? insights?.quick_take ?? insights?.bullets ?? null;
  const compAnalysis = insights?.comparableAnalysis ?? insights?.comparable_analysis ?? null;
  const ownerIntel = insights?.ownerIntelligence ?? insights?.owner_intelligence ?? null;
  const riskNarrative = insights?.riskNarrative ?? insights?.risk_narrative ?? null;

  /* Full loading state */
  if (aiLoading) {
    return (
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SkeletonCard t={t} />
        <SkeletonCard t={t} />
        <SkeletonCard t={t} />
        <SkeletonCard t={t} />
      </div>
    );
  }

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* AI Quick Take */}
      <div style={{
        background: t.bg.secondary,
        border: `1px solid ${t.border.default}`,
        borderRadius: 8,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={16} style={{ color: t.semantic.info }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: t.semantic.info, fontFamily: t.font.display }}>
            AI Quick Take
          </span>
        </div>

        {!bullets ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '8px 0' }}>
            <span style={{ fontSize: 12, color: t.text.tertiary, fontFamily: t.font.display }}>
              No analysis generated yet
            </span>
            <button
              onClick={onGenerateInsights}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: t.bg.primary,
                background: t.accent.green,
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                cursor: 'pointer',
                fontFamily: t.font.display,
              }}
            >
              <Zap size={14} />
              Generate Analysis
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(Array.isArray(bullets) ? bullets : [bullets]).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                <span style={{ color: t.semantic.info, fontSize: 12, flexShrink: 0 }}>{'\u2022'}</span>
                <span style={{ fontSize: 12, color: t.text.primary, fontFamily: t.font.display, lineHeight: 1.5 }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Investment Score */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        padding: 20,
        background: t.bg.secondary,
        border: `1px solid ${t.border.default}`,
        borderRadius: 8,
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: scoreBgColor(t, investmentScore),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: 36,
            fontWeight: 700,
            color: scoreColor(t, investmentScore),
            fontFamily: t.font.mono,
            lineHeight: 1,
          }}>
            {investmentScore ?? '\u2014'}
          </span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: t.text.secondary, fontFamily: t.font.display }}>
          AI Investment Score
        </span>
        {investmentScore != null && (
          <>
            <StatusBadge
              label={investmentScore >= 70 ? 'Strong Buy' : investmentScore >= 50 ? 'Hold' : 'Caution'}
              variant={investmentScore >= 70 ? 'success' : investmentScore >= 50 ? 'warning' : 'error'}
            />
            <div style={{ width: '100%', maxWidth: 240 }}>
              <ProgressBar value={investmentScore} showValue={false} />
            </div>
          </>
        )}
      </div>

      {/* Narrative Cards */}
      <NarrativeCard
        title="Comparable Analysis"
        content={compAnalysis}
        placeholder="Run analysis to generate comp summary"
        t={t}
      />
      <NarrativeCard
        title="Owner Intelligence"
        content={ownerIntel}
        placeholder="Run analysis to assess owner motivation"
        t={t}
      />
      <NarrativeCard
        title="Risk Narrative"
        content={riskNarrative}
        placeholder="Run analysis for risk assessment"
        t={t}
      />

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
        <button
          onClick={onGenerateInsights}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            fontSize: 13,
            fontWeight: 600,
            color: t.bg.primary,
            background: t.accent.green,
            border: 'none',
            borderRadius: 8,
            padding: '10px 0',
            cursor: 'pointer',
            fontFamily: t.font.display,
          }}
        >
          <Sparkles size={16} />
          Generate Full Analysis
        </button>
        <button
          onClick={onOpenChat}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            fontSize: 13,
            fontWeight: 600,
            color: t.text.primary,
            background: 'transparent',
            border: `1px solid ${t.border.default}`,
            borderRadius: 8,
            padding: '10px 0',
            cursor: 'pointer',
            fontFamily: t.font.display,
          }}
        >
          <MessageSquare size={16} />
          Ask about this property
        </button>
      </div>
    </div>
  );
}
