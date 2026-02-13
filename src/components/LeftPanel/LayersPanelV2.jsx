import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Search, Map, Layers, Grid3X3, MapPin, Trees, BarChart3,
  Target, Wrench, Construction, AlertTriangle, Users, Navigation,
  Bookmark, Eye, ChevronDown, ChevronUp, RotateCcw,
  SlidersHorizontal, Plus, ThumbsUp, Send, MessageSquarePlus,
  DollarSign, Building2, Clock, Train, Filter
} from "lucide-react";

const C = {
  panelBg: "#2d2d2d", sectionBg: "#353535", inputBg: "#353535", hoverBg: "#404040",
  modalOverlay: "rgba(0,0,0,0.6)",
  brand: "#1877F2", brandHover: "#1565D8", brandSubtle: "rgba(24,119,242,0.12)", brandBorder: "rgba(24,119,242,0.4)",
  textPrimary: "#ececec", textSecondary: "#a0a0a0", textMuted: "#707070", textWhite: "#ffffff",
  border: "#4a4a4a", borderLight: "#3e3e3e",
  toggleOff: "#555555", toggleOn: "#1877F2",
  panelShadow: "0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)",
};

const font = "'DM Sans', system-ui, sans-serif";
const sym = (type, color) => ({ type, color });

// ── DATA ──
const LAYER_PACKS = [
  { id: "site", label: "Site", icon: MapPin },
  { id: "dd", label: "DD", icon: Search },
  { id: "invest", label: "Invest", icon: BarChart3, default: true },
  { id: "develop", label: "Dev", icon: Construction },
  { id: "risk", label: "Risk", icon: AlertTriangle },
  { id: "demo", label: "Demo", icon: Users },
];

const BASE_MAPS = [
  { id: "streets", label: "Streets" },
  { id: "satellite", label: "Satellite" },
  { id: "hybrid", label: "Hybrid" },
];

