import React from 'react';
import { Send } from 'lucide-react';

interface TelegramModalProps {
  onJoin: () => void;
  onSkip: () => void;
}

export const TelegramModal: React.FC<TelegramModalProps> = ({
  onJoin,
  onSkip,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm rounded-[30px] bg-[#111624] border border-sky-500/25 p-7 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        {/* Telegram Icon Circle */}
        <div className="w-16 h-16 rounded-full bg-[#162742] border border-sky-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.25)] mb-5">
          <Send className="w-8 h-8 text-sky-400 transform -rotate-12 translate-x-0.5" strokeWidth={2.2} />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Join Telegram
        </h2>
        <p className="mt-2 text-sm text-slate-400 font-normal leading-relaxed px-2">
          Join our official channel for latest updates, notes & new platform announcements.
        </p>

        {/* Buttons */}
        <div className="w-full mt-7 space-y-3.5">
          <button
            onClick={onJoin}
            className="w-full py-3.5 px-6 rounded-[16px] bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-bold text-base shadow-[0_4px_20px_rgba(56,189,248,0.35)] active:scale-[0.98] transition-all cursor-pointer"
          >
            Join Channel
          </button>

          <button
            onClick={onSkip}
            className="w-full py-2 text-sm text-slate-400 hover:text-white font-medium transition-colors cursor-pointer"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};
