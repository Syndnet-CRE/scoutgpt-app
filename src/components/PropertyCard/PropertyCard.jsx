import React, { useState } from 'react';
import {
  X, Building2, User, Receipt, DollarSign, TrendingUp,
  Shield, Hammer, ChevronDown, ChevronUp, MapPin, Calendar, Ruler
} from 'lucide-react';
import OwnerSection from './OwnerSection';
import TaxSection from './TaxSection';
import SalesSection from './SalesSection';
import LoanSection from './LoanSection';
import ValuationSection from './ValuationSection';
import ClimateSection from './ClimateSection';
import PermitSection from './PermitSection';

function formatCurrency(val) {
  if (!val && val !== 0) return '—';
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return `$${val.toLocaleString()}`;
}

function formatArea(sqft) {
  if (!sqft) return '—';
  if (sqft >= 43560) return `${(sqft / 43560).toFixed(2)} ac`;
  return `${sqft.toLocaleString()} sf`;
}

export default function PropertyCard({ property, onClose }) {
  if (!property) return null;

  const p = property;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[480px] max-h-[70vh] bg-scout-surface border border-scout-border rounded-xl shadow-2xl overflow-hidden animate-fade-in z-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-scout-accent/10 to-transparent border-b border-scout-border p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-white truncate">{p.address}</h2>
            <p className="text-sm text-scout-text-dim mt-0.5">
              {p.city}, {p.state} {p.zip}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 p-1.5 rounded-lg hover:bg-white/10 text-scout-text-dim hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick stats row */}
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1.5 text-scout-text-dim">
            <Building2 size={14} className="text-scout-accent" />
            <span>{p.property_use}</span>
          </div>
          {p.year_built && (
            <div className="flex items-center gap-1.5 text-scout-text-dim">
              <Calendar size={14} />
              <span>{p.year_built}</span>
            </div>
          )}
          {p.building_area && (
            <div className="flex items-center gap-1.5 text-scout-text-dim">
              <Ruler size={14} />
              <span>{formatArea(p.building_area)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-px bg-scout-border">
        <div className="bg-scout-surface p-3 text-center">
          <div className="text-xs text-scout-text-dim uppercase tracking-wide">Assessed</div>
          <div className="text-base font-semibold text-white mt-0.5">{formatCurrency(p.assessed_value)}</div>
        </div>
        <div className="bg-scout-surface p-3 text-center">
          <div className="text-xs text-scout-text-dim uppercase tracking-wide">Last Sale</div>
          <div className="text-base font-semibold text-white mt-0.5">{formatCurrency(p.last_sale_price)}</div>
        </div>
        <div className="bg-scout-surface p-3 text-center">
          <div className="text-xs text-scout-text-dim uppercase tracking-wide">AVM</div>
          <div className="text-base font-semibold text-scout-success mt-0.5">
            {p.valuation ? formatCurrency(p.valuation.estimated_value) : '—'}
          </div>
        </div>
      </div>

      {/* Expandable sections */}
      <div className="overflow-y-auto max-h-[calc(70vh-200px)]">
        <OwnerSection owner={p.owner} />
        <TaxSection tax={p.tax} />
        <SalesSection sales={p.sales} />
        <LoanSection loans={p.loans} />
        <ValuationSection valuation={p.valuation} />
        <ClimateSection climate={p.climate} />
        <PermitSection permits={p.permits} />
      </div>
    </div>
  );
}
