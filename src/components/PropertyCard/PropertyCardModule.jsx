import React, { useState } from 'react';

// ══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ══════════════════════════════════════════════════════════════════════════════

const GLASS = {
  background: "rgba(15, 23, 42, 0.78)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(148, 163, 184, 0.12)",
};

// ══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════════════════════════

const fmt = {
  dollar: (v) => v != null && v !== "" ? `$${Number(v).toLocaleString()}` : "—",
  dollarK: (v) => {
    if (v == null || v === "") return "—";
    const n = Number(v);
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n}`;
  },
  pct: (v) => v != null && v !== "" ? `${Number(v).toFixed(1)}%` : "—",
  num: (v) => v != null && v !== "" ? Number(v).toLocaleString() : "—",
  sf: (v) => v != null && v !== "" && Number(v) > 0 ? `${Number(v).toLocaleString()} SF` : "—",
  acres: (v) => v != null && v !== "" && Number(v) > 0 ? `${Number(v).toFixed(2)} ac` : null,
  date: (v) => {
    if (!v) return "—";
    const d = new Date(v);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  },
  shortDate: (v) => {
    if (!v) return "—";
    const d = new Date(v);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { month: "2-digit", year: "numeric" });
  },
  yearsAgo: (v) => {
    if (!v) return "—";
    const d = new Date(v);
    if (isNaN(d.getTime())) return "—";
    const diff = (Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return `${diff.toFixed(1)} yrs`;
  },
};

const riskColor = (score) => {
  if (score >= 75) return "#ef4444";
  if (score >= 50) return "#f59e0b";
  if (score >= 25) return "#22c55e";
  return "#6b7280";
};

const riskLabel = (score) => {
  if (score >= 75) return "High";
  if (score >= 50) return "Moderate";
  if (score >= 25) return "Low";
  return "Minimal";
};

// Helper to get value from either camelCase or snake_case
const get = (obj, camel, snake) => {
  if (!obj) return null;
  return obj[camel] ?? obj[snake] ?? null;
};

// Property use code lookup (ATTOM codes → human labels)
const PROPERTY_USE_LABELS = {
  "100": "Agricultural",
  "102": "Farm/Ranch",
  "110": "Livestock",
  "130": "Timberland",
  "163": "Orchard",
  "200": "Commercial",
  "201": "Office",
  "202": "Retail",
  "203": "Warehouse",
  "204": "Restaurant",
  "205": "Hotel/Motel",
  "206": "Medical Office",
  "207": "Shopping Center",
  "208": "Service Station",
  "209": "Parking",
  "210": "Bank",
  "211": "Day Care",
  "212": "Auto Dealership",
  "220": "Industrial Light",
  "221": "Industrial Heavy",
  "230": "Mixed Use",
  "240": "Entertainment",
  "250": "Government",
  "260": "Church/Religious",
  "270": "School/Education",
  "280": "Hospital/Health",
  "290": "Utility",
  "300": "Vacant Land",
  "301": "Vacant Residential",
  "302": "Vacant Commercial",
  "303": "Vacant Industrial",
  "350": "Residential",
  "360": "Single Family",
  "361": "Condo",
  "362": "Townhouse",
  "363": "Co-op",
  "364": "Mobile Home",
  "370": "Duplex",
  "371": "Triplex",
  "372": "Quadruplex",
  "380": "Multi-Family (5-9)",
  "381": "Multi-Family (10-19)",
  "382": "Multi-Family (20-49)",
  "383": "Multi-Family (50-99)",
  "384": "Multi-Family (100+)",
  "385": "Residential (NEC)",
  "390": "Apartment",
  "400": "Exempt/Institutional",
};

const resolvePropertyType = (code, group) => {
  if (!code && !group) return "Property";
  if (code && PROPERTY_USE_LABELS[code]) return PROPERTY_USE_LABELS[code];
  if (code && /^[0-9]+$/.test(code)) return group || `Type ${code}`;
  return code || group || "Property";
};

// ══════════════════════════════════════════════════════════════════════════════
// ICON COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

const Icon = ({ name, size = 16, className = "" }) => {
  const icons = {
    "x": <path d="M18 6L6 18M6 6l12 12" />,
    "chevron-down": <path d="M6 9l6 6 6-6" />,
    "chevron-up": <path d="M6 15l6-6 6 6" />,
    "building": <><path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18" /><path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2" /><path d="M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" /></>,
    "user": <><circle cx="12" cy="8" r="4" /><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" /></>,
    "handshake": <><path d="M11 17a4 4 0 01-4-4V5" /><path d="M7 5l4 4 4-4" /><path d="M17 13v4a4 4 0 01-4 4" /><path d="M13 21l4-4-4-4" /></>,
    "dollar-sign": <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></>,
    "alert-triangle": <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
    "bar-chart": <><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></>,
    "file-text": <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></>,
    "hammer": <><path d="M15 12l-8.5 8.5a2.12 2.12 0 01-3-3L12 9" /><path d="M17.64 15L22 10.64" /><path d="M20.91 11.7a1 1 0 00-.57-.57l-3.66-1.46a1 1 0 01-.57-.57l-1.46-3.66a1 1 0 00-.57-.57L10.42 3.4a1 1 0 00-1.18.28l-2.77 3.08a1 1 0 00.28 1.55l3.18 1.91a1 1 0 01.47.47l1.91 3.18a1 1 0 001.55.28l3.08-2.77a1 1 0 00.28-1.18z" /></>,
    "shield": <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
    "camera": <><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></>,
    "eye": <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
    "eye-off": <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>,
    "map-pin": <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></>,
    "calendar": <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    "home": <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9,22 9,12 15,12 15,22" /></>,
    "briefcase": <><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></>,
    "phone": <><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></>,
    "mail": <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>,
    "external-link": <><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15,3 21,3 21,9" /><line x1="10" y1="14" x2="21" y2="3" /></>,
    "check": <><polyline points="20,6 9,17 4,12" /></>,
    "trending-up": <><polyline points="23,6 13.5,15.5 8.5,10.5 1,18" /><polyline points="17,6 23,6 23,12" /></>,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {icons[name] || null}
    </svg>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PRIMITIVE COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

const Glass = ({ children, className = "", style = {} }) => (
  <div
    className={`rounded-xl ${className}`}
    style={{ ...GLASS, ...style }}
  >
    {children}
  </div>
);

const Badge = ({ children, color = "slate" }) => {
  const colors = {
    slate: "bg-slate-700/60 text-slate-300 border-slate-600/50",
    indigo: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    green: "bg-green-500/20 text-green-300 border-green-500/30",
    amber: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    red: "bg-red-500/20 text-red-300 border-red-500/30",
    purple: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    cyan: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    orange: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
};

const DataRow = ({ label, value, highlight = false, sub = false }) => {
  if (value === null || value === undefined || value === "—" || value === "") return null;
  return (
    <div className={`flex justify-between items-baseline gap-3 ${sub ? "pl-3" : ""}`}>
      <span className="text-slate-400 text-xs shrink-0">{label}</span>
      <span className={`text-right text-xs font-mono ${highlight ? "text-white font-semibold" : "text-slate-200"}`}>
        {value}
      </span>
    </div>
  );
};

const RiskBar = ({ label, score }) => {
  if (score == null) return null;
  const color = riskColor(score);
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400 text-xs w-20 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono w-8 text-right" style={{ color }}>{score}</span>
    </div>
  );
};

const SectionDivider = () => (
  <div className="border-t border-slate-700/50 my-3" />
);

// ══════════════════════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

// 1. Property Overview
const PropertyOverview = ({ data }) => {
  const type = resolvePropertyType(get(data, 'propertyUseStandardized', 'property_use_standardized'), get(data, 'propertyUseGroup', 'property_use_group'));
  const yearBuilt = get(data, 'yearBuilt', 'year_built');
  const beds = get(data, 'bedroomsCount', 'bedrooms_count');
  const baths = get(data, 'bathCount', 'bath_count');
  const bathFull = get(data, 'bathFullCount', 'bath_full_count');
  const bathHalf = get(data, 'bathHalfCount', 'bath_half_count');
  const buildingSf = get(data, 'areaBuilding', 'area_building');
  const lotSf = get(data, 'areaLotSf', 'area_lot_sf');
  const lotAc = get(data, 'areaLotAcres', 'area_lot_acres');
  const stories = get(data, 'storiesCount', 'stories_count');
  const units = get(data, 'unitsCount', 'units_count');
  const buildings = get(data, 'buildingsCount', 'buildings_count');
  const construction = get(data, 'constructionType', 'construction_type');
  const foundation = get(data, 'foundation', 'foundation');
  const roof = get(data, 'roofType', 'roof_type');
  const roofMaterial = get(data, 'roofMaterial', 'roof_material');
  const exterior = get(data, 'exteriorWalls', 'exterior_walls');
  const floor = get(data, 'floorType', 'floor_type');
  const pool = get(data, 'hasPool', 'has_pool');
  const poolType = get(data, 'poolType', 'pool_type');
  const spa = get(data, 'hasSpa', 'has_spa');
  const fireplace = get(data, 'fireplaceCount', 'fireplace_count');
  const elevator = get(data, 'hasElevator', 'has_elevator');
  const garage = get(data, 'garageType', 'garage_type');
  const garageArea = get(data, 'garageArea', 'garage_area');
  const parking = get(data, 'parkingSpaces', 'parking_spaces');
  const hvacCooling = get(data, 'hvacCooling', 'hvac_cooling');
  const hvacHeating = get(data, 'hvacHeating', 'hvac_heating');
  const hvacFuel = get(data, 'hvacFuel', 'hvac_fuel');
  const quality = get(data, 'qualityGrade', 'quality_grade');
  const condition = get(data, 'condition', 'condition');
  const zoning = get(data, 'zoning', 'zoning');
  const census = get(data, 'censusTract', 'census_tract');

  const lotDisplay = fmt.acres(lotAc) || fmt.sf(lotSf);
  const bathDisplay = [
    baths && `${baths} total`,
    bathFull && `${bathFull} full`,
    bathHalf && `${bathHalf} half`,
  ].filter(Boolean).join(", ") || null;

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Key Stats</div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
        <DataRow label="Property Type" value={type} />
        <DataRow label="Year Built" value={yearBuilt} />
        <DataRow label="Bedrooms" value={beds} />
        <DataRow label="Bathrooms" value={bathDisplay} />
        <DataRow label="Building SF" value={fmt.sf(buildingSf)} />
        <DataRow label="Lot Size" value={lotDisplay} />
        <DataRow label="Stories" value={stories} />
        <DataRow label="Units" value={units} />
        <DataRow label="Buildings" value={buildings} />
        <DataRow label="Zoning" value={zoning} />
        <DataRow label="Census Tract" value={census} />
        <DataRow label="Quality" value={quality} />
        <DataRow label="Condition" value={condition} />
      </div>

      {(construction || foundation || roof || exterior || floor) && (
        <>
          <SectionDivider />
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Structure</div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <DataRow label="Construction" value={construction} />
            <DataRow label="Foundation" value={foundation} />
            <DataRow label="Roof Type" value={roof} />
            <DataRow label="Roof Material" value={roofMaterial} />
            <DataRow label="Exterior Walls" value={exterior} />
            <DataRow label="Floor Type" value={floor} />
          </div>
        </>
      )}

      {(pool != null || spa != null || fireplace || elevator != null || garage || parking || hvacCooling || hvacHeating) && (
        <>
          <SectionDivider />
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Amenities</div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <DataRow label="Pool" value={pool ? (poolType || "Yes") : pool === false ? "No" : null} />
            <DataRow label="Spa" value={spa === true ? "Yes" : spa === false ? "No" : null} />
            <DataRow label="Fireplaces" value={fireplace} />
            <DataRow label="Elevator" value={elevator === true ? "Yes" : elevator === false ? "No" : null} />
            <DataRow label="Garage" value={garage} />
            <DataRow label="Garage Area" value={fmt.sf(garageArea)} />
            <DataRow label="Parking Spaces" value={parking} />
            <DataRow label="HVAC Cooling" value={hvacCooling} />
            <DataRow label="HVAC Heating" value={hvacHeating} />
            <DataRow label="Heating Fuel" value={hvacFuel} />
          </div>
        </>
      )}
    </div>
  );
};

// 2. Ownership Intel
const OwnershipIntel = ({ data }) => {
  const [showContact, setShowContact] = useState(false);
  const ownership = data.ownership || [];
  const owner = ownership[0];

  if (!owner) {
    return <div className="text-slate-400 text-sm italic">No ownership data available</div>;
  }

  const ownerName = get(owner, 'owner1NameFull', 'owner1_name_full') ||
                    [get(owner, 'owner1NameFirst', 'owner1_name_first'),
                     get(owner, 'owner1NameLast', 'owner1_name_last')].filter(Boolean).join(' ') || "—";
  const ownerType = get(owner, 'ownershipType', 'ownership_type');
  const isCorp = get(owner, 'companyFlag', 'company_flag');
  const isTrust = get(owner, 'trustFlag', 'trust_flag');
  const isAbsentee = get(owner, 'isAbsenteeOwner', 'is_absentee_owner');
  const isOccupied = get(owner, 'isOwnerOccupied', 'is_owner_occupied');
  const transferDate = get(owner, 'ownershipTransferDate', 'ownership_transfer_date');
  const mailAddress = get(owner, 'mailAddressFull', 'mail_address_full');

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-white font-medium">{ownerName}</div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {isCorp && <Badge color="purple">Corporate</Badge>}
            {isTrust && <Badge color="cyan">Trust</Badge>}
            {isAbsentee && <Badge color="amber">Absentee</Badge>}
            {isOccupied && <Badge color="green">Owner Occupied</Badge>}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <DataRow label="Ownership Type" value={ownerType} />
        <DataRow label="Transfer Date" value={fmt.date(transferDate)} />
        <DataRow label="Years Owned" value={fmt.yearsAgo(transferDate)} />
        <DataRow label="Occupancy" value={isOccupied ? "Owner Occupied" : isAbsentee ? "Absentee" : null} />
      </div>

      {mailAddress && (
        <>
          <SectionDivider />
          <button
            onClick={() => setShowContact(!showContact)}
            className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Icon name={showContact ? "eye-off" : "eye"} size={14} />
            {showContact ? "Hide Contact Info" : "Show Contact Info"}
          </button>
          {showContact && (
            <div className="mt-2 p-2 bg-slate-800/50 rounded-lg">
              <DataRow label="Mailing Address" value={mailAddress} />
            </div>
          )}
        </>
      )}

      {ownership.length > 1 && (
        <>
          <SectionDivider />
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Ownership History</div>
          <div className="space-y-2">
            {ownership.slice(1).map((o, i) => (
              <div key={i} className="p-2 bg-slate-800/30 rounded-lg space-y-1">
                <div className="text-slate-200 text-sm">
                  {get(o, 'owner1NameFull', 'owner1_name_full') || "Previous Owner"}
                </div>
                <DataRow label="Transfer" value={fmt.date(get(o, 'ownershipTransferDate', 'ownership_transfer_date'))} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// 3. Deal History
const DealHistory = ({ data }) => {
  const sales = data.salesTransactions || data.sales_transactions || [];

  if (sales.length === 0) {
    return <div className="text-slate-400 text-sm italic">No sales history available</div>;
  }

  return (
    <div className="space-y-3">
      {sales.map((sale, i) => {
        const price = get(sale, 'salePrice', 'sale_price');
        const date = get(sale, 'recordingDate', 'recording_date');
        const buyer = get(sale, 'grantee1NameFull', 'grantee1_name_full');
        const seller = get(sale, 'grantor1NameFull', 'grantor1_name_full');
        const armsLength = get(sale, 'isArmsLength', 'is_arms_length');
        const distressed = get(sale, 'isDistressed', 'is_distressed');
        const investor = get(sale, 'granteeInvestorFlag', 'grantee_investor_flag');
        const docType = get(sale, 'documentType', 'document_type');
        const titleCompany = get(sale, 'titleCompanyStandardized', 'title_company_standardized');
        const downPayment = get(sale, 'downPayment', 'down_payment');
        const purchaseLtv = get(sale, 'purchaseLtv', 'purchase_ltv');
        const mortgages = sale.mortgages || [];

        return (
          <div key={i} className={`p-3 bg-slate-800/40 rounded-lg space-y-2 ${i > 0 ? 'mt-2' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-white font-semibold">{fmt.dollar(price)}</div>
                <div className="text-slate-400 text-xs">{fmt.date(date)}</div>
              </div>
              <div className="flex flex-wrap gap-1 justify-end">
                {armsLength && <Badge color="green">Arms Length</Badge>}
                {distressed && <Badge color="red">Distressed</Badge>}
                {investor && <Badge color="purple">Investor</Badge>}
              </div>
            </div>

            <div className="space-y-1">
              <DataRow label="Buyer" value={buyer} />
              <DataRow label="Seller" value={seller} />
              <DataRow label="Document Type" value={docType} />
              <DataRow label="Title Company" value={titleCompany} />
              <DataRow label="Down Payment" value={fmt.dollar(downPayment)} />
              <DataRow label="Purchase LTV" value={fmt.pct(purchaseLtv)} />
            </div>

            {mortgages.length > 0 && (
              <div className="mt-2 ml-2 pl-2 border-l-2 border-slate-600 space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mortgages</div>
                {mortgages.map((m, mi) => (
                  <div key={mi} className="space-y-1">
                    <DataRow label="Loan Amount" value={fmt.dollar(get(m, 'loanAmount', 'loan_amount'))} highlight />
                    <DataRow label="Lender" value={get(m, 'lenderNameStandardized', 'lender_name_standardized')} />
                    <DataRow label="Loan Type" value={get(m, 'loanType', 'loan_type')} />
                    <DataRow label="Interest Rate" value={fmt.pct(get(m, 'interestRate', 'interest_rate'))} />
                    <DataRow label="Term" value={get(m, 'loanTerm', 'loan_term') ? `${get(m, 'loanTerm', 'loan_term')} months` : null} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// 4. Financing & Debt
const FinancingDebt = ({ data }) => {
  const loans = data.currentLoans || data.current_loans || [];
  const valuation = data.valuations?.[0] || data.valuation;
  const avm = get(valuation, 'estimatedValue', 'estimated_value');

  const totalDebt = loans.reduce((sum, l) => {
    const amt = get(l, 'loanAmount', 'loan_amount') || get(l, 'estimatedBalance', 'estimated_balance') || 0;
    return sum + Number(amt);
  }, 0);
  const estimatedEquity = avm && totalDebt ? Number(avm) - totalDebt : null;

  return (
    <div className="space-y-3">
      {(totalDebt > 0 || estimatedEquity) && (
        <>
          <div className="p-3 bg-slate-800/40 rounded-lg space-y-1">
            <DataRow label="Total Debt" value={fmt.dollar(totalDebt)} highlight />
            <DataRow label="AVM Value" value={fmt.dollar(avm)} />
            <DataRow label="Estimated Equity" value={estimatedEquity > 0 ? fmt.dollar(estimatedEquity) : null} highlight />
          </div>
          <SectionDivider />
        </>
      )}

      {loans.length === 0 ? (
        <div className="text-slate-400 text-sm italic">No active loans on record</div>
      ) : (
        <div className="space-y-2">
          {loans.map((loan, i) => {
            const position = get(loan, 'loanPosition', 'loan_position') || i + 1;
            const amount = get(loan, 'loanAmount', 'loan_amount');
            const type = get(loan, 'loanType', 'loan_type');
            const lender = get(loan, 'lenderNameStandardized', 'lender_name_standardized');
            const rate = get(loan, 'interestRate', 'interest_rate');
            const term = get(loan, 'loanTerm', 'loan_term');
            const dueDate = get(loan, 'dueDate', 'due_date');
            const estBalance = get(loan, 'estimatedBalance', 'estimated_balance');
            const estMonthly = get(loan, 'estimatedMonthlyPayment', 'estimated_monthly_payment');

            return (
              <div key={i} className="p-3 bg-slate-800/40 rounded-lg space-y-1">
                <div className="flex justify-between items-center mb-2">
                  <Badge color="indigo">Position {position}</Badge>
                  <span className="text-white font-semibold">{fmt.dollar(amount)}</span>
                </div>
                <DataRow label="Loan Type" value={type} />
                <DataRow label="Lender" value={lender} />
                <DataRow label="Interest Rate" value={fmt.pct(rate)} />
                <DataRow label="Term" value={term ? `${term} months` : null} />
                <DataRow label="Due Date" value={fmt.date(dueDate)} />
                <DataRow label="Est. Balance" value={fmt.dollar(estBalance)} />
                <DataRow label="Est. Monthly" value={fmt.dollar(estMonthly)} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 5. Distress Signals
const DistressSignals = ({ data }) => {
  const foreclosures = data.foreclosureRecords || data.foreclosure_records || [];
  const taxDelinquentYear = get(data, 'taxDelinquentYear', 'tax_delinquent_year') ||
                            get(data.taxAssessments?.[0], 'taxDelinquentYear', 'tax_delinquent_year');

  const hasDistress = foreclosures.length > 0 || taxDelinquentYear;

  if (!hasDistress) {
    return (
      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center gap-2 text-green-400">
          <Icon name="check" size={18} />
          <span className="font-medium">No active distress signals</span>
        </div>
        <p className="text-slate-400 text-xs mt-1">This property has no foreclosure filings or tax delinquencies on record.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {taxDelinquentYear && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <Icon name="alert-triangle" size={16} />
            <span className="font-medium">Tax Delinquent</span>
          </div>
          <DataRow label="Delinquent Year" value={taxDelinquentYear} highlight />
        </div>
      )}

      {foreclosures.map((f, i) => {
        const recordType = get(f, 'recordType', 'record_type');
        const filingDate = get(f, 'foreclosureRecordingDate', 'foreclosure_recording_date');
        const caseNumber = get(f, 'caseNumber', 'case_number');
        const borrower = get(f, 'borrowerName', 'borrower_name');
        const lender = get(f, 'lenderNameStandardized', 'lender_name_standardized');
        const trustee = get(f, 'trusteeName', 'trustee_name');
        const originalLoan = get(f, 'originalLoanAmount', 'original_loan_amount');
        const loanBalance = get(f, 'loanBalance', 'loan_balance');
        const defaultAmount = get(f, 'defaultAmount', 'default_amount');
        const auctionDate = get(f, 'auctionDate', 'auction_date');
        const openingBid = get(f, 'auctionOpeningBid', 'auction_opening_bid');
        const auctionAddress = get(f, 'auctionAddress', 'auction_address');
        const status = get(f, 'status', 'status');
        const estimatedValue = get(f, 'estimatedValue', 'estimated_value');
        const maturityDate = get(f, 'loanMaturityDate', 'loan_maturity_date');
        const originalRate = get(f, 'originalLoanInterestRate', 'original_loan_interest_rate');

        return (
          <div key={i} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400">
                <Icon name="alert-triangle" size={16} />
                <span className="font-medium">{recordType || "Foreclosure"}</span>
              </div>
              {status && <Badge color="red">{status}</Badge>}
            </div>

            <div className="space-y-1">
              <DataRow label="Filing Date" value={fmt.date(filingDate)} />
              <DataRow label="Case Number" value={caseNumber} />
              <DataRow label="Borrower" value={borrower} />
              <DataRow label="Lender" value={lender} />
              <DataRow label="Trustee" value={trustee} />
              <DataRow label="Original Loan" value={fmt.dollar(originalLoan)} />
              <DataRow label="Original Rate" value={fmt.pct(originalRate)} />
              <DataRow label="Loan Balance" value={fmt.dollar(loanBalance)} highlight />
              <DataRow label="Default Amount" value={fmt.dollar(defaultAmount)} highlight />
              <DataRow label="Estimated Value" value={fmt.dollar(estimatedValue)} />
              <DataRow label="Loan Maturity" value={fmt.date(maturityDate)} />
            </div>

            {auctionDate && (
              <>
                <SectionDivider />
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Auction Details</div>
                <div className="space-y-1">
                  <DataRow label="Auction Date" value={fmt.date(auctionDate)} highlight />
                  <DataRow label="Opening Bid" value={fmt.dollar(openingBid)} />
                  <DataRow label="Location" value={auctionAddress} />
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

// 6. Valuation & Equity
const ValuationEquity = ({ data }) => {
  const valuation = data.valuations?.[0] || data.valuation;
  const lastSalePrice = get(data, 'lastSalePrice', 'last_sale_price');
  const buildingSf = get(data, 'areaBuilding', 'area_building');

  if (!valuation) {
    return <div className="text-slate-400 text-sm italic">No valuation data available</div>;
  }

  const avm = get(valuation, 'estimatedValue', 'estimated_value');
  const avmMin = get(valuation, 'estimatedMinValue', 'estimated_min_value');
  const avmMax = get(valuation, 'estimatedMaxValue', 'estimated_max_value');
  const confidence = get(valuation, 'confidenceScore', 'confidence_score');
  const rental = get(valuation, 'estimatedRentalValue', 'estimated_rental_value');
  const ltv = get(valuation, 'ltv', 'ltv');
  const availableEquity = get(valuation, 'availableEquity', 'available_equity');
  const lendableEquity = get(valuation, 'lendableEquity', 'lendable_equity');

  const pricePerSf = lastSalePrice && buildingSf && Number(buildingSf) > 0
    ? Number(lastSalePrice) / Number(buildingSf)
    : null;

  const confidenceColor = confidence >= 80 ? "#22c55e" : confidence >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="space-y-3">
      <div className="p-3 bg-slate-800/40 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-400 text-xs">AVM Estimate</span>
          <span className="text-white font-bold text-lg">{fmt.dollar(avm)}</span>
        </div>

        {(avmMin || avmMax) && (
          <div className="text-slate-400 text-xs text-right mb-2">
            Range: {fmt.dollarK(avmMin)} — {fmt.dollarK(avmMax)}
          </div>
        )}

        {confidence != null && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Confidence</span>
              <span style={{ color: confidenceColor }}>{Number(confidence).toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${confidence}%`, backgroundColor: confidenceColor }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <DataRow label="Est. Rental Value" value={rental ? `${fmt.dollar(rental)}/mo` : null} />
        <DataRow label="Price per SF" value={pricePerSf ? fmt.dollar(Math.round(pricePerSf)) : null} />
      </div>

      <SectionDivider />
      <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Investment Metrics</div>
      <div className="space-y-1">
        <DataRow label="Loan-to-Value" value={fmt.pct(ltv)} />
        <DataRow label="Available Equity" value={fmt.dollar(availableEquity)} highlight />
        <DataRow label="Lendable Equity" value={fmt.dollar(lendableEquity)} />
      </div>
    </div>
  );
};

// 7. Tax Profile
const TaxProfile = ({ data }) => {
  const taxRecords = data.taxAssessments || data.tax_assessments || [];
  const current = taxRecords[0];
  const taxDelinquentYear = get(data, 'taxDelinquentYear', 'tax_delinquent_year') ||
                            get(current, 'taxDelinquentYear', 'tax_delinquent_year');

  if (!current && !taxDelinquentYear) {
    return <div className="text-slate-400 text-sm italic">No tax data available</div>;
  }

  const year = get(current, 'taxYear', 'tax_year');
  const total = get(current, 'assessedValueTotal', 'assessed_value_total');
  const land = get(current, 'assessedValueLand', 'assessed_value_land');
  const improvements = get(current, 'assessedValueImprovements', 'assessed_value_improvements');
  const market = get(current, 'marketValueTotal', 'market_value_total');
  const taxBilled = get(current, 'taxAmountBilled', 'tax_amount_billed');
  const homeownerExempt = get(current, 'hasHomeownerExemption', 'has_homeowner_exemption');
  const seniorExempt = get(current, 'hasSeniorExemption', 'has_senior_exemption');
  const veteranExempt = get(current, 'hasVeteranExemption', 'has_veteran_exemption');
  const disabledExempt = get(current, 'hasDisabledExemption', 'has_disabled_exemption');

  const landRatio = total && land ? ((Number(land) / Number(total)) * 100).toFixed(1) : null;

  return (
    <div className="space-y-3">
      {taxDelinquentYear && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-3">
          <div className="flex items-center gap-2 text-red-400">
            <Icon name="alert-triangle" size={16} />
            <span className="font-medium">Tax Delinquent: {taxDelinquentYear}</span>
          </div>
        </div>
      )}

      {current && (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs">Tax Year {year}</span>
            <div className="flex gap-1">
              {homeownerExempt && <Badge color="green">Homeowner</Badge>}
              {seniorExempt && <Badge color="green">Senior</Badge>}
              {veteranExempt && <Badge color="green">Veteran</Badge>}
              {disabledExempt && <Badge color="green">Disabled</Badge>}
            </div>
          </div>

          <div className="space-y-1">
            <DataRow label="Assessed Total" value={fmt.dollar(total)} highlight />
            <DataRow label="Land Value" value={fmt.dollar(land)} />
            <DataRow label="Improvements" value={fmt.dollar(improvements)} />
            <DataRow label="Market Value" value={fmt.dollar(market)} />
            <DataRow label="Land Ratio" value={landRatio ? `${landRatio}%` : null} />
          </div>

          <SectionDivider />
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs">Tax Amount Billed</span>
              <span className="text-amber-400 font-bold">{fmt.dollar(taxBilled)}</span>
            </div>
          </div>
        </>
      )}

      {taxRecords.length > 1 && (
        <>
          <SectionDivider />
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Assessment History</div>
          <div className="space-y-1">
            {taxRecords.slice(1, 5).map((t, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-slate-400">{get(t, 'taxYear', 'tax_year')}</span>
                <span className="text-slate-200 font-mono">{fmt.dollar(get(t, 'assessedValueTotal', 'assessed_value_total'))}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// 8. Development Activity
const DevelopmentActivity = ({ data }) => {
  const permits = data.buildingPermits || data.building_permits || [];

  if (permits.length === 0) {
    return <div className="text-slate-400 text-sm italic">No building permits on record</div>;
  }

  const totalJobValue = permits.reduce((sum, p) => {
    const val = get(p, 'jobValue', 'job_value') || 0;
    return sum + Number(val);
  }, 0);

  return (
    <div className="space-y-3">
      <div className="p-3 bg-slate-800/40 rounded-lg flex justify-between items-center">
        <div>
          <div className="text-slate-400 text-xs">Total Permits</div>
          <div className="text-white font-semibold">{permits.length}</div>
        </div>
        <div className="text-right">
          <div className="text-slate-400 text-xs">Total Job Value</div>
          <div className="text-white font-semibold">{fmt.dollar(totalJobValue)}</div>
        </div>
      </div>

      <div className="space-y-2">
        {permits.map((p, i) => {
          const permitNum = get(p, 'permitNumber', 'permit_number');
          const permitType = get(p, 'permitType', 'permit_type');
          const subType = get(p, 'permitSubType', 'permit_sub_type');
          const status = get(p, 'status', 'status');
          const effectiveDate = get(p, 'effectiveDate', 'effective_date');
          const description = get(p, 'description', 'description');
          const jobValue = get(p, 'jobValue', 'job_value');
          const fees = get(p, 'fees', 'fees');
          const projectName = get(p, 'projectName', 'project_name');
          const businessName = get(p, 'businessName', 'business_name');

          const statusColor = status === 'Complete' ? 'green' : status === 'Active' ? 'indigo' : 'slate';

          return (
            <div key={i} className="p-3 bg-slate-800/40 rounded-lg space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-white font-medium">{permitType || "Permit"}</div>
                  {subType && <div className="text-slate-400 text-xs">{subType}</div>}
                </div>
                {status && <Badge color={statusColor}>{status}</Badge>}
              </div>

              <div className="space-y-1">
                <DataRow label="Permit #" value={permitNum} />
                <DataRow label="Effective Date" value={fmt.date(effectiveDate)} />
                <DataRow label="Project Name" value={projectName} />
                <DataRow label="Business Name" value={businessName} />
                <DataRow label="Job Value" value={fmt.dollar(jobValue)} highlight />
                <DataRow label="Fees" value={fmt.dollar(fees)} />
              </div>

              {description && (
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">{description}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 9. Risk & Environment
const RiskEnvironment = ({ data }) => {
  const climate = data.climateRisk || data.climate_risk;

  if (!climate) {
    return <div className="text-slate-400 text-sm italic">No climate risk data available</div>;
  }

  const total = get(climate, 'totalRiskScore', 'total_risk_score');
  const heat = get(climate, 'heatRiskScore', 'heat_risk_score');
  const storm = get(climate, 'stormRiskScore', 'storm_risk_score');
  const wildfire = get(climate, 'wildfireRiskScore', 'wildfire_risk_score');
  const drought = get(climate, 'droughtRiskScore', 'drought_risk_score');
  const flood = get(climate, 'floodRiskScore', 'flood_risk_score');
  const wind = get(climate, 'windRiskScore', 'wind_risk_score');
  const airQuality = get(climate, 'airQualityRiskScore', 'air_quality_risk_score');
  const floodChanceFuture = get(climate, 'floodChanceFuture', 'flood_chance_future');
  const femaFloodRisk = get(climate, 'femaFloodRisk', 'fema_flood_risk');

  return (
    <div className="space-y-3">
      {total != null && (
        <div className="p-3 bg-slate-800/40 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-xs">Total Risk Score</span>
            <span className="font-bold" style={{ color: riskColor(total) }}>
              {total}/100 — {riskLabel(total)}
            </span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${total}%`, backgroundColor: riskColor(total) }}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <RiskBar label="Heat" score={heat} />
        <RiskBar label="Storm" score={storm} />
        <RiskBar label="Wildfire" score={wildfire} />
        <RiskBar label="Drought" score={drought} />
        <RiskBar label="Flood" score={flood} />
        <RiskBar label="Wind" score={wind} />
        <RiskBar label="Air Quality" score={airQuality} />
      </div>

      {(floodChanceFuture || femaFloodRisk) && (
        <>
          <SectionDivider />
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Flood Risk Detail</div>
          <div className="space-y-1">
            <DataRow label="Future Flood Chance" value={floodChanceFuture ? `${floodChanceFuture}%` : null} />
            <DataRow label="FEMA Classification" value={femaFloodRisk} />
          </div>
        </>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MINI POPUP (for Mapbox popup portal)
// ══════════════════════════════════════════════════════════════════════════════

export const MiniPopup = ({ data, onViewDetails, onClose }) => {
  if (!data) return null;

  // Get data with fallbacks for both camelCase and snake_case
  const addressFull = get(data, 'addressFull', 'address_full') || "—";
  const city = get(data, 'addressCity', 'address_city');
  const state = get(data, 'addressState', 'address_state');
  const zip = get(data, 'addressZip', 'address_zip');
  const propertyType = resolvePropertyType(get(data, 'propertyUseStandardized', 'property_use_standardized'), get(data, 'propertyUseGroup', 'property_use_group'));

  // Valuation
  const valuation = data.valuations?.[0] || data.valuation;
  const avm = get(valuation, 'estimatedValue', 'estimated_value');

  // Sale info
  const lastSalePrice = get(data, 'lastSalePrice', 'last_sale_price');

  // Tax
  const taxTotal = get(data, 'taxAssessedValueTotal', 'tax_assessed_value_total') ||
                   get(data.taxAssessments?.[0], 'assessedValueTotal', 'assessed_value_total');

  // Physical
  const yearBuilt = get(data, 'yearBuilt', 'year_built');
  const buildingSf = get(data, 'areaBuilding', 'area_building');
  const lotAc = get(data, 'areaLotAcres', 'area_lot_acres');
  const lotSf = get(data, 'areaLotSf', 'area_lot_sf');
  const zoning = get(data, 'zoning', 'zoning');

  // Owner
  const owner = data.ownership?.[0];
  const ownerName = owner ? (get(owner, 'owner1NameFull', 'owner1_name_full') || "—") : "—";

  // Distress signals
  const foreclosures = data.foreclosureRecords || data.foreclosure_records || [];
  const taxDelinquentYear = get(data, 'taxDelinquentYear', 'tax_delinquent_year') ||
                            get(data.taxAssessments?.[0], 'taxDelinquentYear', 'tax_delinquent_year');
  const hasForeclosure = foreclosures.length > 0;
  const hasTaxDelinquent = !!taxDelinquentYear;

  // Property type color
  const typeColor = propertyType.toLowerCase().includes('commercial') ? 'indigo' :
                    propertyType.toLowerCase().includes('residential') ? 'green' :
                    propertyType.toLowerCase().includes('vacant') ? 'amber' :
                    propertyType.toLowerCase().includes('mixed') ? 'purple' : 'slate';

  // Lot display
  const lotDisplay = fmt.acres(lotAc) || fmt.sf(lotSf) || "—";

  return (
    <Glass className="w-[416px] overflow-hidden shadow-2xl">
      {/* Distress Banner */}
      {(hasForeclosure || hasTaxDelinquent) && (
        <div className={`px-4 py-2 ${hasForeclosure ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
          <div className={`flex items-center gap-2 ${hasForeclosure ? 'text-red-400' : 'text-amber-400'}`}>
            <Icon name="alert-triangle" size={14} />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {hasForeclosure ? 'Foreclosure Filed' : `Tax Delinquent ${taxDelinquentYear}`}
            </span>
            {hasForeclosure && foreclosures[0] && (
              <span className="text-xs opacity-75 ml-auto">
                {fmt.shortDate(get(foreclosures[0], 'foreclosureRecordingDate', 'foreclosure_recording_date'))}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-700/50">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-base leading-tight truncate">{addressFull}</h3>
            <p className="text-slate-400 text-xs mt-0.5">
              {[city, state].filter(Boolean).join(', ')} {zip}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="mt-2">
          <Badge color={typeColor}>{propertyType}</Badge>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-4 gap-3">
          <div>
            <div className="text-slate-500 text-[10px] uppercase tracking-wider">AVM Value</div>
            <div className="text-white text-sm font-semibold mt-0.5">{fmt.dollarK(avm)}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase tracking-wider">Last Sale</div>
            <div className="text-white text-sm font-semibold mt-0.5">{fmt.dollarK(lastSalePrice)}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase tracking-wider">Assessed</div>
            <div className="text-white text-sm font-semibold mt-0.5">{fmt.dollarK(taxTotal)}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase tracking-wider">Year Built</div>
            <div className="text-white text-sm font-semibold mt-0.5">{yearBuilt || "—"}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase tracking-wider">Building</div>
            <div className="text-white text-sm font-semibold mt-0.5">{fmt.sf(buildingSf)}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase tracking-wider">Lot Size</div>
            <div className="text-white text-sm font-semibold mt-0.5">{lotDisplay}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase tracking-wider">Owner</div>
            <div className="text-white text-sm font-semibold mt-0.5 truncate" title={ownerName}>
              {ownerName.length > 12 ? ownerName.substring(0, 12) + "..." : ownerName}
            </div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase tracking-wider">Zoning</div>
            <div className="text-white text-sm font-semibold mt-0.5">{zoning || "—"}</div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="px-4 pb-4">
        <button
          onClick={onViewDetails}
          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
        >
          VIEW PROPERTY DETAILS
          <Icon name="chevron-down" size={14} className="rotate-[-90deg]" />
        </button>
      </div>
    </Glass>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// DETAIL MODULE (fixed overlay with 9 tabs)
// ══════════════════════════════════════════════════════════════════════════════

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'building' },
  { id: 'ownership', label: 'Ownership', icon: 'user' },
  { id: 'deals', label: 'Deals', icon: 'handshake' },
  { id: 'financing', label: 'Financing', icon: 'dollar-sign' },
  { id: 'distress', label: 'Distress', icon: 'alert-triangle' },
  { id: 'valuation', label: 'Valuation', icon: 'bar-chart' },
  { id: 'tax', label: 'Tax', icon: 'file-text' },
  { id: 'permits', label: 'Permits', icon: 'hammer' },
  { id: 'risk', label: 'Risk', icon: 'shield' },
];

export const DetailModule = ({ data, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!data) return null;

  const addressFull = get(data, 'addressFull', 'address_full') || "—";
  const city = get(data, 'addressCity', 'address_city');
  const state = get(data, 'addressState', 'address_state');
  const zip = get(data, 'addressZip', 'address_zip');
  const propertyType = resolvePropertyType(get(data, 'propertyUseStandardized', 'property_use_standardized'), get(data, 'propertyUseGroup', 'property_use_group'));

  // Key metrics for header bar
  const valuation = data.valuations?.[0] || data.valuation;
  const avm = get(valuation, 'estimatedValue', 'estimated_value');
  const lastSalePrice = get(data, 'lastSalePrice', 'last_sale_price');
  const buildingSf = get(data, 'areaBuilding', 'area_building');
  const yearBuilt = get(data, 'yearBuilt', 'year_built');
  const lotAc = get(data, 'areaLotAcres', 'area_lot_acres');
  const lotSf = get(data, 'areaLotSf', 'area_lot_sf');
  const lotDisplay = fmt.acres(lotAc) || fmt.sf(lotSf);

  const renderSection = () => {
    switch (activeTab) {
      case 'overview': return <PropertyOverview data={data} />;
      case 'ownership': return <OwnershipIntel data={data} />;
      case 'deals': return <DealHistory data={data} />;
      case 'financing': return <FinancingDebt data={data} />;
      case 'distress': return <DistressSignals data={data} />;
      case 'valuation': return <ValuationEquity data={data} />;
      case 'tax': return <TaxProfile data={data} />;
      case 'permits': return <DevelopmentActivity data={data} />;
      case 'risk': return <RiskEnvironment data={data} />;
      default: return null;
    }
  };

  return (
    <Glass
      className="w-[480px] max-h-[85vh] flex flex-col shadow-2xl"
      style={{ ...GLASS }}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-700/50 shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-white font-bold text-lg leading-tight">{addressFull}</h2>
            <p className="text-slate-400 text-sm mt-0.5">
              {[city, state].filter(Boolean).join(', ')} {zip}
            </p>
            <div className="mt-2">
              <Badge color="indigo">{propertyType}</Badge>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
      </div>

      {/* Key Metrics Bar */}
      <div className="px-5 py-3 bg-slate-800/30 border-b border-slate-700/50 shrink-0">
        <div className="flex justify-between text-center">
          <div>
            <div className="text-slate-500 text-[10px] uppercase tracking-wider">AVM</div>
            <div className="text-white text-sm font-bold">{fmt.dollarK(avm)}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase tracking-wider">Last Sale</div>
            <div className="text-white text-sm font-bold">{fmt.dollarK(lastSalePrice)}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase tracking-wider">Building</div>
            <div className="text-white text-sm font-bold">{fmt.sf(buildingSf)}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase tracking-wider">Built</div>
            <div className="text-white text-sm font-bold">{yearBuilt || "—"}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase tracking-wider">Lot</div>
            <div className="text-white text-sm font-bold">{lotDisplay || "—"}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-2 border-b border-slate-700/50 shrink-0 overflow-x-auto">
        <div className="flex">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-white border-indigo-500'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              <Icon name={tab.icon} size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {renderSection()}
      </div>
    </Glass>
  );
};
