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
  // Account for greeting box size and add padding
  const cardWidthPercent = 15; // ~240px as percentage of typical screen
  const cardHeightPercent = 12; // ~120px as percentage of typical screen
  const edgePadding = 8; // Padding from screen edges
  
  // Define safe zones avoiding the center (roughly 30-70% both x and y) with proper padding
  const availableZones = [
    // Top strip
    { minX: edgePadding, maxX: 100 - edgePadding - cardWidthPercent, minY: edgePadding, maxY: 25 },
    // Bottom strip  
    { minX: edgePadding, maxX: 100 - edgePadding - cardWidthPercent, minY: 75, maxY: 88 - cardHeightPercent },
    // Left strip (avoiding center)
    { minX: edgePadding, maxX: 25, minY: 30, maxY: 70 - cardHeightPercent },
    // Right strip (avoiding center)
    { minX: 75, maxX: 88 - cardWidthPercent, minY: 30, maxY: 70 - cardHeightPercent },
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
      
      // Minimum distance to prevent overlap (accounting for card size + padding)
      const minDistanceX = cardWidthPercent + 5; // Card width + 5% spacing
      const minDistanceY = cardHeightPercent + 3; // Card height + 3% spacing
      
      return distanceX < minDistanceX && distanceY < minDistanceY;
    });
    
    if (!hasOverlap) {
      return newPos;
    }
  }
  
  // Fallback to predefined safe positions if no random position found
  const fallbackPositions = [
    { x: '8%', y: '8%' },    // Top-left
    { x: '77%', y: '8%' },   // Top-right  
    { x: '8%', y: '76%' },   // Bottom-left
    { x: '77%', y: '76%' },  // Bottom-right
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
      
      return distanceX < cardWidthPercent + 5 && distanceY < cardHeightPercent + 3;
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

  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    // Start flip animation
    setIsFlipped(true);
    
    window.location.href = '/onboarding';
  };

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
      <div className="hidden md:flex absolute inset-0 z-30 items-center justify-center pointer-events-none">
        <div className="flip-card-container">
          <button 
            className={`flip-card ${isFlipped ? 'flipped' : ''} bg-white rounded-2xl shadow-4xl p-12 max-w-xl w-full mx-4 border-2 border-black pointer-events-auto transition-all duration-300 transform hover:scale-105 hover:shadow-3xl cursor-pointer`}
            onClick={handleCardClick}
          >
            {/* Front of card */}
            <div className={`flip-card-front ${isFlipped ? 'hidden' : 'block'}`}>
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
            </div>
            
            {/* Back of card */}
            <div className={`flip-card-back ${isFlipped ? 'block' : 'hidden'}`}>
              <div className="text-center">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Do you have what it takes to become a polyglot?
                  </h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Polyglot is a language learning platform using multi-language context and spaced repetition
                  </p>
                </div>
              </div>
            </div>
          </button>
        </div>
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
          
          .flip-card-container {
            perspective: 1200px;
            transform-style: preserve-3d;
          }
          
          .flip-card {
            transition: all 0.8s cubic-bezier(0.23, 1, 0.320, 1);
            transform-style: preserve-3d;
            position: relative;
            transform-origin: center center;
          }
          
          .flip-card.flipped {
            transform: rotateY(180deg) scale(1.02);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            animation: flipGlow 0.8s ease-out;
          }
          
          .flip-card-front,
          .flip-card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            top: 0;
            left: 0;
            border-radius: 1rem;
            transition: all 0.8s cubic-bezier(0.23, 1, 0.320, 1);
          }
          
          .flip-card-front {
            z-index: 2;
            transform: rotateY(0deg);
          }
          
          .flip-card-back {
            z-index: 1;
            transform: rotateY(180deg);
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border: 2px solid #1e293b;
          }
          
          .flip-card:not(.flipped) .flip-card-front {
            opacity: 1;
            transform: rotateY(0deg) translateZ(1px);
          }
          
          .flip-card:not(.flipped) .flip-card-back {
            opacity: 0;
            transform: rotateY(180deg) translateZ(-1px);
          }
          
          .flip-card.flipped .flip-card-front {
            opacity: 0;
            transform: rotateY(-180deg) translateZ(-1px);
          }
          
          .flip-card.flipped .flip-card-back {
            opacity: 1;
            transform: rotateY(0deg) translateZ(1px);
          }
          
          @keyframes flipGlow {
            0% { box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); }
            50% { box-shadow: 0 30px 60px rgba(59, 130, 246, 0.3); }
            100% { box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3); }
          }
        `}</style>
      </div>
    </>
  );
};
export default CityGreetings;
