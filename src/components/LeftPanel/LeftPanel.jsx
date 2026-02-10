import React from 'react';
import { Layers, Filter, Compass } from 'lucide-react';
import LayerToggles from './LayerToggles';
import DataFilters from './DataFilters';

export default function LeftPanel({ visibleLayers, onToggleLayer, filters, onToggleFilter }) {
  return (
    <div className="w-72 h-full bg-scout-panel border-r border-scout-border flex flex-col animate-slide-in-left">
      {/* Header */}
      <div className="px-4 py-4 border-b border-scout-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-scout-accent rounded-lg flex items-center justify-center">
            <Compass size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight">ScoutGPT</h1>
            <p className="text-xs text-scout-text-dim">Travis County, TX</p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* GIS Layers */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={14} className="text-scout-accent" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-scout-text-dim">
              Map Layers
            </h2>
          </div>
          <LayerToggles visibleLayers={visibleLayers} onToggle={onToggleLayer} />
        </div>

        <div className="h-px bg-scout-border mx-4" />

        {/* Data Filters */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={14} className="text-scout-accent" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-scout-text-dim">
              Property Filters
            </h2>
          </div>
          <DataFilters filters={filters} onToggle={onToggleFilter} />
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-scout-border">
        <p className="text-xs text-scout-text-dim text-center">
          Data: ATTOM · 375K+ Properties
        </p>
      </div>
    </div>
  );
}
