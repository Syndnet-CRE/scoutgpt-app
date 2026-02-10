import React from 'react';
import { TrendingUp } from 'lucide-react';
import ExpandableSection from './ExpandableSection';

function fmt(val) {
  if (!val && val !== 0) return '—';
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return `$${val.toLocaleString()}`;
}

export default function ValuationSection({ valuation }) {
  if (!valuation) return null;
  const v = valuation;

  return (
    <ExpandableSection icon={TrendingUp} title="AVM Valuation">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-scout-text-dim">Estimated Value</span>
          <span className="text-scout-success font-semibold">{fmt(v.estimated_value)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-scout-text-dim">Range</span>
          <span className="text-white">{fmt(v.estimated_min)} – {fmt(v.estimated_max)}</span>
        </div>

        {/* Confidence bar */}
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-scout-text-dim">Confidence</span>
            <span className="text-white">{v.confidence}%</span>
          </div>
          <div className="w-full h-1.5 bg-scout-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${v.confidence}%`,
                background: v.confidence >= 80 ? '#10b981' : v.confidence >= 60 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
        </div>

        {v.rental_value && (
          <div className="flex justify-between text-sm pt-2 border-t border-scout-border/50">
            <span className="text-scout-text-dim">Est. Rental Value</span>
            <span className="text-white">{fmt(v.rental_value)}/mo</span>
          </div>
        )}
        {v.ltv !== undefined && (
          <div className="flex justify-between text-sm">
            <span className="text-scout-text-dim">LTV</span>
            <span className="text-white">{(v.ltv * 100).toFixed(0)}%</span>
          </div>
        )}
        {v.available_equity && (
          <div className="flex justify-between text-sm">
            <span className="text-scout-text-dim">Available Equity</span>
            <span className="text-scout-success">{fmt(v.available_equity)}</span>
          </div>
        )}
      </div>
    </ExpandableSection>
  );
}
