import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './theme.jsx';
import MapContainer from './components/Map/MapContainer';
import LayersPanel from './components/LeftPanel/LayersPanelV2';
import ScoutGPTChatPanel from './components/RightPanel/ScoutGPTChatPanel';
import { PropertyCard } from './components/PropertyCard/PropertyCardModule';
import WorkstationDrawer from './components/Workstation/WorkstationDrawer';
import { useProperties } from './hooks/useProperties';
import { usePropertyDetail } from './hooks/usePropertyDetail';

import { useChat } from './hooks/useChat';
import { MOCK_FLOOD_GEOJSON, MOCK_SCHOOL_GEOJSON } from './data/mockData';

export default function App() {
  const { t, toggleTheme, isDark } = useTheme();
  const [themeHovered, setThemeHovered] = useState(false);

  // Panel z-index focus state
  const [workstationOnTop, setWorkstationOnTop] = useState(false);

  const getPanelZ = (panel) => {
    if (panel === 'workstation') {
      return workstationOnTop ? 65 : 55;
    }
    // Left and right panels are always above workstation's base z,
    // but below workstation when it's brought to front
    return 60;
  };
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

  // Popup container for portal rendering
  const [popupContainer, setPopupContainer] = useState(null);

  // Ref for map expand callback
  const mapExpandRef = useRef(null);

  // Workstation state
  const [workstationOpen, setWorkstationOpen] = useState(false);
  const [workstationProperty, setWorkstationProperty] = useState(null);

  // Track if workstation was open in previous render (to avoid clearing popup on first property load)
  const wasWorkstationOpenRef = useRef(false);

  // Property detail state
  const { property: selectedProperty, loading: detailLoading, loadProperty, clearProperty } = usePropertyDetail();

  // Chat state
  const { messages, loading: chatLoading, send: sendChat, highlightedProperties, setHighlightedProperties, clearHighlights, chatMarkers, resetChat } = useChat();

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

  const handlePopupOpen = useCallback((container) => {
    setPopupContainer(container);
  }, []);

  const handlePopupClose = useCallback(() => {
    setPopupContainer(null);
    clearProperty();
  }, [clearProperty]);

  // Parcel click handler
  const handleParcelClick = useCallback((attomId) => {
    loadProperty(attomId);
  }, [loadProperty]);

  // Debug: log when highlighted properties change
  useEffect(() => {
    console.log('[APP] highlightedProperties changed:', highlightedProperties.length, highlightedProperties.slice(0, 5));
  }, [highlightedProperties]);

  // Sync theme tokens to CSS custom properties for index.css
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--scout-bg-primary', t.bg.primary);
    root.style.setProperty('--scout-bg-secondary', t.bg.secondary);
    root.style.setProperty('--scout-bg-tertiary', t.bg.tertiary);
    root.style.setProperty('--scout-text-primary', t.text.primary);
    root.style.setProperty('--scout-text-secondary', t.text.secondary);
    root.style.setProperty('--scout-border', t.border.default);
    root.style.setProperty('--scout-border-subtle', t.border.subtle);
  }, [t]);

  // Chat send handler — clear old highlights before sending new query
  const handleChatSend = useCallback((text) => {
    clearHighlights();
    sendChat(text);
  }, [sendChat, clearHighlights]);

  // Chat panel: highlight specific properties on map
  const handleHighlightProperties = useCallback((attomIds) => {
    if (setHighlightedProperties) {
      setHighlightedProperties(attomIds.map(Number));
    }
  }, [setHighlightedProperties]);

  // Chat panel: show single property on map (flyTo + highlight)
  const handleShowOnMap = useCallback((attomId) => {
    // Highlight just this one property
    if (setHighlightedProperties) {
      setHighlightedProperties([Number(attomId)]);
    }
    // Also load the property detail to open its popup
    loadProperty(attomId);
  }, [setHighlightedProperties, loadProperty]);

  // Chat panel: view property details (opens Mapbox popup via same flow as parcel click)
  const handleSelectProperty = useCallback((attomId) => {
    loadProperty(attomId);
  }, [loadProperty]);

  // Open workstation with property data
  const handleOpenWorkstation = useCallback((propertyData) => {
    setWorkstationProperty(propertyData);
    setWorkstationOpen(true);
    // Close the Mapbox popup
    clearProperty();
    setPopupContainer(null);
  }, [clearProperty]);

  // Update workstation data when a new parcel is clicked while workstation is already open
  useEffect(() => {
    // Only auto-update workstation if it was ALREADY open before this property loaded
    // This prevents clearing the popup on initial property load
    if (selectedProperty && workstationOpen && wasWorkstationOpenRef.current) {
      setWorkstationProperty(selectedProperty);
      // Close popup since workstation is showing this property
      clearProperty();
      setPopupContainer(null);
    }
    // Track current workstation state for next render
    wasWorkstationOpenRef.current = workstationOpen;
  }, [selectedProperty, workstationOpen, clearProperty]);

  return (
    <div className="h-screen w-screen flex overflow-hidden" style={{ background: t.bg.primary }}>
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
          onPopupOpen={handlePopupOpen}
          onPopupClose={handlePopupClose}
          mapExpandRef={mapExpandRef}
        />

        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          onMouseEnter={() => setThemeHovered(true)}
          onMouseLeave={() => setThemeHovered(false)}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: themeHovered ? t.bg.tertiary : t.bg.secondary,
            border: `1px solid ${t.border.default}`,
            color: t.text.secondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 55,
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            transition: 'background 0.15s ease',
          }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Floating left panel overlay */}
        <LayersPanel
          onLayerChange={handleLayerChange}
          onFilterChange={handleFilterChange}
          zIndex={getPanelZ('left')}
          onBringToFront={() => setWorkstationOnTop(false)}
        />

        {/* Property Card rendered inside Mapbox popup via portal */}
        {selectedProperty && popupContainer && createPortal(
          <PropertyCard
            data={selectedProperty}
            onClose={() => { clearProperty(); setPopupContainer(null); }}
            onExpand={() => mapExpandRef.current?.()}
            onOpenWorkstation={() => handleOpenWorkstation(selectedProperty)}
          />,
          popupContainer
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

      {/* Right Panel — Scout AI Chat (floating overlay) */}
      <ScoutGPTChatPanel
        messages={messages}
        loading={chatLoading}
        onSend={handleChatSend}
        onSelectProperty={handleSelectProperty}
        onShowOnMap={handleShowOnMap}
        onHighlightProperties={handleHighlightProperties}
        onNewChat={resetChat}
        zIndex={getPanelZ('right')}
        onBringToFront={() => setWorkstationOnTop(false)}
      />

      {/* Bottom Drawer Workstation */}
      <WorkstationDrawer
        data={workstationProperty}
        isOpen={workstationOpen}
        onClose={() => setWorkstationOpen(false)}
        zIndex={getPanelZ('workstation')}
        onBringToFront={() => setWorkstationOnTop(true)}
      />
    </div>
  );
}
