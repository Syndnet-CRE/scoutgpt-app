// GIS Infrastructure Layer Configuration
// Fetches from City of Austin + surrounding cities' ArcGIS MapServer REST endpoints

const DIAMETER_ALIASES = [
  'DIAMETER', 'WATERDIAMETER', 'PIPE_DIAMETER', 'PIPESIZE', 'PIPE_SIZE',
  'DIAM', 'SIZE_', 'NOMINALDIAMETER', 'SIZE', 'WATERDIAMETER_INCH',
  'DIAMETER_INCHES', 'PIPESIZE_', 'PIPE_DIA'
];

const ZONING_ALIASES = [
  'ZONING_ZTYP', 'ZONE_DESCR', 'ZONE_CODE', 'ZONING', 'ZONE_TYPE',
  'ZONING_CODE', 'ZONE', 'ZONINGCODE', 'ZONING_DESIGNATION'
];

const FLOOD_ALIASES = [
  'FLD_ZONE', 'FLOOD_ZONE', 'ZONE', 'SFHA_TF', 'ZONE_SUBTY', 'FLOODZONE', 'FZONE'
];

export const ZONING_COLORS = {
  'SF-1': '#2563eb', 'SF-2': '#3b82f6', 'SF-3': '#60a5fa', 'SF-4A': '#93c5fd', 'SF-5': '#bfdbfe', 'SF-6': '#dbeafe',
  'MF-1': '#7c3aed', 'MF-2': '#8b5cf6', 'MF-3': '#a78bfa', 'MF-4': '#c4b5fd', 'MF-5': '#ddd6fe', 'MF-6': '#ede9fe',
  'LO': '#f59e0b', 'GO': '#f97316', 'GR': '#fb923c', 'CR': '#ef4444', 'CS': '#dc2626', 'CS-1': '#b91c1c', 'CH': '#991b1b',
  'LI': '#6b7280', 'MI': '#4b5563', 'W/LO': '#9ca3af', 'IP': '#78716c',
  'CBD': '#ec4899', 'DMU': '#f472b6', 'PUD': '#a855f7', 'P': '#22c55e', 'AG': '#15803d',
  'RR': '#0ea5e9', 'DR': '#38bdf8', 'I-1': '#475569', 'I-2': '#334155',
  'NO': '#84cc16', 'LR': '#facc15', 'CC': '#f87171', 'HC': '#b91c1c', 'TOD': '#d946ef'
};

export const ZONING_LEGEND = [
  { label: 'Single Family', codes: ['SF-1','SF-2','SF-3','SF-4A','SF-5','SF-6'], color: '#3b82f6' },
  { label: 'Multi-Family', codes: ['MF-1','MF-2','MF-3','MF-4','MF-5','MF-6'], color: '#8b5cf6' },
  { label: 'Office', codes: ['LO','GO'], color: '#f59e0b' },
  { label: 'Commercial', codes: ['GR','CR','CS','CS-1','CH','LR','CC','HC'], color: '#ef4444' },
  { label: 'Industrial', codes: ['LI','MI','W/LO','IP','I-1','I-2'], color: '#6b7280' },
  { label: 'Mixed Use / Downtown', codes: ['CBD','DMU','TOD'], color: '#ec4899' },
  { label: 'Planned / PUD', codes: ['PUD'], color: '#a855f7' },
  { label: 'Parks / Public', codes: ['P'], color: '#22c55e' },
  { label: 'Agricultural', codes: ['AG'], color: '#15803d' },
  { label: 'Rural / Other', codes: ['RR','DR','NO'], color: '#0ea5e9' },
];

export const FLOOD_COLORS = {
  'A': '#ef4444', 'AE': '#dc2626', 'AH': '#b91c1c', 'AO': '#991b1b',
  'V': '#7f1d1d', 'VE': '#450a0a', 'X': '#1e40af', 'D': '#6b7280',
  'A99': '#f87171', 'AR': '#fb923c'
};

export const GIS_LAYERS = {
  water_lines: {
    name: 'Water Lines',
    color: '#3b82f6',
    geometryType: 'line',
    gradient: ['#93c5fd', '#60a5fa', '#3b82f6', '#1e3a5f'],
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
      'https://maps.co.bastrop.tx.us/server/rest/services/Emergency_Management/FEMA_Flood_Hazard_Areas/MapServer/0',
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
  const maxPages = 10;
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
            gj.properties._zone_code = extractField(gj.properties, ZONING_ALIASES) || 'Unknown';
          } else if (layerKey === 'floodplains') {
            gj.properties._flood_zone = extractField(gj.properties, FLOOD_ALIASES) || 'Unknown';
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
