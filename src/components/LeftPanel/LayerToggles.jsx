import React from 'react';
import { Map, Droplets, GraduationCap } from 'lucide-react';

const LAYERS = [
  {
    key: 'parcels',
    label: 'Parcels',
    description: 'Property boundaries',
    icon: Map,
    color: 'bg-blue-500',
  },
  {
    key: 'flood',
    label: 'Flood Zones',
    description: 'FEMA flood hazard areas',
    icon: Droplets,
    color: 'bg-cyan-500',
  },
  {
    key: 'schools',
    label: 'School Districts',
    description: 'District boundaries',
    icon: GraduationCap,
    color: 'bg-purple-500',
  },
];

export default function LayerToggles({ visibleLayers, onToggle }) {
  return (
    <div className="space-y-1.5">
      {LAYERS.map(({ key, label, description, icon: Icon, color }) => {
        const active = visibleLayers[key];
        return (
          <button
            key={key}
            onClick={() => onToggle(key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              active
                ? 'bg-white/8 border border-white/10'
                : 'hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${active ? color : 'bg-scout-border'} transition-colors`} />
            <Icon size={15} className={active ? 'text-white' : 'text-scout-text-dim'} />
            <div className="text-left flex-1 min-w-0">
              <div className={`text-sm ${active ? 'text-white font-medium' : 'text-scout-text-dim'}`}>
                {label}
              </div>
            </div>
            {/* Toggle indicator */}
            <div className={`w-8 h-4 rounded-full transition-colors relative ${active ? 'bg-scout-accent' : 'bg-scout-border'}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${active ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
