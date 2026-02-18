// GIS Infrastructure Layer Configuration
// Fetches from Neon API (replaces ArcGIS MapServer REST endpoints)

const API_URL = import.meta.env.VITE_API_URL;

const DIAMETER_ALIASES = [
  'DIAMETER', 'WATERDIAMETER', 'PIPE_DIAMETER', 'PIPESIZE', 'PIPE_SIZE',
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

// Category colors (high-contrast on dark map, distinct from each other)
export const ZONING_CATEGORY_COLORS = {
  single_family: '#fbbf24',   // amber — dominant land use, warm
  multi_family: '#f97316',    // orange — distinct from SF
  office: '#8b5cf6',          // violet — cool tone
  commercial: '#ef4444',      // red — high visibility
  industrial: '#6b7280',      // gray — muted
  mixed_use: '#ec4899',       // pink — vibrant
  planned: '#14b8a6',         // teal — cool green
  parks: '#22c55e',           // green — natural
  agricultural: '#a3e635',    // lime — rural
  other: '#475569',           // slate — neutral fallback
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

// Legacy ZONING_COLORS export (for backwards compatibility) — maps exact codes to colors
export const ZONING_COLORS = {
  // Single Family (amber)
  'SF-1': '#fbbf24', 'SF-2': '#fbbf24', 'SF-3': '#fbbf24', 'SF-4A': '#fbbf24',
  'SF-5': '#fbbf24', 'SF-6': '#fbbf24', 'RR': '#fbbf24', 'LA': '#fbbf24',
  // Multi-Family (orange)
  'MF-1': '#f97316', 'MF-2': '#f97316', 'MF-3': '#f97316', 'MF-4': '#f97316',
  'MF-5': '#f97316', 'MF-6': '#f97316', 'MH': '#f97316',
  // Office (violet)
  'LO': '#8b5cf6', 'GO': '#8b5cf6', 'NO': '#8b5cf6', 'W/LO': '#8b5cf6',
  // Commercial (red)
  'LR': '#ef4444', 'GR': '#ef4444', 'CR': '#ef4444', 'CS': '#ef4444',
  'CS-1': '#ef4444', 'CH': '#ef4444', 'CBD': '#ef4444',
  // Industrial (gray)
  'IP': '#6b7280', 'MI': '#6b7280', 'LI': '#6b7280',
  // Mixed Use (pink)
  'DMU': '#ec4899', 'MU': '#ec4899', 'TOD': '#ec4899', 'TND': '#ec4899', 'PDA': '#ec4899',
  // Planned / PUD (teal)
  'PUD': '#14b8a6',
  // Parks / Public (green)
  'P': '#22c55e',
  // Agricultural (lime)
  'AG': '#a3e635',
};

// Legend for UI (10 categories)
export const ZONING_LEGEND = [
  { id: 'single_family', label: 'Single Family', color: '#fbbf24' },
  { id: 'multi_family', label: 'Multi-Family', color: '#f97316' },
  { id: 'office', label: 'Office', color: '#8b5cf6' },
  { id: 'commercial', label: 'Commercial', color: '#ef4444' },
  { id: 'industrial', label: 'Industrial', color: '#6b7280' },
  { id: 'mixed_use', label: 'Mixed Use', color: '#ec4899' },
  { id: 'planned', label: 'Planned / PUD', color: '#14b8a6' },
  { id: 'parks', label: 'Parks / Public', color: '#22c55e' },
  { id: 'agricultural', label: 'Agricultural', color: '#a3e635' },
  { id: 'other', label: 'Other / Unknown', color: '#475569' },
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
  // High risk - 100-year floodplain (red-600)
  'A': '#dc2626', 'AE': '#dc2626', 'AH': '#dc2626', 'AO': '#dc2626', 'AR': '#dc2626', 'A99': '#dc2626',
  // Coastal high risk (red-800)
  'V': '#991b1b', 'VE': '#991b1b',
  // Moderate risk - 500-year / shaded X (amber-500)
  'X_SHADED': '#f59e0b', 'B': '#f59e0b',
  // Undetermined (gray-500)
  'D': '#6b7280',
  // Minimal risk - outside floodplain (blue-500)
  'X': '#3b82f6', 'C': '#3b82f6',
  // Unknown (slate-600)
  'UNKNOWN': '#475569',
};

// Flood zone opacity by risk level
export const FLOOD_OPACITY = {
  'A': 0.30, 'AE': 0.30, 'AH': 0.30, 'AO': 0.30, 'AR': 0.30, 'A99': 0.30,
  'V': 0.35, 'VE': 0.35,
  'X_SHADED': 0.20, 'B': 0.20,
  'D': 0.15,
  'X': 0.10, 'C': 0.10,
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
  }
};

// Layer key to API type mapping
const LAYER_TYPE_MAP = {
  water_lines: 'water',
  wastewater_lines: 'sewer',
  stormwater_lines: 'storm',
  zoning_districts: 'zoning',
  floodplains: 'flood'
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
  const url = `${API_URL}/api/gis/${apiType}?bbox=${bbox}`;

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
