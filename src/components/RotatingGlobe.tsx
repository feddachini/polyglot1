'use client'

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const RotatingGlobe: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoidGhvcmZlZCIsImEiOiJjbWVmZDk0dWUwdWJyMmpwenl5Yms0Y2x1In0.kO5AnZRMypJSizrKiObLMg';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: 'mapbox://styles/mapbox/standard-satellite',
      zoom: 1.5,
      center: [-90, 40],
      projection: 'globe'
    });

    map.style.stylesheet.layers.forEach(function(layer) {
    if (layer.type === 'symbol') {
        map.setLayoutProperty(layer.id, "visibility", "none");
    }
    });

    map.on('style.load', () => {
      map.setFog({});
    });

    // Rotation control variables
    const secondsPerRevolution = 120;
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;
    let userInteracting = false;
    let spinEnabled = true;

    function spinGlobe() {
      const zoom = map.getZoom();
      if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
          const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
          distancePerSecond *= zoomDif;
        }
        const center = map.getCenter();
        center.lng -= distancePerSecond;
        map.easeTo({ center, duration: 1000, easing: (n) => n });
      }
    }

    // Pause spinning on interaction
    map.on('mousedown', () => { userInteracting = true; });
    map.on('mouseup', () => { userInteracting = false; spinGlobe(); });
    map.on('dragend', () => { userInteracting = false; spinGlobe(); });
    map.on('pitchend', () => { userInteracting = false; spinGlobe(); });
    map.on('rotateend', () => { userInteracting = false; spinGlobe(); });

    // When animation is complete, start spinning if there is no ongoing interaction
    map.on('moveend', () => { spinGlobe(); });

    // Start spinning
    spinGlobe();

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height: '100vh' }}
    />
  );
};

export default RotatingGlobe;