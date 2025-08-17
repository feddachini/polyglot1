import RotatingGlobe from "@/components/RotatingGlobe";
   export default function Page() {
     return (
       <main className="min-h-screen bg-black p-8 text-white">
         <h1 className="text-3xl font-semibold mb-6">Our Planet</h1>
         <RotatingGlobe  />
       </main>
     );
   }