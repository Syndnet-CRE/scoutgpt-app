// ══════════════════════════════════════════════════════════════
// ScoutGPT v2 — Intelligence Data Hook
// File: src/hooks/useIntelligence.js
//
// Drop into ~/scoutgpt-app/src/hooks/
// Fetches derived metrics, scores, comps, and portfolio data
// from the new intelligence endpoints.
// ══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://scoutgpt-app.onrender.com';

export function useIntelligence(attomId) {
  const [intelligence, setIntelligence] = useState(null);
  const [comps, setComps] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState({ intelligence: false, comps: false, portfolio: false });
  const [errors, setErrors] = useState({ intelligence: null, comps: null, portfolio: null });

  // Fetch intelligence (derived metrics + scores) when attomId changes
  useEffect(() => {
    if (!attomId) {
      setIntelligence(null);
      return;
    }

    let cancelled = false;
    setLoading(prev => ({ ...prev, intelligence: true }));
    setErrors(prev => ({ ...prev, intelligence: null }));

    fetch(`${API_URL}/api/property/${attomId}/intelligence`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!cancelled) setIntelligence(data);
      })
      .catch(err => {
        if (!cancelled) setErrors(prev => ({ ...prev, intelligence: err.message }));
      })
      .finally(() => {
        if (!cancelled) setLoading(prev => ({ ...prev, intelligence: false }));
      });

    return () => { cancelled = true; };
  }, [attomId]);

  // Fetch comps on demand (not automatic — user clicks "Load Comps")
  const fetchComps = useCallback(async (options = {}) => {
    if (!attomId) return;
    setLoading(prev => ({ ...prev, comps: true }));
    setErrors(prev => ({ ...prev, comps: null }));

    try {
      const params = new URLSearchParams({
        radius: options.radius || 3,
        months: options.months || 24,
        limit: options.limit || 5,
      });
      const res = await fetch(`${API_URL}/api/property/${attomId}/comps?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setComps(data);
      return data;
    } catch (err) {
      setErrors(prev => ({ ...prev, comps: err.message }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, comps: false }));
    }
  }, [attomId]);

  // Fetch portfolio on demand
  const fetchPortfolio = useCallback(async () => {
    if (!attomId) return;
    setLoading(prev => ({ ...prev, portfolio: true }));
    setErrors(prev => ({ ...prev, portfolio: null }));

    try {
      const res = await fetch(`${API_URL}/api/property/${attomId}/portfolio`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPortfolio(data);
      return data;
    } catch (err) {
      setErrors(prev => ({ ...prev, portfolio: err.message }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, portfolio: false }));
    }
  }, [attomId]);

  // Reset all data when property changes
  useEffect(() => {
    setComps(null);
    setPortfolio(null);
  }, [attomId]);

  return {
    intelligence,
    comps,
    portfolio,
    loading,
    errors,
    fetchComps,
    fetchPortfolio,
  };
}

export default useIntelligence;
