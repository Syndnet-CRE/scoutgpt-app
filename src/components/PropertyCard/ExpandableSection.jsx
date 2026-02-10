import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function ExpandableSection({ icon: Icon, title, badge, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-scout-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-scout-accent" />}
          <span className="text-sm font-medium text-scout-text">{title}</span>
          {badge && (
            <span className="text-xs bg-scout-accent/20 text-scout-accent px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {open ? <ChevronUp size={16} className="text-scout-text-dim" /> : <ChevronDown size={16} className="text-scout-text-dim" />}
      </button>
      {open && <div className="px-4 pb-3 animate-fade-in">{children}</div>}
    </div>
  );
}
