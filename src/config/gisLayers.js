// GIS Infrastructure Layer Configuration
// Fetches from Neon API (replaces ArcGIS MapServer REST endpoints)

const API_URL = import.meta.env.VITE_API_URL;

const DIAMETER_ALIASES = [
  'diameter', 'DIAMETER', 'WATERDIAMETER', 'PIPE_DIAMETER', 'PIPESIZE', 'PIPE_SIZE',
  'DIAM', 'SIZE_', 'NOMINALDIAMETER', 'SIZE', 'WATERDIAMETER_INCH',
  'DIAMETER_INCHES', 'PIPESIZE_', 'PIPE_DIA'
];

// Zoning field aliases - ZONING_ZTYPE is the primary field for Austin
const ZONING_ALIASES = [
  'ZONING_ZTYPE', 'ZONING_ZTYP', 'ZONING', 'ZONE_CODE', 'ZONE_DESIG',
  'ZoningDesignation', 'ZONING_BASE', 'ZONE_DESCR', 'ZONE_TYPE', 'ZONINGCODE'
];

// Flood zone field aliases - FEMA_FLOOD_ZONE and FLOOD_ZONE are primary
const FLOOD_ALIASES = [
  'FEMA_FLOOD_ZONE', 'FLD_ZONE', 'FLOOD_ZONE', 'ZONE_', 'FloodZone',
  'ZONE', 'SFHA_TF', 'ZONE_SUBTY', 'FLOODZONE', 'FZONE'
];

// ══════════════════════════════════════════════════════════════════════════════
// ZONING CATEGORIZATION — Normalizes zone codes from 7 jurisdictions to 10 categories
// ══════════════════════════════════════════════════════════════════════════════

// Category colors — APA standard palette (optimized for dark map)
export const ZONING_CATEGORY_COLORS = {
  single_family: '#facc15',   // yellow-400 (APA: yellow)
  multi_family: '#fb923c',    // orange-400 (APA: orange/tan)
  office: '#60a5fa',          // blue-400 (APA: blue)
  commercial: '#f87171',      // red-400 (APA: red)
  industrial: '#a78bfa',      // violet-400 (APA: purple)
  mixed_use: '#f472b6',       // pink-400 (APA: pink/magenta)
  planned: '#2dd4bf',         // teal-400 (APA: teal)
  parks: '#4ade80',           // green-400 (APA: green)
  agricultural: '#a3e635',    // lime-400 (APA: light green)
  other: '#94a3b8',           // slate-400 (neutral)
};

