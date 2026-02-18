import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { GIS_LAYERS, ZONING_CATEGORY_COLORS, FLOOD_COLORS, FLOOD_OPACITY, DIAMETER_ALIASES, fetchGisLayer } from '../../config/gisLayers';

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
  gisLayerOpacity,
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
  const gisFetchingRef = useRef({}); // Track in-progress fetches per layer
  const lastBoundsKeyRef = useRef({}); // Track last fetch bounds key per layer (string comparison)

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

  // Helper: coalesce all diameter field aliases with default fallback
  function getDiameterExpr(defaultVal = 8) {
    const getExprs = DIAMETER_ALIASES.map(f => ['get', f]);
    return ['to-number', ['coalesce', ...getExprs, defaultVal], defaultVal];
  }

  // Helper: build diameter-scaled line width expression (varies by zoom AND diameter)
  function buildDiameterWidthExpr() {
    const diam = getDiameterExpr(8);
    return [
      'interpolate', ['linear'], ['zoom'],
      10, ['interpolate', ['linear'], diam,
        2, 0.5,    // 2" pipe → 0.5px at z10
        8, 1,      // 8" pipe → 1px at z10
        16, 1.5,   // 16" pipe → 1.5px at z10
        36, 2.5,   // 36" pipe → 2.5px at z10
        60, 3.5    // 60" pipe → 3.5px at z10
      ],
      14, ['interpolate', ['linear'], diam,
        2, 1,
        8, 2,
        16, 3,
        36, 5,
        60, 7
      ],
      18, ['interpolate', ['linear'], diam,
        2, 2,
        8, 3,
        16, 5,
        36, 8,
        60, 12
      ]
    ];
  }

  // Helper: build diameter-based color gradient for each utility type
  function buildDiameterColorExpr(layerKey) {
    const diam = getDiameterExpr(8);

    // Water lines: blue family (light → dark)
    if (layerKey === 'water_lines') {
      return [
        'interpolate', ['linear'], diam,
        2, '#93c5fd',   // small → light blue
        8, '#3b82f6',   // medium → blue
        16, '#2563eb',  // large → darker blue
        36, '#1d4ed8',  // major → deep blue
        60, '#1e3a8a'   // transmission → navy
      ];
    }

    // Wastewater/sewer lines: green family (light → dark)
    if (layerKey === 'wastewater_lines') {
      return [
        'interpolate', ['linear'], diam,
        2, '#86efac',   // small → light green
        8, '#22c55e',   // medium → green
        16, '#16a34a',  // large → darker green
        36, '#15803d',  // major → deep green
        60, '#14532d'   // trunk → forest
      ];
    }

    // Stormwater lines: cyan family (light → dark)
    if (layerKey === 'stormwater_lines') {
      return [
        'interpolate', ['linear'], diam,
        2, '#67e8f9',   // small → light cyan
        8, '#06b6d4',   // medium → cyan
        16, '#0891b2',  // large → darker cyan
        36, '#0e7490',  // major → deep cyan
        60, '#164e63'   // trunk → dark teal
      ];
    }

    // Fallback
    return '#888888';
  }

  // Ref for utility line hover popup (one at a time)
  const utilityPopupRef = useRef(null);

  // Ref for polygon (zoning/flood) hover popup
  const polygonPopupRef = useRef(null);

  // Helper: add hover handlers for utility line layers
  function addUtilityLineHover(map, layerId, layerKey) {
    // Get friendly name for layer type
    const layerNames = {
      water_lines: 'Water',
      wastewater_lines: 'Sewer',
      stormwater_lines: 'Storm'
    };
    const layerName = layerNames[layerKey] || 'Utility';

    map.on('mouseenter', layerId, (e) => {
      map.getCanvas().style.cursor = 'pointer';

      if (e.features && e.features.length > 0) {
        const props = e.features[0].properties;

        // Extract diameter from any of the aliases
        let diameter = null;
        for (const alias of DIAMETER_ALIASES) {
          if (props[alias] != null && props[alias] !== '' && props[alias] !== 0) {
            diameter = props[alias];
            break;
          }
        }

        // Extract material from common field names (include lowercase for Neon API)
        const materialAliases = ['material', 'MATERIAL', 'PIPE_MATERIAL', 'PIPEMATERIAL', 'MAT', 'PIPE_MAT'];
        let material = null;
        for (const alias of materialAliases) {
          if (props[alias] != null && props[alias] !== '') {
            material = String(props[alias]).toUpperCase();
            break;
          }
        }

        // Extract source
        const source = props.source || '';

        // Build popup content
        const diamText = diameter != null ? `${diameter}"` : 'Unknown';
        const matText = material ? ` • ${material}` : '';
        const sourceText = source ? `<div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">${source}</div>` : '';

        // Remove existing utility popup
        if (utilityPopupRef.current) {
          utilityPopupRef.current.remove();
          utilityPopupRef.current = null;
        }

        // Create popup
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          className: 'utility-popup',
          offset: 10,
        })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="
              background: rgba(15, 23, 42, 0.95);
              border: 1px solid rgba(99, 102, 241, 0.4);
              border-radius: 6px;
              padding: 8px 12px;
              font-family: 'DM Sans', sans-serif;
              color: #e2e8f0;
              font-size: 12px;
              white-space: nowrap;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            ">
              <div style="font-weight: 600; color: #a5b4fc; margin-bottom: 2px;">${layerName} Main</div>
              <div style="font-family: 'JetBrains Mono', monospace;">⌀ ${diamText}${matText}</div>
              ${sourceText}
            </div>
          `)
          .addTo(map);

        utilityPopupRef.current = popup;
      }
    });

    map.on('mousemove', layerId, (e) => {
      // Update popup position as mouse moves along the line
      if (utilityPopupRef.current && e.lngLat) {
        utilityPopupRef.current.setLngLat(e.lngLat);
      }
    });

    map.on('mouseleave', layerId, () => {
      map.getCanvas().style.cursor = '';
      if (utilityPopupRef.current) {
        utilityPopupRef.current.remove();
        utilityPopupRef.current = null;
      }
    });
  }

  // Helper: add hover handlers for zoning district layers
  function addZoningHover(map, fillLayerId) {
    map.on('mouseenter', fillLayerId, (e) => {
      map.getCanvas().style.cursor = 'pointer';

      if (e.features && e.features.length > 0) {
        const props = e.features[0].properties;
        const zoneCode = props.zone_code || props._zone_category || 'Unknown';
        const zoneCategory = props.zone_category || props._zone_category || '';
        const source = props.source || '';

        // Remove existing polygon popup
        if (polygonPopupRef.current) {
          polygonPopupRef.current.remove();
          polygonPopupRef.current = null;
        }

        // Build popup content
        const sourceText = source ? `<div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">${source}</div>` : '';

        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          className: 'gis-polygon-popup',
          offset: 10,
        })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="
              background: rgba(15, 23, 42, 0.95);
              border: 1px solid rgba(236, 72, 153, 0.4);
              border-radius: 6px;
              padding: 8px 12px;
              font-family: 'DM Sans', sans-serif;
              color: #e2e8f0;
              font-size: 12px;
              white-space: nowrap;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            ">
              <div style="font-weight: 600; color: #f472b6; margin-bottom: 2px;">Zoning</div>
              <div style="font-family: 'JetBrains Mono', monospace; font-weight: 500;">${zoneCode}</div>
              ${zoneCategory && zoneCategory !== zoneCode ? `<div style="color: #94a3b8; font-size: 11px;">${zoneCategory}</div>` : ''}
              ${sourceText}
            </div>
          `)
          .addTo(map);

        polygonPopupRef.current = popup;
      }
    });

    map.on('mousemove', fillLayerId, (e) => {
      if (polygonPopupRef.current && e.lngLat) {
        polygonPopupRef.current.setLngLat(e.lngLat);
      }
    });

    map.on('mouseleave', fillLayerId, () => {
      map.getCanvas().style.cursor = '';
      if (polygonPopupRef.current) {
        polygonPopupRef.current.remove();
        polygonPopupRef.current = null;
      }
    });
  }

  // Helper: add hover handlers for floodplain layers
  function addFloodHover(map, fillLayerId) {
    map.on('mouseenter', fillLayerId, (e) => {
      map.getCanvas().style.cursor = 'pointer';

      if (e.features && e.features.length > 0) {
        const props = e.features[0].properties;
        const floodZone = props.flood_zone || props._flood_zone || 'Unknown';
        const isSfha = props.is_sfha;
        const source = props.source || '';

        // Remove existing polygon popup
        if (polygonPopupRef.current) {
          polygonPopupRef.current.remove();
          polygonPopupRef.current = null;
        }

        // Determine SFHA status text
        const sfhaText = isSfha ? '⚠ SFHA (High Risk)' : 'Non-SFHA';
        const sfhaColor = isSfha ? '#fbbf24' : '#94a3b8';

        // Build popup content
        const sourceText = source ? `<div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">${source}</div>` : '';

        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          className: 'gis-polygon-popup',
          offset: 10,
        })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="
              background: rgba(15, 23, 42, 0.95);
              border: 1px solid rgba(239, 68, 68, 0.4);
              border-radius: 6px;
              padding: 8px 12px;
              font-family: 'DM Sans', sans-serif;
              color: #e2e8f0;
              font-size: 12px;
              white-space: nowrap;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              max-width: 280px;
            ">
              <div style="font-weight: 600; color: #f87171; margin-bottom: 2px;">Flood Zone</div>
              <div style="font-family: 'JetBrains Mono', monospace; font-weight: 500; white-space: normal; word-wrap: break-word;">${floodZone}</div>
              <div style="color: ${sfhaColor}; font-size: 11px; margin-top: 2px;">${sfhaText}</div>
              ${sourceText}
            </div>
          `)
          .addTo(map);

        polygonPopupRef.current = popup;
      }
    });

    map.on('mousemove', fillLayerId, (e) => {
      if (polygonPopupRef.current && e.lngLat) {
        polygonPopupRef.current.setLngLat(e.lngLat);
      }
    });

    map.on('mouseleave', fillLayerId, () => {
      map.getCanvas().style.cursor = '';
      if (polygonPopupRef.current) {
        polygonPopupRef.current.remove();
        polygonPopupRef.current = null;
      }
    });
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
      const layerId = `${sourceId}-line`;

      // Utility lines go on TOP (no beforeId = add to top)
      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': buildDiameterColorExpr(layerKey),
          'line-width': buildDiameterWidthExpr(),
          'line-opacity': 0.85
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' }
      });

      // Add hover popup for utility line details
      addUtilityLineHover(map, layerId, layerKey);
    } else if (config.geometryType === 'fill' && layerKey === 'zoning_districts') {
      // Zoning: use _zone_category (normalized during GeoJSON conversion)
      const categoryValue = ['get', '_zone_category'];

      // Build match expression for category colors
      const colorExpr = ['match', categoryValue];
      for (const [category, color] of Object.entries(ZONING_CATEGORY_COLORS)) {
        colorExpr.push(category, color);
      }
      colorExpr.push('#475569'); // Slate fallback for unknown

      // Add below parcels-fill if it exists
      const beforeId = map.getLayer('parcels-fill') ? 'parcels-fill' : undefined;

      map.addLayer({
        id: `${sourceId}-fill`,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': colorExpr,
          'fill-opacity': 0.25  // Reduced from 0.35 — lets parcels show through
        }
      }, beforeId);
      map.addLayer({
        id: `${sourceId}-outline`,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': colorExpr,  // Match fill color instead of static white
          'line-width': 1,
          'line-opacity': 0.5
        }
      }, beforeId);

      // Add hover popup for zoning district details
      addZoningHover(map, `${sourceId}-fill`);
    } else if (config.geometryType === 'fill' && layerKey === 'floodplains') {
      // Flood: use _flood_zone (normalized during GeoJSON conversion)
      const floodValue = ['get', '_flood_zone'];

      // Build match expression for flood colors using normalized codes
      const colorExpr = ['match', floodValue];
      for (const [code, color] of Object.entries(FLOOD_COLORS)) {
        colorExpr.push(code, color);
      }
      colorExpr.push('#475569'); // Slate fallback

      // Build match expression for flood opacity
      const opacityExpr = ['match', floodValue];
      for (const [code, opacity] of Object.entries(FLOOD_OPACITY)) {
        opacityExpr.push(code, opacity);
      }
      opacityExpr.push(0.15); // Fallback opacity

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
          'fill-opacity': opacityExpr
        }
      }, beforeId);
      map.addLayer({
        id: `${sourceId}-outline`,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': colorExpr,
          'line-width': 1,
          'line-opacity': 0.5  // Consistent outline opacity
        }
      }, beforeId);

      // Add hover popup for floodplain details
      addFloodHover(map, `${sourceId}-fill`);
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

      // Re-fetch active GIS layers on viewport change (debounced, with bounds-change + in-progress guards)
      clearTimeout(gisFetchTimeoutRef.current);
      gisFetchTimeoutRef.current = setTimeout(() => {
        const currentGisLayers = visibleGisLayersRef.current;
        if (!currentGisLayers) return;
        const currentBounds = map.getBounds();

        // Build bounds key (3 decimal places = ~100m precision) for change detection
        const boundsKey = `${currentBounds.getWest().toFixed(3)},${currentBounds.getSouth().toFixed(3)},${currentBounds.getEast().toFixed(3)},${currentBounds.getNorth().toFixed(3)}`;

        for (const [layerKey, isVisible] of Object.entries(currentGisLayers)) {
          if (!isVisible) continue;

          // Skip if fetch already in progress for this layer
          if (gisFetchingRef.current[layerKey]) {
            console.log(`[GIS] Skipping ${layerKey} - fetch already in progress`);
            continue;
          }

          // Skip if bounds haven't changed significantly (same key = same viewport)
          if (lastBoundsKeyRef.current[layerKey] === boundsKey) {
            continue;
          }

          const sourceId = `gis-${layerKey}`;

          // Mark fetch as in-progress
          gisFetchingRef.current[layerKey] = true;

          fetchGisLayer(layerKey, currentBounds).then(geojson => {
            if (!geojson || !mapRef.current) return;
            // Check layer is still visible (user might have toggled off during fetch)
            if (!visibleGisLayersRef.current?.[layerKey]) return;
            const m = mapRef.current;
            const src = m.getSource(sourceId);
            if (src) {
              src.setData(geojson);
              gisDataRef.current[layerKey] = geojson;
              // Only update bounds key on successful fetch
              lastBoundsKeyRef.current[layerKey] = boundsKey;
            }
          }).catch((err) => {
            console.warn(`[GIS] Re-fetch failed for ${layerKey}:`, err.message);
          }).finally(() => {
            // Always clear in-progress flag
            gisFetchingRef.current[layerKey] = false;
          });
        }
      }, 800); // Increased from 500ms to reduce fetch storm
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

  // Update GIS layer opacity when slider changes (also re-applies after layer creation)
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !gisLayerOpacity) return;
    const map = mapRef.current;

    for (const [layerKey, opacity] of Object.entries(gisLayerOpacity)) {
      const config = GIS_LAYERS[layerKey];
      if (!config) continue;

      // Only update if layer is visible
      if (!visibleGisLayers?.[layerKey]) continue;

      const sourceId = `gis-${layerKey}`;

      // Update opacity based on layer type
      if (config.geometryType === 'line') {
        const lineLayerId = `${sourceId}-line`;
        if (map.getLayer(lineLayerId)) {
          map.setPaintProperty(lineLayerId, 'line-opacity', opacity);
        }
      } else if (config.geometryType === 'fill') {
        const fillLayerId = `${sourceId}-fill`;
        const outlineLayerId = `${sourceId}-outline`;
        if (map.getLayer(fillLayerId)) {
          map.setPaintProperty(fillLayerId, 'fill-opacity', opacity);
        }
        if (map.getLayer(outlineLayerId)) {
          // Outline slightly more opaque for visibility
          map.setPaintProperty(outlineLayerId, 'line-opacity', Math.min(opacity + 0.25, 1));
        }
      }
    }
  }, [mapLoaded, gisLayerOpacity, visibleGisLayers]);

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
