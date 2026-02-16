import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { GIS_LAYERS, ZONING_COLORS, FLOOD_COLORS, DIAMETER_ALIASES, fetchGisLayer } from '../../config/gisLayers';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.placeholder';

const AUSTIN_CENTER = [-97.7431, 30.2672];
const INITIAL_ZOOM = 12;

const TILESET_ID = 'bradyirwin.travis-parcels-v2';
const TILESET_LAYER = 'parcels'; // source-layer name from MTS recipe

// Asset class to use_code mapping for tile-side filtering
const ASSET_CLASS_USE_CODES = {
  single_family: [385, 373, 375, 369, 381],
  condo: [401, 366],
  multifamily: [386, 378, 383, 388, 368, 359, 370],
  mixed_use: [155, 358],
  office: [139, 172, 184],
  retail: [169, 167, 148, 166, 194],
  industrial: [238, 135, 171, 175, 210, 229, 212, 231, 220, 280],
  hospitality: [178],
  senior_living: [339],
  land: [120, 270, 117, 109],
  developments: [402, 383],
  special_purpose: [126, 124, 146, 160, 150, 159],
};

// Asset class colors (must match filterAPI.js ASSET_CLASSES)
const ASSET_CLASS_COLORS = {
  single_family: '#4ADE80',
  condo: '#60A5FA',
  multifamily: '#F472B6',
  mixed_use: '#C084FC',
  office: '#38BDF8',
  retail: '#FBBF24',
  industrial: '#FB923C',
  hospitality: '#E879F9',
  senior_living: '#FB7185',
  land: '#A3E635',
  developments: '#2DD4BF',
  special_purpose: '#94A3B8',
};

