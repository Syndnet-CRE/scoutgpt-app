import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../theme.jsx';
import MapContainer from '../components/Map/MapContainer';
import LayersPanel from '../components/LeftPanel/LayersPanelV2';
import ScoutGPTChatPanel from '../components/RightPanel/ScoutGPTChatPanel';
import { PropertyCard } from '../components/PropertyCard/PropertyCardModule';
import WorkstationPanel from '../components/Workstation/WorkstationPanel';
import { useProperties } from '../hooks/useProperties';
import { usePropertyDetail } from '../hooks/usePropertyDetail';

import { useChat } from '../hooks/useChat';
import { MOCK_FLOOD_GEOJSON, MOCK_SCHOOL_GEOJSON } from '../data/mockData';

export default function LiveMapPage() {
  const { t } = useTheme();

  // Dynamic header height measurement
  const contentRef = useRef(null);
  const [headerBottom, setHeaderBottom] = useState(104); // fallback

  useEffect(() => {
    const measure = () => {
      if (contentRef.current) {
        const top = contentRef.current.getBoundingClientRect().top;
        if (top > 0) setHeaderBottom(top);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

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

  // GIS layer visibility state (ArcGIS endpoints)
  const [visibleGisLayers, setVisibleGisLayers] = useState({});

  // GIS layer opacity state (0-1 values)
  const [gisLayerOpacity, setGisLayerOpacity] = useState({});

  // GIS layer loading state (true while fetching)
  const [gisLayerLoading, setGisLayerLoading] = useState({});

  // Map viewport bbox
  const [mapBbox, setMapBbox] = useState(null);

  // Filter-highlighted attom_ids (separate from chat highlights)
  const [filterHighlightIds, setFilterHighlightIds] = useState([]);

  // Active asset class filters for tile-side coloring
  const [activeAssetClasses, setActiveAssetClasses] = useState([]);

  // Popup container for portal rendering
  const [popupContainer, setPopupContainer] = useState(null);

  // Ref for map expand callback
  const mapExpandRef = useRef(null);

  // Ref for map instance (used by filter API)
  const mapInstanceRef = useRef(null);

  // Right panel mode: 'chat' | 'workstation'
  const [rightPanelMode, setRightPanelMode] = useState('chat');

  // Workstation state
  const [workstationOpen, setWorkstationOpen] = useState(false);
  const [workstationProperty, setWorkstationProperty] = useState(null);
  const [activeWorkstationTab, setActiveWorkstationTab] = useState('Overview');

  // Track if workstation was open in previous render (to avoid clearing popup on first property load)
  const wasWorkstationOpenRef = useRef(false);

  // Property detail state
  const { property: selectedProperty, loading: detailLoading, loadProperty, clearProperty } = usePropertyDetail();

  // Chat state
  const { messages, setMessages, loading: chatLoading, send: sendChat, highlightedProperties, setHighlightedProperties, clearHighlights, chatMarkers, resetChat } = useChat();

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

  // Handler for GIS layer toggles (ArcGIS endpoints)
  const handleGisLayerChange = useCallback((layerKey, isVisible) => {
    setVisibleGisLayers(prev => ({ ...prev, [layerKey]: isVisible }));
  }, []);

  // Handler for GIS layer opacity changes
  const handleGisOpacityChange = useCallback((layerKey, opacity) => {
    setGisLayerOpacity(prev => ({ ...prev, [layerKey]: opacity }));
  }, []);

  // Handler for new filter panel — receives filtered attom IDs for map highlighting
  const handleFilteredIdsChange = useCallback((ids) => {
    setFilterHighlightIds(ids || []);
  }, []);

  // Handler for asset class changes — tile-side coloring (no API call)
  const handleAssetClassChange = useCallback((assetClasses) => {
    setActiveAssetClasses(assetClasses || []);
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

  // Ref to hold filterAPI functions exposed from LayersPanelV2
  const filterAPIRef = useRef(null);

  // NLQ interceptor — handles layer/filter commands without calling Claude API
  // INLINED parseNLQCommand to prevent Vite tree-shaking
  const handleNLQCommand = useCallback((text) => {
    // ============================================================
    // INLINE NLQ PARSER — cannot be tree-shaken from useCallback
    // ============================================================
    const normalizedText = (text || '').trim().toLowerCase();
    if (!normalizedText) return false;

    // LAYER COMMANDS — order: check hide first, then show
    const LAYERS = [
      { key: 'zoning_districts', type: 'gis_layer', name: 'Zoning',
        show: ['show zoning', 'display zoning', 'turn on zoning', 'enable zoning', 'add zoning', 'activate zoning', 'zoning layer', 'zoning on', 'whats the zoning', "what's the zoning", 'what is the zoning', 'show zones', 'show zone'],
        hide: ['hide zoning', 'remove zoning', 'turn off zoning', 'disable zoning', 'no zoning', 'zoning off', 'hide zones', 'remove zones'] },
      { key: 'floodplains', type: 'gis_layer', name: 'Floodplains',
        show: ['show flood', 'show floodplains', 'show floodplain', 'show flood zones', 'show flood zone', 'show fema', 'flood layer', 'flood on', 'display flood', 'turn on flood', 'whats the flood', "what's the flood zone"],
        hide: ['hide flood', 'remove flood', 'turn off flood', 'disable flood', 'no flood', 'flood off', 'hide floodplains', 'remove floodplains'] },
      { key: 'water_lines', type: 'gis_layer', name: 'Water Lines',
        show: ['show water', 'show water lines', 'show water mains', 'water layer', 'water on', 'display water', 'turn on water'],
        hide: ['hide water', 'remove water', 'turn off water', 'water off', 'remove water lines'] },
      { key: 'wastewater_lines', type: 'gis_layer', name: 'Sewer Lines',
        show: ['show sewer', 'show wastewater', 'show sewer lines', 'sewer layer', 'sewer on', 'display sewer', 'turn on sewer'],
        hide: ['hide sewer', 'remove sewer', 'turn off sewer', 'sewer off', 'remove sewer lines', 'hide wastewater', 'remove wastewater'] },
      { key: 'stormwater_lines', type: 'gis_layer', name: 'Stormwater',
        show: ['show storm', 'show stormwater', 'show storm drains', 'show storm lines', 'storm layer', 'storm on', 'display storm', 'turn on storm'],
        hide: ['hide storm', 'remove storm', 'turn off storm', 'storm off', 'remove stormwater', 'hide stormwater'] },
      { key: 'parcels', type: 'basic_layer', name: 'Parcel Boundaries',
        show: ['show parcels', 'show parcel boundaries', 'show boundaries', 'parcels on', 'display parcels', 'turn on parcels'],
        hide: ['hide parcels', 'remove parcels', 'turn off parcels', 'parcels off', 'hide boundaries', 'remove boundaries'] },
      { key: 'schools', type: 'basic_layer', name: 'School Districts',
        show: ['show schools', 'show school districts', 'show school zones', 'schools on', 'display schools', 'turn on schools'],
        hide: ['hide schools', 'remove schools', 'turn off schools', 'schools off', 'hide school districts', 'remove school districts'] },
    ];

    // FILTER COMMANDS
    const FILTERS = [
      { show: ['show foreclosures', 'filter foreclosures', 'filter to foreclosures', 'foreclosure filter', 'foreclosure properties'],
        clear: ['remove foreclosure', 'clear foreclosure', 'hide foreclosure'],
        key: 'hasForeclosure', val: true, clearVal: false, label: 'Foreclosure', tab: 'Risk' },
      { show: ['show absentee', 'filter absentee', 'filter to absentee', 'absentee owners', 'absentee only'],
        clear: ['remove absentee', 'clear absentee', 'hide absentee'],
        key: 'absenteeOnly', val: true, clearVal: false, label: 'Absentee Owner', tab: 'Ownership' },
      { show: ['show corporate', 'filter corporate', 'corporate owners', 'corporate owned', 'show llc'],
        clear: ['remove corporate', 'clear corporate', 'hide corporate'],
        key: 'ownerType', val: ['corporate'], clearVal: [], label: 'Corporate Owners', tab: 'Ownership', isArray: true },
      { show: ['filter flood zone', 'in flood zone', 'show flood zone filter', 'fema filter'],
        clear: ['remove flood filter', 'clear flood filter'],
        key: 'inFloodZone', val: true, clearVal: false, label: 'In Flood Zone', tab: 'Risk' },
      { show: ['show distressed', 'filter distressed', 'distressed properties', 'high distress'],
        clear: ['remove distress', 'clear distress', 'hide distress'],
        key: 'distressScoreMin', val: '30', clearVal: '', label: 'Distressed (score ≥ 30)', tab: 'Risk' },
      { show: ['show high ltv', 'filter high ltv', 'overleveraged', 'high leverage', 'underwater'],
        clear: ['remove ltv', 'clear ltv', 'hide ltv'],
        key: 'highLtvOnly', val: true, clearVal: false, label: 'High LTV (>80%)', tab: 'Financial' },
      { show: ['show recent sales', 'filter recent sales', 'recently sold', 'sold recently', 'recent transactions'],
        clear: ['remove recent sales', 'clear recent sales'],
        key: 'soldWithinDays', val: '365', clearVal: '', label: 'Recent Sales (12 mo)', tab: 'Sales' },
      { show: ['show investor', 'filter investor', 'investor purchases', 'investor buys'],
        clear: ['remove investor', 'clear investor', 'hide investor'],
        key: 'investorOnly', val: true, clearVal: false, label: 'Investor Purchases', tab: 'Sales' },
      { show: ['show high equity', 'filter high equity', 'equity rich', 'high equity properties'],
        clear: ['remove equity', 'clear equity', 'hide equity'],
        key: 'equityMin', val: '100000', clearVal: '', label: 'High Equity (≥$100K)', tab: 'Financial' },
    ];

    let command = null;

    // Check layers — hide first, then show
    for (const layer of LAYERS) {
      for (const phrase of layer.hide) {
        if (normalizedText.includes(phrase)) {
          command = { type: layer.type, action: 'hide', layerKey: layer.key,
            confirmationText: `✅ ${layer.name} layer hidden.` };
          break;
        }
      }
      if (command) break;
      for (const phrase of layer.show) {
        if (normalizedText.includes(phrase)) {
          command = { type: layer.type, action: 'show', layerKey: layer.key,
            confirmationText: `✅ ${layer.name} layer is now visible.` };
          break;
        }
      }
      if (command) break;
    }

    // Check filters — clear first, then set
    if (!command) {
      for (const f of FILTERS) {
        for (const phrase of f.clear) {
          if (normalizedText.includes(phrase)) {
            command = { type: 'filter', action: 'clear', filterKey: f.key, filterValue: f.clearVal,
              isArray: f.isArray || false, confirmationText: `✅ ${f.label} filter cleared.` };
            break;
          }
        }
        if (command) break;
        for (const phrase of f.show) {
          if (normalizedText.includes(phrase)) {
            command = { type: 'filter', action: 'set', filterKey: f.key, filterValue: f.val,
              isArray: f.isArray || false, tab: f.tab,
              confirmationText: `✅ ${f.label} filter applied. Check the Filters panel (${f.tab} tab) to see results.` };
            break;
          }
        }
        if (command) break;
      }
    }

    // Clear all
    if (!command && (normalizedText.includes('clear all filters') || normalizedText.includes('reset all filters') || normalizedText.includes('remove all filters') || normalizedText.includes('clear all layers') || normalizedText.includes('turn off all layers'))) {
      command = { type: 'clear_all', confirmationText: '✅ All filters and layers cleared.' };
    }

    // ============================================================
    // END INLINE NLQ PARSER
    // ============================================================

    console.log('[NLQ] Command result:', command);
    if (!command) return false; // No match — let Claude handle it

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date() }]);

    // Execute the command
    switch (command.type) {
      case 'gis_layer':
        console.log('[NLQ] Calling handleGisLayerChange:', command.layerKey, command.action === 'show');
        handleGisLayerChange(command.layerKey, command.action === 'show');
        break;
      case 'basic_layer':
        handleLayerChange(command.layerKey, command.action === 'show');
        break;
      case 'filter':
        if (filterAPIRef.current) {
          filterAPIRef.current.setFilter(command.filterKey, command.filterValue);
        }
        break;
      case 'clear_all':
        // Clear all GIS layers
        setVisibleGisLayers({});
        // Clear filters
        if (filterAPIRef.current) {
          filterAPIRef.current.clearFilters();
        }
        break;
      default:
        break;
    }

    // Inject confirmation message into chat
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: command.confirmationText,
        timestamp: new Date(),
      }]);
    }, 150);

    return true; // Command was handled
  }, [handleGisLayerChange, handleLayerChange, setMessages]);

  // Chat send handler — clear old highlights before sending new query
  const handleChatSend = useCallback((text) => {
    // Try NLQ command first — if matched, don't call Claude
    if (handleNLQCommand(text)) return;
    clearHighlights();
    sendChat(text);
  }, [handleNLQCommand, clearHighlights, sendChat]);

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

    // Find marker coordinates from chatMarkers and pan to it
    const marker = chatMarkers?.find(m => String(m.attomId) === String(attomId));
    if (marker?.latitude && marker?.longitude && mapInstanceRef.current) {
      // Calculate offset to center between panels
      const leftPanel = 370;
      const rightPanel = 400;
      const horizontalOffset = (leftPanel - rightPanel) / 2;

      mapInstanceRef.current.flyTo({
        center: [Number(marker.longitude), Number(marker.latitude)],
        offset: [horizontalOffset, 0],
        duration: 800,
        essential: true,
        // Preserve current zoom level — don't change it
      });
    }

    // Also load the property detail to open its popup
    loadProperty(attomId);
  }, [setHighlightedProperties, loadProperty, chatMarkers]);

  // Chat panel: view property details (opens Mapbox popup via same flow as parcel click)
  const handleSelectProperty = useCallback((attomId) => {
    loadProperty(attomId);
  }, [loadProperty]);

  // Open workstation with property data
  const handleOpenWorkstation = useCallback((propertyData) => {
    setWorkstationProperty(propertyData);
    setWorkstationOpen(true);
    setRightPanelMode('workstation');
    setActiveWorkstationTab('Overview');
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
    <div ref={contentRef} className="flex-1 flex flex-col overflow-hidden" style={{ background: t.bg.primary }}>
      <div className="flex flex-1 overflow-hidden" style={{ position: 'relative' }}>
        {/* Map — full width */}
        <div className="flex-1 relative">
          <MapContainer
            floodGeoJSON={MOCK_FLOOD_GEOJSON}
            schoolsGeoJSON={MOCK_SCHOOL_GEOJSON}
            visibleLayers={visibleLayers}
            visibleGisLayers={visibleGisLayers}
            gisLayerOpacity={gisLayerOpacity}
            highlightedProperties={highlightedProperties}
            chatMarkers={chatMarkers}
            onParcelClick={handleParcelClick}
            onBoundsChange={setMapBbox}
            selectedAttomId={selectedProperty?.attomId}
            filterHighlightIds={filterHighlightIds}
            activeAssetClasses={activeAssetClasses}
            onPopupOpen={handlePopupOpen}
            onPopupClose={handlePopupClose}
            mapExpandRef={mapExpandRef}
            mapInstanceRef={mapInstanceRef}
            setGisLayerLoading={setGisLayerLoading}
          />

        {/* Floating left panel overlay */}
        <LayersPanel
          onLayerChange={handleLayerChange}
          onFilterChange={handleFilterChange}
          onFilteredIdsChange={handleFilteredIdsChange}
          onAssetClassChange={handleAssetClassChange}
          onGisLayerChange={handleGisLayerChange}
          onGisOpacityChange={handleGisOpacityChange}
          gisLayerOpacity={gisLayerOpacity}
          gisLayerLoading={gisLayerLoading}
          mapRef={mapInstanceRef}
          zIndex={getPanelZ('left')}
          onBringToFront={() => setWorkstationOnTop(false)}
          filterAPIRef={filterAPIRef}
          visibleGisLayers={visibleGisLayers}
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

        {/* Right Panel — Scout AI Chat (visible when mode is chat) */}
        {rightPanelMode === 'chat' && (
          <ScoutGPTChatPanel
            messages={messages}
            loading={chatLoading}
            onSend={handleChatSend}
            onSelectProperty={handleSelectProperty}
            onShowOnMap={handleShowOnMap}
            onHighlightProperties={handleHighlightProperties}
            onNewChat={resetChat}
            onLoadSession={setMessages}
            zIndex={getPanelZ('right')}
            onBringToFront={() => setWorkstationOnTop(false)}
          />
        )}

        {/* Collapsed Chat Strip (visible when workstation is active) */}
        {rightPanelMode === 'workstation' && (
          <button
            onClick={() => setRightPanelMode('chat')}
            style={{
              position: 'fixed',
              right: 0,
              top: headerBottom,
              height: `calc(100vh - ${headerBottom}px)`,
              width: 48,
              zIndex: 64,
              background: t.bg.secondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none',
              borderLeft: `1px solid ${t.border.default}`,
              padding: 0,
            }}
          >
            <span style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontSize: 12,
              fontWeight: 600,
              color: t.text.tertiary,
              fontFamily: t.font.display,
              letterSpacing: '0.05em',
            }}>
              Scout AI
            </span>
          </button>
        )}

        {/* Workstation Panel (right side slide-in) */}
        <WorkstationPanel
          isOpen={workstationOpen && rightPanelMode === 'workstation'}
          onClose={() => {
            setWorkstationOpen(false);
            setRightPanelMode('chat');
          }}
          propertyData={workstationProperty}
          activeTab={activeWorkstationTab}
          onTabChange={setActiveWorkstationTab}
          onOpenChat={() => setRightPanelMode('chat')}
          topOffset={headerBottom}
        />

        {/* Collapsed Workstation Strip (visible when chat is active and workstation has data) */}
        {rightPanelMode === 'chat' && workstationProperty && (
          <button
            onClick={() => {
              setRightPanelMode('workstation');
              setWorkstationOpen(true);
            }}
            style={{
              position: 'fixed',
              right: 0,
              top: headerBottom,
              height: `calc(100vh - ${headerBottom}px)`,
              width: 48,
              zIndex: 54,
              background: t.bg.secondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none',
              borderLeft: `1px solid ${t.border.default}`,
              padding: 0,
            }}
          >
            <span style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontSize: 12,
              fontWeight: 600,
              color: t.text.tertiary,
              fontFamily: t.font.display,
              letterSpacing: '0.05em',
            }}>
              Workstation
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
