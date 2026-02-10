import React from 'react';
import { DollarSign } from 'lucide-react';
import ExpandableSection from './ExpandableSection';

export default function SalesSection({ sales }) {
  if (!sales || sales.length === 0) return null;

  return (
    <ExpandableSection icon={DollarSign} title="Sales History" badge={`${sales.length}`}>
      <div className="space-y-3">
        {sales.map((s, i) => (
          <div key={i} className={`text-sm ${i > 0 ? 'pt-2 border-t border-scout-border/50' : ''}`}>
            <div className="flex justify-between">
              <span className="text-white font-medium">
                ${s.price.toLocaleString()}
              </span>
              <span className="text-scout-text-dim">{s.date}</span>
            </div>
            <div className="text-xs text-scout-text-dim mt-1">
              {s.seller} → {s.buyer}
            </div>
            {s.arms_length && (
              <span className="text-xs text-green-400/80">Arms-length</span>
            )}
          </div>
        ))}
      </div>
    </ExpandableSection>
  );
}
