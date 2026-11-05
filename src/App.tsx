import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'lucide-react';
import { SplashScreen } from './components/SplashScreen.tsx';
import { WelcomeModal } from './components/WelcomeModal.tsx';
import { TelegramModal } from './components/TelegramModal.tsx';
import { StudentAnalyticsModal } from './components/StudentAnalyticsModal.tsx';
import { PlatformLaunchingModal } from './components/PlatformLaunchingModal.tsx';
import { Carousel } from './components/Carousel.tsx';
import { PlatformCard } from './components/PlatformCard.tsx';
import { BatchesView } from './components/BatchesView.tsx';
import { UpcomingView } from './components/UpcomingView.tsx';
import { BottomNav, NavTab } from './components/BottomNav.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { InternalWebview } from './components/InternalWebview.tsx';
import { GBAI } from './components/GBAI.tsx';
import { GBChat } from './components/GBChat.tsx';
import { SecretAdminModal } from './components/SecretAdminModal.tsx';
import { INITIAL_PLATFORMS } from './data/platforms.ts';
import { INITIAL_SLIDES } from './data/carousel.ts';
import { PlatformItem, CarouselSlide } from './types.ts';
import {
  subscribeToPlatforms,
  subscribeToCarousel,
  seedInitialPlatformsIfEmpty,
  seedInitialCarouselIfEmpty,
  getStoredPlatforms,
  getStoredCarousel,
} from './services/firestoreService.ts';

type AppStep =
  | 'splash'
  | 'welcome'
  | 'telegram'
  | 'home'
  | 'launching'
  | 'batches'
  | 'webview';

