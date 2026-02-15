// ═══════════════════════════════════════════════════════════
// ScoutGPT v2 — Filter API Hook
// src/hooks/useFilterAPI.js
// ═══════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchFilteredProperties } from '../services/filterAPI';

const DEBOUNCE_MS = 500;

// Default filter state
const DEFAULT_FILTERS = {
  // Property
  assetClass: [],
  lotSizeMin: '',
  lotSizeMax: '',
  buildingSizeMin: '',
  buildingSizeMax: '',
  yearBuiltMin: '',
  yearBuiltMax: '',
  stories: '',
  // Ownership
  ownerType: [],
  absenteeOnly: false,
  ownerName: '',
  // Sales
  soldWithinDays: '',
  salePriceMin: '',
  salePriceMax: '',
  armsLengthOnly: true,
  investorOnly: false,
  distressedSalesOnly: false,
  // Financial
  ltvMin: '',
  ltvMax: '',
  highLtvOnly: false,
  equityMin: '',
  equityMax: '',
  // Risk
  hasForeclosure: false,
  foreclosureType: [],
  foreclosureFiledDays: '',
  auctionWithinDays: '',
  distressScoreMin: '',
  floodRiskMin: '',
  inFloodZone: false,
};

/**
 * Hook for managing filter state and API calls
 * @param {React.RefObject} mapRef - Reference to the Mapbox map instance
 * @returns {Object} Filter state and control functions
 */
export function useFilterAPI(mapRef) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [count, setCount] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bbox, setBbox] = useState(null);

  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Get current bbox from map
  const getBboxFromMap = useCallback(() => {
    const map = mapRef?.current;
    if (!map) return null;

    try {
      const bounds = map.getBounds();
      return {
        west: bounds.getWest(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        north: bounds.getNorth(),
      };
    } catch {
      return null;
    }
  }, [mapRef]);

  // Check if any filters are active (non-default)
  const hasActiveFilters = useCallback(() => {
    return Object.entries(filters).some(([key, value]) => {
      const defaultValue = DEFAULT_FILTERS[key];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return value !== defaultValue;
      if (value === '' || value === null || value === undefined) return false;
      return value !== defaultValue;
    });
  }, [filters]);

  // Execute filter query
  const executeQuery = useCallback(async (currentBbox, currentFilters) => {
    if (!currentBbox) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      // Build clean filters object (exclude empty/default values)
      const cleanFilters = {};
      Object.entries(currentFilters).forEach(([key, value]) => {
        const defaultValue = DEFAULT_FILTERS[key];
        if (Array.isArray(value) && value.length > 0) {
          cleanFilters[key] = value;
        } else if (typeof value === 'boolean' && value !== defaultValue) {
          cleanFilters[key] = value;
        } else if (value !== '' && value !== null && value !== undefined && value !== defaultValue) {
          // Convert numeric strings to numbers
          cleanFilters[key] = isNaN(Number(value)) ? value : Number(value);
        }
      });

      const result = await fetchFilteredProperties({
        bbox: currentBbox,
        filters: cleanFilters,
      });

      setCount(result.count);
      setProperties(result.properties || []);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('[useFilterAPI] Query failed:', err);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced query trigger
  const triggerQuery = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const currentBbox = getBboxFromMap();
      if (currentBbox) {
        setBbox(currentBbox);
        executeQuery(currentBbox, filters);
      }
    }, DEBOUNCE_MS);
  }, [getBboxFromMap, executeQuery, filters]);

  // Set a single filter value
  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Toggle a value in an array filter
  const toggleArrayFilter = useCallback((key, value) => {
    setFilters(prev => {
      const arr = prev[key] || [];
      const newArr = arr.includes(value)
        ? arr.filter(v => v !== value)
        : [...arr, value];
      return { ...prev, [key]: newArr };
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setCount(null);
    setProperties([]);
    setError(null);
  }, []);

  // Re-query when filters change
  useEffect(() => {
    if (hasActiveFilters()) {
      triggerQuery();
    } else {
      // No active filters - clear results
      setCount(null);
      setProperties([]);
    }
  }, [filters, hasActiveFilters, triggerQuery]);

  // Listen for map move events
  useEffect(() => {
    const map = mapRef?.current;
    if (!map) return;

    const handleMoveEnd = () => {
      if (hasActiveFilters()) {
        triggerQuery();
      }
    };

    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [mapRef, hasActiveFilters, triggerQuery]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return {
    filters,
    setFilter,
    toggleArrayFilter,
    clearFilters,
    count,
    properties,
    filteredAttomIds: properties.map(p => p.attomId),
    hasActiveFilters: hasActiveFilters(),
    loading,
    error,
    bbox,
  };
}

export default useFilterAPI;
