import React from 'react';
import { Landmark } from 'lucide-react';
import ExpandableSection from './ExpandableSection';

export default function LoanSection({ loans }) {
  if (!loans || loans.length === 0) return null;

  return (
    <ExpandableSection icon={Landmark} title="Current Loans" badge={`${loans.length}`}>
      <div className="space-y-3">
        {loans.map((loan, i) => (
          <div key={i} className="text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-scout-text-dim">Position {loan.position}</span>
              <span className="text-white font-medium">${loan.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-scout-text-dim">Type</span>
              <span className="text-white">{loan.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-scout-text-dim">Rate</span>
              <span className="text-white">{loan.rate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-scout-text-dim">Lender</span>
              <span className="text-white">{loan.lender}</span>
            </div>
          </div>
        ))}
      </div>
    </ExpandableSection>
  );
}
