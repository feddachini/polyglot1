import RotatingGlobe from "@/components/RotatingGlobe";
import CityGreetings from "@/components/CityGreetings";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-black relative overflow-hidden">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6 z-20 relative px-4 md:px-8">Our Planet</h1>
      {/* Grid of white dots overlay (z-0) - responsive grid */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        {/* Mobile: smaller grid with fewer dots */}
        <div className="w-full h-full grid grid-cols-15 grid-rows-25 gap-3 md:hidden">
          {Array.from({ length: 15 * 25 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-center"
            >
              <span className="block w-1 h-1 rounded-full bg-white opacity-80" />
            </div>
          ))}
        </div>
        {/* Desktop: original larger grid */}
        <div className="w-full h-full grid grid-cols-30 grid-rows-20 gap-6 hidden md:grid">
          {Array.from({ length: 30 * 20 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-center"
            >
              <span className="block w-1.5 h-1.5 rounded-full bg-white opacity-90" />
            </div>
          ))}
        </div>
      </div>
      {/* RotatingGlobe above dots (z-10) - hidden on mobile */}
      <div className="absolute inset-0 z-10 hidden md:block">
        <RotatingGlobe />
      </div>
      
      {/* City Greetings - only on desktop */}
      <CityGreetings />
    </main>
  );
}