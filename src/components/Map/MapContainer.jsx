import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.placeholder';

const AUSTIN_CENTER = [-97.7431, 30.2672];
const INITIAL_ZOOM = 12;

const TILESET_ID = 'bradyirwin.travis-parcels';
const TILESET_LAYER = 'parcels'; // source-layer name from MTS recipe

export default function MapContainer({
  floodGeoJSON,
  schoolsGeoJSON,
  visibleLayers,
  highlightedProperties,
  chatMarkers,
  onParcelClick,
  onBoundsChange,
  selectedAttomId,
  filterHighlightIds,
  onPopupOpen,
  onPopupClose,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/bradyirwin/cmlg51jvm004601qv5428h4aq',
      center: AUSTIN_CENTER,
      zoom: INITIAL_ZOOM,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

    map.on('load', () => {
      // --- PARCEL BOUNDARIES FROM VECTOR TILESET ---
      map.addSource('parcels', {
        type: 'vector',
        url: `mapbox://${TILESET_ID}`,
        generateId: true,
      });

      // Base fill — invisible, kept for click/hover detection
      map.addLayer({
        id: 'parcels-fill',
        type: 'fill',
        source: 'parcels',
        'source-layer': TILESET_LAYER,
        paint: {
          'fill-color': '#000000',
          'fill-opacity': 0,
        },
      });

      // Highlight fill — chat results (red)
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

      // Selected fill — clicked parcel (red)
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

      // Selected outline — clicked parcel (red)
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

      // --- FILTER HIGHLIGHT LAYERS (green/teal) ---
      map.addLayer({
        id: 'parcels-filter-fill',
        type: 'fill',
        source: 'parcels',
        'source-layer': TILESET_LAYER,
        paint: {
          'fill-color': '#10b981',
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
          'line-color': '#10b981',
          'line-width': 2,
          'line-opacity': 0.9,
        },
        filter: ['in', ['get', 'attom_id'], ['literal', []]],
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
            container.style.width = '416px';
            const lngLat = [e.lngLat.lng, e.lngLat.lat];

            const popup = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
              maxWidth: '440px',
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
          container.style.width = '416px';

          const lngLat = [e.lngLat.lng, e.lngLat.lat];

          const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            maxWidth: '440px',
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
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Toggle parcel visibility
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;
    const vis = visibleLayers?.parcels !== false ? 'visible' : 'none';
    const parcelLayers = [
      'parcels-fill',
      'parcels-highlight-fill', 'parcels-highlight-outline',
      'parcels-selected-fill', 'parcels-selected-outline',
      'parcels-filter-fill', 'parcels-filter-outline',
      'chat-markers-circle', 'chat-markers-dot',
    ];
    for (const id of parcelLayers) {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', vis);
    }
  }, [mapLoaded, visibleLayers?.parcels]);

  // Flood zone layer (GeoJSON from API)
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
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
  }, [mapLoaded, floodGeoJSON]);

  // Toggle flood visibility
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;
    const vis = visibleLayers?.flood ? 'visible' : 'none';
    if (map.getLayer('flood-fill')) map.setLayoutProperty('flood-fill', 'visibility', vis);
    if (map.getLayer('flood-outline')) map.setLayoutProperty('flood-outline', 'visibility', vis);
  }, [mapLoaded, visibleLayers?.flood]);

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