const SECTIONS = [
  { id: "parcels", title: "PARCELS & BOUNDARIES", icon: Grid3X3, hasOpacity: true, layers: [
    { id: "parcelBoundaries", label: "Parcel Boundaries", sym: sym("solid","#1877F2"), hasData: true },
    { id: "parcelLabels", label: "Parcel Labels", sym: sym("solid","#a0a0a0"), hasData: true },
    { id: "propertyDots", label: "Property Dots", sym: sym("point","#1877F2"), hasData: true },
    { id: "ownerType", label: "Color by Owner Type", sym: sym("fill","#8B5CF6"), hasData: true },
    { id: "lotLines", label: "Lot Lines", sym: sym("dashed","#6b7280"), hasData: false, badge: "Soon" },
  ]},
  { id: "zoning", title: "ZONING", icon: Map, hasOpacity: true, layers: [
    { id: "zoningDistricts", label: "Zoning Districts", sym: sym("fill","#3B82F6"), hasData: true },
    { id: "futureLandUse", label: "Future Land Use", sym: sym("fill","#8B5CF6"), hasData: false, badge: "Soon" },
    { id: "zoningOverlays", label: "Zoning Overlays", sym: sym("dashed","#60a5fa"), hasData: false, badge: "Later" },
  ]},
  { id: "environmental", title: "ENVIRONMENTAL", icon: Trees, layers: [
    { id: "floodZones", label: "FEMA Flood Zones", sym: sym("fill","#3B82F6"), hasData: true },
    { id: "wetlands", label: "Wetlands", sym: sym("fill","#14B8A6"), hasData: false, badge: "Later" },
    { id: "soilTypes", label: "Soil Types", sym: sym("fill","#A3714F"), hasData: false, badge: "Later" },
    { id: "climateRisk", label: "Climate Risk", sym: sym("fill","#EF4444"), hasData: false, badge: "Soon" },
    { id: "contourLines", label: "Contour Lines", sym: sym("solid","#6b7280"), hasData: false, badge: "Later" },
  ]},
  { id: "valueChoropleth", title: "VALUE CHOROPLETHS", icon: BarChart3, type: "radio", layers: [
    { id: "marketValue", label: "Market Value", gradient: ["#ea580c","#dc2626","#991b1b"] },
    { id: "valuePerAcre", label: "Value per Acre", gradient: ["#1e3a5f","#6366f1","#c084fc"] },
    { id: "assessedValue", label: "Assessed Value", gradient: ["#1e40af","#3b82f6","#93c5fd"] },
    { id: "landValue", label: "Land Value", gradient: ["#166534","#22c55e","#86efac"] },
    { id: "improvementValue", label: "Improvement Value", gradient: ["#ea580c","#ef4444","#fca5a5"] },
  ]},
  { id: "incentives", title: "INCENTIVES & OPPORTUNITY", icon: Target, layers: [
    { id: "opportunityZones", label: "Opportunity Zones", sym: sym("fill","#22c55e"), hasData: false, badge: "Soon" },
    { id: "tifDistricts", label: "TIF Districts", sym: sym("dashed","#f59e0b"), hasData: false, badge: "Later" },
    { id: "enterpriseZones", label: "Enterprise Zones", sym: sym("fill","#8B5CF6"), hasData: false, badge: "Later" },
  ]},
  { id: "utilities", title: "UTILITIES", icon: Wrench, layers: [
    { id: "waterMains", label: "Water Mains", sym: sym("solid","#3B82F6"), hasData: true },
    { id: "sewerMains", label: "Sewer Mains", sym: sym("dashed","#B45309"), hasData: true },
    { id: "waterServiceAreas", label: "Water Service Areas", sym: sym("solid","#60a5fa"), hasData: true },
    { id: "sewerServiceAreas", label: "Sewer Service Areas", sym: sym("solid","#C2956A"), hasData: true },
    { id: "electricServiceAreas", label: "Electric Service Areas", sym: sym("solid","#D97706"), hasData: true },
    { id: "powerLines", label: "Power Lines", sym: sym("dotted","#D97706"), hasData: true },
    { id: "gasLines", label: "Gas Lines", sym: sym("dashdot","#DC2626"), hasData: false, badge: "Later" },
    { id: "manholes", label: "Manholes", sym: sym("point","#A855F7"), hasData: true },
    { id: "fireHydrants", label: "Fire Hydrants", sym: sym("point","#EF4444"), hasData: true },
  ]},
  { id: "development", title: "DEVELOPMENT ACTIVITY", icon: Construction, layers: [
    { id: "buildingPermits", label: "Building Permits", sym: sym("point","#22c55e"), hasData: false, badge: "Soon" },
    { id: "activeDevelopments", label: "Active Developments", sym: sym("fill","#f59e0b"), hasData: true },
    { id: "demolitionPermits", label: "Demolition Permits", sym: sym("point","#EF4444"), hasData: false, badge: "Later" },
  ]},
  { id: "distress", title: "DISTRESS SIGNALS", icon: AlertTriangle, layers: [
    { id: "taxDelinquent", label: "Tax Delinquent", sym: sym("point","#EF4444"), hasData: true },
    { id: "preForeclosure", label: "Pre-Foreclosure", sym: sym("point","#F97316"), hasData: false, badge: "Soon" },
    { id: "lisPendens", label: "Lis Pendens", sym: sym("point","#DC2626"), hasData: false, badge: "Later" },
    { id: "codeLiens", label: "Code Liens", sym: sym("point","#991b1b"), hasData: false, badge: "Later" },
  ]},
  { id: "demographics", title: "DEMOGRAPHICS", icon: Users, layers: [
    { id: "censusTract", label: "Census Tracts", sym: sym("solid","#6366f1"), hasData: false, badge: "Soon" },
    { id: "medianIncome", label: "Median Income", sym: sym("fill","#22c55e"), hasData: false, badge: "Later" },
    { id: "populationDensity", label: "Population Density", sym: sym("fill","#f59e0b"), hasData: false, badge: "Later" },
  ]},
  { id: "poi", title: "POINTS OF INTEREST", icon: Bookmark, layers: [
    { id: "restaurants", label: "Restaurants", sym: sym("point","#F97316"), hasData: true },
    { id: "retail", label: "Retail", sym: sym("point","#8B5CF6"), hasData: true },
    { id: "schools", label: "Schools", sym: sym("point","#3B82F6"), hasData: true },
    { id: "transitStops", label: "Transit Stops", sym: sym("point","#22c55e"), hasData: true },
    { id: "parks", label: "Parks", sym: sym("fill","#16a34a"), hasData: true },
  ]},
  { id: "transportation", title: "TRANSPORTATION", icon: Navigation, layers: [
    { id: "trafficAADT", label: "Traffic (AADT)", sym: sym("solid","#EF4444"), hasData: false, badge: "Soon" },
    { id: "majorRoads", label: "Major Roads", sym: sym("solid","#f59e0b"), hasData: false, badge: "Later" },
    { id: "bikeRoutes", label: "Bike Routes", sym: sym("dashed","#22c55e"), hasData: false, badge: "Later" },
    { id: "sidewalks", label: "Sidewalks", sym: sym("dotted","#a0a0a0"), hasData: false, badge: "Later" },
  ]},
];

