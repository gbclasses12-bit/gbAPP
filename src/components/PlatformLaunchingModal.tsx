import React, { useState, useEffect, useRef } from 'react';
import { PlatformItem } from '../types.ts';
import { Lock, Sparkles, Zap } from 'lucide-react';

interface PlatformLaunchingModalProps {
  platform?: PlatformItem | null;
  onLaunched: () => void;
}

export const PlatformLaunchingModal: React.FC<PlatformLaunchingModalProps> = ({
  platform,
  onLaunched,
}) => {
  const [progress, setProgress] = useState(20);
  const [statusText, setStatusText] = useState('Connecting to high-speed server...');
  const onLaunchedRef = useRef(onLaunched);
  onLaunchedRef.current = onLaunched;

  useEffect(() => {
    // Total launching sequence is EXACTLY 1.9 - 2.0 seconds, reliable and fast!
    const t1 = setTimeout(() => {
      setProgress(60);
      setStatusText('Verifying student access & courses...');
    }, 450);

    const t2 = setTimeout(() => {
      setProgress(95);
      setStatusText(`Opening ${platform?.name || 'Platform'}...`);
    }, 1100);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Launching now...');
    }, 1650);

    const t4 = setTimeout(() => {
      onLaunchedRef.current();
    }, 1900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []); // CRITICAL: Empty dependency array ensures timer is NEVER interrupted or reset by parent re-renders!

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-72 sm:w-80 rounded-[32px] bg-[#0f1422] border-2 border-sky-500/40 p-6 flex flex-col items-center justify-center text-center shadow-[0_20px_60px_rgba(56,189,248,0.25)] animate-in zoom-in-95 duration-200">
        {/* Platform Icon with pulsing glow halo */}
        <div className="relative mb-4">
          <div className="absolute -inset-2 rounded-2xl bg-sky-500/30 blur-lg animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden p-1 bg-gradient-to-b from-sky-400/30 to-slate-900 border border-sky-400/50 bg-[#162035] shadow-md flex items-center justify-center">
            {platform?.icon ? (
              <img
                src={platform.icon}
                alt={platform.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <Sparkles className="w-8 h-8 text-sky-400" />
            )}
          </div>
        </div>

        {/* Animated cyan spinner */}
        <div className="relative w-10 h-10 mb-3">
          <div className="w-10 h-10 rounded-full border-3 border-sky-500/20 border-t-sky-400 animate-spin" />
        </div>

        {/* Title */}
        <h3 className="text-white font-black text-lg tracking-tight">
          Launching {platform?.name || 'Platform'}...
        </h3>

        {/* Dynamic status text */}
        <p className="mt-1 text-xs text-slate-400 font-medium h-4 transition-all">
          {statusText}
        </p>

        {/* Animated Progress Bar */}
        <div className="w-full mt-4 h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Instant Fast Launch Button */}
        <button
          onClick={() => onLaunchedRef.current()}
          className="mt-3.5 px-4 py-1.5 rounded-full bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 text-sky-400" />
          <span>Open Immediately (Skip)</span>
        </button>

        {/* Subtitle footer */}
        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>GB Study • Sarvottam Yadav</span>
        </div>
      </div>
    </div>
  );
};
