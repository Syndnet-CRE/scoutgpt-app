import { useState, useEffect, useCallback } from 'react';
import { fetchProperties } from '../services/api';

export function useProperties(bbox, filters) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProperties(bbox, filters);
      setProperties(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch properties:', err);
    } finally {
      setLoading(false);
    }
  }, [bbox, filters]);

  useEffect(() => {
    load();
  }, [load]);

  return { properties, loading, error, refetch: load };
}