const FILTER_GROUPS = [
  { id: "financial", label: "Financial", icon: DollarSign, filters: [
    { id: "priceRange", label: "Price Range", type: "range", min: 0, max: 50000000, step: 50000, unit: "$", format: "currency" },
    { id: "distressed", label: "Distressed Only", type: "toggle" },
  ]},
  { id: "property", label: "Property", icon: Building2, filters: [
    { id: "acreage", label: "Lot Size (acres)", type: "range", min: 0, max: 500, step: 0.5, unit: "ac" },
    { id: "yearBuilt", label: "Year Built", type: "range", min: 1900, max: 2026, step: 1, unit: "" },
    { id: "zoningType", label: "Zoning Type", type: "select", options: ["All","Residential","Commercial","Industrial","Mixed Use","Agricultural","Planned Development"] },
    { id: "ownerType", label: "Owner Type", type: "select", options: ["All","Individual","Corporate","Trust","Government","Absentee"] },
  ]},
  { id: "status", label: "Status & Activity", icon: Clock, filters: [
    { id: "daysOnMarket", label: "Days on Market", type: "range", min: 0, max: 365, step: 1, unit: "d" },
    { id: "withPermits", label: "Active Permits", type: "toggle" },
    { id: "activeDev", label: "Active Developments", type: "toggle" },
    { id: "recentlySold", label: "Recently Sold (90d)", type: "toggle" },
  ]},
  { id: "proximity", label: "Proximity", icon: Train, filters: [
    { id: "nearTransit", label: "Near Transit", type: "toggle" },
    { id: "nearSchools", label: "Near Schools", type: "toggle" },
    { id: "nearAmenities", label: "Near Amenities", type: "toggle" },
    { id: "proximityRadius", label: "Search Radius", type: "range", min: 0.1, max: 5, step: 0.1, unit: "mi" },
  ]},
];

const INITIAL_REQUESTED = [
  { id: "r1", name: "Tree Canopy / Coverage", votes: 47, voted: false },
  { id: "r2", name: "Historic Districts", votes: 39, voted: false },
  { id: "r3", name: "Noise Contours", votes: 31, voted: false },
  { id: "r4", name: "Internet / Fiber Coverage", votes: 28, voted: false },
  { id: "r5", name: "Easements & Right-of-Way", votes: 24, voted: false },
  { id: "r6", name: "Stormwater Infrastructure", votes: 22, voted: false },
  { id: "r7", name: "Crime / Safety Heat Map", votes: 19, voted: false },
  { id: "r8", name: "Property Tax Rate Zones", votes: 16, voted: false },
  { id: "r9", name: "School District Boundaries", votes: 14, voted: false },
  { id: "r10", name: "HOA / PID Boundaries", votes: 11, voted: false },
];

// ── ATOMS ──
function Toggle({ checked, onChange, size = "default" }) {
  const w = size === "small" ? 30 : 34, h = size === "small" ? 16 : 18, t = size === "small" ? 12 : 14;
  return (<button onClick={() => onChange(!checked)} style={{ width: w, height: h, borderRadius: 999, cursor: "pointer", background: checked ? C.toggleOn : C.toggleOff, border: "none", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
    <div style={{ width: t, height: t, borderRadius: "50%", background: "#fff", position: "absolute", top: (h-t)/2, left: checked ? w-t-2 : 2, transition: "left 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.3)" }} />
  </button>);
}

function Radiob({ selected, onChange }) {
  return (<button onClick={onChange} style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${selected ? C.brand : "#666"}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 0 }}>
    {selected && <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.brand }} />}
  </button>);
}

