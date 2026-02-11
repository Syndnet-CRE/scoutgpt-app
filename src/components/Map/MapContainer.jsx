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
      // --- PARCEL BOUNDARIES FROM VECTOR TILESET ---
      map.addSource('parcels', {
        type: 'vector',
        url: `mapbox://${TILESET_ID}`,
        promoteId: 'attom_id', // Use attom_id as feature ID for feature-state
      });

      // Base fill — all parcels
      map.addLayer({
        id: 'parcels-fill',
        type: 'fill',
        source: 'parcels',
        'source-layer': TILESET_LAYER,
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], '#3b82f6',
            ['boolean', ['feature-state', 'highlighted'], false], '#f59e0b',
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

      // Outline — all parcels
      map.addLayer({
        id: 'parcels-outline',
        type: 'line',
        source: 'parcels',
        'source-layer': TILESET_LAYER,
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
            0.5,
          ],
          'line-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], 1,
            ['boolean', ['feature-state', 'highlighted'], false], 0.9,
            0.4,
          ],
        },
      });

      // Hover cursor
      map.on('mouseenter', 'parcels-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'parcels-fill', () => {
        map.getCanvas().style.cursor = '';
      });

      // Click handler — get attom_id from clicked parcel
      map.on('click', 'parcels-fill', (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const attomId = feature.properties.attom_id;
          if (attomId && onParcelClick) {
            onParcelClick(Number(attomId));
          }
        }
      });

      setMapLoaded(true);
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
    if (map.getLayer('parcels-fill')) map.setLayoutProperty('parcels-fill', 'visibility', vis);
    if (map.getLayer('parcels-outline')) map.setLayoutProperty('parcels-outline', 'visibility', vis);
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

  // Highlight properties from chat results + selected parcel
  // Uses feature-state on vector tileset — keyed by attom_id (promoteId)
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    // Clear previous highlights by removing and re-adding feature states
    // For vector sources, we need to track what we've set
    // Use removeFeatureState to clear all at once
    map.removeFeatureState({ source: 'parcels', sourceLayer: TILESET_LAYER });

    // Set highlights from chat results
    if (highlightedProperties && highlightedProperties.length > 0) {
      for (const attomId of highlightedProperties) {
        map.setFeatureState(
          { source: 'parcels', sourceLayer: TILESET_LAYER, id: attomId },
          { highlighted: true }
        );
      }
    }

    // Set selected parcel
    if (selectedAttomId) {
      map.setFeatureState(
        { source: 'parcels', sourceLayer: TILESET_LAYER, id: selectedAttomId },
        { selected: true }
      );
    }
  }, [mapLoaded, highlightedProperties, selectedAttomId]);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}
