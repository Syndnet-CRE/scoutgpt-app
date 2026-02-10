import React, { useState, useCallback, useMemo } from 'react';
import MapContainer from './components/Map/MapContainer';
import LeftPanel from './components/LeftPanel/LeftPanel';
import RightPanel from './components/RightPanel/RightPanel';
import PropertyCard from './components/PropertyCard/PropertyCard';
import { useProperties } from './hooks/useProperties';
import { usePropertyDetail } from './hooks/usePropertyDetail';
import { useLayers } from './hooks/useLayers';
import { useChat } from './hooks/useChat';
import { MOCK_PARCELS_GEOJSON, MOCK_FLOOD_GEOJSON, MOCK_SCHOOL_GEOJSON } from './data/mockData';

export default function App() {
  // Layer visibility state
  const [visibleLayers, setVisibleLayers] = useState({
    parcels: true,
    flood: false,
    schools: false,
  });

  // Data filter state
  const [filters, setFilters] = useState({
    absentee: false,
    foreclosure: false,
    ownerOccupied: false,
    corporate: false,
    recentSales: false,
    highEquity: false,
  });

  // Property detail state
  const { property: selectedProperty, loading: detailLoading, loadProperty, clearProperty } = usePropertyDetail();

  // Chat state
  const { messages, loading: chatLoading, send: sendChat, highlightedProperties } = useChat();

  // Properties for current viewport + filters
  const { properties } = useProperties(null, filters);

  // Layer toggle handler
  const handleToggleLayer = useCallback((layerKey) => {
    setVisibleLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  }, []);

  // Filter toggle handler
  const handleToggleFilter = useCallback((filterKey) => {
    setFilters((prev) => ({ ...prev, [filterKey]: !prev[filterKey] }));
  }, []);

  // Parcel click handler
  const handleParcelClick = useCallback((attomId) => {
    loadProperty(attomId);
  }, [loadProperty]);

  // Chat send handler
  const handleChatSend = useCallback((text) => {
    sendChat(text, {
      visibleLayers,
      filters,
      // In production, include map bbox here
    });
  }, [sendChat, visibleLayers, filters]);

  // Using mock GeoJSON directly for now — swap to API-fetched data later
  const parcelsGeoJSON = useMemo(() => {
    // Add feature IDs for feature-state to work
    const data = { ...MOCK_PARCELS_GEOJSON };
    data.features = data.features.map((f, i) => ({ ...f, id: i }));
    return data;
  }, []);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-scout-bg">
      {/* Left Panel — Layers + Filters */}
      <LeftPanel
        visibleLayers={visibleLayers}
        onToggleLayer={handleToggleLayer}
        filters={filters}
        onToggleFilter={handleToggleFilter}
      />

      {/* Map — Center */}
      <div className="flex-1 relative">
        <MapContainer
          parcelsGeoJSON={parcelsGeoJSON}
          floodGeoJSON={MOCK_FLOOD_GEOJSON}
          schoolsGeoJSON={MOCK_SCHOOL_GEOJSON}
          visibleLayers={visibleLayers}
          highlightedProperties={highlightedProperties}
          onParcelClick={handleParcelClick}
          selectedAttomId={selectedProperty?.attom_id}
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