// Categorize any zone code to one of 10 categories
// Handles codes from Austin, Round Rock, Georgetown, Cedar Park, Pflugerville, Kyle, San Marcos
export function categorizeZoneCode(code) {
  if (!code || typeof code !== 'string') return 'other';
  const c = code.toUpperCase().trim();
  if (!c || c === 'UNZ' || c === 'UNZONED') return 'other';

  // Single Family: SF-*, R-1*, RS-*, RE-*, RR, LA, R1, SF1-SF6, DR (Kyle), etc.
  if (/^SF[-]?\d/.test(c) || /^R[-]?1/.test(c) || /^RS[-]?\d?/.test(c) ||
      /^RE[-]?\d?/.test(c) || c === 'RR' || c === 'LA' || c === 'DR' ||
      c === 'R-1A' || c === 'R-1B' || c === 'R-1C' || c === 'R-1D' ||
      c.startsWith('SF-') || c === 'SFR' || c === 'SINGLE FAMILY') {
    return 'single_family';
  }

  // Multi-Family: MF-*, R-2*, R-3*, RM-*, MH, MF1-MF6, MU-R (residential mixed)
  if (/^MF[-]?\d/.test(c) || /^R[-]?[234]/.test(c) || /^RM[-]?\d?/.test(c) ||
      c === 'MH' || c === 'MU-R' || c.startsWith('MF-') || c === 'MULTI FAMILY' ||
      c === 'MULTIFAMILY' || c === 'APARTMENT') {
    return 'multi_family';
  }

  // Office: GO, LO, NO, W/LO, O-*, OF-*, OFFICE
  if (c === 'GO' || c === 'LO' || c === 'NO' || c === 'W/LO' ||
      /^O[-]?\d/.test(c) || /^OF[-]?\d?/.test(c) || c === 'OFFICE') {
    return 'office';
  }

  // Commercial: CS, CS-1, GR, CR, CBD, LR, CH, C-*, CC-*, COM-*, COMMERCIAL, RETAIL
  if (c === 'CS' || c === 'CS-1' || c === 'GR' || c === 'CR' || c === 'CBD' ||
      c === 'LR' || c === 'CH' || /^C[-]?\d/.test(c) || /^CC[-]?\d?/.test(c) ||
      /^COM[-]?\d?/.test(c) || c === 'COMMERCIAL' || c === 'RETAIL' || c === 'NC' ||
      c === 'GC' || c === 'HC') {
    return 'commercial';
  }

  // Industrial: LI, IP, MI, I-*, IN-*, IND-*, INDUSTRIAL, LIGHT INDUSTRIAL
  if (c === 'LI' || c === 'IP' || c === 'MI' || c === 'HI' ||
      /^I[-]?\d/.test(c) || /^IN[-]?\d?/.test(c) || /^IND[-]?/.test(c) ||
      c === 'INDUSTRIAL' || c === 'LIGHT INDUSTRIAL' || c === 'BP') {
    return 'industrial';
  }

  // Mixed Use: DMU, MU-*, V-MU*, *-MU-*, contains MU, MIXED USE, TOD, TND
  if (c === 'DMU' || c === 'TOD' || c === 'TND' || c === 'PDA' ||
      /^MU[-]?\d?/.test(c) || /^V[-]?MU/.test(c) || c.includes('-MU-') ||
      c.includes('MU-') || c === 'MIXED USE' || c === 'MIXEDUSE' ||
      c === 'DOWNTOWN' || c === 'DT') {
    return 'mixed_use';
  }

  // Planned/PUD: PUD, P-*, PD-*, PLAN-*, PLANNED
  if (c === 'PUD' || /^PD[-]?\d?/.test(c) || /^P[-]?\d/.test(c) ||
      c.startsWith('PLAN') || c === 'PLANNED') {
    return 'planned';
  }

  // Parks/Public: P, PK-*, OS-*, PARK*, GOV-*, PUBLIC, OPEN SPACE, UNZ
  if (c === 'P' || /^PK[-]?\d?/.test(c) || /^OS[-]?\d?/.test(c) ||
      c.startsWith('PARK') || /^GOV[-]?/.test(c) || c === 'PUBLIC' ||
      c === 'OPEN SPACE' || c === 'CIVIC' || c === 'INST') {
    return 'parks';
  }

  // Agricultural: AG-*, A-*, RURAL-*, RR (if not caught above), AGRICULTURAL
  if (/^AG[-]?\d?/.test(c) || /^A[-]?\d/.test(c) || c.startsWith('RURAL') ||
      c === 'AGRICULTURAL' || c === 'FARM' || c === 'RANCH') {
    return 'agricultural';
  }

  // Fallback
  return 'other';
}

// Legacy ZONING_COLORS export (for backwards compatibility) — maps exact codes to APA colors
export const ZONING_COLORS = {
  // Single Family (yellow)
  'SF-1': '#facc15', 'SF-2': '#facc15', 'SF-3': '#facc15', 'SF-4A': '#facc15',
  'SF-5': '#facc15', 'SF-6': '#facc15', 'RR': '#facc15', 'LA': '#facc15',
  // Multi-Family (orange)
  'MF-1': '#fb923c', 'MF-2': '#fb923c', 'MF-3': '#fb923c', 'MF-4': '#fb923c',
  'MF-5': '#fb923c', 'MF-6': '#fb923c', 'MH': '#fb923c',
  // Office (blue)
  'LO': '#60a5fa', 'GO': '#60a5fa', 'NO': '#60a5fa', 'W/LO': '#60a5fa',
  // Commercial (red)
  'LR': '#f87171', 'GR': '#f87171', 'CR': '#f87171', 'CS': '#f87171',
  'CS-1': '#f87171', 'CH': '#f87171', 'CBD': '#f87171',
  // Industrial (violet)
  'IP': '#a78bfa', 'MI': '#a78bfa', 'LI': '#a78bfa',
  // Mixed Use (pink)
  'DMU': '#f472b6', 'MU': '#f472b6', 'TOD': '#f472b6', 'TND': '#f472b6', 'PDA': '#f472b6',
  // Planned / PUD (teal)
  'PUD': '#2dd4bf',
  // Parks / Public (green)
  'P': '#4ade80',
  // Agricultural (lime)
  'AG': '#a3e635',
};

