import React, { useEffect } from 'react';

interface SplashSecondProps {
  onComplete: () => void;
}

export const SplashSecond: React.FC<SplashSecondProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1400);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07090e] text-white select-none overflow-hidden animate-in fade-in duration-300 cursor-pointer"
    >
      {/* Top subtle ambient highlight */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />

      {/* Radial Rainbow / Aurora Glow effect */}
      <div className="relative flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-700">
        <div
          className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full blur-3xl opacity-80 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(56,189,248,0.7) 0%, rgba(168,85,247,0.55) 35%, rgba(245,158,11,0.45) 70%, rgba(239,68,68,0.2) 100%)',
          }}
        />

        {/* GB STUDY Squircle App Icon */}
        <div className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-[32px] overflow-hidden p-1 bg-gradient-to-b from-white/25 via-white/10 to-transparent shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/20">
          <img
            src="/assets/gb_study_icon.png"
            alt="GB Study Icon"
            className="w-full h-full object-cover rounded-[28px]"
          />
        </div>

        {/* Title: gbstudy.in */}
        <div className="mt-7 text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center justify-center">
          <span className="text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]">
            gbstudy.
          </span>
          <span className="text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]">
            in
          </span>
        </div>

        {/* Subtitle Pill Badge: SARVOTTAM YADAV */}
        <div className="mt-4 px-6 py-2 rounded-full bg-[#121622]/80 backdrop-blur-md border border-slate-700/60 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <div className="text-xs sm:text-sm font-bold tracking-widest uppercase flex items-center gap-1.5">
            <span className="text-slate-200">SARVOTTAM</span>
            <span className="text-sky-400">YADAV</span>
          </div>
        </div>
      </div>
    </div>
  );
};
