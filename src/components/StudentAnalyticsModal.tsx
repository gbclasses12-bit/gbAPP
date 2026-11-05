import React from 'react';
import { User, ShieldCheck } from 'lucide-react';

interface StudentAnalyticsModalProps {
  studentName: string;
  activeSeconds: number;
  onClose: () => void;
  onOpenAdmin: () => void;
}

export const StudentAnalyticsModal: React.FC<StudentAnalyticsModalProps> = ({
  studentName,
  activeSeconds,
  onClose,
  onOpenAdmin,
}) => {
  const hours = Math.floor(activeSeconds / 3600);
  const minutes = Math.floor((activeSeconds % 3600) / 60);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm rounded-[30px] bg-[#111624] border border-sky-500/25 p-7 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        {/* User Icon Circle */}
        <div className="w-16 h-16 rounded-full bg-[#182338] border border-sky-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.25)] mb-5">
          <User className="w-8 h-8 text-sky-400" strokeWidth={2} />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Student Analytics
        </h2>
        <p className="mt-1 text-sm text-slate-400 font-normal">
          Your registered account information
        </p>

        {/* Inner Info Card */}
        <div className="w-full mt-6 rounded-[20px] bg-[#171f30] border border-slate-700/50 p-5 space-y-4 text-left">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 font-medium">Student Name</span>
            <span className="text-white font-bold tracking-wide">
              {studentName || 'SARVOTTAM'}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 font-medium">Active Time</span>
            <span className="text-white font-bold tracking-wide">
              {hours}h {minutes}m
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 font-medium">Access</span>
            <span className="text-white font-bold tracking-wide">
              Full Access (Free)
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full mt-6 space-y-2.5">
          <button
            onClick={() => {
              onClose();
              onOpenAdmin();
            }}
            className="w-full py-3 px-5 rounded-[16px] bg-[#162138] hover:bg-[#1e2e4e] border border-sky-500/30 text-sky-400 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Admin Control Panel</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-[16px] bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-bold text-base shadow-[0_4px_20px_rgba(56,189,248,0.35)] active:scale-[0.98] transition-all cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
