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
      style: {
        version: 8,
        sources: {
          // Use Mapbox vector tiles as base
          "vector-tiles": {
            type: "vector",
            url: "mapbox://mapbox.mapbox-streets-v8"
          }
        },
        layers: [
          // Background (white page bg)
          {
            id: "background",
            type: "background",
            paint: {
              "background-color": "#ffffff"
            }
          },
          // Oceans
          {
            id: "water",
            source: "vector-tiles",
            "source-layer": "water",
            type: "fill",
            paint: {
              "fill-color": "#111111" // darkgray
            }
          },
          // Land
          {
            id: "land",
            source: "vector-tiles",
            "source-layer": "land",
            type: "fill",
            paint: {
              "fill-color": "#3BB273" // simple green
            }
          },
          // Country borders (optional subtle outline
        ]
      },
      center: [0, 20], // center on globe
      zoom: window.innerWidth < 768 ? 1.8 : 2.4, // responsive zoom: smaller on mobile
      projection: "globe",
      interactive: false
    });

    // Make the globe spin slowly
    map.on("load", () => {
      let rotate = 0;
      function spinGlobe() {
        rotate -= 0.04; // faster rotation speed
        map.setCenter([rotate, 20]);
        requestAnimationFrame(spinGlobe);
      }
      spinGlobe();
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      style={{ 
        width: '100%', 
        height: '100vh',
        cursor: 'default' // Remove pointer cursor since interaction is disabled
      }}
      className="globe-container"
    />
  );
};

export default RotatingGlobe;