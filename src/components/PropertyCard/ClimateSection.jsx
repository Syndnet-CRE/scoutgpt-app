import React from 'react';
import { Shield } from 'lucide-react';
import ExpandableSection from './ExpandableSection';

function RiskBar({ label, score }) {
  const color =
    score >= 70 ? '#ef4444' :
    score >= 50 ? '#f59e0b' :
    score >= 30 ? '#eab308' :
    '#10b981';

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-scout-text-dim w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-scout-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-xs font-mono text-white w-8 text-right">{score}</span>
    </div>
  );
}

export default function ClimateSection({ climate }) {
  if (!climate) return null;

  const riskLevel =
    climate.total >= 70 ? { label: 'High', color: 'text-red-400' } :
    climate.total >= 50 ? { label: 'Moderate', color: 'text-amber-400' } :
    { label: 'Low', color: 'text-green-400' };

  return (
    <ExpandableSection
      icon={Shield}
      title="Climate Risk"
      badge={
        <span className={riskLevel.color}>{riskLevel.label}</span>
      }
    >
      <div className="space-y-2.5">
        <div className="flex justify-between text-sm mb-3">
          <span className="text-scout-text-dim">Total Risk Score</span>
          <span className={`font-semibold ${riskLevel.color}`}>{climate.total}/100</span>
        </div>
        <RiskBar label="Heat" score={climate.heat} />
        <RiskBar label="Storm" score={climate.storm} />
        <RiskBar label="Wildfire" score={climate.wildfire} />
        <RiskBar label="Drought" score={climate.drought} />
        <RiskBar label="Flood" score={climate.flood} />
      </div>
    </ExpandableSection>
  );
}
