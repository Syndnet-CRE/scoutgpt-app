import { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://scoutgpt-app.onrender.com';

const streetViewCache = new Map();

export function useStreetView(attomId) {
  const [streetView, setStreetView] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!attomId) {
      setStreetView(null);
      setLoading(false);
      setError(null);
      return;
    }

    const key = String(attomId);

    if (streetViewCache.has(key)) {
      setStreetView(streetViewCache.get(key));
      setLoading(false);
      setError(null);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    fetch(`${API_URL}/api/property/${attomId}/streetview`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        streetViewCache.set(key, data);
        setStreetView(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('[useStreetView] Error:', err.message);
        setError(err.message);
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [attomId]);

  return { streetView, loading, error };
}