// Legend for UI (10 categories) — APA standard colors
export const ZONING_LEGEND = [
  { id: 'single_family', label: 'Single Family', color: '#facc15' },
  { id: 'multi_family', label: 'Multi-Family', color: '#fb923c' },
  { id: 'office', label: 'Office', color: '#60a5fa' },
  { id: 'commercial', label: 'Commercial', color: '#f87171' },
  { id: 'industrial', label: 'Industrial', color: '#a78bfa' },
  { id: 'mixed_use', label: 'Mixed Use', color: '#f472b6' },
  { id: 'planned', label: 'Planned / PUD', color: '#2dd4bf' },
  { id: 'parks', label: 'Parks / Public', color: '#4ade80' },
  { id: 'agricultural', label: 'Agricultural', color: '#a3e635' },
  { id: 'other', label: 'Other / Unknown', color: '#94a3b8' },
];

// ══════════════════════════════════════════════════════════════════════════════
// FLOOD ZONE NORMALIZATION — Handles varied field values from 5 endpoints
// ══════════════════════════════════════════════════════════════════════════════

// Normalize flood zone values to standard FEMA codes
// Handles: exact codes, long strings (Austin FloodPro), abbreviations
export function normalizeFloodZone(value) {
  if (!value || typeof value !== 'string') return 'UNKNOWN';
  const v = value.toUpperCase().trim();

  // Direct matches for standard FEMA codes
  if (['A', 'AE', 'AH', 'AO', 'AR', 'A99'].includes(v)) return v;
  if (['V', 'VE'].includes(v)) return v;
  if (['X', 'C'].includes(v)) return 'X';
  if (['B', 'X500', 'SHADED'].includes(v) || v.includes('SHADED')) return 'X_SHADED';
  if (v === 'D') return 'D';

  // Long string matches (Austin FloodPro format)
  if (v.includes('100-YEAR') || v.includes('100 YEAR') || v.includes('1% ANNUAL')) return 'AE';
  if (v.includes('25-YEAR') || v.includes('25 YEAR') || v.includes('500-YEAR') || v.includes('500 YEAR') || v.includes('0.2 PCT') || v.includes('0.2%')) return 'X_SHADED';
  if (v.includes('FLOODWAY')) return 'AE';
  if (v.includes('COASTAL') && v.includes('HIGH')) return 'VE';
  if (v.includes('MINIMAL') || v.includes('OUTSIDE') || v.includes('NOT INCLUDED') || v.includes('AREA NOT')) return 'X';

  // Fallback
  return 'UNKNOWN';
}

// Flood zone colors by normalized code
export const FLOOD_COLORS = {
  // AE - 100-year detailed (tangerine)
  'AE': '#FF8C00',
  // A-group - 100-year approx (blue)
  'A': '#2563EB', 'AH': '#2563EB', 'AR': '#2563EB', 'A99': '#2563EB',
  // AO - shallow flooding (turquoise)
  'AO': '#06B6D4',
  // Moderate risk - 500-year / shaded X (sky blue)
  'X_SHADED': '#0ea5e9', 'B': '#0ea5e9',
  // Undetermined (gray-blue)
  'D': '#64748b',
  // Minimal risk - outside floodplain (light blue)
  'X': '#7dd3fc', 'C': '#7dd3fc',
  // Unknown (slate)
  'UNKNOWN': '#475569',
};

