import React, { useState, useEffect } from 'react';
import {
  Menu,
  ChevronLeft,
  Moon,
  Sun,
  Search,
  Users,
  Calendar,
  GraduationCap,
  Bookmark,
  Play,
  FileText,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { BatchItem } from '../types.ts';
import { BATCHES_DATA } from '../data/batches.ts';

interface BatchesViewProps {
  platformName: string;
  onBack: () => void;
}

export const BatchesView: React.FC<BatchesViewProps> = ({
  platformName,
  onBack,
}) => {
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<BatchItem | null>(null);
  const [enrolledBatches, setEnrolledBatches] = useState<string[]>(['yakeen-2027']);
  const [activeSubject, setActiveSubject] = useState<string>('Physics');
  const [activeLecture, setActiveLecture] = useState<{
    title: string;
    duration: string;
    teacher: string;
  }>({
    title: 'Kinematics 01: Introduction & Basic Vectors',
    duration: '1h 14m',
    teacher: 'MR Sir',
  });

  useEffect(() => {
    // Exact skeleton simulation like in the video (00:34 - 00:35)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const filteredBatches = BATCHES_DATA.filter((batch) =>
    batch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    batch.target.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEnroll = (batchId: string) => {
    if (!enrolledBatches.includes(batchId)) {
      setEnrolledBatches([...enrolledBatches, batchId]);
    }
  };

  const bgClasses = isDarkMode ? 'bg-[#0b0e14] text-white' : 'bg-slate-50 text-slate-900';
  const cardBgClasses = isDarkMode
    ? 'bg-[#111624] border-slate-800'
    : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className={`min-h-full flex flex-col ${bgClasses} transition-colors duration-200`}>
      {/* Top Navbar */}
      <div className={`sticky top-0 z-30 px-4 py-3.5 flex items-center justify-between border-b ${
        isDarkMode ? 'border-slate-800/80 bg-[#0b0e14]/90' : 'border-slate-200 bg-white/90'
      } backdrop-blur-md`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-semibold hover:text-sky-400 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            {platformName}
          </span>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDarkMode ? 'bg-slate-800 text-amber-300' : 'bg-slate-200 text-slate-700'
            }`}
            title="Toggle Dark/Light Mode"
          >
            {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <button className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full space-y-5 pb-20">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight">Batches</h1>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
            Free Access
          </span>
        </div>

        {/* Search Bar */}
        <div className={`flex items-center gap-2 p-1.5 pl-4 rounded-[18px] border ${
          isDarkMode ? 'bg-[#131929] border-slate-800' : 'bg-white border-slate-300 shadow-sm'
        }`}>
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Your Batch"
            className={`w-full bg-transparent text-sm focus:outline-none ${
              isDarkMode ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
            }`}
          />
          <button className="px-5 py-2.5 rounded-[14px] bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-bold text-sm tracking-wide transition-all shadow-md active:scale-95 cursor-pointer">
            Search
          </button>
        </div>

        {/* Promo Banner Carousel */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-800 bg-black">
          <img
            src="/assets/banner_pw_power.png"
            alt="Power Batch Promo"
            className="w-full h-auto object-cover"
          />
          <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5">
            <span className="w-5 h-1.5 rounded-full bg-sky-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
          </div>
        </div>

        {/* SKELETON LOADING VIEW (Exact replica of frame 34-35) */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`rounded-[24px] p-5 border ${cardBgClasses} animate-pulse space-y-4`}
              >
                <div className="flex justify-between items-center">
                  <div className={`h-6 w-32 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                  <div className={`h-6 w-14 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                </div>
                <div className={`w-full h-44 rounded-2xl ${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-200'}`} />
                <div className={`h-4 w-44 rounded ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <div className={`h-4 w-60 rounded ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <div className="flex gap-2">
                  <div className={`h-11 flex-1 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                  <div className={`h-11 flex-1 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* BATCHES LIST */
          <div className="space-y-5">
            {filteredBatches.map((batch) => {
              const isEnrolled = enrolledBatches.includes(batch.id);

              return (
                <div
                  key={batch.id}
                  className={`rounded-[26px] p-4 sm:p-5 border ${cardBgClasses} shadow-xl hover:border-sky-500/40 transition-all`}
                >
                  {/* Card Header: Title & Badge */}
                  <div className="flex items-center justify-between mb-3.5">
                    <h3 className="text-xl font-bold tracking-tight">
                      {batch.title}
                    </h3>
                    <span
                      className="px-2.5 py-0.5 rounded-lg text-xs font-black uppercase text-slate-950 shadow-sm"
                      style={{ backgroundColor: batch.badgeColor || '#eab308' }}
                    >
                      {batch.badge}
                    </span>
                  </div>

                  {/* Batch Image Poster */}
                  <div className="relative rounded-2xl overflow-hidden bg-black mb-4 border border-slate-700/50">
                    <img
                      src={batch.image}
                      alt={batch.title}
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#22c55e] text-slate-950 font-bold text-xs shadow">
                        {batch.language}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white font-medium text-[11px] border border-white/20">
                        {batch.tags}
                      </span>
                    </div>
                  </div>

                  {/* Batch Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                      <Users className="w-4 h-4 text-sky-400" />
                      <span>{batch.target}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                        <span>Starts on: <strong className="text-slate-200">{batch.startDate}</strong></span>
                      </div>
                      <span className="text-slate-600">|</span>
                      <div>
                        <span>Ends on: <strong className="text-slate-200">{batch.endDate}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Free Pill */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl font-extrabold text-[#22c55e] flex items-center gap-0.5">
                      {batch.price}
                    </span>
                    <span className="text-sm text-slate-500 line-through">
                      {batch.originalPrice}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/40 text-[#22c55e] text-xs font-bold">
                      {batch.discountTag}
                    </span>
                  </div>

                  {/* Buttons: Study & Enroll Now */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={() => setSelectedBatch(batch)}
                      className="py-3 px-4 rounded-[16px] bg-[#1a2335] hover:bg-[#222f47] border border-slate-700/80 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4 text-sky-400" />
                      <span>Study</span>
                    </button>

                    <button
                      onClick={() => {
                        handleEnroll(batch.id);
                        setSelectedBatch(batch);
                      }}
                      className={`py-3 px-4 rounded-[16px] font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md cursor-pointer ${
                        isEnrolled
                          ? 'bg-[#22c55e] hover:bg-[#16a34a] text-slate-950'
                          : 'bg-[#22c55e] hover:bg-[#16a34a] text-slate-950'
                      }`}
                    >
                      <span>{isEnrolled ? 'Enrolled' : 'Enroll Now'}</span>
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* INTERACTIVE STUDY / LECTURE VIEWER MODAL */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-[28px] bg-[#101524] border border-sky-500/30 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#131b2e]">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-base font-bold text-white leading-tight">
                    {selectedBatch.title} Study Room
                  </h4>
                  <span className="text-xs text-slate-400">
                    GB Study • Powered by Sarvottam Yadav
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="p-1.5 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Simulation */}
            <div className="relative aspect-video bg-slate-950 flex flex-col items-center justify-center overflow-hidden border-b border-slate-800">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
              <img
                src={selectedBatch.image}
                alt="Lecture preview"
                className="w-full h-full object-cover opacity-35"
              />
              <div className="relative z-10 flex flex-col items-center text-center px-4">
                <div className="w-14 h-14 rounded-full bg-sky-500/90 text-slate-950 flex items-center justify-center shadow-[0_0_25px_rgba(56,189,248,0.6)] mb-2 hover:scale-110 transition-transform cursor-pointer">
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-600/90 text-white uppercase tracking-wider mb-1">
                  HD 1080p Stream
                </span>
                <p className="text-sm font-bold text-white max-w-xs truncate">
                  {activeLecture.title}
                </p>
                <span className="text-[11px] text-slate-300">
                  Instructor: {activeLecture.teacher} • Duration: {activeLecture.duration}
                </span>
              </div>
            </div>

            {/* Subjects Pill Filter */}
            <div className="px-4 py-2.5 bg-[#0e1320] border-b border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
              {selectedBatch.subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubject(sub)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeSubject === sub
                      ? 'bg-sky-400 text-slate-950 shadow-[0_0_10px_#38bdf8]'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Lectures and DPPs List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Chapter 01: Foundations & Core Concepts
              </div>

              {[
                {
                  id: 'lec-1',
                  title: `${activeSubject} Lecture 01: Basics & Fundamentals`,
                  duration: '1h 22m',
                  teacher: 'Senior Faculty',
                  dppCount: '2 DPPs',
                },
                {
                  id: 'lec-2',
                  title: `${activeSubject} Lecture 02: Advanced Problem Solving`,
                  duration: '1h 05m',
                  teacher: 'Senior Faculty',
                  dppCount: '1 DPP + Notes',
                },
                {
                  id: 'lec-3',
                  title: `${activeSubject} Lecture 03: PYQ Marathon (2020-2025)`,
                  duration: '1h 40m',
                  teacher: 'Senior Faculty',
                  dppCount: 'PYQ Sheet',
                },
              ].map((lec) => (
                <div
                  key={lec.id}
                  onClick={() =>
                    setActiveLecture({
                      title: lec.title,
                      duration: lec.duration,
                      teacher: lec.teacher,
                    })
                  }
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    activeLecture.title === lec.title
                      ? 'bg-sky-950/40 border-sky-500/50 shadow-md'
                      : 'bg-[#151c2e] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400 shrink-0">
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white line-clamp-1">
                        {lec.title}
                      </h5>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-sky-400" />
                          {lec.duration}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-400">{lec.dppCount}</span>
                      </div>
                    </div>
                  </div>

                  <button className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 shrink-0 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <span>Notes</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-800 bg-[#131b2e] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Full Access Unlocked (Free)</span>
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 font-bold text-xs shadow-md cursor-pointer active:scale-95 transition-all"
              >
                Close Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