export default function App() {
  const [appStep, setAppStep] = useState<AppStep>('splash');
  const [studentName, setStudentName] = useState<string>('SARVOTTAM');
  const [activeSeconds, setActiveSeconds] = useState<number>(0);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [showSecretUnlock, setShowSecretUnlock] = useState<boolean>(false);

  // 20-clicks consecutive secret counter for GB Study icon
  const [clickCount, setClickCount] = useState<number>(0);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [clickNotice, setClickNotice] = useState<string | null>(null);

  // Current User / Owner State
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    id: string;
    email?: string;
    isOwner: boolean;
    isAdmin: boolean;
  }>(() => {
    const isOwnerAuth = localStorage.getItem('gb_admin_auth') === 'true';
    const ownerName = localStorage.getItem('gb_admin_owner_name') || 'Sarvottam Yadav';
    const ownerEmail = localStorage.getItem('gb_admin_owner_email') || '';
    return {
      name: isOwnerAuth ? ownerName : 'SARVOTTAM',
      id: isOwnerAuth ? 'owner-sarvottam' : 'student-' + Math.random().toString(36).substr(2, 6),
      email: ownerEmail,
      isOwner: isOwnerAuth,
      isAdmin: isOwnerAuth,
    };
  });

  const [selectedPlatform, setSelectedPlatform] = useState<PlatformItem>(INITIAL_PLATFORMS[0]);
  const [activeWebviewUrl, setActiveWebviewUrl] = useState<{ title: string; url: string }>({
    title: '',
    url: '',
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<NavTab>('platforms');
  const [telegramToast, setTelegramToast] = useState<string | null>(null);

  // Real-time persistent state (loaded from local store immediately, synced with Firestore)
  const [platforms, setPlatforms] = useState<PlatformItem[]>(() => getStoredPlatforms());
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>(() => getStoredCarousel());

  // Real-time subscription to platforms and carousel
  useEffect(() => {
    // Ensure initial platforms exist in Firestore for real-time synchronization
    seedInitialPlatformsIfEmpty();

    const unsubPlatforms = subscribeToPlatforms((livePlatforms) => {
      setPlatforms(livePlatforms);
    });

    const unsubCarousel = subscribeToCarousel((liveSlides) => {
      setCarouselSlides(liveSlides);
    });

    return () => {
      unsubPlatforms();
      unsubCarousel();
    };
  }, []);

  // Active time counter for Student Analytics
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 20 Clicks Handler on GB Study Icon
  const handleLogoClick = () => {
    const now = Date.now();
    let newCount = clickCount + 1;

    // Reset if gap between clicks is more than 3 seconds
    if (now - lastClickTime > 3000) {
      newCount = 1;
    }

    setClickCount(newCount);
    setLastClickTime(now);

    if (newCount >= 10 && newCount < 20) {
      setClickNotice(`${20 - newCount} clicks to Owner Gateway...`);
    }

    if (newCount >= 20) {
      setClickCount(0);
      setClickNotice('👑 Secret Gateway Unlocked!');
      setTimeout(() => setClickNotice(null), 1500);
      setShowSecretUnlock(true);
    }
  };

  const handleOwnerAuthSuccess = (ownerData: { name: string; email: string }) => {
    setCurrentUser({
      name: ownerData.name,
      id: 'owner-sarvottam',
      email: ownerData.email,
      isOwner: true,
      isAdmin: true,
    });
    setStudentName(ownerData.name);
    setShowSecretUnlock(false);
    setShowAdmin(true);
  };

  const handleWelcomeConfirm = (name: string) => {
    setStudentName(name);
    setCurrentUser((prev) => ({
      ...prev,
      name,
    }));
    setAppStep('telegram');
  };

  const handleTelegramJoin = () => {
    setTelegramToast('Opening official GB Study Telegram Channel...');
    setTimeout(() => {
      setTelegramToast(null);
      setAppStep('home');
    }, 800);
  };

  const handleTelegramSkip = () => {
    setAppStep('home');
  };

  // Launching Modal ALWAYS appears on clicking any platform
  const handlePlatformClick = (platform: PlatformItem) => {
    setSelectedPlatform(platform);
    setAppStep('launching');
  };

  // Launching Modal also appears when clicking a carousel banner with a target URL
  const handleSlideClick = (slide: CarouselSlide) => {
    if (!slide.targetUrl?.trim()) return;

    const pseudoPlatform: PlatformItem = {
      id: slide.id,
      name: slide.title,
      subtitle: slide.subtitle || 'GB Study Featured Platform',
      icon: slide.image,
      targetUrl: slide.targetUrl.trim(),
      openMode: slide.openMode || 'internal',
      order: slide.order || 1,
    };
    setSelectedPlatform(pseudoPlatform);
    setAppStep('launching');
  };

  // Once launching animation and connection finish, open the platform immediately
  const handleLaunchComplete = useCallback(() => {
    if (!selectedPlatform) {
      setAppStep('home');
      return;
    }

    const targetUrl = selectedPlatform.targetUrl?.trim();
    const mode = selectedPlatform.openMode || 'internal';

    if (mode === 'external' && targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      setAppStep('home');
      return;
    }

    if (mode === 'new_tab' && targetUrl) {
      window.open(targetUrl, '_blank');
      setAppStep('home');
      return;
    }

    if (mode === 'same_tab' && targetUrl) {
      window.location.href = targetUrl;
      return;
    }

    if (mode === 'internal' && targetUrl) {
      setActiveWebviewUrl({
        title: selectedPlatform.name,
        url: targetUrl,
      });
      setAppStep('webview');
      return;
    }

    // Default: in-app Batches study view
    setAppStep('batches');
  }, [selectedPlatform]);

  const handleBackToHome = () => {
    setAppStep('home');
  };

  const filteredPlatforms = platforms.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#05070b] text-slate-100 flex justify-center select-none overflow-x-hidden">
      {/* 100% PURE MOBILE APP CONTAINER (Edge-to-Edge Native Feel) */}
      <div className="w-full max-w-md min-h-screen bg-[#080b11] relative overflow-hidden flex flex-col shadow-2xl">
        {/* Click Notice / Toast */}
        {clickNotice && (
          <div className="absolute top-3 inset-x-4 z-50 p-2.5 rounded-2xl bg-amber-500/90 text-slate-950 font-black text-xs text-center shadow-lg border border-amber-300 animate-in fade-in duration-200">
            {clickNotice}
          </div>
        )}

        {/* Telegram Toast */}
        {telegramToast && (
          <div className="absolute top-4 inset-x-4 z-50 p-3 rounded-2xl bg-sky-500 text-slate-950 font-bold text-xs text-center shadow-lg animate-in slide-in-from-top duration-300">
            {telegramToast}
          </div>
        )}

        {/* STEP 1: AUTOMATIC 3.5s SPLASH SCREEN (Sarvottam Yadav Gold Emblem -> GB Study App Icon + Rainbow Glow, 100% Automatic with 0 clicks required) */}
        {appStep === 'splash' && (
          <SplashScreen onComplete={() => setAppStep('home')} />
        )}

        {/* STEP 3: WELCOME STUDENT MODAL */}
        {appStep === 'welcome' && (
          <WelcomeModal
            initialName={studentName}
            onConfirm={handleWelcomeConfirm}
          />
        )}

        {/* STEP 4: JOIN TELEGRAM MODAL */}
        {appStep === 'telegram' && (
          <TelegramModal
            onJoin={handleTelegramJoin}
            onSkip={handleTelegramSkip}
          />
        )}

        {/* STEP 6: PLATFORM LAUNCHING ANIMATION SPINNER (Shows for every platform until connection completes) */}
        {appStep === 'launching' && (
          <PlatformLaunchingModal
            platform={selectedPlatform}
            onLaunched={handleLaunchComplete}
          />
        )}

        {/* INTERNAL WEBVIEW */}
        {appStep === 'webview' && (
          <InternalWebview
            title={activeWebviewUrl.title}
            url={activeWebviewUrl.url}
            onBack={handleBackToHome}
          />
        )}

        {/* STEP 7: BATCHES VIEW */}
        {appStep === 'batches' ? (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <BatchesView
              platformName={selectedPlatform.name}
              onBack={handleBackToHome}
            />
          </div>
        ) : (
          /* STEP 5: MAIN HUB WITH BOTTOM TABS */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Top Header */}
            <div className="px-4 py-3 bg-[#080b11] flex items-center justify-between shrink-0 border-b border-slate-900/60 z-20">
              <div className="flex items-center gap-3">
                {/* Secret 20-Click GB Study Logo */}
                <div
                  onClick={handleLogoClick}
                  className="w-12 h-12 rounded-2xl p-1 bg-gradient-to-b from-white/20 to-transparent border border-white/20 shadow-md overflow-hidden bg-[#0a0e17] cursor-pointer active:scale-90 transition-transform"
                  title="GB Study Logo"
                >
                  <img
                    src="/assets/gb_study_icon.png"
                    alt="GB Study Logo"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                {/* Brand & Creator Title */}
                <div className="flex flex-col">
                  <div className="text-xl font-black tracking-tight text-white flex items-center gap-1 leading-tight">
                    <span>gbstudy.</span>
                    <span className="text-sky-400">live</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                      SARVOTTAM YADAV
                    </span>
                    {currentUser.isOwner && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold text-[9px]">
                        OWNER
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Button */}
              <button
                onClick={() => setShowAnalytics(true)}
                className="w-10 h-10 rounded-2xl bg-[#141b2c] border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-sky-400 hover:border-sky-400/50 transition-all cursor-pointer shadow-md"
                title="Student Profile"
              >
                <div className="w-6 h-6 rounded-full border border-sky-400/40 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                </div>
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* TAB 1: PLATFORMS */}
              {activeTab === 'platforms' && (
                <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-2 pb-24 flex flex-col space-y-4">
                  {/* Hero Carousel */}
                  <Carousel
                    slides={carouselSlides}
                    onSlideClick={handleSlideClick}
                  />

                  {/* Ultra Platform Hub Badge with Real-Time Count */}
                  <div className="flex flex-col items-center gap-1.5 pt-1">
                    <div className="px-4 py-1.5 rounded-full bg-sky-950/40 border border-sky-500/30 flex items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                      <span className="text-[11px] font-extrabold tracking-widest text-sky-300 uppercase">
                        ULTRA PLATFORM HUB • {platforms.length} LIVE
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Firebase Real-Time Synced for All Students
                    </span>
                  </div>

                  {/* Section Title */}
                  <div className="text-center">
                    <h2 className="text-2xl font-black tracking-tight text-white">
                      Choose Your{' '}
                      <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                        Platform
                      </span>
                    </h2>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search platforms, notes, features..."
                      className="w-full py-3.5 px-6 rounded-full bg-[#111726]/90 border border-slate-700/60 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all shadow-inner text-center font-medium"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Platforms Cards List */}
                  <div className="space-y-3 pt-1">
                    {filteredPlatforms.length > 0 ? (
                      filteredPlatforms.map((platform) => (
                        <PlatformCard
                          key={platform.id}
                          platform={platform}
                          onClick={handlePlatformClick}
                        />
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-400 text-sm">
                        No platforms found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: GB AI */}
              {activeTab === 'ai' && <GBAI />}

              {/* TAB 3: GB CHAT (Telegram Discussion Group) */}
              {activeTab === 'chat' && <GBChat currentUser={currentUser} />}

              {/* TAB 4: UPCOMING */}
              {activeTab === 'upcoming' && (
                <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-24">
                  <UpcomingView />
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION BAR (Platforms, GB AI, GB Chat, Upcoming) */}
        {appStep === 'home' && (
          <BottomNav
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
          />
        )}

        {/* STUDENT ANALYTICS MODAL */}
        {showAnalytics && (
          <StudentAnalyticsModal
            studentName={studentName}
            activeSeconds={activeSeconds}
            onClose={() => setShowAnalytics(false)}
            onOpenAdmin={() => {
              setShowAnalytics(false);
              setShowAdmin(true);
            }}
          />
        )}

        {/* SECRET ADMIN AUTH MODAL (Triggered by 20 clicks on GB Study icon) */}
        <SecretAdminModal
          isOpen={showSecretUnlock}
          onClose={() => setShowSecretUnlock(false)}
          onSuccess={handleOwnerAuthSuccess}
        />

        {/* ADMIN CONTROL PANEL */}
        {showAdmin && (
          <AdminPanel
            platforms={platforms}
            carouselSlides={carouselSlides}
            onClose={() => setShowAdmin(false)}
          />
        )}
      </div>
    </div>
  );
}
