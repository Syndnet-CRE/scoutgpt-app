import { useState, useEffect, useRef, useMemo } from 'react';
import { fetchProperties } from '../services/api';

export function useProperties(bbox, filters) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  // Stabilize filters so a new {} on every render doesn't re-trigger the effect
  const filtersKey = JSON.stringify(filters ?? {});
  const stableFilters = useMemo(() => JSON.parse(filtersKey), [filtersKey]);

  useEffect(() => {
    if (!bbox) return;

    // If a previous fetch errored, don't automatically retry —
    // wait for an actual bbox/filter change to clear the error.
    // (error is NOT in the dep array, so state changes from setError
    // won't re-run this effect.)

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const bboxArr = [bbox.west, bbox.south, bbox.east, bbox.north];
        const data = await fetchProperties(bboxArr, stableFilters);
        if (!cancelled) setProperties(data.properties || data);
      } catch (err) {
        if (cancelled || err.name === 'AbortError') return;
        setError(err.message);
        console.error('[useProperties] Error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Debounce to avoid firing on every tiny map pan
    const timer = setTimeout(fetchData, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [bbox, stableFilters]);

  return { properties, loading, error };
}
