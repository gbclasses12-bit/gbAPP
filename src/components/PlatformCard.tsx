import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PlatformItem } from '../types.ts';

interface PlatformCardProps {
  platform: PlatformItem;
  onClick: (platform: PlatformItem) => void;
}

export const PlatformCard: React.FC<PlatformCardProps> = ({ platform, onClick }) => {
  return (
    <div
      onClick={() => onClick(platform)}
      className="group w-full rounded-[24px] bg-[#0f1422] border border-slate-800/80 p-3.5 sm:p-4 flex items-center justify-between gap-3.5 hover:border-sky-500/40 hover:bg-[#131b2e] active:scale-[0.98] transition-all cursor-pointer shadow-lg"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Platform Icon */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl bg-[#090d16] border border-slate-700/60 overflow-hidden flex items-center justify-center p-1.5 shadow-md group-hover:border-sky-500/50 transition-colors">
          <img
            src={platform.icon}
            alt={platform.name}
            className="w-full h-full object-contain rounded-xl"
            style={{
              imageRendering: 'auto',
              transform: 'translateZ(0)',
            }}
            onError={(e) => {
              // fallback if any icon fails to load
              (e.target as HTMLImageElement).src = '/assets/gb_study_icon.png';
            }}
          />
        </div>

        {/* Text Info */}
        <div className="min-w-0 flex flex-col">
          <div className="flex items-center gap-2">
            <h4 className="text-base sm:text-lg font-bold text-white tracking-wide truncate group-hover:text-sky-300 transition-colors">
              {platform.name}
            </h4>
            {platform.badge && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300 uppercase">
                {platform.badge}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-medium truncate mt-0.5">
            {platform.subtitle}
          </p>
        </div>
      </div>

      {/* Action Arrow Button */}
      <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full bg-[#141f32] border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20 group-hover:scale-105 group-hover:border-sky-400 transition-all shadow-[0_0_12px_rgba(56,189,248,0.15)]">
        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.2} />
      </div>
    </div>
  );
};
