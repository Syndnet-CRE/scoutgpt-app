import React, { useState } from 'react';
import {
  X, User, Receipt, DollarSign, TrendingUp,
  Shield, Hammer, ChevronDown, ChevronUp,
  Home, Landmark, Layers, Gavel,
} from 'lucide-react';

// ── Formatting helpers ──────────────────────────────────────────────

function fmtCurrency(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function fmtCurrencyShort(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return '$' + n.toLocaleString();
}

function fmtDate(val) {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtArea(sqft) {
  const n = parseFloat(sqft);
  if (isNaN(n) || n <= 0) return '—';
  return n.toLocaleString() + ' sf';
}

function fmtLot(acres, sqft) {
  const ac = parseFloat(acres);
  if (!isNaN(ac) && ac >= 1) return ac.toFixed(2) + ' ac';
  const sf = parseFloat(sqft);
  if (!isNaN(sf) && sf > 0) return sf.toLocaleString() + ' sf';
  return '—';
}

function fmtPercent(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  return n.toFixed(1) + '%';
}

function yesNo(val) {
  if (val === true || val === 'true' || val === 'Y') return 'Yes';
  if (val === false || val === 'false' || val === 'N') return 'No';
  return '—';
}

function safeScore(v) {
  return (v != null && v >= 0) ? v : 0;
}

// ── Reusable tiny components ────────────────────────────────────────

function Row({ label, value, valueClass = 'text-white' }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-scout-text-dim">{label}</span>
      <span className={valueClass}>{value ?? '—'}</span>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, children, defaultOpen = false }) {
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
        </div>
        {open
          ? <ChevronUp size={16} className="text-scout-text-dim" />
          : <ChevronDown size={16} className="text-scout-text-dim" />
        }
      </button>
      {open && <div className="px-4 pb-4 space-y-2 animate-fade-in">{children}</div>}
    </div>
  );
}

function NoData() {
  return <p className="text-sm text-scout-text-dim italic">No data available</p>;
}

