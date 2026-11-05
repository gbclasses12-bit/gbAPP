import React from 'react';
import { Calendar, Clock, Bell, Sparkles, BookOpen } from 'lucide-react';

export const UpcomingView: React.FC = () => {
  const events = [
    {
      id: 'event-1',
      title: 'All India Mega Mock Test: NEET 2026',
      date: 'Sunday, 10 Nov 2026',
      time: '02:00 PM - 05:20 PM',
      platform: 'GB Study Special',
      badge: 'Live Test',
      students: '42,000+ Enrolled',
    },
    {
      id: 'event-2',
      title: 'JEE Advanced High-Yield Organic Problem Marathon',
      date: 'Tuesday, 12 Nov 2026',
      time: '06:00 PM - 09:00 PM',
      platform: 'PW Main',
      badge: 'Interactive',
      students: '18,500+ Enrolled',
    },
    {
      id: 'event-3',
      title: 'New Batch Launch: Arjuna 3.0 Fast Track',
      date: 'Friday, 15 Nov 2026',
      time: '07:30 PM',
      platform: 'GB Study Hub',
      badge: 'Launch',
      students: '31,000+ Enrolled',
    },
  ];

  return (
    <div className="w-full space-y-4 pb-20 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Upcoming Schedule</span>
            <Sparkles className="w-4 h-4 text-sky-400" />
          </h2>
          <p className="text-xs text-slate-400">Live tests, new batches & masterclasses</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold border border-sky-500/20">
          November 2026
        </span>
      </div>

      <div className="space-y-3.5">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="rounded-[22px] bg-[#0f1422] border border-slate-800/90 p-4 hover:border-sky-500/40 transition-all shadow-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 text-[11px] font-bold border border-sky-500/30">
                {ev.badge}
              </span>
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                {ev.platform}
              </span>
            </div>

            <h3 className="text-base font-bold text-white leading-snug">
              {ev.title}
            </h3>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span>{ev.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>{ev.time}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-semibold">{ev.students}</span>
              <button
                onClick={() => alert(`Reminder set for ${ev.title}`)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Notify Me</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
