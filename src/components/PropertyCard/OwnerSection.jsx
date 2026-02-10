import React from 'react';
import { User, MapPin, Building } from 'lucide-react';
import ExpandableSection from './ExpandableSection';

export default function OwnerSection({ owner }) {
  if (!owner) return null;

  return (
    <ExpandableSection icon={User} title="Ownership" defaultOpen={true}>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-scout-text-dim">Owner</span>
          <span className="text-white font-medium">{owner.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-scout-text-dim">Type</span>
          <span className="text-white flex items-center gap-1.5">
            {owner.type === 'Corporate' && <Building size={12} className="text-purple-400" />}
            {owner.type}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-scout-text-dim">Absentee</span>
          <span className={owner.is_absentee ? 'text-amber-400' : 'text-scout-text-dim'}>
            {owner.is_absentee ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-scout-text-dim">Owner Occupied</span>
          <span className="text-white">{owner.is_owner_occupied ? 'Yes' : 'No'}</span>
        </div>
        {owner.mail_address && (
          <div className="flex items-start gap-2 text-sm mt-1 pt-1 border-t border-scout-border/50">
            <MapPin size={12} className="text-scout-text-dim mt-0.5 shrink-0" />
            <span className="text-scout-text-dim">{owner.mail_address}</span>
          </div>
        )}
      </div>
    </ExpandableSection>
  );
}
