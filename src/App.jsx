import React, { useState, useCallback, useEffect, useRef } from 'react';
import MapContainer from './components/Map/MapContainer';
import LayersPanel from './components/LeftPanel/LayersPanelV2';
import RightPanel from './components/RightPanel/RightPanel';
import PropertyCard from './components/PropertyCard/PropertyCard';
import { useProperties } from './hooks/useProperties';
import { usePropertyDetail } from './hooks/usePropertyDetail';
import { useLayers } from './hooks/useLayers';
import { useChat } from './hooks/useChat';
import { MOCK_FLOOD_GEOJSON, MOCK_SCHOOL_GEOJSON } from './data/mockData';

export default function App() {
  // Layer visibility state
  const [visibleLayers, setVisibleLayers] = useState({
    parcels: true,
    flood: false,
    schools: false,
  });

  // Map viewport bbox
  const [mapBbox, setMapBbox] = useState(null);

  // Filter-highlighted attom_ids (separate from chat highlights)
  const [filterHighlightIds, setFilterHighlightIds] = useState([]);

  // Property detail state
  const { property: selectedProperty, loading: detailLoading, loadProperty, clearProperty } = usePropertyDetail();

  // Chat state
  const { messages, loading: chatLoading, send: sendChat, highlightedProperties, clearHighlights, chatMarkers } = useChat();

  // Properties for current viewport
  const { properties } = useProperties(mapBbox, {});

  // Debounced filter handler — calls backend when filters change
  const filterTimeoutRef = useRef(null);

  const handleFilterChange = useCallback((backendFilters) => {
    // Clear previous timeout
    if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);

    // Check if any filters are active
    const hasActiveFilters = Object.keys(backendFilters).length > 0;

    if (!hasActiveFilters) {
      // No filters active — clear filter highlights
      setFilterHighlightIds([]);
      return;
    }

    // Debounce 500ms to avoid spamming API during slider drags
    filterTimeoutRef.current = setTimeout(async () => {
      try {
        // Use Travis County default bbox
        const bbox = '-98.2,30.0,-97.3,30.7';
        const params = new URLSearchParams({ bbox });

        // Add active filters to query params
        for (const [key, value] of Object.entries(backendFilters)) {
          params.append(key, String(value));
        }

        const API_URL = import.meta.env.VITE_API_URL || 'https://scoutgpt-app.onrender.com/api';
        const response = await fetch(`${API_URL}/properties?${params.toString()}`);

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        const ids = (data.properties || data || []).map(p => p.attomId || p.attom_id).filter(Boolean);

        console.log(`[FILTERS] ${ids.length} properties match active filters`);
        setFilterHighlightIds(ids);
      } catch (err) {
        console.error('[FILTERS] Failed to fetch filtered properties:', err);
        setFilterHighlightIds([]);
      }
    }, 500);
  }, []);

  const handleLayerChange = useCallback((layerKey, isVisible) => {
    setVisibleLayers(prev => ({ ...prev, [layerKey]: isVisible }));
  }, []);

  // Parcel click handler
  const handleParcelClick = useCallback((attomId) => {
    loadProperty(attomId);
  }, [loadProperty]);

  // Debug: log when highlighted properties change
  useEffect(() => {
    console.log('[APP] highlightedProperties changed:', highlightedProperties.length, highlightedProperties.slice(0, 5));
  }, [highlightedProperties]);

  // Chat send handler — clear old highlights before sending new query
  const handleChatSend = useCallback((text) => {
    clearHighlights();
    sendChat(text);
  }, [sendChat, clearHighlights]);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-scout-bg">
      {/* Map — full width */}
      <div className="flex-1 relative">
        <MapContainer
          floodGeoJSON={MOCK_FLOOD_GEOJSON}
          schoolsGeoJSON={MOCK_SCHOOL_GEOJSON}
          visibleLayers={visibleLayers}
          highlightedProperties={highlightedProperties}
          chatMarkers={chatMarkers}
          onParcelClick={handleParcelClick}
          onBoundsChange={setMapBbox}
          selectedAttomId={selectedProperty?.attomId}
          filterHighlightIds={filterHighlightIds}
        />

        {/* Floating left panel overlay */}
        <LayersPanel
          onLayerChange={handleLayerChange}
          onFilterChange={handleFilterChange}
        />

        {/* Property Card overlay on map */}
        {selectedProperty && (
          <PropertyCard
            property={selectedProperty}
            onClose={clearProperty}
          />
        )}

        {/* Loading overlay for property detail */}
        {detailLoading && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-scout-surface border border-scout-border rounded-xl px-6 py-3 shadow-xl z-20 animate-fade-in">
            <div className="flex items-center gap-3 text-sm text-scout-text-dim">
              <div className="w-4 h-4 border-2 border-scout-accent border-t-transparent rounded-full animate-spin" />
              Loading property data...
            </div>
          </div>
        )}
      </div>

      {/* Right Panel — Claude Chat */}
      <RightPanel
        messages={messages}
        loading={chatLoading}
        onSend={handleChatSend}
      />
    </div>
  );
}
