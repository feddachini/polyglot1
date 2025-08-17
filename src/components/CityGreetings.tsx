'use client'

import React, { useEffect, useState } from 'react';

interface Greeting {
  text: string;
  language: string;
}

// Collection of greetings in different languages
const greetings: Greeting[] = [
  { text: "Hello", language: "English" },
  { text: "Hola", language: "Spanish" },
  { text: "Bonjour", language: "French" },
  { text: "Hallo", language: "German" },
  { text: "Ciao", language: "Italian" },
  { text: "こんにちは", language: "Japanese" },
  { text: "你好", language: "Chinese" },
  { text: "Привет", language: "Russian" },
  { text: "مرحبا", language: "Arabic" },
  { text: "नमस्ते", language: "Hindi" },
  { text: "Olá", language: "Portuguese" },
  { text: "안녕하세요", language: "Korean" },
  { text: "สวัสดี", language: "Thai" },
  { text: "Γεια σας", language: "Greek" },
  { text: "Merhaba", language: "Turkish" },
  { text: "Jambo", language: "Swahili" },
  { text: "Shalom", language: "Hebrew" },
  { text: "Hej", language: "Swedish" },
  { text: "Kia ora", language: "Māori" },
  { text: "G'day", language: "Australian" }
];

// More vibrant, extreme colors
const vibrantColors = [
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FF0080', // Hot Pink
  '#80FF00', // Lime Green
  '#FF8000', // Orange
  '#8000FF', // Purple
  '#00FF80', // Spring Green
  '#FF0040', // Red Pink
  '#40FF00', // Bright Green
  '#0080FF', // Bright Blue
];

interface GreetingPosition {
  id: number;
  x: string;
  y: string;
  currentGreeting: Greeting;
  color: string;
  isVisible: boolean;
  isHovering: boolean;
}

// Function to generate random positions that avoid the center card area and overlaps
const generateRandomPosition = (existingPositions: { x: string; y: string }[] = []) => {
  const cardWidth = 240; // minWidth from CSS
  const cardHeight = 120; // minHeight from CSS
  const screenPadding = 50; // Padding from screen edges
  
  // Define safe zones avoiding the center (roughly 30-70% both x and y)
  const availableZones = [
    // Top strip
    { minX: 5, maxX: 95, minY: 5, maxY: 25 },
    // Bottom strip  
    { minX: 5, maxX: 95, minY: 75, maxY: 90 },
    // Left strip (avoiding center)
    { minX: 5, maxX: 25, minY: 25, maxY: 75 },
    // Right strip (avoiding center)
    { minX: 75, maxX: 90, minY: 25, maxY: 75 },
  ];

  const maxAttempts = 50;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    // Pick a random zone
    const zone = availableZones[Math.floor(Math.random() * availableZones.length)];
    
    // Generate random position within the zone
    const x = Math.random() * (zone.maxX - zone.minX) + zone.minX;
    const y = Math.random() * (zone.maxY - zone.minY) + zone.minY;
    
    const newPos = { x: `${x}%`, y: `${y}%` };
    
    // Check for overlaps with existing positions
    const hasOverlap = existingPositions.some(existingPos => {
      const existingX = parseFloat(existingPos.x.replace('%', ''));
      const existingY = parseFloat(existingPos.y.replace('%', ''));
      
      // Calculate distance between positions (rough overlap check)
      const distanceX = Math.abs(x - existingX);
      const distanceY = Math.abs(y - existingY);
      
      // Minimum distance to prevent overlap (accounting for card size)
      const minDistanceX = 25; // Roughly 25% of screen width
      const minDistanceY = 20; // Roughly 20% of screen height
      
      return distanceX < minDistanceX && distanceY < minDistanceY;
    });
    
    if (!hasOverlap) {
      return newPos;
    }
  }
  
  // Fallback to predefined safe positions if no random position found
  const fallbackPositions = [
    { x: '8%', y: '15%' },   // Top-left
    { x: '80%', y: '15%' },  // Top-right  
    { x: '8%', y: '80%' },   // Bottom-left
    { x: '80%', y: '80%' },  // Bottom-right
  ];
  
  // Find first fallback that doesn't overlap
  for (const fallback of fallbackPositions) {
    const hasOverlap = existingPositions.some(existingPos => {
      const existingX = parseFloat(existingPos.x.replace('%', ''));
      const existingY = parseFloat(existingPos.y.replace('%', ''));
      const fallbackX = parseFloat(fallback.x.replace('%', ''));
      const fallbackY = parseFloat(fallback.y.replace('%', ''));
      
      const distanceX = Math.abs(fallbackX - existingX);
      const distanceY = Math.abs(fallbackY - existingY);
      
      return distanceX < 25 && distanceY < 20;
    });
    
    if (!hasOverlap) {
      return fallback;
    }
  }
  
  // Ultimate fallback
  return { x: '10%', y: '10%' };
};

