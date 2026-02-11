import { useState, useEffect } from 'react';
import { fetchProperties } from '../services/api';

export function useProperties(bbox, filters) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bbox) return; // Don't fetch without viewport bbox

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const bboxArr = [bbox.west, bbox.south, bbox.east, bbox.north];
        const data = await fetchProperties(bboxArr, filters);
        setProperties(data.properties || data);
      } catch (err) {
        setError(err.message);
        console.error('[useProperties] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce to avoid firing on every tiny map pan
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [bbox, filters]);

  return { properties, loading, error };
}
