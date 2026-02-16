// GIS Infrastructure Layer Configuration
// Fetches from City of Austin + surrounding cities' ArcGIS MapServer REST endpoints

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

// Zoning colors by category (matching real ArcGIS ZONING_ZTYPE values)
export const ZONING_COLORS = {
  // Single Family (light blue #93c5fd)
  'SF-1': '#93c5fd', 'SF-2': '#93c5fd', 'SF-3': '#93c5fd', 'SF-4A': '#93c5fd',
  'SF-5': '#93c5fd', 'SF-6': '#93c5fd', 'RR': '#93c5fd', 'LA': '#93c5fd',
  // Multi-Family (purple #c084fc)
  'MF-1': '#c084fc', 'MF-2': '#c084fc', 'MF-3': '#c084fc', 'MF-4': '#c084fc',
  'MF-5': '#c084fc', 'MF-6': '#c084fc', 'MH': '#c084fc',
  // Office (amber #fbbf24)
  'LO': '#fbbf24', 'GO': '#fbbf24', 'NO': '#fbbf24', 'W/LO': '#fbbf24',
  // Commercial (red #f87171)
  'LR': '#f87171', 'GR': '#f87171', 'CR': '#f87171', 'CS': '#f87171',
  'CS-1': '#f87171', 'CH': '#f87171', 'CBD': '#f87171',
  // Industrial (gray #94a3b8)
  'IP': '#94a3b8', 'MI': '#94a3b8', 'LI': '#94a3b8',
  // Mixed Use / Downtown (pink #f472b6)
  'DMU': '#f472b6', 'MU': '#f472b6', 'TOD': '#f472b6', 'TND': '#f472b6', 'PDA': '#f472b6',
  // Planned / PUD (violet #a78bfa)
  'PUD': '#a78bfa',
  // Parks / Public (green #4ade80)
  'P': '#4ade80',
  // Agricultural (lime #a3e635)
  'AG': '#a3e635',
};

export const ZONING_LEGEND = [
  { label: 'Single Family', codes: ['SF-1','SF-2','SF-3','SF-4A','SF-5','SF-6','RR','LA'], color: '#93c5fd' },
  { label: 'Multi-Family', codes: ['MF-1','MF-2','MF-3','MF-4','MF-5','MF-6','MH'], color: '#c084fc' },
  { label: 'Office', codes: ['LO','GO','NO','W/LO'], color: '#fbbf24' },
  { label: 'Commercial', codes: ['LR','GR','CR','CS','CS-1','CH','CBD'], color: '#f87171' },
  { label: 'Industrial', codes: ['IP','MI','LI'], color: '#94a3b8' },
  { label: 'Mixed Use', codes: ['DMU','MU','TOD','TND','PDA'], color: '#f472b6' },
  { label: 'Planned / PUD', codes: ['PUD'], color: '#a78bfa' },
  { label: 'Parks / Public', codes: ['P'], color: '#4ade80' },
  { label: 'Agricultural', codes: ['AG'], color: '#a3e635' },
];

// Flood zone colors - only high-risk zones get red, others are subtle or transparent
export const FLOOD_COLORS = {
  // High risk (red) - 100-year floodplain
  'A': '#ef4444', 'AE': '#ef4444', 'AH': '#ef4444', 'AO': '#ef4444',
  'V': '#ef4444', 'VE': '#ef4444', 'AR': '#ef4444', 'A99': '#ef4444',
  // Moderate risk (orange) - 500-year floodplain
  'X500': '#f97316', 'B': '#f97316', 'D': '#f97316',
  // Minimal risk (blue) - outside floodplain
  'X': '#3b82f6', 'C': '#3b82f6',
};

