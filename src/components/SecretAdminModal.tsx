import React, { useState } from 'react';
import { Crown, Lock, Mail, User, AlertCircle, Sparkles, X, Eye, EyeOff } from 'lucide-react';

interface SecretAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (ownerData: { name: string; email: string }) => void;
}

export const SecretAdminModal: React.FC<SecretAdminModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // Verify exact secret owner credentials
    if (cleanEmail === 'sarvottamyadav789@gmail.com' && cleanPass === 'GBADMIN2026') {
      const finalName = ownerName.trim() || 'Sarvottam Yadav';
      localStorage.setItem('gb_admin_owner_email', cleanEmail);
      localStorage.setItem('gb_admin_owner_name', finalName);
      localStorage.setItem('gb_admin_auth', 'true');
      setError('');
      onSuccess({ name: finalName, email: cleanEmail });
    } else {
      setError('Galat Email ya Password! Access Denied.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-[32px] bg-[#0f1422] border-2 border-amber-500/50 p-6 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col items-center text-center relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Crown Icon */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500/20 to-amber-600/40 border-2 border-amber-400/80 flex items-center justify-center text-amber-400 mb-4 shadow-[0_0_25px_rgba(245,158,11,0.35)]">
          <Crown className="w-8 h-8" />
        </div>

        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-xl font-black text-white tracking-tight">
            Admin Authentication
          </h2>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>
        <p className="text-xs text-slate-400 font-medium">
          Owner secret gateway locked. Enter authorized credentials:
        </p>

        <form onSubmit={handleSubmit} className="w-full mt-5 space-y-3.5 text-left">
          {/* Owner Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2.5 rounded-xl bg-[#172035] border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 font-semibold"
            />
          </div>

          {/* Email (No hints or placeholders showing the email) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              <span>Admin Email</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter authorized email"
              className="w-full px-4 py-2.5 rounded-xl bg-[#172035] border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
              autoComplete="off"
            />
          </div>

          {/* Password (Hidden with Eye Toggle) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-sky-400" />
              <span>Admin Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-[#172035] border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer active:scale-95 transition-all mt-2"
          >
            Unlock Owner Admin Panel
          </button>
        </form>
      </div>
    </div>
  );
};
