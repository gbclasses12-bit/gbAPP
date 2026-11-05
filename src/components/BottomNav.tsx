import React from 'react';
import { Home, BrainCircuit, MessageSquare, Calendar } from 'lucide-react';

export type NavTab = 'platforms' | 'ai' | 'chat' | 'upcoming';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

interface TabConfig {
  id: NavTab;
  label: string;
  icon: typeof Home;
  badge?: string;
  isLive?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: TabConfig[] = [
    { id: 'platforms', label: 'Platforms', icon: Home },
    { id: 'ai', label: 'GB AI', icon: BrainCircuit, badge: 'AI' },
    { id: 'chat', label: 'GB Chat', icon: MessageSquare, isLive: true },
    { id: 'upcoming', label: 'Upcoming', icon: Calendar },
  ];

  return (
    <div className="fixed bottom-3 inset-x-0 z-40 flex justify-center px-3 pointer-events-none">
      <div className="pointer-events-auto rounded-full bg-[#0d121d]/95 backdrop-blur-xl border border-slate-800/90 p-1.5 flex items-center justify-between gap-1 shadow-[0_10px_35px_rgba(0,0,0,0.85)] max-w-sm w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-2 px-2 rounded-full flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer relative ${
                isActive
                  ? 'bg-[#18273d] text-sky-400 border border-sky-500/35 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={isActive ? 2.5 : 2} />
                {tab.isLive && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] font-bold tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