function Badge({ type }) {
  const m = { Soon: { bg: "rgba(245,158,11,0.12)", c: "#f59e0b", b: "rgba(245,158,11,0.25)" }, Later: { bg: "rgba(160,160,160,0.1)", c: "#888", b: "rgba(160,160,160,0.2)" }, Live: { bg: "rgba(34,197,94,0.12)", c: "#22c55e", b: "rgba(34,197,94,0.25)" } };
  const s = m[type] || m.Later;
  return <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.6px", textTransform: "uppercase", padding: "1px 6px", borderRadius: 999, lineHeight: "16px", background: s.bg, color: s.c, border: `1px solid ${s.b}`, whiteSpace: "nowrap" }}>{type}</span>;
}

function Sym({ sym: s }) {
  if (!s) return null;
  const w = 28, h = 16;
  if (s.type === "point") return <div style={{ width: w, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><div style={{ width: 10, height: 10, borderRadius: "50%", border: `2px solid ${s.color}`, background: s.color+"30" }} /></div>;
  if (s.type === "fill") return <div style={{ width: w, height: h-4, borderRadius: 3, flexShrink: 0, background: s.color+"40", border: `1.5px solid ${s.color}` }} />;
  const d = s.type==="dashed"?"6,3":s.type==="dotted"?"2,3":s.type==="dashdot"?"8,3,2,3":"none";
  return <svg width={w} height={h} style={{ flexShrink: 0 }}><line x1="2" y1={h/2} x2={w-2} y2={h/2} stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={d} /></svg>;
}

function Grad({ colors }) {
  return <div style={{ height: 10, borderRadius: 5, flexShrink: 0, width: 80, background: `linear-gradient(to right, ${colors.join(", ")})` }} />;
}

function ActiveCount({ active, total }) {
  return <span style={{ fontSize: 11, fontWeight: 500, color: active > 0 ? C.brand : C.textMuted, marginRight: 4, whiteSpace: "nowrap" }}>{active} of {total}</span>;
}

function Section({ title, icon: Icon, children, count, activeCount, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const Ch = open ? ChevronUp : ChevronDown;
  return (<div style={{ background: C.sectionBg, borderRadius: 10, border: `1px solid ${C.borderLight}`, marginBottom: 6, overflow: "hidden" }}>
    <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: "transparent", border: "none", cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <Icon size={14} color={C.textSecondary} strokeWidth={1.8} />
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", color: C.textPrimary }}>{title}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {count !== undefined && <ActiveCount active={activeCount||0} total={count} />}
        <Ch size={14} color={C.textMuted} strokeWidth={1.8} />
      </div>
    </button>
    {open && <div style={{ padding: "0 10px 10px" }}>{children}</div>}
  </div>);
}

function LayerRow({ layer, checked, onChange, isRadio, disabled }) {
  return (<div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 4px", borderRadius: 6, opacity: disabled ? 0.45 : 1, cursor: disabled ? "not-allowed" : "pointer", transition: "background 0.12s" }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = C.hoverBg; }}
    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
    {layer.sym && <Sym sym={layer.sym} />}
    {layer.gradient && <Grad colors={layer.gradient} />}
    <span style={{ flex: 1, fontSize: 13, color: disabled ? C.textMuted : C.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{layer.label}</span>
    {layer.badge && <Badge type={layer.badge} />}
    {isRadio ? <Radiob selected={checked} onChange={() => !disabled && onChange(layer.id)} /> : <Toggle size="small" checked={checked} onChange={() => !disabled && onChange(layer.id)} />}
  </div>);
}

// ── FILTER COMPONENTS ──
function RangeFilter({ filter, value, onChange }) {
  const [lo, hi] = value;
  const fmt = v => { if (filter.format==="currency") { if (v>=1e6) return `$${(v/1e6).toFixed(1)}M`; if (v>=1e3) return `$${(v/1e3).toFixed(0)}K`; return `$${v}`; } return `${v}${filter.unit?` ${filter.unit}`:""}`; };
  return (<div style={{ padding: "6px 0" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontSize: 12, color: C.textPrimary }}>{filter.label}</span>
      <span style={{ fontSize: 11, color: C.brand, fontVariantNumeric: "tabular-nums" }}>{fmt(lo)} — {fmt(hi)}</span>
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      <input type="range" min={filter.min} max={filter.max} step={filter.step} value={lo} onChange={e => { const v=Number(e.target.value); onChange([Math.min(v,hi),hi]); }} style={{ flex: 1, height: 3, accentColor: C.brand, cursor: "pointer" }} />
      <input type="range" min={filter.min} max={filter.max} step={filter.step} value={hi} onChange={e => { const v=Number(e.target.value); onChange([lo,Math.max(v,lo)]); }} style={{ flex: 1, height: 3, accentColor: C.brand, cursor: "pointer" }} />
    </div>
  </div>);
}

function SelectFilter({ filter, value, onChange }) {
  return (<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
    <span style={{ fontSize: 12, color: C.textPrimary }}>{filter.label}</span>
    <select value={value} onChange={e => onChange(e.target.value)} style={{ background: C.inputBg, color: C.textPrimary, border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 8px", fontSize: 12, outline: "none", cursor: "pointer", fontFamily: font, maxWidth: 140 }}>
      {filter.options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>);
}

function ToggleFilter({ filter, value, onChange }) {
  return (<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.sectionBg, borderRadius: 7, padding: "7px 10px" }}>
    <span style={{ fontSize: 12, color: C.textPrimary }}>{filter.label}</span>
    <Toggle size="small" checked={value} onChange={onChange} />
  </div>);
}

// ── REQUEST LAYER MODAL ──
function RequestModal({ isOpen, onClose }) {
  const [list, setList] = useState(INITIAL_REQUESTED);
  const [input, setInput] = useState("");
  const ref = useRef(null);
  useEffect(() => { if (isOpen && ref.current) ref.current.focus(); }, [isOpen]);
  if (!isOpen) return null;
  const vote = id => setList(p => p.map(r => r.id===id ? {...r, voted: !r.voted, votes: r.voted ? r.votes-1 : r.votes+1} : r).sort((a,b) => b.votes-a.votes));
  const submit = () => { if (!input.trim()) return; setList(p => [{id:`r-${Date.now()}`,name:input.trim(),votes:1,voted:true},...p].sort((a,b)=>b.votes-a.votes)); setInput(""); };
  return (<div onClick={onClose} style={{ position: "fixed", inset: 0, background: C.modalOverlay, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div onClick={e => e.stopPropagation()} style={{ width: 380, maxHeight: "80vh", background: C.panelBg, borderRadius: 16, boxShadow: C.panelShadow, display: "flex", flexDirection: "column", border: `1px solid ${C.borderLight}`, overflow: "hidden", fontFamily: font }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 12px", borderBottom: `1px solid ${C.borderLight}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><MessageSquarePlus size={16} color={C.brand} strokeWidth={1.8} /><span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Request a Layer</span></div>
        <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, display: "flex" }}><X size={16} color={C.textSecondary} strokeWidth={1.8} /></button>
      </div>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.borderLight}`, flexShrink: 0 }}>
        <p style={{ fontSize: 12, color: C.textSecondary, margin: "0 0 8px", lineHeight: 1.4 }}>Vote for layers you need or suggest a new one.</p>
        <div style={{ display: "flex", gap: 6 }}>
          <input ref={ref} type="text" placeholder="Suggest a layer..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter"&&submit()}
            style={{ flex: 1, height: 34, background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "0 10px", color: C.textPrimary, fontSize: 13, outline: "none", fontFamily: font }}
            onFocus={e => { e.target.style.borderColor=C.brand; }} onBlur={e => { e.target.style.borderColor=C.border; }} />
          <button onClick={submit} disabled={!input.trim()} style={{ width: 34, height: 34, borderRadius: 8, border: "none", background: input.trim() ? C.brand : C.toggleOff, cursor: input.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Send size={14} color="#fff" strokeWidth={2} />
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
        {list.map((r, i) => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px", borderRadius: 8, transition: "background 0.12s" }}
            onMouseEnter={e => { e.currentTarget.style.background=C.hoverBg; }} onMouseLeave={e => { e.currentTarget.style.background="transparent"; }}>
            <span style={{ fontSize: 12, color: C.textMuted, width: 18, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{i+1}</span>
            <span style={{ flex: 1, fontSize: 13, color: C.textPrimary }}>{r.name}</span>
            <button onClick={() => vote(r.id)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, border: `1px solid ${r.voted?C.brand:C.border}`, background: r.voted?C.brandSubtle:"transparent", cursor: "pointer", transition: "all 0.15s" }}>
              <ThumbsUp size={12} color={r.voted?C.brand:C.textMuted} strokeWidth={2} fill={r.voted?C.brand:"none"} />
              <span style={{ fontSize: 11, fontWeight: 600, color: r.voted?C.brand:C.textMuted, fontVariantNumeric: "tabular-nums" }}>{r.votes}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>);
}

// ── MAIN ──
// This is the original LayersPanelV2 component with added onLayerChange and onFilterChange callbacks.
// It notifies the parent (App.jsx) whenever a wired layer or filter changes state.
export default function LayersPanel({ onLayerChange, onFilterChange }) {
  const [isOpen, setIsOpen] = useState(true);
  const [view, setView] = useState("layers");
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");
  const [pack, setPack] = useState("invest");
  const [baseMap, setBaseMap] = useState("streets");
  const [ls, setLs] = useState(() => { const i = {}; SECTIONS.forEach(s => s.layers.forEach(l => { i[l.id]=false; })); i.parcelBoundaries=true; i.propertyDots=true; return i; });
  const [op, setOp] = useState({ parcels: 80, zoning: 60 });
  const [fs, setFs] = useState(() => { const i = {}; FILTER_GROUPS.forEach(g => g.filters.forEach(f => { if (f.type==="range") i[f.id]=[f.min,f.max]; else if (f.type==="select") i[f.id]=f.options[0]; else i[f.id]=false; })); return i; });

  // Track previous layer/filter state to detect changes and notify parent
  const prevLsRef = useRef(ls);
  const prevFsRef = useRef(fs);

  // Notify parent when layer toggles change (for wired layers only)
  useEffect(() => {
    const prev = prevLsRef.current;
    prevLsRef.current = ls;

    // Map panel layer IDs → App.jsx visibleLayers keys
    const LAYER_MAP = {
      parcelBoundaries: 'parcels',
      floodZones: 'flood',
      schools: 'schools',
    };

    for (const [panelId, appKey] of Object.entries(LAYER_MAP)) {
      if (prev[panelId] !== ls[panelId]) {
        onLayerChange?.(appKey, ls[panelId]);
      }
    }
  }, [ls, onLayerChange]);

  // Notify parent when filters change (for wired filters only)
  useEffect(() => {
    const prev = prevFsRef.current;
    prevFsRef.current = fs;

    // Build the backend-compatible filter object from panel filter state
    // Only include filters that have active (non-default) values
    const backendFilters = {};

    // distressed toggle → foreclosure filter
    if (fs.distressed) backendFilters.foreclosure = true;

    // ownerType select → absenteeOwner or corporateOwned
    if (fs.ownerType === 'Absentee') backendFilters.absenteeOwner = true;
    if (fs.ownerType === 'Corporate') backendFilters.corporateOwned = true;

    // recentlySold toggle → recentSales filter
    if (fs.recentlySold) backendFilters.recentSales = true;

    // acreage range → minAcres / maxAcres (only if changed from defaults)
    const acreageDef = FILTER_GROUPS.flatMap(g => g.filters).find(f => f.id === 'acreage');
    if (acreageDef && (fs.acreage[0] !== acreageDef.min || fs.acreage[1] !== acreageDef.max)) {
      if (fs.acreage[0] > acreageDef.min) backendFilters.minAcres = fs.acreage[0];
      if (fs.acreage[1] < acreageDef.max) backendFilters.maxAcres = fs.acreage[1];
    }

    onFilterChange?.(backendFilters);
  }, [fs, onFilterChange]);

  const tog = id => setLs(p => ({...p,[id]:!p[id]}));
  const selRadio = (sid, lid) => { const sec = SECTIONS.find(s=>s.id===sid); if (!sec) return; setLs(p => { const n={...p}; sec.layers.forEach(l => { n[l.id] = l.id===lid ? !p[lid] : false; }); return n; }); };
  const cntActive = sec => sec.layers.filter(l => ls[l.id]).length;
  const totalLayers = Object.values(ls).filter(Boolean).length;
  const cntFilters = Object.entries(fs).filter(([k,v]) => { const d=FILTER_GROUPS.flatMap(g=>g.filters).find(f=>f.id===k); if(!d) return false; if(d.type==="range") return v[0]!==d.min||v[1]!==d.max; if(d.type==="select") return v!==d.options[0]; return v===true; }).length;
  const resetFs = () => { const i={}; FILTER_GROUPS.forEach(g=>g.filters.forEach(f=>{if(f.type==="range")i[f.id]=[f.min,f.max];else if(f.type==="select")i[f.id]=f.options[0];else i[f.id]=false;})); setFs(i); };
  const filtered = search ? SECTIONS.map(s=>({...s,layers:s.layers.filter(l=>l.label.toLowerCase().includes(search.toLowerCase()))})).filter(s=>s.layers.length>0) : SECTIONS;

  if (!isOpen) return (
    <div style={{ position: "absolute", top: 12, left: 12, zIndex: 55, display: "flex", gap: 6 }}>
      {[["layers",Layers,"Layers",totalLayers],["filters",Filter,"Filters",cntFilters]].map(([v,Ic,lb,cnt]) => (
        <button key={v} onClick={() => {setIsOpen(true);setView(v);}} style={{ background: C.panelBg, color: C.textPrimary, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, boxShadow: C.panelShadow, fontFamily: font }}>
          <Ic size={15} strokeWidth={1.8} />{lb}
          {cnt>0 && <span style={{ background: C.brand, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "1px 6px", lineHeight: "16px" }}>{cnt}</span>}
        </button>
      ))}
    </div>
  );

  return (<>
    <div style={{ position: "absolute", top: 12, left: 12, zIndex: 55, width: 350, maxHeight: "calc(100vh - 24px)", background: C.panelBg, borderRadius: 14, boxShadow: C.panelShadow, display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: font, border: `1px solid ${C.borderLight}` }}>
      {/* HEADER */}
      <div style={{ padding: "12px 14px 0", borderBottom: `1px solid ${C.borderLight}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {view==="layers" ? <Layers size={16} color={C.textPrimary} strokeWidth={1.8}/> : <Filter size={16} color={C.textPrimary} strokeWidth={1.8}/>}
            <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, letterSpacing: "-0.2px" }}>{view==="layers"?"Map Layers":"Filters"}</span>
            {view==="layers"&&totalLayers>0 && <span style={{ background: C.brandSubtle, color: C.brand, fontSize: 11, fontWeight: 600, borderRadius: 999, padding: "1px 8px", lineHeight: "18px", border: `1px solid ${C.brandBorder}` }}>{totalLayers} active</span>}
            {view==="filters"&&cntFilters>0 && <span style={{ background: C.brandSubtle, color: C.brand, fontSize: 11, fontWeight: 600, borderRadius: 999, padding: "1px 8px", lineHeight: "18px", border: `1px solid ${C.brandBorder}` }}>{cntFilters} active</span>}
          </div>
          <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, display: "flex" }}
            onMouseEnter={e=>{e.currentTarget.style.background=C.hoverBg;}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
            <X size={16} color={C.textSecondary} strokeWidth={1.8} />
          </button>
        </div>
        <div style={{ display: "flex", background: C.sectionBg, borderRadius: 8, padding: 3, gap: 2, marginBottom: 12 }}>
          {[{id:"layers",label:"Layers",icon:Layers},{id:"filters",label:"Filters",icon:SlidersHorizontal}].map(tab => {
            const on = view===tab.id; const Ic=tab.icon;
            return <button key={tab.id} onClick={()=>setView(tab.id)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px 0", borderRadius: 6, border: "none", cursor: "pointer", background: on?C.brand:"transparent", color: on?C.textWhite:C.textSecondary, fontSize: 12, fontWeight: 600, transition: "all 0.15s", fontFamily: font }}><Ic size={13} strokeWidth={2}/>{tab.label}</button>;
          })}
        </div>
      </div>

      {/* LAYERS VIEW */}
      {view==="layers" && <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <input type="text" placeholder="Search layers..." value={search} onChange={e=>setSearch(e.target.value)}
            style={{ width: "100%", height: 34, background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "0 10px 0 34px", color: C.textPrimary, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: font }}
            onFocus={e=>{e.target.style.borderColor=C.brand;}} onBlur={e=>{e.target.style.borderColor=C.border;}} />
          <Search size={14} color={C.textMuted} strokeWidth={1.8} style={{ position: "absolute", left: 11, top: 10 }} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "1px", color: C.textMuted, textTransform: "uppercase" }}>Layer Packs</span>
            <button onClick={()=>setPack(null)} style={{ fontSize: 10, color: C.brand, background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 3 }}><RotateCcw size={10} strokeWidth={2}/>Reset</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
            {LAYER_PACKS.map(p => { const on=pack===p.id; const Ic=p.icon;
              return <button key={p.id} onClick={()=>setPack(on?null:p.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 52, gap: 3, padding: 4, cursor: "pointer", background: on?C.brandSubtle:C.sectionBg, border: `1px solid ${on?C.brand:C.borderLight}`, borderRadius: 8, transition: "all 0.15s" }}>
                <Ic size={15} color={on?C.brand:C.textSecondary} strokeWidth={1.8}/><span style={{ fontSize: 10, fontWeight: 600, color: on?C.brand:C.textSecondary }}>{p.label}</span>
              </button>;
            })}
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <span style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "1px", color: C.textMuted, textTransform: "uppercase", marginBottom: 6 }}>Base Maps</span>
          <div style={{ display: "flex", gap: 5 }}>
            {BASE_MAPS.map(bm => { const on=baseMap===bm.id;
              return <button key={bm.id} onClick={()=>setBaseMap(bm.id)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, background: on?C.brand:C.sectionBg, color: on?C.textWhite:C.textSecondary, border: `1px solid ${on?C.brand:C.borderLight}`, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s", fontFamily: font }}>{bm.label}</button>;
            })}
          </div>
        </div>

        {filtered.map(sec => (
          <Section key={sec.id} title={sec.title} icon={sec.icon} count={sec.layers.length} activeCount={cntActive(sec)} defaultOpen={sec.id==="parcels"}>
            {sec.layers.map(layer => (
              <LayerRow key={layer.id} layer={layer} checked={ls[layer.id]||false}
                onChange={sec.type==="radio"?()=>selRadio(sec.id,layer.id):()=>tog(layer.id)}
                isRadio={sec.type==="radio"} disabled={!layer.hasData&&!layer.gradient&&layer.badge!=="Live"} />
            ))}
            {sec.hasOpacity && cntActive(sec)>0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 4px 2px 36px" }}>
                <Eye size={12} color={C.textMuted}/>
                <input type="range" min="0" max="100" value={op[sec.id]||80} onChange={e=>setOp(p=>({...p,[sec.id]:Number(e.target.value)}))} style={{ flex: 1, height: 3, accentColor: C.brand, cursor: "pointer" }}/>
                <span style={{ fontSize: 10, color: C.textMuted, width: 26, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{op[sec.id]||80}%</span>
              </div>
            )}
          </Section>
        ))}

        <button onClick={()=>setModal(true)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px 0", marginTop: 4, marginBottom: 16, borderRadius: 10, background: "transparent", border: `1px dashed ${C.border}`, color: C.textSecondary, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s", fontFamily: font }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.brand;e.currentTarget.style.color=C.brand;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textSecondary;}}>
          <Plus size={14} strokeWidth={2}/>Request a Layer
        </button>
      </div>}

      {/* FILTERS VIEW */}
      {view==="filters" && <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
        {cntFilters>0 && <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button onClick={resetFs} style={{ fontSize: 11, color: C.brand, background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}><RotateCcw size={11} strokeWidth={2}/>Reset All</button>
        </div>}
        {FILTER_GROUPS.map(g => { const Ic=g.icon;
          return <Section key={g.id} title={g.label.toUpperCase()} icon={Ic} count={g.filters.length}
            activeCount={g.filters.filter(f=>{const v=fs[f.id];if(f.type==="range")return v[0]!==f.min||v[1]!==f.max;if(f.type==="select")return v!==f.options[0];return v===true;}).length}
            defaultOpen={g.id==="financial"}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {g.filters.map(f => {
                if (f.type==="range") return <RangeFilter key={f.id} filter={f} value={fs[f.id]} onChange={v=>setFs(p=>({...p,[f.id]:v}))} />;
                if (f.type==="select") return <SelectFilter key={f.id} filter={f} value={fs[f.id]} onChange={v=>setFs(p=>({...p,[f.id]:v}))} />;
                return <ToggleFilter key={f.id} filter={f} value={fs[f.id]} onChange={v=>setFs(p=>({...p,[f.id]:v}))} />;
              })}
            </div>
          </Section>;
        })}
        <button style={{ width: "100%", padding: "10px 0", marginTop: 6, marginBottom: 16, borderRadius: 10, background: C.brand, border: "none", color: C.textWhite, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, transition: "background 0.15s" }}
          onMouseEnter={e=>{e.currentTarget.style.background=C.brandHover;}} onMouseLeave={e=>{e.currentTarget.style.background=C.brand;}}>
          Apply Filters {cntFilters>0&&`(${cntFilters})`}
        </button>
      </div>}
    </div>

    <RequestModal isOpen={modal} onClose={()=>setModal(false)} />
  </>);
}
