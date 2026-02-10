import {
  MOCK_PROPERTIES,
  MOCK_PARCELS_GEOJSON,
  MOCK_FLOOD_GEOJSON,
  MOCK_SCHOOL_GEOJSON,
  MOCK_CHAT_RESPONSES,
} from '../data/mockData';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const USE_MOCK = false; // Connected to live backend

// --- Properties ---

export async function fetchProperties(bbox, filters = {}) {
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
  const res = await fetch(`${API_BASE}/property/${attomId}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// --- GIS Layers ---

export async function fetchParcels(bbox) {
  const res = await fetch(`${API_BASE}/layers/parcels?bbox=${bbox.join(',')}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchFloodZones(bbox) {
  const res = await fetch(`${API_BASE}/layers/flood?bbox=${bbox.join(',')}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchSchoolDistricts(bbox) {
  const res = await fetch(`${API_BASE}/layers/schools?bbox=${bbox.join(',')}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// --- Chat ---

/**
 * Send chat messages to the backend.
 * @param {Array} messages - Full conversation history: [{ role: 'user'|'assistant', content: '...' }]
 * @returns {Promise<{ text: string, properties: number[], toolCalls: number }>}
 */
export async function sendChatMessage(messages) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.text || errData.error || `API error: ${res.status}`);
  }

  return res.json();
}
