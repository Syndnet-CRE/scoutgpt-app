import React from 'react';
import { Receipt } from 'lucide-react';
import ExpandableSection from './ExpandableSection';

function fmt(val) {
  if (!val && val !== 0) return '—';
  return `$${val.toLocaleString()}`;
}

export default function TaxSection({ tax }) {
  if (!tax) return null;

  return (
    <ExpandableSection icon={Receipt} title="Tax Assessment" badge={String(tax.year)}>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-scout-text-dim">Total Assessed</span>
          <span className="text-white font-medium">{fmt(tax.assessed_total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-scout-text-dim">Land Value</span>
          <span className="text-white">{fmt(tax.assessed_land)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-scout-text-dim">Improvements</span>
          <span className="text-white">{fmt(tax.assessed_improvements)}</span>
        </div>
        <div className="flex justify-between text-sm pt-1 border-t border-scout-border/50">
          <span className="text-scout-text-dim">Tax Billed</span>
          <span className="text-amber-400 font-medium">{fmt(tax.tax_billed)}</span>
        </div>
        {tax.homeowner_exemption && (
          <div className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
            Homeowner Exemption Active
          </div>
        )}
      </div>
    </ExpandableSection>
  );
}
