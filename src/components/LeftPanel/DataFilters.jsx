import React from 'react';
import {
  UserX, AlertTriangle, Home, Building, Clock, TrendingUp
} from 'lucide-react';

const FILTERS = [
  {
    key: 'absentee',
    label: 'Absentee Owners',
    icon: UserX,
    color: 'text-amber-400',
    bgActive: 'bg-amber-400/10 border-amber-400/30',
  },
  {
    key: 'foreclosure',
    label: 'Foreclosure',
    icon: AlertTriangle,
    color: 'text-red-400',
    bgActive: 'bg-red-400/10 border-red-400/30',
  },
  {
    key: 'ownerOccupied',
    label: 'Owner Occupied',
    icon: Home,
    color: 'text-green-400',
    bgActive: 'bg-green-400/10 border-green-400/30',
  },
  {
    key: 'corporate',
    label: 'Corporate Owned',
    icon: Building,
    color: 'text-purple-400',
    bgActive: 'bg-purple-400/10 border-purple-400/30',
  },
  {
    key: 'recentSales',
    label: 'Recent Sales (12mo)',
    icon: Clock,
    color: 'text-blue-400',
    bgActive: 'bg-blue-400/10 border-blue-400/30',
  },
  {
    key: 'highEquity',
    label: 'High Equity',
    icon: TrendingUp,
    color: 'text-emerald-400',
    bgActive: 'bg-emerald-400/10 border-emerald-400/30',
  },
];

export default function DataFilters({ filters, onToggle }) {
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div>
      {activeCount > 0 && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-scout-accent">{activeCount} active</span>
          <button
            onClick={() => Object.keys(filters).forEach((k) => filters[k] && onToggle(k))}
            className="text-xs text-scout-text-dim hover:text-white transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
      <div className="space-y-1.5">
        {FILTERS.map(({ key, label, icon: Icon, color, bgActive }) => {
          const active = filters[key];
          return (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all border ${
                active
                  ? bgActive
                  : 'border-transparent hover:bg-white/5'
              }`}
            >
              <Icon size={15} className={active ? color : 'text-scout-text-dim'} />
              <span className={`text-sm text-left flex-1 ${active ? 'text-white font-medium' : 'text-scout-text-dim'}`}>
                {label}
              </span>
              {active && (
                <div className={`w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
