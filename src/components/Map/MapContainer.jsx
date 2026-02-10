import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';

// You'll set this to your real token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.placeholder';

const AUSTIN_CENTER = [-97.7431, 30.2672];
const INITIAL_ZOOM = 12;

export default function MapContainer({
  parcelsGeoJSON,
  floodGeoJSON,
  schoolsGeoJSON,
  visibleLayers,
  highlightedProperties,
  onParcelClick,
  selectedAttomId,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: AUSTIN_CENTER,
      zoom: INITIAL_ZOOM,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

    map.on('load', () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Add/update parcel layer
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !parcelsGeoJSON) return;
    const map = mapRef.current;

    if (map.getSource('parcels')) {
      map.getSource('parcels').setData(parcelsGeoJSON);
    } else {
      map.addSource('parcels', { type: 'geojson', data: parcelsGeoJSON });

      map.addLayer({
        id: 'parcels-fill',
        type: 'fill',
        source: 'parcels',
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], '#3b82f6',
            ['boolean', ['feature-state', 'highlighted'], false], '#f59e0b',
            ['==', ['get', 'is_corporate'], true], '#8b5cf6',
            '#1e40af',
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], 0.5,
            ['boolean', ['feature-state', 'highlighted'], false], 0.4,
            0.15,
          ],
        },
      });

      map.addLayer({
        id: 'parcels-outline',
        type: 'line',
        source: 'parcels',
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], '#60a5fa',
            ['boolean', ['feature-state', 'highlighted'], false], '#fbbf24',
            '#3b82f6',
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], 2.5,
            ['boolean', ['feature-state', 'highlighted'], false], 2,
            1,
          ],
          'line-opacity': 0.8,
        },
      });

      // Hover effect
      let hoveredId = null;

      map.on('mouseenter', 'parcels-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'parcels-fill', () => {
        map.getCanvas().style.cursor = '';
        if (hoveredId !== null) {
          map.setFeatureState({ source: 'parcels', id: hoveredId }, { hover: false });
          hoveredId = null;
        }
      });

      // Click handler
      map.on('click', 'parcels-fill', (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const attomId = feature.properties.attom_id;
          if (onParcelClick) onParcelClick(attomId);
        }
      });
    }
  }, [mapLoaded, parcelsGeoJSON, onParcelClick]);

  // Toggle parcel visibility
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;
    const vis = visibleLayers?.parcels !== false ? 'visible' : 'none';
    if (map.getLayer('parcels-fill')) map.setLayoutProperty('parcels-fill', 'visibility', vis);
    if (map.getLayer('parcels-outline')) map.setLayoutProperty('parcels-outline', 'visibility', vis);
  }, [mapLoaded, visibleLayers?.parcels]);

  // Flood zone layer
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
      }, 'parcels-fill'); // Insert below parcels

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

  // School district layer
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

  // Highlight properties from chat results
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !parcelsGeoJSON) return;
    const map = mapRef.current;
    const source = map.getSource('parcels');
    if (!source) return;

    // Clear all highlights first
    parcelsGeoJSON.features.forEach((f, i) => {
      map.setFeatureState({ source: 'parcels', id: i }, { highlighted: false, selected: false });
    });

    // Set highlights
    if (highlightedProperties && highlightedProperties.length > 0) {
      parcelsGeoJSON.features.forEach((f, i) => {
        if (highlightedProperties.includes(f.properties.attom_id)) {
          map.setFeatureState({ source: 'parcels', id: i }, { highlighted: true });
        }
      });
    }

    // Set selected
    if (selectedAttomId) {
      parcelsGeoJSON.features.forEach((f, i) => {
        if (f.properties.attom_id === selectedAttomId) {
          map.setFeatureState({ source: 'parcels', id: i }, { selected: true });
        }
      });
    }
  }, [mapLoaded, highlightedProperties, selectedAttomId, parcelsGeoJSON]);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}
