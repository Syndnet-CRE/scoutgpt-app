import { useState, useCallback } from 'react';
import { fetchPropertyDetail } from '../services/api';

export function usePropertyDetail() {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProperty = useCallback(async (attomId) => {
    if (!attomId) {
      setProperty(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPropertyDetail(attomId);
      setProperty(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch property detail:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearProperty = useCallback(() => {
    setProperty(null);
    setError(null);
  }, []);

  return { property, loading, error, loadProperty, clearProperty };
}
