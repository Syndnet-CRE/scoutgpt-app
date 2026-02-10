import React from 'react';
import { Hammer } from 'lucide-react';
import ExpandableSection from './ExpandableSection';

export default function PermitSection({ permits }) {
  if (!permits || permits.length === 0) {
    return (
      <ExpandableSection icon={Hammer} title="Building Permits" badge="0">
        <p className="text-sm text-scout-text-dim">No permits on record.</p>
      </ExpandableSection>
    );
  }

  return (
    <ExpandableSection icon={Hammer} title="Building Permits" badge={`${permits.length}`}>
      <div className="space-y-3">
        {permits.map((p, i) => (
          <div key={i} className={`text-sm ${i > 0 ? 'pt-2 border-t border-scout-border/50' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-white font-medium">{p.type}</span>
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                  p.status === 'Complete' ? 'bg-green-400/10 text-green-400' :
                  p.status === 'Active' ? 'bg-blue-400/10 text-blue-400' :
                  'bg-gray-400/10 text-gray-400'
                }`}>
                  {p.status}
                </span>
              </div>
              <span className="text-scout-text-dim">{p.date}</span>
            </div>
            <p className="text-scout-text-dim mt-1">{p.description}</p>
            {p.value && (
              <div className="text-xs text-scout-text-dim mt-1">
                Job Value: <span className="text-white">${p.value.toLocaleString()}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </ExpandableSection>
  );
}
