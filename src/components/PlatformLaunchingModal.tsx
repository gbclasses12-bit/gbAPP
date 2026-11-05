import React, { useState, useEffect } from 'react';
import { PlatformItem } from '../types.ts';
import { Lock, Sparkles } from 'lucide-react';

interface PlatformLaunchingModalProps {
  platform?: PlatformItem | null;
  onLaunched: () => void;
}

export const PlatformLaunchingModal: React.FC<PlatformLaunchingModalProps> = ({
  platform,
  onLaunched,
}) => {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Connecting to secure server...');

  useEffect(() => {
    // Total launching sequence is EXACTLY 2.0 seconds (2000ms) as requested by user
    const t1 = setTimeout(() => {
      setProgress(55);
      setStatusText('Verifying student access & courses...');
    }, 550);

    const t2 = setTimeout(() => {
      setProgress(90);
      setStatusText(`Opening ${platform?.name || 'Platform'}...`);
    }, 1300);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Launching Platform Now...');
    }, 1750);

    const t4 = setTimeout(() => {
      onLaunched();
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [platform?.name, onLaunched]);

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

        {/* Subtitle footer */}
        <div className="mt-4 flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>GB Study • Sarvottam Yadav</span>
        </div>
      </div>
    </div>
  );
};
