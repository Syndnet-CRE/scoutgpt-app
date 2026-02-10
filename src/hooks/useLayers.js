import { useState, useEffect, useCallback } from 'react';
import { fetchParcels, fetchFloodZones, fetchSchoolDistricts } from '../services/api';

export function useLayers(bbox) {
  const [layers, setLayers] = useState({
    parcels: null,
    flood: null,
    schools: null,
  });
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  const loadLayer = useCallback(async (type) => {
    try {
      setLoading((prev) => ({ ...prev, [type]: true }));
      setErrors((prev) => ({ ...prev, [type]: null }));

      let data;
      switch (type) {
        case 'parcels':
          data = await fetchParcels(bbox);
          break;
        case 'flood':
          data = await fetchFloodZones(bbox);
          break;
        case 'schools':
          data = await fetchSchoolDistricts(bbox);
          break;
        default:
          throw new Error(`Unknown layer type: ${type}`);
      }

      setLayers((prev) => ({ ...prev, [type]: data }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [type]: err.message }));
      console.error(`Failed to fetch ${type} layer:`, err);
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  }, [bbox]);

  // Load parcels on mount
  useEffect(() => {
    loadLayer('parcels');
  }, [loadLayer]);

  return { layers, loading, errors, loadLayer };
}