export const GIS_LAYERS = {
  water_lines: {
    name: 'Water Lines',
    color: '#00bfff',
    geometryType: 'line',
    gradient: ['#7dd3fc', '#38bdf8', '#00bfff', '#0284c7'],
    thresholds: [6, 12, 24, 48],
    endpoints: [
      'https://coagiswebadaptor.austintexas.gov/awgisago/rest/services/RAAS/RAAS_Water_Service/MapServer/17',
      'https://coagiswebadaptor.austintexas.gov/awgisago/rest/services/RAAS/RAAS_Water_Service/MapServer/0',
      'https://maps.roundrocktexas.gov/arcgis/rest/services/Base_Maps/LineLocate/MapServer/5',
      'https://gis.georgetown.org/arcgis/rest/services/GUS/Hydrant_Meters_WebMap/MapServer/4',
      'https://gis.cedarparktexas.gov/mapping/rest/services/VIEW/Water_Distribution_System/MapServer/9',
      'https://gis.cedarparktexas.gov/mapping/rest/services/VIEW/Water_Distribution_System/MapServer/7',
      'https://gis.cityofkyle.com/server/rest/services/CartegraphGIS2/MapServer/20',
      'https://maps.pflugervilletx.gov/arcgis/rest/services/CityWorks/Storm_Drainage_System/MapServer/3'
    ]
  },
  wastewater_lines: {
    name: 'Wastewater Lines',
    color: '#22c55e',
    geometryType: 'line',
    gradient: ['#86efac', '#4ade80', '#22c55e', '#14532d'],
    thresholds: [6, 12, 24, 48],
    endpoints: [
      'https://coagiswebadaptor.austintexas.gov/awgisago/rest/services/RAAS/RAAS_Wastewater_Network/MapServer/11',
      'https://coagiswebadaptor.austintexas.gov/awgisago/rest/services/RAAS/RAAS_Wastewater_Network/MapServer/0',
      'https://maps.roundrocktexas.gov/arcgis/rest/services/Base_Maps/LineLocate/MapServer/4',
      'https://gis.cedarparktexas.gov/mapping/rest/services/VIEW/WastewaterCollectionSystem/MapServer/8',
      'https://gis.cedarparktexas.gov/mapping/rest/services/VIEW/WastewaterCollectionSystem/MapServer/6',
      'https://gis.georgetown.org/arcgis/rest/services/DigTix/DigTix_FeatureService/MapServer/18',
      'https://maps.pflugervilletx.gov/arcgis/rest/services/Wastewater/Sewer_Lateral/MapServer/0'
    ]
  },
  stormwater_lines: {
    name: 'Stormwater Lines',
    color: '#06b6d4',
    geometryType: 'line',
    gradient: ['#67e8f9', '#22d3ee', '#06b6d4', '#164e63'],
    thresholds: [12, 24, 36, 60],
    endpoints: [
      'https://maps.austintexas.gov/arcgis/rest/services/Shared/DrainageInfrastructure/MapServer/6',
      'https://maps.roundrocktexas.gov/arcgis/rest/services/Stormwater/Storm_Multi/MapServer/7',
      'https://gis.cedarparktexas.gov/mapping/rest/services/VIEW/Stormwater_Collection_System/MapServer/5',
      'https://maps.pflugervilletx.gov/arcgisadmin/rest/services/Streets/Stormwater_Line/MapServer/0',
      'https://gis.georgetown.org/arcgis/rest/services/SystemsEngineering/SystemsEngineering_WebMap/MapServer/3'
    ]
  },
  zoning_districts: {
    name: 'Zoning Districts',
    color: '#ec4899',
    geometryType: 'fill',
    endpoints: [
      'https://maps.austintexas.gov/arcgis/rest/services/Shared/Zoning_1/MapServer/0',
      'https://maps.roundrocktexas.gov/arcgis/rest/services/Planning/Planning_Multi/MapServer/12',
      'https://maps.pflugervilletx.gov/arcgis/rest/services/Planning/Zoning_Districts/MapServer/0',
      'https://gis.cedarparktexas.gov/mapping/rest/services/VIEW/Zoning/MapServer/3',
      'https://gis.georgetown.org/arcgis/rest/services/PublicSafety/FireDepartment_WebMap/MapServer/28',
      'https://gis.cityofkyle.com/server/rest/services/Location_Check/MapServer/5',
      'https://smgis.sanmarcostx.gov/arcgis/rest/services/AllDataProd/DS_prod/MapServer/50'
    ]
  },
  floodplains: {
    name: 'Floodplains',
    color: '#ef4444',
    geometryType: 'fill',
    endpoints: [
      'https://maps.austintexas.gov/arcgis/rest/services/FloodPro/FloodPro/MapServer/4',
      'https://maps.austintexas.gov/arcgis/rest/services/FloodPro/FloodPro/MapServer/9',
      'https://gis.georgetown.org/arcgis/rest/services/Planning/PlanningDevelopmentNew_WebMap/MapServer/60',
      // Bastrop County endpoint removed - CORS completely broken
      'https://gis.cedarparktexas.gov/mapping/rest/services/VIEW/Flood_Zones/MapServer/0',
      'https://smgis.sanmarcostx.gov/arcgis/rest/services/CityRegulatedFloodplains/MapServer/2'
    ]
  }
};

// --- ArcGIS to GeoJSON ---

function ringArea(ring) {
  let area = 0;
  for (let i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
    area += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
  }
  return area / 2;
}

function groupRings(rings) {
  const polygons = [];
  let current = null;
  for (const ring of rings) {
    if (ringArea(ring) > 0) {
      if (current) polygons.push(current);
      current = [ring];
    } else {
      if (current) current.push(ring);
      else current = [ring];
    }
  }
  if (current) polygons.push(current);
  return polygons.length > 0 ? polygons : [rings];
}