export default function MapContainer({
  floodGeoJSON,
  schoolsGeoJSON,
  visibleLayers,
  visibleGisLayers,
  highlightedProperties,
  chatMarkers,
  onParcelClick,
  onBoundsChange,
  selectedAttomId,
  filterHighlightIds,
  activeAssetClasses,
  onPopupOpen,
  onPopupClose,
  mapExpandRef,
  mapInstanceRef,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // GIS layer refs
  const gisDataRef = useRef({});
  const gisFetchTimeoutRef = useRef(null);
  const visibleGisLayersRef = useRef(visibleGisLayers);
  const lastFetchBoundsRef = useRef({}); // Track last fetch bounds per layer to reduce spam

  // Handle popup expand — re-pan map to center larger DetailModule
  const handlePopupExpand = () => {
    if (!mapRef.current || !popupRef.current) return;
    const map = mapRef.current;

    // Get the popup's anchor coordinates
    const lngLat = popupRef.current.getLngLat();
    if (!lngLat) return;

    // Calculate offset to center the larger card
    // Card is 780px wide, ~90vh tall
    // Left panel ~370px, right panel ~400px
    // Visible map area: window.innerWidth - 370 - 400
    const leftPanel = 370;
    const rightPanel = 400;
    const visibleHeight = window.innerHeight;

    // We want the CENTER of the card to be at the CENTER of visible area
    // Card anchors at top-center to the parcel point
    // So we need to offset the parcel point down and to the center
    const horizontalOffset = (leftPanel - rightPanel) / 2;
    const verticalOffset = visibleHeight * 0.45; // push parcel toward bottom so card body is centered

    map.flyTo({
      center: [lngLat.lng, lngLat.lat],
      offset: [horizontalOffset, verticalOffset],
      duration: 600,
      essential: true,
    });
  };

  // Expose handlePopupExpand via ref
  if (mapExpandRef) {
    mapExpandRef.current = handlePopupExpand;
  }

  // Keep visibleGisLayersRef in sync (for use in moveend handler)
  useEffect(() => { visibleGisLayersRef.current = visibleGisLayers; }, [visibleGisLayers]);

  // Helper: build diameter-based color expression for utility lines
  function buildDiameterColorExpr(gradient, thresholds) {
    const getExprs = DIAMETER_ALIASES.map(f => ['get', f]);
    const coalesced = ['coalesce', ...getExprs, 0];
    return [
      'interpolate', ['linear'], ['to-number', coalesced, 0],
      0, gradient[0],
      thresholds[0], gradient[0],
      thresholds[1], gradient[1],
      thresholds[2], gradient[2],
      thresholds[3], gradient[3]
    ];
  }

  // Helper: reorder GIS layers to enforce z-order
  // Order (bottom to top): floodplains → zoning → parcels → utility lines
  function reorderGisLayers(map) {
    const zOrder = [
      'gis-floodplains-fill', 'gis-floodplains-outline',
      'gis-zoning_districts-fill', 'gis-zoning_districts-outline',
      // Parcels are added separately and stay in place
      'gis-water_lines-line', 'gis-wastewater_lines-line', 'gis-stormwater_lines-line'
    ];

    // Move utility lines to top (after all parcels)
    const utilityLayers = ['gis-water_lines-line', 'gis-wastewater_lines-line', 'gis-stormwater_lines-line'];
    for (const layerId of utilityLayers) {
      if (map.getLayer(layerId)) {
        map.moveLayer(layerId); // Move to top
      }
    }
  }

  // Helper: add GIS map layers for a given layerKey
  // Note: GIS layers added with z-ordering: flood (bottom) → zoning → parcels → utilities (top)
  function addGisMapLayers(map, layerKey, config) {
    const sourceId = `gis-${layerKey}`;

    if (config.geometryType === 'line') {
      // Utility lines go on TOP (no beforeId = add to top)
      map.addLayer({
        id: `${sourceId}-line`,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': buildDiameterColorExpr(config.gradient, config.thresholds),
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 14, 3, 18, 5],
          'line-opacity': 1.0
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' }
      });
    } else if (config.geometryType === 'fill' && layerKey === 'zoning_districts') {
      // Zoning: use coalesce to try multiple field names
      const zoneValue = ['coalesce',
        ['get', 'ZONING_ZTYPE'], ['get', 'ZONING_ZTYP'], ['get', 'ZONING'],
        ['get', 'ZONE_CODE'], ['get', 'ZONE_DESIG'], ['get', 'ZoningDesignation'],
        ['get', 'ZONING_BASE'], ['get', '_zone_code'], ''
      ];

      // Build match expression for zone colors
      const matchExpr = ['match', zoneValue];
      for (const [code, color] of Object.entries(ZONING_COLORS)) {
        matchExpr.push(code, color);
      }
      matchExpr.push('#6b7280'); // Gray fallback for unknown zones

      // Add below parcels-fill if it exists
      const beforeId = map.getLayer('parcels-fill') ? 'parcels-fill' : undefined;

      map.addLayer({
        id: `${sourceId}-fill`,
        type: 'fill',
        source: sourceId,
        paint: { 'fill-color': matchExpr, 'fill-opacity': 0.35 }
      }, beforeId);
      map.addLayer({
        id: `${sourceId}-outline`,
        type: 'line',
        source: sourceId,
        paint: { 'line-color': '#e2e8f0', 'line-width': 1, 'line-opacity': 0.4 }
      }, beforeId);
    } else if (config.geometryType === 'fill' && layerKey === 'floodplains') {
      // Flood: use coalesce to try multiple field names
      const floodValue = ['coalesce',
        ['get', 'FEMA_FLOOD_ZONE'], ['get', 'FLD_ZONE'], ['get', 'FLOOD_ZONE'],
        ['get', 'ZONE_'], ['get', 'FloodZone'], ['get', '_flood_zone'], ''
      ];

      // Build case expression for flood colors with both exact matches and long string matches
      const colorExpr = ['case',
        // High risk exact matches (100-year floodplain)
        ['in', floodValue, ['literal', ['A', 'AE', 'AH', 'AO', 'V', 'VE', 'AR', 'A99']]], '#ef4444',
        // High risk long string matches (Austin FloodPro)
        ['==', floodValue, 'City of Austin Fully Developed 100-Year Floodplain'], '#ef4444',
        ['==', floodValue, '100-Year Floodplain'], '#ef4444',
        // Moderate risk exact matches (500-year)
        ['in', floodValue, ['literal', ['X500', 'B', 'D', '0.2 PCT']]], '#f97316',
        // Moderate risk long string matches
        ['==', floodValue, 'City of Austin Fully Developed 25-Year Floodplain'], '#f97316',
        ['==', floodValue, '500-Year Floodplain'], '#f97316',
        // Minimal risk exact matches
        ['in', floodValue, ['literal', ['X', 'C']]], '#3b82f6',
        // Unknown/unmatched = completely transparent (don't render)
        'rgba(0,0,0,0)'
      ];

      // Floodplains go at the BOTTOM - below zoning if it exists, otherwise below parcels
      const zoningFill = map.getLayer('gis-zoning_districts-fill');
      const beforeId = zoningFill ? 'gis-zoning_districts-fill' :
                       (map.getLayer('parcels-fill') ? 'parcels-fill' : undefined);

      map.addLayer({
        id: `${sourceId}-fill`,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': colorExpr,
          'fill-opacity': ['case',
            ['in', floodValue, ['literal', ['A', 'AE', 'AH', 'AO', 'V', 'VE', 'AR', 'A99']]], 0.4,
            ['==', floodValue, 'City of Austin Fully Developed 100-Year Floodplain'], 0.4,
            ['in', floodValue, ['literal', ['X500', 'B', 'D']]], 0.3,
            ['in', floodValue, ['literal', ['X', 'C']]], 0.15,
            0 // Transparent for unmatched
          ]
        }
      }, beforeId);
      map.addLayer({
        id: `${sourceId}-outline`,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': colorExpr,
          'line-width': 1,
          'line-opacity': ['case',
            ['in', floodValue, ['literal', ['A', 'AE', 'AH', 'AO', 'V', 'VE', 'AR', 'A99']]], 0.5,
            ['==', floodValue, 'City of Austin Fully Developed 100-Year Floodplain'], 0.5,
            ['in', floodValue, ['literal', ['X500', 'B', 'D']]], 0.4,
            ['in', floodValue, ['literal', ['X', 'C']]], 0.25,
            0 // Transparent for unmatched
          ]
        }
      }, beforeId);
    }

    // After adding, reorder to enforce z-order
    reorderGisLayers(map);
  }

  // Helper: remove GIS map layers for a given layerKey
  function removeGisMapLayers(map, layerKey) {
    const sourceId = `gis-${layerKey}`;
    for (const suffix of ['-line', '-fill', '-outline']) {
      if (map.getLayer(sourceId + suffix)) map.removeLayer(sourceId + suffix);
    }
    if (map.getSource(sourceId)) map.removeSource(sourceId);
  }

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/bradyirwin/cmlpnkhcm007z01sf0vaxfpm8',
      center: AUSTIN_CENTER,
      zoom: INITIAL_ZOOM,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

    // Expose map instance to parent via ref
    if (mapInstanceRef) {
      mapInstanceRef.current = map;
    }

    map.on('load', () => {
      // --- PARCEL BOUNDARIES FROM VECTOR TILESET ---
      map.addSource('parcels', {
        type: 'vector',
        url: `mapbox://${TILESET_ID}`,
        generateId: true,
      });

      // Base fill — transparent but receives click events (filter controls visibility)
      map.addLayer({
        id: 'parcels-fill',
        type: 'fill',
        source: 'parcels',
        'source-layer': TILESET_LAYER,
        paint: {
          'fill-color': '#000000',
          'fill-opacity': 0, // Transparent — click target only
        },
      });

      // Asset class coloring layer — shows colored parcels when asset filters active
      map.addLayer({
        id: 'parcels-asset-fill',
        type: 'fill',
        source: 'parcels',
        'source-layer': TILESET_LAYER,
        filter: ['==', ['get', 'use_code'], -9999], // Initially hidden (no match)
        paint: {
          'fill-color': '#888888', // Will be updated dynamically
          'fill-opacity': 0.4,
        },
      });

      // Asset class outline layer — color matches fill (updated dynamically)
      map.addLayer({
        id: 'parcels-asset-outline',
        type: 'line',
        source: 'parcels',
        'source-layer': TILESET_LAYER,
        filter: ['==', ['get', 'use_code'], -9999], // Initially hidden
        paint: {
          'line-color': '#888888', // Will be updated dynamically to match fill
          'line-width': 1.5,
          'line-opacity': 0.8,
        },
      });

      // --- FILTER HIGHLIGHT LAYERS (green/teal) — below highlight/selected ---
      map.addLayer({
        id: 'parcels-filter-fill',
        type: 'fill',
        source: 'parcels',
        'source-layer': TILESET_LAYER,
        paint: {
          'fill-color': '#1877F2',
          'fill-opacity': 0.35,
        },
        filter: ['in', ['get', 'attom_id'], ['literal', []]],
      });

      map.addLayer({
        id: 'parcels-filter-outline',
        type: 'line',
        source: 'parcels',
        'source-layer': TILESET_LAYER,
        paint: {
          'line-color': '#1877F2',
          'line-width': 2,
          'line-opacity': 0.9,
        },
        filter: ['in', ['get', 'attom_id'], ['literal', []]],
      });

      // Highlight fill — chat results (red) — above filter layers
      map.addLayer({
        id: 'parcels-highlight-fill',
        type: 'fill',
        source: 'parcels',
        'source-layer': TILESET_LAYER,
        filter: ['==', ['get', 'attom_id'], -1],
        paint: {
          'fill-color': '#ef4444',
          'fill-opacity': 0.15,
        },
      });

      // Highlight outline — chat results (red)
      map.addLayer({
        id: 'parcels-highlight-outline',
        type: 'line',
        source: 'parcels',
        'source-layer': TILESET_LAYER,
        filter: ['==', ['get', 'attom_id'], -1],
        paint: {
          'line-color': '#ef4444',
          'line-width': 2.5,
          'line-opacity': 0.9,
        },
      });

      // Selected fill — clicked parcel (red) — ON TOP
      map.addLayer({
        id: 'parcels-selected-fill',
        type: 'fill',
        source: 'parcels',
        'source-layer': TILESET_LAYER,
        filter: ['==', ['get', 'attom_id'], -1],
        paint: {
          'fill-color': '#ef4444',
          'fill-opacity': 0.25,
        },
      });

      // Selected outline — clicked parcel (red) — ON TOP
      map.addLayer({
        id: 'parcels-selected-outline',
        type: 'line',
        source: 'parcels',
        'source-layer': TILESET_LAYER,
        filter: ['==', ['get', 'attom_id'], -1],
        paint: {
          'line-color': '#ef4444',
          'line-width': 2.5,
          'line-opacity': 1,
        },
      });

      // --- CHAT RESULT MARKERS (GeoJSON points) ---
      map.addSource('chat-markers', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Red circle marker
      map.addLayer({
        id: 'chat-markers-circle',
        type: 'circle',
        source: 'chat-markers',
        paint: {
          'circle-radius': 7,
          'circle-color': '#ef4444',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        },
      });

      // White inner dot for pin effect
      map.addLayer({
        id: 'chat-markers-dot',
        type: 'circle',
        source: 'chat-markers',
        paint: {
          'circle-radius': 3,
          'circle-color': '#ffffff',
          'circle-opacity': 0.9,
        },
      });

      // Click handler for chat markers
      map.on('click', 'chat-markers-circle', (e) => {
        if (e.features && e.features.length > 0) {
          const attomId = e.features[0].properties.attomId;
          if (attomId && onParcelClick) {
            onParcelClick(Number(attomId));

            if (popupRef.current) {
              popupRef.current.remove();
              popupRef.current = null;
            }

            const container = document.createElement('div');
            const lngLat = [e.lngLat.lng, e.lngLat.lat];

            const popup = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
              maxWidth: '800px',
              anchor: 'bottom',
              offset: 15,
              className: 'scout-popup',
            })
              .setLngLat(lngLat)
              .setDOMContent(container)
              .addTo(map);

            popup.on('close', () => {
              popupRef.current = null;
              if (onPopupClose) onPopupClose();
            });

            popupRef.current = popup;
            if (onPopupOpen) onPopupOpen(container, lngLat);

            const leftPanel = 370;
            const rightPanel = 400;
            const horizontalOffset = (leftPanel - rightPanel) / 2;
            const verticalOffset = 100;
            map.flyTo({ center: lngLat, zoom: Math.max(map.getZoom(), 16), duration: 800, offset: [horizontalOffset, verticalOffset] });
          }
        }
      });

      map.on('mouseenter', 'chat-markers-circle', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'chat-markers-circle', () => {
        map.getCanvas().style.cursor = '';
      });

      // Hover cursor
      map.on('mouseenter', 'parcels-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'parcels-fill', () => {
        map.getCanvas().style.cursor = '';
      });

      // Click handler — get attom_id from clicked parcel and open popup
      map.on('click', 'parcels-fill', (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          console.log('[MAP] Clicked feature:', feature.properties);
          const attomId = feature.properties.attom_id;
          if (attomId != null && onParcelClick) {
            onParcelClick(Number(attomId));
          }

          // Close existing popup
          if (popupRef.current) {
            popupRef.current.remove();
            popupRef.current = null;
          }

          // Create popup DOM container
          const container = document.createElement('div');

          const lngLat = [e.lngLat.lng, e.lngLat.lat];

          const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            maxWidth: '800px',
            anchor: 'bottom',
            offset: 15,
            className: 'scout-popup',
          })
            .setLngLat(lngLat)
            .setDOMContent(container)
            .addTo(map);

          popup.on('close', () => {
            popupRef.current = null;
            if (onPopupClose) onPopupClose();
          });

          popupRef.current = popup;
          if (onPopupOpen) onPopupOpen(container, lngLat);

          // Calculate offset to center parcel+popup in visible area between panels
          // Left panel ~370px, right panel ~400px → shift right by half the difference
          const leftPanel = 370;
          const rightPanel = 400;
          const horizontalOffset = (leftPanel - rightPanel) / 2;
          // Popup is ~200px tall above parcel, shift down so both are centered
          const verticalOffset = 100;

          map.flyTo({
            center: lngLat,
            zoom: Math.max(map.getZoom(), 16),
            duration: 800,
            offset: [horizontalOffset, verticalOffset],
          });
        }
      });

      // Emit initial bounds
      if (onBoundsChange) {
        const bounds = map.getBounds();
        onBoundsChange({
          west: bounds.getWest(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          north: bounds.getNorth(),
        });
      }

      setMapLoaded(true);
    });

    // Emit bounds on viewport change
    map.on('moveend', () => {
      if (onBoundsChange) {
        const bounds = map.getBounds();
        onBoundsChange({
          west: bounds.getWest(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          north: bounds.getNorth(),
        });
      }

      // Re-fetch active GIS layers on viewport change (debounced, with viewport change threshold)
      clearTimeout(gisFetchTimeoutRef.current);
      gisFetchTimeoutRef.current = setTimeout(() => {
        const currentGisLayers = visibleGisLayersRef.current;
        if (!currentGisLayers) return;
        const currentBounds = map.getBounds();

        for (const [layerKey, isVisible] of Object.entries(currentGisLayers)) {
          if (!isVisible) continue;

          // Check if viewport has changed significantly (>20%) since last fetch
          const lastBounds = lastFetchBoundsRef.current[layerKey];
          if (lastBounds) {
            const lastWidth = lastBounds.getEast() - lastBounds.getWest();
            const lastHeight = lastBounds.getNorth() - lastBounds.getSouth();
            const currWidth = currentBounds.getEast() - currentBounds.getWest();
            const currHeight = currentBounds.getNorth() - currentBounds.getSouth();

            // Calculate overlap percentage
            const overlapWest = Math.max(lastBounds.getWest(), currentBounds.getWest());
            const overlapEast = Math.min(lastBounds.getEast(), currentBounds.getEast());
            const overlapSouth = Math.max(lastBounds.getSouth(), currentBounds.getSouth());
            const overlapNorth = Math.min(lastBounds.getNorth(), currentBounds.getNorth());

            if (overlapEast > overlapWest && overlapNorth > overlapSouth) {
              const overlapArea = (overlapEast - overlapWest) * (overlapNorth - overlapSouth);
              const currArea = currWidth * currHeight;
              const overlapRatio = overlapArea / currArea;

              // Skip re-fetch if >80% overlap (viewport changed <20%)
              // Use stricter threshold for expensive layers like floodplains
              const threshold = (layerKey === 'floodplains') ? 0.7 : 0.8;
              if (overlapRatio > threshold) {
                continue;
              }
            }
          }

          const sourceId = `gis-${layerKey}`;
          lastFetchBoundsRef.current[layerKey] = currentBounds;

          fetchGisLayer(layerKey, currentBounds).then(geojson => {
            if (!geojson || !mapRef.current) return;
            const m = mapRef.current;
            const src = m.getSource(sourceId);
            if (src) {
              src.setData(geojson);
              gisDataRef.current[layerKey] = geojson;
            }
          }).catch(() => {});
        }
      }, 500);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Toggle parcel visibility (includes Studio style 'parcels' layer + code layers)
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;
    const isVisible = visibleLayers?.parcels !== false;
    const vis = isVisible ? 'visible' : 'none';

    // All parcel-related layers to toggle
    // 'parcels' = Studio style layer (base boundary rendering from MTS)
    // 'parcels-fill' = transparent click target
    // Others = interactive highlighting layers
    const parcelLayers = [
      'parcels',  // Studio style layer (base boundary rendering)
      'parcels-fill',
      'parcels-asset-fill', 'parcels-asset-outline',
      'parcels-filter-fill', 'parcels-filter-outline',
      'parcels-highlight-fill', 'parcels-highlight-outline',
      'parcels-selected-fill', 'parcels-selected-outline',
      'chat-markers-circle', 'chat-markers-dot',
    ];
    parcelLayers.forEach(id => {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', vis);
      }
    });
  }, [mapLoaded, visibleLayers?.parcels]);

  // Flood zone layer (GeoJSON from API) - bypass if ArcGIS floodplains is active
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    // Only use Neon flood if ArcGIS floodplains is NOT active
    if (visibleGisLayers?.floodplains) return;
    const map = mapRef.current;

    if (floodGeoJSON && !map.getSource('flood')) {
      map.addSource('flood', { type: 'geojson', data: floodGeoJSON });

      map.addLayer({
        id: 'flood-fill',
        type: 'fill',
        source: 'flood',
        paint: {
          'fill-color': [
            'case',
            ['==', ['get', 'is_sfha'], true], '#0ea5e9',
            '#38bdf8',
          ],
          'fill-opacity': 0.2,
        },
        layout: { visibility: 'none' },
      }, 'parcels-fill');

      map.addLayer({
        id: 'flood-outline',
        type: 'line',
        source: 'flood',
        paint: {
          'line-color': '#0ea5e9',
          'line-width': 1.5,
          'line-dasharray': [3, 2],
          'line-opacity': 0.6,
        },
        layout: { visibility: 'none' },
      }, 'parcels-fill');
    } else if (floodGeoJSON && map.getSource('flood')) {
      map.getSource('flood').setData(floodGeoJSON);
    }
  }, [mapLoaded, floodGeoJSON, visibleGisLayers?.floodplains]);

  // Toggle flood visibility - bypass if ArcGIS floodplains is active
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    // Only use Neon flood if ArcGIS floodplains is NOT active
    if (visibleGisLayers?.floodplains) return;
    const map = mapRef.current;
    const vis = visibleLayers?.flood ? 'visible' : 'none';
    if (map.getLayer('flood-fill')) map.setLayoutProperty('flood-fill', 'visibility', vis);
    if (map.getLayer('flood-outline')) map.setLayoutProperty('flood-outline', 'visibility', vis);
  }, [mapLoaded, visibleLayers?.flood, visibleGisLayers?.floodplains]);

  // School district layer (GeoJSON from API)
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    if (schoolsGeoJSON && !map.getSource('schools')) {
      map.addSource('schools', { type: 'geojson', data: schoolsGeoJSON });

      map.addLayer({
        id: 'schools-fill',
        type: 'fill',
        source: 'schools',
        paint: {
          'fill-color': '#a855f7',
          'fill-opacity': 0.08,
        },
        layout: { visibility: 'none' },
      }, 'parcels-fill');

      map.addLayer({
        id: 'schools-outline',
        type: 'line',
        source: 'schools',
        paint: {
          'line-color': '#a855f7',
          'line-width': 2,
          'line-opacity': 0.5,
        },
        layout: { visibility: 'none' },
      }, 'parcels-fill');

      map.addLayer({
        id: 'schools-label',
        type: 'symbol',
        source: 'schools',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 12,
          'text-anchor': 'center',
          visibility: 'none',
        },
        paint: {
          'text-color': '#c084fc',
          'text-halo-color': '#0a0f1a',
          'text-halo-width': 2,
        },
      });
    } else if (schoolsGeoJSON && map.getSource('schools')) {
      map.getSource('schools').setData(schoolsGeoJSON);
    }
  }, [mapLoaded, schoolsGeoJSON]);

  // Toggle school visibility
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;
    const vis = visibleLayers?.schools ? 'visible' : 'none';
    if (map.getLayer('schools-fill')) map.setLayoutProperty('schools-fill', 'visibility', vis);
    if (map.getLayer('schools-outline')) map.setLayoutProperty('schools-outline', 'visibility', vis);
    if (map.getLayer('schools-label')) map.setLayoutProperty('schools-label', 'visibility', vis);
  }, [mapLoaded, visibleLayers?.schools]);

  // Handle GIS layer toggle changes
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    if (!visibleGisLayers) return;

    for (const [layerKey, isVisible] of Object.entries(visibleGisLayers)) {
      const config = GIS_LAYERS[layerKey];
      if (!config) continue;
      const sourceId = `gis-${layerKey}`;

      if (isVisible && !map.getSource(sourceId)) {
        // Toggle ON — fetch and add
        fetchGisLayer(layerKey, map.getBounds()).then(geojson => {
          if (!geojson || !mapRef.current) return;
          // Check it's still supposed to be visible (user might have toggled off during fetch)
          if (!visibleGisLayersRef.current?.[layerKey]) return;
          const m = mapRef.current;
          if (m.getSource(sourceId)) return; // already added
          gisDataRef.current[layerKey] = geojson;
          m.addSource(sourceId, { type: 'geojson', data: geojson });
          addGisMapLayers(m, layerKey, config);
        }).catch(err => console.warn(`[GIS] Error loading ${layerKey}:`, err));
      } else if (!isVisible && map.getSource(sourceId)) {
        // Toggle OFF — remove
        removeGisMapLayers(map, layerKey);
        delete gisDataRef.current[layerKey];
      }
    }
  }, [mapLoaded, visibleGisLayers]);

  // Highlight properties from chat results (filter-based — attom_id is numeric in tiles)
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    if (highlightedProperties && highlightedProperties.length > 0) {
      // attom_id is a number in the vector tiles — use numbers only (no mixed types)
      const ids = highlightedProperties.map(Number);
      const filter = ['in', ['get', 'attom_id'], ['literal', ids]];
      console.log('[MAP] Highlighting', ids.length, 'properties, filter:', JSON.stringify(filter).substring(0, 120));
      if (map.getLayer('parcels-highlight-fill')) map.setFilter('parcels-highlight-fill', filter);
      if (map.getLayer('parcels-highlight-outline')) map.setFilter('parcels-highlight-outline', filter);
    } else {
      console.log('[MAP] Clearing highlights');
      const noMatch = ['==', ['get', 'attom_id'], -1];
      if (map.getLayer('parcels-highlight-fill')) map.setFilter('parcels-highlight-fill', noMatch);
      if (map.getLayer('parcels-highlight-outline')) map.setFilter('parcels-highlight-outline', noMatch);
    }
  }, [mapLoaded, highlightedProperties]);

  // Filter-highlight from left panel data filters
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    if (filterHighlightIds && filterHighlightIds.length > 0) {
      // Include both string and number variants for type safety
      const ids = filterHighlightIds.flatMap(id => [Number(id), String(id)]);
      const filterExpr = ['in', ['get', 'attom_id'], ['literal', ids]];
      if (map.getLayer('parcels-filter-fill')) map.setFilter('parcels-filter-fill', filterExpr);
      if (map.getLayer('parcels-filter-outline')) map.setFilter('parcels-filter-outline', filterExpr);
    } else {
      // No filters active — hide filter layers
      const emptyFilter = ['in', ['get', 'attom_id'], ['literal', []]];
      if (map.getLayer('parcels-filter-fill')) map.setFilter('parcels-filter-fill', emptyFilter);
      if (map.getLayer('parcels-filter-outline')) map.setFilter('parcels-filter-outline', emptyFilter);
    }
  }, [mapLoaded, filterHighlightIds]);

  // Asset class coloring — tile-side filtering by use_code
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    if (activeAssetClasses && activeAssetClasses.length > 0) {
      // Build list of all use_codes for selected asset classes
      const useCodes = activeAssetClasses.flatMap(ac => ASSET_CLASS_USE_CODES[ac] || []);

      // Build filter: show parcels with matching use_codes
      const filterExpr = ['in', ['get', 'use_code'], ['literal', useCodes]];

      // Build color expression: match use_code to asset class color
      const colorExpr = ['case'];
      activeAssetClasses.forEach(ac => {
        const codes = ASSET_CLASS_USE_CODES[ac] || [];
        const color = ASSET_CLASS_COLORS[ac] || '#888888';
        if (codes.length > 0) {
          colorExpr.push(['in', ['get', 'use_code'], ['literal', codes]]);
          colorExpr.push(color);
        }
      });
      colorExpr.push('#888888'); // fallback

      // Update fill layer
      if (map.getLayer('parcels-asset-fill')) {
        map.setFilter('parcels-asset-fill', filterExpr);
        map.setPaintProperty('parcels-asset-fill', 'fill-color', colorExpr);
      }

      // Update outline layer (same filter, matching color)
      if (map.getLayer('parcels-asset-outline')) {
        map.setFilter('parcels-asset-outline', filterExpr);
        map.setPaintProperty('parcels-asset-outline', 'line-color', colorExpr);
      }

      console.log('[MAP] Asset class filter active:', activeAssetClasses, 'use_codes:', useCodes.length);
    } else {
      // No asset class filters — hide asset layers
      const noMatch = ['==', ['get', 'use_code'], -9999];
      if (map.getLayer('parcels-asset-fill')) map.setFilter('parcels-asset-fill', noMatch);
      if (map.getLayer('parcels-asset-outline')) map.setFilter('parcels-asset-outline', noMatch);
      console.log('[MAP] Asset class filter cleared');
    }
  }, [mapLoaded, activeAssetClasses]);

  // Close popup when property is deselected
  useEffect(() => {
    if (selectedAttomId == null && popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
  }, [selectedAttomId]);

  // Selected parcel (filter-based — attom_id is numeric in tiles)
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    if (selectedAttomId != null) {
      const filter = ['==', ['get', 'attom_id'], Number(selectedAttomId)];
      if (map.getLayer('parcels-selected-fill')) map.setFilter('parcels-selected-fill', filter);
      if (map.getLayer('parcels-selected-outline')) map.setFilter('parcels-selected-outline', filter);
    } else {
      const noMatch = ['==', ['get', 'attom_id'], -1];
      if (map.getLayer('parcels-selected-fill')) map.setFilter('parcels-selected-fill', noMatch);
      if (map.getLayer('parcels-selected-outline')) map.setFilter('parcels-selected-outline', noMatch);
    }
  }, [mapLoaded, selectedAttomId]);

  // Update chat marker points
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;
    const source = map.getSource('chat-markers');
    if (!source) return;

    if (chatMarkers && chatMarkers.length > 0) {
      const geojson = {
        type: 'FeatureCollection',
        features: chatMarkers
          .filter(m => m.latitude && m.longitude)
          .map(m => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [Number(m.longitude), Number(m.latitude)],
            },
            properties: { attomId: m.attomId },
          })),
      };
      source.setData(geojson);
      console.log('[MAP] Set', geojson.features.length, 'chat markers');
    } else {
      source.setData({ type: 'FeatureCollection', features: [] });
    }
  }, [mapLoaded, chatMarkers]);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}