const CityGreetings: React.FC = () => {
  const [positions, setPositions] = useState<GreetingPosition[]>(() => {
    // Initialize with non-overlapping random positions
    const initialPositions: GreetingPosition[] = [];
    const usedPositions: { x: string; y: string }[] = [];
    
    for (let index = 0; index < 4; index++) {
      const randomPos = generateRandomPosition(usedPositions);
      usedPositions.push(randomPos);
      
      initialPositions.push({
        id: index,
        x: randomPos.x,
        y: randomPos.y,
        currentGreeting: greetings[index],
        color: vibrantColors[index],
        isVisible: true,
        isHovering: true
      });
    }
    
    return initialPositions;
  });

  // Set up staggered timers for each position
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    positions.forEach((position, index) => {
      const startDelay = index === 0 ? 0 : (5 + index) * 1000; // 0s, 5s, 6s, 7s, 8s delays
      
      const positionCycle = () => {
        // Hover for 8 seconds, then fade out
        setTimeout(() => {
          setPositions(current => 
            current.map(pos => 
              pos.id === position.id 
                ? { ...pos, isHovering: false, isVisible: false }
                : pos
            )
          );
        }, 8000);

        // Wait 3 seconds, then fade in new greeting at new position
        setTimeout(() => {
          const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
          
          setPositions(current => {
            // Get current positions of other visible greetings to avoid overlap
            const otherPositions = current
              .filter(pos => pos.id !== position.id && pos.isVisible)
              .map(pos => ({ x: pos.x, y: pos.y }));
              
            const newPosition = generateRandomPosition(otherPositions);
            
            return current.map(pos => 
              pos.id === position.id 
                ? { 
                    ...pos, 
                    x: newPosition.x,
                    y: newPosition.y,
                    currentGreeting: randomGreeting,
                    color: vibrantColors[Math.floor(Math.random() * vibrantColors.length)],
                    isVisible: true,
                    isHovering: true
                  }
                : pos
            );
          });
        }, 11000); // 8s hover + 3s wait
      };

      // Start the initial cycle after delay
      const initialTimer = setTimeout(() => {
        positionCycle();
        // Then repeat every 11 seconds (8s hover + 3s wait)
        const repeatTimer = setInterval(positionCycle, 11000);
        timers.push(repeatTimer);
      }, startDelay);
      
      timers.push(initialTimer);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []); // Only run once on mount

  const handleGreetingClick = (positionId: number) => {
    setPositions(prev => 
      prev.map(position => {
        if (position.id === positionId) {
          // Get a random different greeting
          let newGreeting;
          do {
            newGreeting = greetings[Math.floor(Math.random() * greetings.length)];
          } while (newGreeting.text === position.currentGreeting.text);
          
          return {
            ...position,
            currentGreeting: newGreeting,
            color: vibrantColors[Math.floor(Math.random() * vibrantColors.length)]
          };
        }
        return position;
      })
    );
  };

  return (
    <>
      {/* Dark overlay over globe and dots for better contrast */}
      <div className="hidden md:block absolute inset-0 z-15 backdrop-blur-xs pointer-events-none" />
      
      {/* Central Flash Card */}
      <div className="hidden md:flex absolute inset-0 z-20 items-center justify-center pointer-events-none">
        <button 
          className="bg-white rounded-2xl shadow-4xl p-12 max-w-xl w-full mx-4 border-2 border-black pointer-events-auto transition-all duration-300 transform hover:scale-105 hover:shadow-3xl cursor-pointer"
          onClick={() => {
            window.location.href = '/onboarding';
          }}
        >
          <div className="text-center">
            <div className="mb-6">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                English
              </span>
            </div>
            <div className="mb-4">
              <h2 className="text-6xl font-bold text-gray-900 mb-3">
                POLYGLOT
              </h2>
              <p className="text-xl text-gray-600 font-mono mb-1">
                /'PAH-lee-glot'/
              </p>
            </div>
          </div>
        </button>
      </div>
      
      <div className="hidden md:block absolute inset-0 z-20 pointer-events-none">
        {positions.map((position) => (
          <div
            key={position.id}
            className={`absolute transition-all duration-1500 ease-in-out ${
              position.isVisible 
                ? 'opacity-100' 
                : 'opacity-0'
            }`}
            style={{
              left: position.x,
              top: position.y,
              animation: position.isHovering 
                ? 'smoothHover 3s ease-in-out infinite' 
                : 'none',
            }}
          >
            <button 
              className="pointer-events-auto px-8 py-4 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl transform cursor-pointer"
              style={{
                backgroundColor: `${position.color}95`,
                border: `3px solid ${position.color}`, 
                boxShadow: `0 12px 35px ${position.color}60`,
                minWidth: '240px',
                minHeight: '120px',
                whiteSpace: 'nowrap',
                backdropFilter: 'blur(3px)',
              }}
              onClick={() => handleGreetingClick(position.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = position.color;
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 15px 40px ${position.color}80`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${position.color}95`;
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = `0 12px 35px ${position.color}60`;
              }}
              title={`Click to change greeting (${position.currentGreeting.language})`}
            >
              {position.currentGreeting.text}
            </button>
          </div>
        ))}
        
        <style jsx>{`
          @keyframes smoothHover {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-8px);
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default CityGreetings; 