import React, { useState } from 'react';
import { User } from 'lucide-react';

interface WelcomeModalProps {
  initialName: string;
  onConfirm: (name: string) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  initialName,
  onConfirm,
}) => {
  const [name, setName] = useState(initialName || 'SARVOTTAM');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim());
    } else {
      onConfirm('SARVOTTAM');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm rounded-[30px] bg-[#111624] border border-sky-500/25 p-7 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        {/* User Icon Circle */}
        <div className="w-16 h-16 rounded-full bg-[#182338] border border-sky-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.2)] mb-5">
          <User className="w-8 h-8 text-sky-400" strokeWidth={2} />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Welcome Student
        </h2>
        <p className="mt-1 text-sm text-slate-400 font-normal">
          Enter your full name to start learning.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full mt-6 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Full Name"
              className="w-full px-5 py-3.5 rounded-[16px] bg-[#1a2133] border border-slate-700/70 text-white placeholder-slate-500 text-base focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all text-center font-medium"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-[16px] bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-bold text-base shadow-[0_4px_20px_rgba(56,189,248,0.35)] active:scale-[0.98] transition-all cursor-pointer"
          >
            Start Exploring
          </button>
        </form>
      </div>
    </div>
  );
};