// Flood zone opacity by risk level
export const FLOOD_OPACITY = {
  'AE': 0.40,
  'A': 0.35, 'AH': 0.35, 'AR': 0.35, 'A99': 0.35,
  'AO': 0.35,
  'X_SHADED': 0.25, 'B': 0.25,
  'D': 0.15,
  'X': 0.08, 'C': 0.08,
  'UNKNOWN': 0.15,
};

export const GIS_LAYERS = {
  water_lines: {
    name: 'Water Lines',
    color: '#00bfff',
    geometryType: 'line',
    gradient: ['#7dd3fc', '#38bdf8', '#00bfff', '#0284c7'],
    thresholds: [6, 12, 24, 48],
  },
  wastewater_lines: {
    name: 'Wastewater Lines',
    color: '#22c55e',
    geometryType: 'line',
    gradient: ['#86efac', '#4ade80', '#22c55e', '#14532d'],
    thresholds: [6, 12, 24, 48],
  },
  stormwater_lines: {
    name: 'Stormwater Lines',
    color: '#06b6d4',
    geometryType: 'line',
    gradient: ['#67e8f9', '#22d3ee', '#06b6d4', '#164e63'],
    thresholds: [12, 24, 36, 60],
  },
  zoning_districts: {
    name: 'Zoning Districts',
    color: '#ec4899',
    geometryType: 'fill',
  },
  floodplains: {
    name: 'Floodplains',
    color: '#ef4444',
    geometryType: 'fill',
  },
  traffic_roadways: {
    name: 'Traffic Roadways',
    color: '#64748b',
    geometryType: 'line',
  },
  traffic_aadt: {
    name: 'Traffic AADT',
    color: '#f59e0b',
    geometryType: 'line',
    gradient: ['#fde68a', '#fbbf24', '#f59e0b', '#d97706'],
    thresholds: [5000, 15000, 30000, 50000],
  },
  city_limits: {
    name: 'City Limits',
    color: '#3b82f6',
    geometryType: 'line',
  },
  etj_boundaries: {
    name: 'ETJ Boundaries',
    color: '#8b5cf6',
    geometryType: 'line',
  },
  etj_released: {
    name: 'ETJ Released',
    color: '#10b981',
    geometryType: 'fill',
  },
  future_land_use: {
    name: 'Future Land Use',
    color: '#f472b6',
    geometryType: 'fill',
  },
};

// Layer key to API type mapping
const LAYER_TYPE_MAP = {
  water_lines: 'water',
  wastewater_lines: 'sewer',
  stormwater_lines: 'storm',
  zoning_districts: 'zoning',
  floodplains: 'flood',
  traffic_roadways: 'traffic-roadways',
  traffic_aadt: 'traffic-aadt',
  city_limits: 'city-limits',
  etj_boundaries: 'etj-boundaries',
  etj_released: 'etj-released',
  future_land_use: 'future-land-use',
};

// --- Neon API Fetch ---

export async function fetchGisLayer(layerKey, bounds) {
  const config = GIS_LAYERS[layerKey];
  if (!config) return null;

  const apiType = LAYER_TYPE_MAP[layerKey];
  if (!apiType) {
    console.warn(`[GIS] Unknown layer key: ${layerKey}`);
    return null;
  }

  const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
  const url = `${API_URL}/gis/${apiType}?bbox=${bbox}`;

  console.log(`[GIS] Fetching ${layerKey} from Neon API...`);

  try {
    const resp = await fetch(url);

    if (resp.status === 404) {
      console.warn(`[GIS] No data for ${layerKey} in this viewport`);
      return { type: 'FeatureCollection', features: [] };
    }

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    }

    const geojson = await resp.json();
    console.log(`[GIS] ${layerKey}: ${geojson.features?.length || 0} features loaded`);
    return geojson;
  } catch (e) {
    console.warn(`[GIS] Failed to fetch ${layerKey}: ${e.message}`);
    return { type: 'FeatureCollection', features: [] };
  }
}

export { DIAMETER_ALIASES };
