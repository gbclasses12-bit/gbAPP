import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  // Phase 1 = Sarvottam Yadav Emblem (0s - 1.7s)
  // Phase 2 = GB Study Icon + gbstudy.in + Aurora (1.7s - 3.5s)
  const [phase, setPhase] = useState<1 | 2>(1);

  useEffect(() => {
    // Phase 1 -> Phase 2 transition at 1.7 seconds
    const phaseTimer = setTimeout(() => {
      setPhase(2);
    }, 1700);

    // Total splash sequence duration: exactly 3.5 seconds (in the 3-4s range)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(phaseTimer);
      clearTimeout(completeTimer);
    };
  }, []); // Empty dependency array ensures timer is NEVER interrupted by parent re-renders!

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none overflow-hidden">
      {/* ======================================================== */}
      {/* PHASE 1: SARVOTTAM YADAV GOLD EMBLEM (0s - 1.7s) */}
      {/* ======================================================== */}
      {phase === 1 && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#1c1f24] text-white animate-in fade-in duration-500">
          <div className="relative flex flex-col items-center justify-center px-4 animate-in fade-in zoom-in-95 duration-700">
            {/* Glowing gold aurora halo */}
            <div className="absolute -inset-8 rounded-full bg-amber-500/30 blur-3xl pointer-events-none animate-pulse" />

            {/* Emblem container (Identical size & squircle geometry to GB Study icon) */}
            <div className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-[32px] overflow-hidden p-1 bg-gradient-to-b from-amber-300/40 via-amber-400/20 to-transparent shadow-[0_25px_60px_rgba(0,0,0,0.95)] border border-amber-400/50 bg-black">
              <img
                src="/assets/sarvottam_splash.jpg"
                alt="Sarvottam Yadav Emblem"
                className="w-full h-full object-cover rounded-[28px]"
              />
            </div>

            {/* Subtitle text badge */}
            <div className="mt-6 px-5 py-1.5 rounded-full bg-[#11141c]/90 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <span className="text-xs sm:text-sm font-black tracking-widest text-amber-400 uppercase">
                SARVOTTAM YADAV
              </span>
            </div>
          </div>

          {/* Bottom subtle progress bar */}
          <div className="absolute bottom-10 inset-x-12 max-w-xs mx-auto h-1 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 animate-[pulse_1s_infinite] w-full" />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PHASE 2: GB STUDY ICON & RAINBOW GLOW (1.7s - 3.5s) */}
      {/* ======================================================== */}
      {phase === 2 && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#07090e] text-white animate-in fade-in duration-500">
          {/* Top subtle highlight */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />

          {/* Radial Rainbow / Aurora Glow effect */}
          <div className="relative flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
            <div
              className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full blur-3xl opacity-80 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(56,189,248,0.7) 0%, rgba(168,85,247,0.55) 35%, rgba(245,158,11,0.45) 70%, rgba(239,68,68,0.2) 100%)',
              }}
            />

            {/* GB STUDY Squircle App Icon */}
            <div className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-[32px] overflow-hidden p-1 bg-gradient-to-b from-white/25 via-white/10 to-transparent shadow-[0_25px_60px_rgba(0,0,0,0.95)] border border-white/20 bg-black">
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

          {/* Bottom subtle progress indicator */}
          <div className="absolute bottom-10 inset-x-12 max-w-xs mx-auto h-1 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 animate-pulse w-full" />
          </div>
        </div>
      )}
    </div>
  );
};
