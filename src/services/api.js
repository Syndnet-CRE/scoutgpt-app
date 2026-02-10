import {
  MOCK_PROPERTIES,
  MOCK_PARCELS_GEOJSON,
  MOCK_FLOOD_GEOJSON,
  MOCK_SCHOOL_GEOJSON,
  MOCK_CHAT_RESPONSES,
} from '../data/mockData';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const USE_MOCK = false; // Flip to false when backend is ready

// --- Properties ---

export async function fetchProperties(bbox, filters = {}) {
  if (USE_MOCK) {
    let results = [...MOCK_PROPERTIES];
    if (filters.absentee) results = results.filter((p) => p.owner.is_absentee);
    if (filters.corporate) results = results.filter((p) => p.owner.type === 'Corporate');
    if (filters.ownerOccupied) results = results.filter((p) => p.owner.is_owner_occupied);
    if (filters.propertyUse) results = results.filter((p) => p.property_use.toLowerCase().includes(filters.propertyUse.toLowerCase()));
    return results;
  }

  const params = new URLSearchParams();
  if (bbox) params.set('bbox', bbox.join(','));
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== false && v !== '') params.set(k, v);
  });
  const res = await fetch(`${API_BASE}/properties?${params}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchPropertyDetail(attomId) {
  if (USE_MOCK) {
    const p = MOCK_PROPERTIES.find((x) => x.attom_id === attomId);
    if (!p) throw new Error('Property not found');
    return p;
  }

  const res = await fetch(`${API_BASE}/property/${attomId}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// --- GIS Layers ---

export async function fetchParcels(bbox) {
  if (USE_MOCK) return MOCK_PARCELS_GEOJSON;

  const res = await fetch(`${API_BASE}/layers/parcels?bbox=${bbox.join(',')}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchFloodZones(bbox) {
  if (USE_MOCK) return MOCK_FLOOD_GEOJSON;

  const res = await fetch(`${API_BASE}/layers/flood?bbox=${bbox.join(',')}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchSchoolDistricts(bbox) {
  if (USE_MOCK) return MOCK_SCHOOL_GEOJSON;

  const res = await fetch(`${API_BASE}/layers/schools?bbox=${bbox.join(',')}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// --- Chat ---

export async function sendChatMessage(message, context = {}) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800)); // Simulate latency
    const key = Object.keys(MOCK_CHAT_RESPONSES).find((k) =>
      message.toLowerCase().includes(k)
    );
    return MOCK_CHAT_RESPONSES[key] || MOCK_CHAT_RESPONSES.default;
  }

  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
