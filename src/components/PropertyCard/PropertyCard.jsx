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

// Transform API camelCase response into the shape sub-components expect
function transformProperty(raw) {
  // Owner from first ownership record
  const ownerRec = raw.ownership?.[0];
  const owner = ownerRec ? {
    name: ownerRec.owner1NameFull || '—',
    type: ownerRec.ownershipType || '—',
    is_absentee: ownerRec.isAbsenteeOwner,
    is_owner_occupied: ownerRec.isOwnerOccupied,
    mail_address: [ownerRec.mailAddressFull, ownerRec.mailAddressCity, ownerRec.mailAddressState, ownerRec.mailAddressZip].filter(Boolean).join(', ') || null,
  } : null;

  // Tax from most recent assessment
  const taxRec = raw.taxAssessments?.[0];
  const tax = taxRec ? {
    year: taxRec.taxYear,
    assessed_total: parseFloat(taxRec.assessedValueTotal) || 0,
    assessed_land: parseFloat(taxRec.assessedValueLand) || 0,
    assessed_improvements: parseFloat(taxRec.assessedValueImprovements) || 0,
    tax_billed: parseFloat(taxRec.taxAmountBilled) || 0,
    homeowner_exemption: taxRec.hasHomeownerExemption,
  } : null;

  // Sales transactions
  const sales = (raw.salesTransactions || [])
    .filter(s => s.salePrice != null && parseFloat(s.salePrice) > 0)
    .map(s => ({
      price: parseFloat(s.salePrice) || 0,
      date: s.recordingDate ? new Date(s.recordingDate).toLocaleDateString() : '—',
      seller: s.grantor1NameFull || '—',
      buyer: s.grantee1NameFull || '—',
      arms_length: s.isArmsLength,
    }));

  // Current loans
  const loans = (raw.currentLoans || []).map(l => ({
    position: l.loanPosition,
    amount: parseFloat(l.loanAmount) || 0,
    type: l.mortgageType || l.loanType || '—',
    rate: parseFloat(l.interestRate) || 0,
    lender: l.lenderNameStandardized || '—',
  }));

  // Valuation from first record
  const valRec = raw.valuations?.[0];
  const valuation = valRec ? {
    estimated_value: parseFloat(valRec.estimatedValue) || null,
    estimated_min: parseFloat(valRec.estimatedMinValue) || null,
    estimated_max: parseFloat(valRec.estimatedMaxValue) || null,
    confidence: parseFloat(valRec.confidenceScore) || null,
    rental_value: parseFloat(valRec.estimatedRentalValue) || null,
    ltv: valRec.ltv != null ? parseFloat(valRec.ltv) / 100 : null,
    available_equity: parseFloat(valRec.availableEquity) || null,
  } : null;

  // Climate risk (-1 means unknown, convert to 0)
  const cr = raw.climateRisk;
  const safeScore = (v) => (v != null && v >= 0) ? v : 0;
  const climate = cr ? {
    total: safeScore(cr.totalRiskScore),
    heat: safeScore(cr.heatRiskScore),
    storm: safeScore(cr.stormRiskScore),
    wildfire: safeScore(cr.wildfireRiskScore),
    drought: safeScore(cr.droughtRiskScore),
    flood: safeScore(cr.floodRiskScore),
  } : null;

  // Building permits
  const permits = (raw.buildingPermits || []).map(bp => ({
    type: bp.permitType || '—',
    status: bp.status || '—',
    date: bp.effectiveDate ? new Date(bp.effectiveDate).toLocaleDateString() : '—',
    description: bp.description || '',
    value: parseFloat(bp.jobValue) || null,
  }));

  return {
    address: raw.addressFull || '—',
    city: raw.addressCity || '',
    state: raw.addressState || '',
    zip: raw.addressZip || '',
    property_use: raw.propertyUseGroup || '—',
    year_built: raw.yearBuilt,
    building_area: raw.areaBuilding,
    assessed_value: parseFloat(raw.taxAssessedValueTotal) || null,
    last_sale_price: parseFloat(raw.lastSalePrice) || null,
    valuation,
    owner,
    tax,
    sales,
    loans,
    climate,
    permits,
  };
}

export default function PropertyCard({ property, onClose }) {
  if (!property) return null;

  const p = transformProperty(property);

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
