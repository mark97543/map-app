import React, { useState, useEffect } from 'react';

const KickAssLoader = () => {
  const [flavorText, setFlavorText] = useState("Checking the tire pressure...");

  const messages = [
    "Checking the tire pressure...",
    "Arguing about who picks the music...",
    "Stopping at Buc-ee's for beaver nuggets...",
    "Recalculating... (I'm not lost, I'm exploring)",
    "Consulting the paper map I'll never fold back correctly...",
    "Looking for a radio station that isn't static..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFlavorText(messages[Math.floor(Math.random() * messages.length)]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a', // slate-900
        zIndex: 99999,
        color: 'white'
      }}
    >
      {/* Background Map Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#4ade80_1px,transparent_1px)] [background-size:30px_30px]" />

      <div className="relative z-10 flex flex-col items-center">
        {/* The Animated "Road" */}
        <div className="relative w-80 h-3 mb-10 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div className="absolute top-0 left-0 h-full bg-green-400 shadow-[0_0_20px_rgba(74,222,128,0.9)] animate-road-trip" />
        </div>

        {/* The Humor Section */}
        <div className="text-center px-4">
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-green-400 mb-2">
            Hold Your Horses
          </h2>
          <div className="h-8">
            <p className="text-slate-400 font-mono text-lg animate-pulse">
              {flavorText}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes road-trip {
          0% { width: 10%; left: -10%; }
          50% { width: 30%; left: 35%; }
          100% { width: 10%; left: 100%; }
        }
        .animate-road-trip {
          animation: road-trip 1.8s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default KickAssLoader;