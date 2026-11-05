import React, { useEffect } from 'react';

interface SplashFirstProps {
  onComplete: () => void;
}

export const SplashFirst: React.FC<SplashFirstProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1400);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#202328] text-white select-none overflow-hidden animate-in fade-in duration-300 cursor-pointer"
    >
      {/* Center Sarvottam Yadav Emblem (Identical size and geometry to GB Study icon) */}
      <div className="relative flex flex-col items-center justify-center px-4 animate-in fade-in zoom-in-95 duration-700">
        {/* Glow halo behind emblem */}
        <div className="absolute -inset-6 rounded-full bg-amber-500/25 blur-2xl pointer-events-none" />

        <div className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-[32px] overflow-hidden p-1 bg-gradient-to-b from-amber-300/40 via-amber-400/20 to-transparent shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-amber-400/50 bg-black">
          <img
            src="/assets/sarvottam_splash.jpg"
            alt="Sarvottam Yadav Emblem"
            className="w-full h-full object-cover rounded-[28px]"
          />
        </div>
      </div>
    </div>
  );
};
