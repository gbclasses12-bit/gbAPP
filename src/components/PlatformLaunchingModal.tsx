import React, { useEffect } from 'react';

interface PlatformLaunchingModalProps {
  onLaunched: () => void;
}

export const PlatformLaunchingModal: React.FC<PlatformLaunchingModalProps> = ({
  onLaunched,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onLaunched();
    }, 1300);
    return () => clearTimeout(timer);
  }, [onLaunched]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-64 sm:w-72 rounded-[26px] bg-[#101524] border border-sky-500/30 py-9 px-6 flex flex-col items-center justify-center text-center shadow-[0_20px_50px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-200">
        {/* Animated cyan arc spinner */}
        <div className="relative w-12 h-12 mb-5">
          <div className="w-12 h-12 rounded-full border-4 border-sky-400/20 border-t-sky-400 animate-spin" />
        </div>

        <span className="text-white font-bold text-lg tracking-wide">
          Launching Platform...
        </span>
      </div>
    </div>
  );
};