function arcgisToGeoJSON(feature, geometryType) {
  const geom = feature.geometry;
  if (!geom) return null;
  let geometry;
  switch (geometryType) {
    case 'esriGeometryPolyline':
      if (!geom.paths?.length) return null;
      geometry = geom.paths.length === 1
        ? { type: 'LineString', coordinates: geom.paths[0] }
        : { type: 'MultiLineString', coordinates: geom.paths };
      break;
    case 'esriGeometryPolygon':
      if (!geom.rings?.length) return null;
      if (geom.rings.length === 1) {
        geometry = { type: 'Polygon', coordinates: [geom.rings[0]] };
      } else {
        const grouped = groupRings(geom.rings);
        geometry = grouped.length === 1
          ? { type: 'Polygon', coordinates: grouped[0] }
          : { type: 'MultiPolygon', coordinates: grouped };
      }
      break;
    case 'esriGeometryPoint':
      if (geom.x == null || geom.y == null) return null;
      geometry = { type: 'Point', coordinates: [geom.x, geom.y] };
      break;
    default:
      return null;
  }
  return { type: 'Feature', geometry, properties: feature.attributes || {} };
}

function extractField(props, fieldAliases) {
  for (const alias of fieldAliases) {
    for (const key of Object.keys(props)) {
      if (key.toUpperCase() === alias.toUpperCase()) {
        const val = props[key];
        if (val != null && String(val).trim() !== '') return String(val).trim();
      }
    }
  }
  return null;
}

// --- Fetch with CORS proxy fallback ---

const hostMethodCache = {};

async function safeFetchJSON(url) {
  const host = new URL(url).hostname;
  const methods = [
    { name: 'direct', fn: () => fetch(url) },
    { name: 'corsproxy', fn: () => fetch('https://corsproxy.io/?' + encodeURIComponent(url)) },
    { name: 'allorigins', fn: () => fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(url)) }
  ];
  const cached = hostMethodCache[host];
  if (cached) {
    const preferred = methods.find(m => m.name === cached);
    if (preferred) { methods.splice(methods.indexOf(preferred), 1); methods.unshift(preferred); }
  }
  for (const method of methods) {
    try {
      const resp = await method.fn();
      if (!resp.ok) continue;
      const text = await resp.text();
      if (!text || text.trim().startsWith('<')) continue;
      const data = JSON.parse(text);
      hostMethodCache[host] = method.name;
      return data;
    } catch { /* try next method */ }
  }
  throw new Error(`All fetch methods failed for ${host}`);
}

function buildQueryUrl(baseUrl, bounds, offset = 0, max = 1000) {
  const envelope = JSON.stringify({
    xmin: bounds.getWest(), ymin: bounds.getSouth(),
    xmax: bounds.getEast(), ymax: bounds.getNorth(),
    spatialReference: { wkid: 4326 }
  });
  const params = new URLSearchParams({
    where: '1=1', geometry: envelope, geometryType: 'esriGeometryEnvelope',
    inSR: '4326', spatialRel: 'esriSpatialRelIntersects',
    outFields: '*', outSR: '4326', f: 'json',
    resultOffset: String(offset), resultRecordCount: String(max)
  });
  return `${baseUrl}/query?${params}`;
}

async function fetchEndpoint(endpointUrl, bounds, layerKey) {
  const features = [];
  let offset = 0;
  const max = 1000;
  const maxPages = 7; // Reduced from 10 to avoid CORS issues on paginated requests
  try {
    for (let page = 0; page < maxPages; page++) {
      const url = buildQueryUrl(endpointUrl, bounds, offset, max);
      const data = await safeFetchJSON(url);
      if (data.error) throw new Error(data.error.message);
      const raw = data.features || [];
      if (raw.length === 0) break;
      const geomType = data.geometryType || 'esriGeometryPolyline';

      for (const f of raw) {
        const gj = arcgisToGeoJSON(f, geomType);
        if (gj) {
          if (layerKey === 'zoning_districts') {
            gj.properties._zone_code = extractField(gj.properties, ZONING_ALIASES) || '';
          } else if (layerKey === 'floodplains') {
            gj.properties._flood_zone = extractField(gj.properties, FLOOD_ALIASES) || '';
          }
          features.push(gj);
        }
      }
      if (!data.exceededTransferLimit && raw.length < max) break;
      offset += max;
    }
  } catch (e) {
    console.warn(`[GIS] Failed: ${endpointUrl}: ${e.message}`);
  }
  return features;
}

async function promisePool(fns, concurrency = 3) {
  const results = [];
  let i = 0;
  async function run() {
    while (i < fns.length) { const idx = i++; results[idx] = await fns[idx](); }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, fns.length) }, run));
  return results;
}

export async function fetchGisLayer(layerKey, bounds) {
  const config = GIS_LAYERS[layerKey];
  if (!config) return null;
  console.log(`[GIS] Fetching ${layerKey} from ${config.endpoints.length} endpoints...`);
  const results = await promisePool(
    config.endpoints.map(ep => () => fetchEndpoint(ep, bounds, layerKey)),
    3
  );
  const features = results.flat();
  console.log(`[GIS] ${layerKey}: ${features.length} features loaded`);
  return { type: 'FeatureCollection', features };
}

export { DIAMETER_ALIASES };
