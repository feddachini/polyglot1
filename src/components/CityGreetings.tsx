'use client'

import React, { useEffect, useState } from 'react';

interface CityPoint {
  id: string;
  text: string;
  coords: [number, number]; // [longitude, latitude]
}

const cityPoints: CityPoint[] = [
  // Europe
  { id: "rome", text: "Ciao", coords: [12.4964, 41.9028] },
  { id: "paris", text: "Bonjour", coords: [2.3522, 48.8566] },
  { id: "madrid", text: "Hola", coords: [-3.7038, 40.4168] },
  { id: "berlin", text: "Hallo", coords: [13.4050, 52.5200] },
  { id: "moscow", text: "Привет", coords: [37.6173, 55.7558] },
  { id: "athens", text: "Γεια σας", coords: [23.7275, 37.9838] },
  { id: "stockholm", text: "Hej", coords: [18.0686, 59.3293] },
  
  // Africa
  { id: "lagos", text: "Ẹ n lẹ", coords: [3.3792, 6.5244] },
  { id: "cairo", text: "السلام عليكم", coords: [31.2357, 30.0444] },
  { id: "capetown", text: "Sawubona", coords: [18.4241, -33.9249] },
  { id: "nairobi", text: "Jambo", coords: [36.8219, -1.2921] },
  
  // Middle East
  { id: "dubai", text: "مرحبا", coords: [55.2708, 25.2048] },
  { id: "tehran", text: "سلام", coords: [51.3890, 35.6892] },
  { id: "istanbul", text: "Merhaba", coords: [28.9784, 41.0082] },
  
  // Asia
  { id: "tokyo", text: "こんにちは", coords: [139.6917, 35.6895] },
  { id: "beijing", text: "你好", coords: [116.4074, 39.9042] },
  { id: "mumbai", text: "नमस्ते", coords: [72.8777, 19.0760] },
  { id: "seoul", text: "안녕하세요", coords: [126.9780, 37.5665] },
  { id: "bangkok", text: "สวัสดี", coords: [100.5018, 13.7563] },
  { id: "jakarta", text: "Selamat pagi", coords: [106.8456, -6.2088] },
  { id: "hanoi", text: "Xin chào", coords: [105.8542, 21.0285] },
  
  // Americas
  { id: "nyc", text: "Hello", coords: [-74.006, 40.7128] },
  { id: "mexicocity", text: "Hola", coords: [-99.1332, 19.4326] },
  { id: "saopaulo", text: "Olá", coords: [-46.6333, -23.5505] },
  { id: "buenosaires", text: "Hola", coords: [-58.3816, -34.6037] },
  { id: "toronto", text: "Hello", coords: [-79.3832, 43.6532] },
  { id: "lima", text: "Hola", coords: [-77.0428, -12.0464] },
  
  // Oceania
  { id: "sydney", text: "G'day", coords: [151.2093, -33.8688] },
  { id: "auckland", text: "Kia ora", coords: [174.7633, -36.8485] }
];

interface VisibleCity extends CityPoint {
  screenX: number; // x coordinate on screen
  screenY: number; // y coordinate on screen
  color: string; // dynamic color
}

// ENS-inspired vibrant colors
const vibrantColors = [
  '#FF6B6B', // Coral red
  '#4ECDC4', // Turquoise 
  '#45B7D1', // Sky blue
  '#96CEB4', // Mint green
  '#FFEAA7', // Warm yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Seafoam
  '#F7DC6F', // Golden yellow
  '#BB8FCE', // Lavender
  '#85C1E9', // Light blue
];

const CityGreetings: React.FC = () => {
  const [visibleCities, setVisibleCities] = useState<VisibleCity[]>([]);
  const [currentRotation, setCurrentRotation] = useState(0);

  // Convert lat/lng to screen coordinates with proper front-face detection
  const projectToScreen = (lng: number, lat: number, rotation: number) => {
    const adjustedLng = lng + rotation;
    const normalizedLng = ((adjustedLng % 360) + 360) % 360;
    
    // Globe center and radius
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.2; // More accurate globe radius
    
    // Convert to radians
    const lngRad = (normalizedLng - 180) * Math.PI / 180;
    const latRad = lat * Math.PI / 180;
    
    // Check if point is on front-facing hemisphere
    const isVisible = Math.cos(lngRad) < 0; // Only front-facing side (corrected)
    
    // Project to screen coordinates using orthographic projection
    const x = centerX + radius * Math.cos(latRad) * Math.sin(lngRad);
    const y = centerY - radius * Math.sin(latRad);
    
    return { x, y, isVisible };
  };

  useEffect(() => {
    // Track rotation and determine visible cities
    const updateVisibleCities = () => {
      setCurrentRotation(prev => prev + 0.6); // Match globe rotation speed
      
      const newVisibleCities: VisibleCity[] = [];

      cityPoints.forEach((city, index) => {
        // Get screen coordinates and visibility for the city
        const screenCoords = projectToScreen(city.coords[0], city.coords[1], currentRotation);
        
        // Only show cities that are on the front-facing hemisphere
        if (screenCoords.isVisible && newVisibleCities.length < 6) { // Allow more cities since we have more space
          newVisibleCities.push({
            ...city,
            screenX: screenCoords.x,
            screenY: screenCoords.y,
            color: vibrantColors[index % vibrantColors.length]
          });
        }
      });

      setVisibleCities(newVisibleCities);
    };

    const interval = setInterval(updateVisibleCities, 100);
    return () => clearInterval(interval);
  }, [currentRotation]);

    return (
    <div className="hidden md:block absolute inset-0 z-20 pointer-events-none">
      {visibleCities.map((city) => {
        return (
          <div
            key={city.id}
            className="absolute transition-all duration-1000 ease-in-out transform"
            style={{
              left: `${city.screenX - 80}px`, // Center button on coordinate (assuming 160px width)
              top: `${city.screenY - 25}px`, // Center button on coordinate (assuming 50px height)
            }}
          >
            {/* Greeting Button positioned directly over city coordinate */}
            <button 
              className="pointer-events-auto px-6 py-3 text-black text-base font-bold rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-xl transform"
              style={{
                backgroundColor: `${city.color}90`, // Higher opacity for better visibility over globe
                border: `2px solid ${city.color}`, 
                boxShadow: `0 8px 25px ${city.color}50`,
                minWidth: '160px',
                whiteSpace: 'nowrap', // Prevent text wrapping
                backdropFilter: 'blur(2px)', // Subtle blur effect for better readability
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = city.color; // Full color on hover
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${city.color}90`;
                e.currentTarget.style.color = 'black';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {city.text}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default CityGreetings; 