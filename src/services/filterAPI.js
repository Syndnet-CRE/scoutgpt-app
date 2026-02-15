// ═══════════════════════════════════════════════════════════
// ScoutGPT v2 — Filter API Service
// src/services/filterAPI.js
// ═══════════════════════════════════════════════════════════

const API_URL = import.meta.env.VITE_API_URL || 'https://scoutgpt-app.onrender.com/api';

/**
 * POST /api/properties/filter
 * @param {Object} params
 * @param {Object} params.bbox - { west, south, east, north }
 * @param {Object} params.filters - All filter parameters
 * @returns {Promise<{ count: number, properties: Array, filters: Object, bbox: Object }>}
 */
export async function fetchFilteredProperties({ bbox, filters = {} }) {
  // Build request body - only include non-empty filters
  const body = { bbox };

  // Add filters, excluding empty values
  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    if (Array.isArray(value) && value.length === 0) return;
    if (typeof value === 'boolean' && value === false) return;
    body[key] = value;
  });

  const response = await fetch(`${API_URL}/properties/filter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Filter API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

/**
 * Asset class definitions with colors
 */
export const ASSET_CLASSES = [
  { id: 'single_family', label: 'Single Family', color: '#4ADE80' },
  { id: 'condo', label: 'Condo', color: '#60A5FA' },
  { id: 'multifamily', label: 'Multifamily', color: '#F472B6' },
  { id: 'mixed_use', label: 'Mixed-Use', color: '#C084FC' },
  { id: 'office', label: 'Office', color: '#38BDF8' },
  { id: 'retail', label: 'Retail', color: '#FBBF24' },
  { id: 'industrial', label: 'Industrial', color: '#FB923C' },
  { id: 'hospitality', label: 'Hospitality', color: '#E879F9' },
  { id: 'senior_living', label: 'Senior Living', color: '#FB7185' },
  { id: 'land', label: 'Land', color: '#A3E635' },
  { id: 'developments', label: 'Developments', color: '#2DD4BF' },
  { id: 'special_purpose', label: 'Special Purpose', color: '#94A3B8' },
];

/**
 * Owner type options
 */
export const OWNER_TYPES = [
  { id: 'individual', label: 'Individual' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'trust', label: 'Trust' },
  { id: 'government', label: 'Government' },
  { id: 'builder', label: 'Builder' },
];

/**
 * Foreclosure type options
 */
export const FORECLOSURE_TYPES = [
  { id: 'NTS', label: 'Notice to Sell' },
  { id: 'LIS', label: 'Lis Pendens' },
  { id: 'NOD', label: 'Notice of Default' },
];

/**
 * Sold within days options
 */
export const SOLD_WITHIN_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
  { value: 180, label: '6 months' },
  { value: 365, label: '1 year' },
];

/**
 * Stories options
 */
export const STORIES_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: '5+', label: '5+' },
];