function RiskBar({ label, score }) {
  const s = safeScore(score);
  const color =
    s >= 70 ? '#ef4444' :
    s >= 50 ? '#f59e0b' :
    s >= 30 ? '#eab308' :
    '#10b981';
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-scout-text-dim w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-scout-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${s}%`, background: color }}
        />
      </div>
      <span className="text-xs font-mono text-white w-8 text-right">{s}</span>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────

export default function PropertyCard({ property, onClose }) {
  const [expanded, setExpanded] = useState(false);
  if (!property) return null;

  const p = property; // read camelCase fields directly

  // Derived helpers
  const ownerName = p.ownership?.[0]?.owner1NameFull
    || [p.ownership?.[0]?.owner1NameFirst, p.ownership?.[0]?.owner1NameLast].filter(Boolean).join(' ')
    || '—';
  const lotDisplay = fmtLot(p.areaLotAcres, p.areaLotSf);
  const hasBedBath = (p.bedroomsCount > 0) || (p.bathCount > 0);

  // ── MINI STATE ──────────────────────────────────────────────────
  if (!expanded) {
    return (
      <div className="w-[320px] bg-scout-surface border border-scout-border rounded-xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between p-4 pb-0">
          <h2 className="text-base font-semibold text-white leading-snug pr-2">{p.addressFull || '—'}</h2>
          <button
            onClick={onClose}
            className="shrink-0 p-1 rounded-lg hover:bg-white/10 text-scout-text-dim hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 pt-3 pb-4 space-y-2.5">
          <Row label="Owner" value={ownerName} />
          <Row label="Lot Size" value={lotDisplay} />
          {hasBedBath && (
            <Row
              label="Bed / Bath"
              value={[
                p.bedroomsCount > 0 ? `${p.bedroomsCount} bd` : null,
                p.bathCount > 0 ? `${p.bathCount} ba` : null,
              ].filter(Boolean).join(' / ')}
            />
          )}
          <Row label="Type" value={p.propertyUseStandardized || p.propertyUseGroup || '—'} />
          <Row label="Market Value" value={fmtCurrency(p.taxAssessedValueTotal)} />
          <Row label="Last Sale" value={fmtDate(p.lastSaleDate)} />
        </div>

        {/* CTA */}
        <div className="px-4 pb-4">
          <button
            onClick={() => setExpanded(true)}
            className="w-full py-2.5 bg-scout-accent hover:bg-scout-accent/90 text-white text-sm font-medium rounded-lg transition-colors"
          >
            View Property Details
          </button>
        </div>
      </div>
    );
  }

  // ── EXPANDED STATE ──────────────────────────────────────────────

  const owner = p.ownership?.[0];
  const taxRec = p.taxAssessments?.[0];
  const sales = p.salesTransactions || [];
  const loans = p.currentLoans || [];
  const valRec = p.valuations?.[0];
  const cr = p.climateRisk;
  const permits = p.buildingPermits || [];
  const foreclosures = p.foreclosureRecords || [];

  return (
    <div className="w-[420px] max-h-[60vh] bg-scout-surface border border-scout-border rounded-xl shadow-2xl overflow-hidden animate-fade-in flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-scout-accent/10 to-transparent border-b border-scout-border p-4 shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-white truncate">{p.addressFull || '—'}</h2>
            <p className="text-sm text-scout-text-dim mt-0.5">
              {[p.addressCity, p.addressState].filter(Boolean).join(', ')} {p.addressZip || ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 p-1.5 rounded-lg hover:bg-white/10 text-scout-text-dim hover:text-white transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable sections */}
      <div className="overflow-y-auto flex-1">

        {/* ── PROPERTY OVERVIEW ─────────────────────────────── */}
        <SectionHeader icon={Home} title="Property Overview" defaultOpen={true}>
          <Row label="Address" value={p.addressFull || '—'} />
          <Row label="Property Type" value={p.propertyUseStandardized || p.propertyUseGroup || '—'} />
          <Row label="Year Built" value={p.yearBuilt || '—'} />
          {p.bedroomsCount > 0 && <Row label="Bedrooms" value={p.bedroomsCount} />}
          {p.bathCount > 0 && (
            <Row
              label="Bathrooms"
              value={[
                p.bathCount && `${p.bathCount} total`,
                p.bathFullCount && `${p.bathFullCount} full`,
                p.bathHalfCount && `${p.bathHalfCount} half`,
              ].filter(Boolean).join(', ')}
            />
          )}
          {p.storiesCount > 0 && <Row label="Stories" value={p.storiesCount} />}
          <Row label="Building Area" value={fmtArea(p.areaBuilding)} />
          <Row label="Lot Size (sf)" value={p.areaLotSf ? parseFloat(p.areaLotSf).toLocaleString() + ' sf' : '—'} />
          <Row label="Lot Size (ac)" value={p.areaLotAcres ? parseFloat(p.areaLotAcres).toFixed(2) + ' ac' : '—'} />
          {p.zoning && <Row label="Zoning" value={p.zoning} />}
          {p.censusTract && <Row label="Census Tract" value={p.censusTract} />}
        </SectionHeader>

        {/* ── PROPERTY DETAILS ──────────────────────────────── */}
        <SectionHeader icon={Layers} title="Property Details">
          {(p.constructionType || p.exteriorWallsType || p.foundationType || p.roofType ||
            p.roofMaterialType || p.floorType || p.garageType || p.hasPool != null) ? (
            <>
              {p.constructionType && <Row label="Construction" value={p.constructionType} />}
              {p.exteriorWallsType && <Row label="Exterior Walls" value={p.exteriorWallsType} />}
              {p.foundationType && <Row label="Foundation" value={p.foundationType} />}
              {p.roofType && <Row label="Roof Type" value={p.roofType} />}
              {p.roofMaterialType && <Row label="Roof Material" value={p.roofMaterialType} />}
              {p.floorType && <Row label="Floor Type" value={p.floorType} />}
              {p.garageType && <Row label="Garage" value={p.garageType} />}
              {p.garageArea > 0 && <Row label="Garage Area" value={fmtArea(p.garageArea)} />}
              {p.parkingSpaces > 0 && <Row label="Parking Spaces" value={p.parkingSpaces} />}
              <Row label="Pool" value={yesNo(p.hasPool)} />
              {p.poolType && <Row label="Pool Type" value={p.poolType} />}
              {p.hasSpa != null && <Row label="Spa" value={yesNo(p.hasSpa)} />}
              {p.hasElevator != null && <Row label="Elevator" value={yesNo(p.hasElevator)} />}
              {p.fireplaceCount > 0 && <Row label="Fireplaces" value={p.fireplaceCount} />}
              {p.hvacCoolingType && <Row label="HVAC Cooling" value={p.hvacCoolingType} />}
              {p.hvacHeatingType && <Row label="HVAC Heating" value={p.hvacHeatingType} />}
              {p.hvacHeatingFuel && <Row label="Heating Fuel" value={p.hvacHeatingFuel} />}
              {p.qualityGrade && <Row label="Quality Grade" value={p.qualityGrade} />}
              {p.condition && <Row label="Condition" value={p.condition} />}
            </>
          ) : <NoData />}
        </SectionHeader>

        {/* ── OWNER ────────────────────────────────────────── */}
        <SectionHeader icon={User} title="Owner">
          {owner ? (
            <>
              <Row label="Owner Name" value={owner.owner1NameFull || [owner.owner1NameFirst, owner.owner1NameLast].filter(Boolean).join(' ') || '—'} />
              {owner.ownershipType && <Row label="Ownership Type" value={owner.ownershipType} />}
              <Row label="Company" value={yesNo(owner.companyFlag)} />
              <Row label="Trust" value={yesNo(owner.trustFlag)} />
              {owner.mailAddressFull && <Row label="Mailing Address" value={owner.mailAddressFull} />}
              <Row label="Owner Occupied" value={yesNo(owner.isOwnerOccupied)} />
              <Row label="Absentee Owner" value={yesNo(owner.isAbsenteeOwner)} valueClass={owner.isAbsenteeOwner ? 'text-amber-400' : 'text-white'} />
              {owner.ownershipTransferDate && <Row label="Transfer Date" value={fmtDate(owner.ownershipTransferDate)} />}
            </>
          ) : <NoData />}
        </SectionHeader>

        {/* ── TAX ASSESSMENT ───────────────────────────────── */}
        <SectionHeader icon={Receipt} title="Tax Assessment">
          {taxRec ? (
            <>
              <Row label="Tax Year" value={taxRec.taxYear || '—'} />
              <Row label="Assessed Total" value={fmtCurrency(taxRec.assessedValueTotal)} valueClass="text-white font-medium" />
              <Row label="Assessed Land" value={fmtCurrency(taxRec.assessedValueLand)} />
              <Row label="Assessed Improvements" value={fmtCurrency(taxRec.assessedValueImprovements)} />
              {taxRec.marketValueTotal && <Row label="Market Value" value={fmtCurrency(taxRec.marketValueTotal)} />}
              <Row label="Tax Billed" value={fmtCurrency(taxRec.taxAmountBilled)} valueClass="text-amber-400 font-medium" />
              {taxRec.hasHomeownerExemption && (
                <div className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded mt-1">Homeowner Exemption Active</div>
              )}
              {taxRec.hasSeniorExemption && (
                <div className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded mt-1">Senior Exemption Active</div>
              )}
            </>
          ) : <NoData />}
        </SectionHeader>

        {/* ── SALES HISTORY ────────────────────────────────── */}
        <SectionHeader icon={DollarSign} title="Sales History">
          {sales.length > 0 ? (
            <div className="space-y-3">
              {sales.map((s, i) => (
                <div key={i} className={`text-sm ${i > 0 ? 'pt-2 border-t border-scout-border/50' : ''}`}>
                  <div className="flex justify-between">
                    <span className="text-white font-medium">{fmtCurrency(s.salePrice)}</span>
                    <span className="text-scout-text-dim">{fmtDate(s.recordingDate)}</span>
                  </div>
                  <div className="text-xs text-scout-text-dim mt-1">
                    {s.grantor1NameFull || '—'} &rarr; {s.grantee1NameFull || '—'}
                  </div>
                  {s.isArmsLength && <span className="text-xs text-green-400/80">Arms-length</span>}
                  {s.documentType && <span className="text-xs text-scout-text-dim ml-2">{s.documentType}</span>}
                  {/* Nested mortgages */}
                  {s.mortgages && s.mortgages.length > 0 && (
                    <div className="mt-2 ml-3 border-l-2 border-scout-border pl-3 space-y-1">
                      <span className="text-xs font-medium text-scout-text-dim uppercase tracking-wide">Mortgages</span>
                      {s.mortgages.map((m, mi) => (
                        <div key={mi} className="text-xs space-y-0.5">
                          <div className="flex justify-between">
                            <span className="text-scout-text-dim">Amount</span>
                            <span className="text-white">{fmtCurrency(m.loanAmount)}</span>
                          </div>
                          {m.loanType && <div className="flex justify-between"><span className="text-scout-text-dim">Type</span><span className="text-white">{m.loanType}</span></div>}
                          {m.lenderNameStandardized && <div className="flex justify-between"><span className="text-scout-text-dim">Lender</span><span className="text-white">{m.lenderNameStandardized}</span></div>}
                          {m.interestRate > 0 && <div className="flex justify-between"><span className="text-scout-text-dim">Rate</span><span className="text-white">{fmtPercent(m.interestRate)}</span></div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : <NoData />}
        </SectionHeader>

        {/* ── CURRENT LOANS ────────────────────────────────── */}
        <SectionHeader icon={Landmark} title="Current Loans">
          {loans.length > 0 ? (
            <div className="space-y-3">
              {loans.map((l, i) => (
                <div key={i} className={`text-sm space-y-1 ${i > 0 ? 'pt-2 border-t border-scout-border/50' : ''}`}>
                  <Row label={`Position ${l.loanPosition || i + 1}`} value={fmtCurrency(l.loanAmount)} valueClass="text-white font-medium" />
                  <Row label="Type" value={l.loanType || '—'} />
                  <Row label="Rate" value={fmtPercent(l.interestRate)} />
                  <Row label="Lender" value={l.lenderNameStandardized || '—'} />
                  {l.estimatedBalance && <Row label="Est. Balance" value={fmtCurrency(l.estimatedBalance)} />}
                  {l.estimatedMonthlyPayment && <Row label="Est. Monthly" value={fmtCurrency(l.estimatedMonthlyPayment)} />}
                </div>
              ))}
            </div>
          ) : <NoData />}
        </SectionHeader>

        {/* ── VALUATION (AVM) ──────────────────────────────── */}
        <SectionHeader icon={TrendingUp} title="Valuation (AVM)">
          {valRec ? (
            <>
              <Row label="Estimated Value" value={fmtCurrency(valRec.estimatedValue)} valueClass="text-scout-success font-semibold" />
              <Row label="Range" value={`${fmtCurrencyShort(valRec.estimatedMinValue)} – ${fmtCurrencyShort(valRec.estimatedMaxValue)}`} />
              {valRec.confidenceScore != null && (
                <div className="mt-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-scout-text-dim">Confidence</span>
                    <span className="text-white">{parseFloat(valRec.confidenceScore).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-scout-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${parseFloat(valRec.confidenceScore)}%`,
                        background: parseFloat(valRec.confidenceScore) >= 80 ? '#10b981' : parseFloat(valRec.confidenceScore) >= 60 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
              )}
              {valRec.estimatedRentalValue && <Row label="Est. Rental" value={fmtCurrency(valRec.estimatedRentalValue) + '/mo'} />}
              {valRec.ltv != null && <Row label="LTV" value={fmtPercent(parseFloat(valRec.ltv))} />}
              {valRec.availableEquity && <Row label="Available Equity" value={fmtCurrency(valRec.availableEquity)} valueClass="text-scout-success" />}
              {valRec.lendableEquity && <Row label="Lendable Equity" value={fmtCurrency(valRec.lendableEquity)} />}
            </>
          ) : <NoData />}
        </SectionHeader>

        {/* ── CLIMATE RISK ─────────────────────────────────── */}
        <SectionHeader icon={Shield} title="Climate Risk">
          {cr ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-scout-text-dim">Total Risk Score</span>
                <span className={`font-semibold ${
                  safeScore(cr.totalRiskScore) >= 70 ? 'text-red-400' :
                  safeScore(cr.totalRiskScore) >= 50 ? 'text-amber-400' :
                  'text-green-400'
                }`}>{safeScore(cr.totalRiskScore)}/100</span>
              </div>
              <RiskBar label="Heat" score={cr.heatRiskScore} />
              <RiskBar label="Storm" score={cr.stormRiskScore} />
              <RiskBar label="Wildfire" score={cr.wildfireRiskScore} />
              <RiskBar label="Drought" score={cr.droughtRiskScore} />
              <RiskBar label="Flood" score={cr.floodRiskScore} />
              <RiskBar label="Wind" score={cr.windRiskScore} />
              <RiskBar label="Air Quality" score={cr.airQualityRiskScore} />
            </div>
          ) : <NoData />}
        </SectionHeader>

        {/* ── BUILDING PERMITS ─────────────────────────────── */}
        <SectionHeader icon={Hammer} title="Building Permits">
          {permits.length > 0 ? (
            <div className="space-y-3">
              {permits.map((bp, i) => (
                <div key={i} className={`text-sm ${i > 0 ? 'pt-2 border-t border-scout-border/50' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-white font-medium">{bp.permitType || '—'}</span>
                      {bp.status && (
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                          bp.status === 'Complete' ? 'bg-green-400/10 text-green-400' :
                          bp.status === 'Active' ? 'bg-blue-400/10 text-blue-400' :
                          'bg-gray-400/10 text-gray-400'
                        }`}>{bp.status}</span>
                      )}
                    </div>
                    <span className="text-scout-text-dim shrink-0 ml-2">{fmtDate(bp.effectiveDate)}</span>
                  </div>
                  {bp.permitNumber && <div className="text-xs text-scout-text-dim mt-0.5">#{bp.permitNumber}</div>}
                  {bp.description && <p className="text-scout-text-dim mt-1">{bp.description}</p>}
                  {bp.jobValue > 0 && (
                    <div className="text-xs text-scout-text-dim mt-1">
                      Job Value: <span className="text-white">{fmtCurrency(bp.jobValue)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : <NoData />}
        </SectionHeader>

        {/* ── FORECLOSURE ──────────────────────────────────── */}
        <SectionHeader icon={Gavel} title="Foreclosure">
          {foreclosures.length > 0 ? (
            <div className="space-y-3">
              {foreclosures.map((f, i) => (
                <div key={i} className={`text-sm space-y-1 ${i > 0 ? 'pt-2 border-t border-scout-border/50' : ''}`}>
                  {f.recordType && <Row label="Record Type" value={f.recordType} />}
                  <Row label="Recording Date" value={fmtDate(f.foreclosureRecordingDate)} />
                  {f.caseNumber && <Row label="Case Number" value={f.caseNumber} />}
                  {f.defaultAmount && <Row label="Default Amount" value={fmtCurrency(f.defaultAmount)} valueClass="text-red-400" />}
                  {f.loanBalance && <Row label="Loan Balance" value={fmtCurrency(f.loanBalance)} />}
                  {f.auctionDate && <Row label="Auction Date" value={fmtDate(f.auctionDate)} />}
                  {f.auctionOpeningBid && <Row label="Opening Bid" value={fmtCurrency(f.auctionOpeningBid)} />}
                  {f.statusField && <Row label="Status" value={f.statusField} />}
                </div>
              ))}
            </div>
          ) : <NoData />}
        </SectionHeader>

      </div>
    </div>
  );
}
