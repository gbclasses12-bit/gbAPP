import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Image,
  Upload,
  Link,
  Check,
  X,
  Layers,
  Sparkles,
  ArrowLeft,
  Sliders,
  AlertCircle,
  Eye,
  EyeOff,
  Key,
  Download,
  RefreshCw,
} from 'lucide-react';
import { PlatformItem, CarouselSlide, OpenMode } from '../types.ts';
import {
  savePlatform,
  deletePlatformFromDb,
  saveCarouselSlide,
  deleteCarouselSlideFromDb,
  exportDataBackup,
  importDataBackup,
  resetPlatformsToDefault,
  getFirestoreQuotaStatus,
} from '../services/firestoreService.ts';
import { enhanceImageTo8KQuality } from '../utils/imageEnhancer.ts';

interface AdminPanelProps {
  platforms: PlatformItem[];
  carouselSlides: CarouselSlide[];
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  platforms,
  carouselSlides,
  onClose,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('gb_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<'platforms' | 'carousel' | 'ai-key'>('platforms');

  // Gemini API Key Management State
  const [geminiKeyInput, setGeminiKeyInput] = useState(() => localStorage.getItem('gb_gemini_api_key') || '');
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  // Platform Edit / Add Form State
  const [editingPlatform, setEditingPlatform] = useState<PlatformItem | null>(null);
  const [isAddingPlatform, setIsAddingPlatform] = useState(false);
  const [platformForm, setPlatformForm] = useState<{
    id: string;
    name: string;
    subtitle: string;
    icon: string;
    targetUrl: string;
    openMode: OpenMode;
    badge: string;
    order: number;
  }>({
    id: '',
    name: '',
    subtitle: '',
    icon: '/assets/gb_study_icon.png',
    targetUrl: '',
    openMode: 'internal',
    badge: '',
    order: 1,
  });

  // Carousel Edit / Add Form State
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [isAddingSlide, setIsAddingSlide] = useState(false);
  const [slideForm, setSlideForm] = useState<{
    id: string;
    title: string;
    subtitle: string;
    image: string;
    targetUrl: string;
    openMode: OpenMode;
    order: number;
  }>({
    id: '',
    title: '',
    subtitle: '',
    image: '',
    targetUrl: '',
    openMode: 'internal',
    order: 1,
  });

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const platformFileRef = useRef<HTMLInputElement>(null);
  const slideFileRef = useRef<HTMLInputElement>(null);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const [emailInput, setEmailInput] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPass = pinInput.trim();

    if (cleanEmail === 'sarvottamyadav789@gmail.com' && cleanPass === 'GBADMIN2026') {
      setIsAuthenticated(true);
      localStorage.setItem('gb_admin_auth', 'true');
      localStorage.setItem('gb_admin_owner_email', 'sarvottamyadav789@gmail.com');
      localStorage.setItem('gb_admin_owner_name', 'Sarvottam Yadav');
      setPinError('');
    } else {
      setPinError('Invalid Credentials! Access Denied.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('gb_admin_auth');
  };

  const handleSaveApiKey = () => {
    if (!geminiKeyInput.trim()) {
      showStatus('Please enter an API key', 'error');
      return;
    }
    localStorage.setItem('gb_gemini_api_key', geminiKeyInput.trim());
    showStatus('Gemini API Key saved! Active for GB AI doubt solver.');
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('gb_gemini_api_key');
    setGeminiKeyInput('');
    showStatus('API Key removed from browser storage.');
  };

  const [isEnhancingIcon, setIsEnhancingIcon] = useState(false);
  const [isEnhancingBanner, setIsEnhancingBanner] = useState(false);

  // Helper for platform icon upload (Auto-Enhanced to 8K Razor-Sharp Definition)
  const processIconImageFile = async (file: File, callback: (dataUrl: string) => void) => {
    if (!file.type.startsWith('image/')) {
      showStatus('Please select a valid image file', 'error');
      return;
    }
    setIsEnhancingIcon(true);
    showStatus('Enhancing icon to 8K Ultra-HD Quality...');
    try {
      const enhanced = await enhanceImageTo8KQuality(file, 'icon');
      callback(enhanced);
      showStatus('✨ Icon automatically enhanced to 8K Ultra-HD Quality!');
    } catch {
      showStatus('Error enhancing icon to 8K', 'error');
    } finally {
      setIsEnhancingIcon(false);
    }
  };

  // Helper for 8K / 4K / Ultra-HD Carousel Banner Upload (Auto-Enhanced to 8K Razor-Sharp Definition)
  const processBannerImageFile = async (file: File, callback: (dataUrl: string) => void) => {
    if (!file.type.startsWith('image/')) {
      showStatus('Please select a valid image file', 'error');
      return;
    }
    setIsEnhancingBanner(true);
    showStatus('Enhancing banner to 8K Ultra-HD Clarity...');
    try {
      const enhanced = await enhanceImageTo8KQuality(file, 'banner');
      callback(enhanced);
      showStatus('✨ Banner automatically enhanced to 8K Ultra-HD Quality!');
    } catch {
      showStatus('Error enhancing banner to 8K', 'error');
    } finally {
      setIsEnhancingBanner(false);
    }
  };

  // 1-Click Auto 8K Enhance for Icon (works on pasted URLs or existing icons)
  const handleEnhanceIconUrl = async () => {
    if (!platformForm.icon.trim()) {
      showStatus('Please enter an icon image URL or select photo first', 'error');
      return;
    }
    setIsEnhancingIcon(true);
    showStatus('Enhancing icon to 8K Ultra-HD Quality...');
    try {
      const enhanced = await enhanceImageTo8KQuality(platformForm.icon, 'icon');
      setPlatformForm((prev) => ({ ...prev, icon: enhanced }));
      showStatus('✨ Icon enhanced to 8K Ultra-HD Quality!');
    } catch {
      showStatus('Could not enhance image. Check URL access.', 'error');
    } finally {
      setIsEnhancingIcon(false);
    }
  };

  // 1-Click Auto 8K Enhance for Banner (works on pasted URLs or existing banners)
  const handleEnhanceBannerUrl = async () => {
    if (!slideForm.image.trim()) {
      showStatus('Please enter a banner image URL or select photo first', 'error');
      return;
    }
    setIsEnhancingBanner(true);
    showStatus('Enhancing banner to 8K Ultra-HD Clarity...');
    try {
      const enhanced = await enhanceImageTo8KQuality(slideForm.image, 'banner');
      setSlideForm((prev) => ({ ...prev, image: enhanced }));
      showStatus('✨ Banner enhanced to 8K Ultra-HD Quality!');
    } catch {
      showStatus('Could not enhance image. Check URL access.', 'error');
    } finally {
      setIsEnhancingBanner(false);
    }
  };

  // PLATFORM ACTIONS
  const handleOpenAddPlatform = () => {
    setIsAddingPlatform(true);
    setEditingPlatform(null);
    setPlatformForm({
      id: 'plat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: '',
      subtitle: 'Open platform to explore content.',
      icon: '/assets/gb_study_icon.png',
      targetUrl: '',
      openMode: 'internal',
      badge: '',
      order: platforms.length + 1,
    });
  };

  const handleOpenEditPlatform = (p: PlatformItem) => {
    setEditingPlatform(p);
    setIsAddingPlatform(false);
    setPlatformForm({
      id: p.id,
      name: p.name,
      subtitle: p.subtitle,
      icon: p.icon,
      targetUrl: p.targetUrl || '',
      openMode: p.openMode || 'internal',
      badge: p.badge || '',
      order: p.order || 1,
    });
  };

  const handleSavePlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platformForm.name.trim()) {
      showStatus('Platform name is required', 'error');
      return;
    }
    if (!platformForm.icon.trim()) {
      showStatus('Platform icon is required (URL or Photo upload)', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const item: PlatformItem = {
        id: platformForm.id || 'platform-' + Date.now(),
        name: platformForm.name.trim(),
        subtitle: platformForm.subtitle.trim(),
        icon: platformForm.icon.trim(),
        targetUrl: platformForm.targetUrl.trim(),
        openMode: platformForm.openMode,
        badge: platformForm.badge.trim() || undefined,
        order: Number(platformForm.order) || 1,
      };

      const res = await savePlatform(item);
      if (res && res.syncedToCloud) {
        showStatus(`Platform "${item.name}" saved & synced to Cloud!`);
      } else {
        showStatus(`Platform "${item.name}" saved permanently in local storage!`);
      }
      setIsAddingPlatform(false);
      setEditingPlatform(null);
    } catch (err) {
      showStatus('Notice: ' + String(err), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlatform = async (p: PlatformItem) => {
    if (confirm(`Are you sure you want to delete "${p.name}"? It will be removed permanently.`)) {
      try {
        await deletePlatformFromDb(p.id);
        showStatus(`Platform "${p.name}" permanently deleted!`);
      } catch (err) {
        showStatus('Notice: ' + String(err), 'error');
      }
    }
  };

  // CAROUSEL ACTIONS
  const handleOpenAddSlide = () => {
    setIsAddingSlide(true);
    setEditingSlide(null);
    setSlideForm({
      id: 'slide-' + Date.now(),
      title: '',
      subtitle: '',
      image: '/assets/banner_study.png',
      targetUrl: '',
      openMode: 'internal',
      order: carouselSlides.length + 1,
    });
  };

  const handleOpenEditSlide = (slide: CarouselSlide) => {
    setEditingSlide(slide);
    setIsAddingSlide(false);
    setSlideForm({
      id: slide.id,
      title: slide.title,
      subtitle: slide.subtitle,
      image: slide.image,
      targetUrl: slide.targetUrl || '',
      openMode: slide.openMode || 'internal',
      order: slide.order || 1,
    });
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideForm.title.trim()) {
      showStatus('Slide title is required', 'error');
      return;
    }
    if (!slideForm.image.trim()) {
      showStatus('Slide banner image is required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const slide: CarouselSlide = {
        id: slideForm.id || 'slide-' + Date.now(),
        title: slideForm.title.trim(),
        subtitle: slideForm.subtitle.trim(),
        image: slideForm.image.trim(),
        targetUrl: slideForm.targetUrl.trim() || undefined,
        openMode: slideForm.openMode,
        order: Number(slideForm.order) || 1,
      };

      const res = await saveCarouselSlide(slide);
      if (res && res.syncedToCloud) {
        showStatus(`Carousel banner "${slide.title}" saved & synced to Cloud!`);
      } else {
        showStatus(`Carousel banner "${slide.title}" saved permanently in local storage!`);
      }
      setIsAddingSlide(false);
      setEditingSlide(null);
    } catch (err) {
      showStatus('Notice: ' + String(err), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSlide = async (slide: CarouselSlide) => {
    if (confirm(`Delete carousel banner "${slide.title}"?`)) {
      try {
        await deleteCarouselSlideFromDb(slide.id);
        showStatus(`Slide "${slide.title}" permanently removed!`);
      } catch (err) {
        showStatus('Notice: ' + String(err), 'error');
      }
    }
  };

  // BACKUP & RESTORE ACTIONS
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    try {
      const json = exportDataBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gb-study-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showStatus('All Platforms & Carousels exported to backup file!');
    } catch {
      showStatus('Error exporting backup file', 'error');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const res = await importDataBackup(text);
        showStatus(`Backup imported successfully! (${res.count.platforms} platforms, ${res.count.slides} banners)`);
      } catch (err) {
        showStatus('Invalid backup JSON file: ' + String(err), 'error');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleResetDefaults = async () => {
    if (confirm('Reset to standard default 13 platforms? (Deleted IDs blacklist will be cleared)')) {
      await resetPlatformsToDefault();
      showStatus('Default platforms restored successfully!');
    }
  };

  // LOGIN SCREEN FOR ADMIN
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-sm rounded-[32px] bg-[#101524] border border-sky-500/30 p-7 shadow-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-400/40 flex items-center justify-center text-sky-400 mb-4 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            GB Study Admin Panel
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Authorized access for Sarvottam Yadav (Owner)
          </p>

          <form onSubmit={handleLogin} className="w-full mt-6 space-y-3.5 text-left">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter authorized email"
                autoComplete="off"
                className="w-full px-4 py-2.5 rounded-xl bg-[#161f33] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter authorized password"
                  autoComplete="off"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-[#161f33] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {pinError && (
              <p className="text-xs text-rose-400 flex items-center justify-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{pinError}</span>
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md cursor-pointer"
              >
                Unlock Panel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#070a10] text-slate-100 overflow-hidden animate-in fade-in duration-200">
      {/* Top Admin Header */}
      <div className="px-4 py-3.5 border-b border-slate-800 bg-[#0e1422] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Return to App"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <h1 className="text-base font-black text-white">
                GB Study Admin Control
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              GB Unlimited Database • Sarvottam Yadav
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-rose-900/40 hover:text-rose-300 text-slate-400 text-xs font-semibold transition-colors cursor-pointer"
          >
            Lock
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-sky-500/20 text-sky-400 hover:bg-sky-500 hover:text-slate-950 transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMsg && (
        <div
          className={`px-4 py-2.5 text-xs font-bold text-center flex items-center justify-center gap-2 shrink-0 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 border-b border-rose-500/30'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Segment Tabs */}
      <div className="px-4 py-2 bg-[#0b101c] border-b border-slate-800 flex gap-2 shrink-0">
        <button
          onClick={() => {
            setActiveTab('platforms');
            setIsAddingPlatform(false);
            setEditingPlatform(null);
          }}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'platforms'
              ? 'bg-sky-500 text-slate-950 shadow-md'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Platforms Hub ({platforms.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('carousel');
            setIsAddingSlide(false);
            setEditingSlide(null);
          }}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'carousel'
              ? 'bg-sky-500 text-slate-950 shadow-md'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Carousel ({carouselSlides.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('ai-key');
            setIsAddingPlatform(false);
            setIsAddingSlide(false);
          }}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'ai-key'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-black'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>AI & Key</span>
        </button>
      </div>

      {/* Unlimited Native Database Status Notice */}
      <div className="mx-4 mt-2 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-200">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-emerald-300">GB Ultra Native Database:</span>
          <span className="text-[11px] text-emerald-200/90 font-medium">100% Free & Unlimited (Zero Quotas, No Read Limits)</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
          Unlimited Active
        </span>
      </div>

      {/* Quick Backup & Utilities Bar */}
      <div className="px-4 py-2 bg-[#0d1322] border-b border-slate-800/80 flex items-center justify-between text-xs gap-2">
        <span className="text-[11px] text-slate-400 font-medium">Data Safety:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            title="Download JSON backup of all platforms & carousel slides"
          >
            <Download className="w-3 h-3 text-sky-400" />
            <span>Export Backup</span>
          </button>

          <button
            onClick={() => backupFileInputRef.current?.click()}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            title="Import JSON backup file"
          >
            <Upload className="w-3 h-3 text-emerald-400" />
            <span>Import</span>
          </button>
          <input
            type="file"
            ref={backupFileInputRef}
            onChange={handleImportBackup}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            onClick={handleResetDefaults}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            title="Restore default 13 platforms"
          >
            <RefreshCw className="w-3 h-3 text-rose-400" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {/* ============================================================== */}
        {/* PLATFORMS MANAGEMENT TAB */}
        {/* ============================================================== */}
        {activeTab === 'platforms' && (
          <div className="space-y-4">
            {/* If Adding or Editing a Platform */}
            {isAddingPlatform || editingPlatform ? (
              <form
                onSubmit={handleSavePlatform}
                className="rounded-3xl bg-[#111728] border border-sky-500/30 p-5 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-sky-400" />
                    <span>
                      {isAddingPlatform ? 'Add New Platform' : `Edit Platform: ${platformForm.name}`}
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingPlatform(false);
                      setEditingPlatform(null);
                    }}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                {/* Platform Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Platform Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={platformForm.name}
                    onChange={(e) =>
                      setPlatformForm({ ...platformForm, name: e.target.value })
                    }
                    placeholder="e.g. Physics Wallah, Careerwill, etc."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#162035] border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-400"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Subtitle / Description
                  </label>
                  <input
                    type="text"
                    value={platformForm.subtitle}
                    onChange={(e) =>
                      setPlatformForm({ ...platformForm, subtitle: e.target.value })
                    }
                    placeholder="e.g. 200+ app& server, Open platform to explore..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#162035] border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-400"
                  />
                </div>

                {/* Target URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <Link className="w-3.5 h-3.5 text-sky-400" />
                    <span>Target URL (Website or App Link)</span>
                  </label>
                  <input
                    type="text"
                    value={platformForm.targetUrl}
                    onChange={(e) =>
                      setPlatformForm({ ...platformForm, targetUrl: e.target.value })
                    }
                    placeholder="https://example.com (leave empty for native in-app Batches study)"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#162035] border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-400 font-mono"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Khali chhodne par app ka in-app Batches & Study screen khulega.
                  </span>
                </div>

                {/* Open Mode Selection (CRITICAL USER REQUIREMENT) */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                    <span>Open Mode (Kis Tarah Chalana Hai) *</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        mode: 'internal',
                        label: 'Internal (In-App View)',
                        desc: 'App ke andar hi chalega',
                      },
                      {
                        mode: 'external',
                        label: 'External Browser',
                        desc: 'Phone ke default browser me',
                      },
                      {
                        mode: 'new_tab',
                        label: 'New Tab (_blank)',
                        desc: 'Naye tab me khulega',
                      },
                      {
                        mode: 'same_tab',
                        label: 'Same Tab (_self)',
                        desc: 'Isi tab me khulega',
                      },
                    ].map((item) => (
                      <button
                        key={item.mode}
                        type="button"
                        onClick={() =>
                          setPlatformForm({
                            ...platformForm,
                            openMode: item.mode as OpenMode,
                          })
                        }
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          platformForm.openMode === item.mode
                            ? 'bg-sky-500/20 border-sky-400 text-white shadow-sm'
                            : 'bg-[#162035] border-slate-700/60 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="font-bold text-xs">{item.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {item.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Platform Icon: URL OR Photo Upload (CRITICAL USER REQUIREMENT) */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Image className="w-3.5 h-3.5 text-sky-400" />
                      <span>Platform Icon (Photo Upload ya Image URL)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Photo / URL Dono Supported</span>
                  </label>

                  {/* Icon Preview */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#162035] border border-slate-700">
                    <div className="w-14 h-14 rounded-xl bg-black border border-slate-600 overflow-hidden shrink-0 flex items-center justify-center p-1">
                      {platformForm.icon ? (
                        <img
                          src={platformForm.icon}
                          alt="Icon Preview"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Image className="w-6 h-6 text-slate-500" />
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={platformForm.icon}
                        onChange={(e) =>
                          setPlatformForm({ ...platformForm, icon: e.target.value })
                        }
                        placeholder="Image URL paste karein..."
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0f1422] border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-sky-400"
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => platformFileRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Photo Upload Karein</span>
                        </button>

                        <button
                          type="button"
                          disabled={isEnhancingIcon}
                          onClick={handleEnhanceIconUrl}
                          className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-sky-500/20 border border-amber-400/40 hover:border-amber-400 text-amber-300 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                          title="Auto-enhance icon to 8K razor-sharp quality"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isEnhancingIcon ? 'Enhancing to 8K...' : '✨ Auto 8K Enhance'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setPlatformForm({
                              ...platformForm,
                              icon: '/assets/gb_study_icon.png',
                            })
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                        >
                          Use GB Logo
                        </button>
                      </div>

                      <input
                        ref={platformFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            processIconImageFile(file, (dataUrl) => {
                              setPlatformForm((prev) => ({ ...prev, icon: dataUrl }));
                              showStatus('Platform photo uploaded successfully!');
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Badge & Order */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Badge (Optional)
                    </label>
                    <input
                      type="text"
                      value={platformForm.badge}
                      onChange={(e) =>
                        setPlatformForm({ ...platformForm, badge: e.target.value })
                      }
                      placeholder="e.g. Official, Trending"
                      className="w-full px-3 py-2 rounded-xl bg-[#162035] border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Display Order (Number)
                    </label>
                    <input
                      type="number"
                      value={platformForm.order}
                      onChange={(e) =>
                        setPlatformForm({
                          ...platformForm,
                          order: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#162035] border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-black text-sm shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Platform'}
                </button>
              </form>
            ) : (
              /* Add Platform Trigger Button */
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Live Platforms List</h3>
                  <p className="text-[11px] text-slate-400">
                    Real-time synchronized across all student devices
                  </p>
                </div>
                <button
                  onClick={handleOpenAddPlatform}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Platform</span>
                </button>
              </div>
            )}

            {/* Platform Items List */}
            <div className="space-y-2.5">
              {platforms.map((p, idx) => (
                <div
                  key={p.id}
                  className="rounded-2xl bg-[#0f1422] border border-slate-800 p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-slate-500 w-5 text-center">
                      {idx + 1}
                    </span>
                    <div className="w-11 h-11 rounded-xl bg-black/60 border border-slate-700 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                      <img
                        src={p.icon}
                        alt={p.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white truncate">
                          {p.name}
                        </h4>
                        {p.badge && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold uppercase">
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-sky-300">
                          Mode: {p.openMode || 'internal'}
                        </span>
                        {p.targetUrl && (
                          <span className="truncate max-w-[120px] text-slate-500 font-mono">
                            {p.targetUrl}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEditPlatform(p)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-sky-500/20 hover:text-sky-400 text-slate-300 transition-colors cursor-pointer"
                      title="Edit Platform"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePlatform(p)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 transition-colors cursor-pointer"
                      title="Delete Platform"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* CAROUSEL BANNERS MANAGEMENT TAB */}
        {/* ============================================================== */}
        {activeTab === 'carousel' && (
          <div className="space-y-4">
            {isAddingSlide || editingSlide ? (
              <form
                onSubmit={handleSaveSlide}
                className="rounded-3xl bg-[#111728] border border-sky-500/30 p-5 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>
                      {isAddingSlide ? 'Add Carousel Banner' : `Edit Banner: ${slideForm.title}`}
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingSlide(false);
                      setEditingSlide(null);
                    }}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Banner Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={slideForm.title}
                    onChange={(e) =>
                      setSlideForm({ ...slideForm, title: e.target.value })
                    }
                    placeholder="e.g. GB STUDY MEGA BATCH, CRIC LIVE..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#162035] border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Banner Subtitle
                  </label>
                  <input
                    type="text"
                    value={slideForm.subtitle}
                    onChange={(e) =>
                      setSlideForm({ ...slideForm, subtitle: e.target.value })
                    }
                    placeholder="e.g. Sarvottam Yadav • Live TV from every country"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#162035] border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-400"
                  />
                </div>

                {/* Banner Image: URL OR Upload (CRITICAL USER REQUIREMENT) */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Image className="w-3.5 h-3.5 text-sky-400" />
                      <span>Banner Photo (Photo Upload ya Image URL)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Photo / URL Dono Supported</span>
                  </label>

                  {/* Banner Preview */}
                  <div className="rounded-2xl bg-[#162035] border border-slate-700 p-3 space-y-3">
                    <div className="w-full aspect-[16/8] rounded-xl bg-black border border-slate-700 overflow-hidden relative flex items-center justify-center">
                      {slideForm.image ? (
                        <img
                          src={slideForm.image}
                          alt="Banner Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-slate-500 text-xs flex flex-col items-center gap-1">
                          <Image className="w-6 h-6" />
                          <span>No Image Selected</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        value={slideForm.image}
                        onChange={(e) =>
                          setSlideForm({ ...slideForm, image: e.target.value })
                        }
                        placeholder="Image URL paste karein..."
                        className="flex-1 min-w-[180px] px-3 py-2 rounded-xl bg-[#0f1422] border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-sky-400"
                      />

                      <button
                        type="button"
                        onClick={() => slideFileRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>

                      <button
                        type="button"
                        disabled={isEnhancingBanner}
                        onClick={handleEnhanceBannerUrl}
                        className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-sky-500/20 border border-amber-400/40 hover:border-amber-400 text-amber-300 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer disabled:opacity-50"
                        title="Auto-enhance banner to 8K razor-sharp quality"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isEnhancingBanner ? 'Enhancing to 8K...' : '✨ Auto 8K Enhance'}</span>
                      </button>

                      <input
                        ref={slideFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            processBannerImageFile(file, (dataUrl) => {
                              setSlideForm((prev) => ({ ...prev, image: dataUrl }));
                              showStatus('Ultra-HD 8K/4K banner processed with crystal clarity!');
                            });
                          }
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>✨ Auto 8K Enhance Engine Active: Koi bhi photo ya image URL lagate hi 8K quality me automatically sharpen aur HDR boost ho jaata hai!</span>
                    </p>
                  </div>
                </div>

                {/* Target URL & Open Mode for Banner */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Click Link / Target URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={slideForm.targetUrl}
                    onChange={(e) =>
                      setSlideForm({ ...slideForm, targetUrl: e.target.value })
                    }
                    placeholder="https://... (URL open karne ke liye)"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#162035] border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={slideForm.order}
                    onChange={(e) =>
                      setSlideForm({ ...slideForm, order: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-[#162035] border border-slate-700 text-white text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-black text-sm shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Banner'}
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Hero Carousel Banners</h3>
                  <p className="text-[11px] text-slate-400">
                    Add, edit or delete banners shown to all students
                  </p>
                </div>
                <button
                  onClick={handleOpenAddSlide}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Banner</span>
                </button>
              </div>
            )}

            {/* List of Carousel Slides */}
            <div className="space-y-3">
              {carouselSlides.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#0f1422] border border-slate-800 text-center">
                  <p className="text-slate-400 text-xs">
                    Abhi koi banner nahi hai. Default 4 banners hata diye gaye hain. Upar "+ Add Banner" dabakar aap naya custom 8K Ultra-HD banner jod sakte hain!
                  </p>
                </div>
              ) : (
                carouselSlides.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className="rounded-2xl bg-[#0f1422] border border-slate-800 p-3 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[11px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white">{slide.title}</h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditSlide(slide)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-500/20 hover:text-sky-400 text-slate-300 transition-colors cursor-pointer"
                          title="Edit Banner"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlide(slide)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 transition-colors cursor-pointer"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="w-full aspect-[16/7] rounded-xl overflow-hidden bg-black border border-slate-800 relative">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                      {slide.subtitle && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/70 p-2 text-xs text-slate-300">
                          {slide.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* AI & API KEY CONFIGURATION TAB */}
        {/* ============================================================== */}
        {activeTab === 'ai-key' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#0f1422] border border-amber-500/40 p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Gemini AI API Key Setup</h3>
                  <p className="text-xs text-slate-400">
                    GitHub push protection se bachne ke liye API key yahan add karein
                  </p>
                </div>
              </div>

              {/* Status indicator */}
              <div className="p-3.5 rounded-xl bg-[#162035] border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      geminiKeyInput ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-xs font-bold text-white">
                    {geminiKeyInput ? 'Custom API Key Active' : 'Default Hybrid Study Solver'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {geminiKeyInput ? `${geminiKeyInput.slice(0, 6)}••••••••` : 'Built-in'}
                </span>
              </div>

              {/* Input field */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-slate-300">
                  Enter Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    value={geminiKeyInput}
                    onChange={(e) => setGeminiKeyInput(e.target.value)}
                    placeholder="Paste Gemini API key (e.g. AIzaSy... or AQ...)"
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-[#162035] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Yeh key aapke device aur server me secure rehti hai. GitHub repository me expose nahi hoti.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md cursor-pointer active:scale-95 transition-all"
                >
                  Save API Key
                </button>

                <button
                  type="button"
                  onClick={handleClearApiKey}
                  disabled={!geminiKeyInput}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-rose-900/40 hover:text-rose-300 text-slate-400 font-bold text-xs disabled:opacity-40 cursor-pointer transition-all"
                >
                  Clear Key
                </button>
              </div>
            </div>

            {/* Vercel Deployment Guide Card */}
            <div className="rounded-2xl bg-[#0f1422] border border-slate-800 p-4 space-y-2.5 text-left">
              <h4 className="text-xs font-extrabold tracking-wide uppercase text-sky-400">
                🚀 Vercel 1-Click Deployment Ready
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Aap is repo ko direct GitHub se Vercel par bina kisi error ke deploy kar sakte hain:
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                <li><b className="text-white">Framework:</b> Vite (Auto-detected by Vercel)</li>
                <li><b className="text-white">Build Command:</b> npm run build</li>
                <li><b className="text-white">Output Directory:</b> dist</li>
                <li><b className="text-white">Vercel Environment Variable:</b> Vercel Project Settings &gt; Environment Variables me <code className="text-amber-300 bg-black/50 px-1 py-0.5 rounded">GEMINI_API_KEY</code> add kar sakte hain.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
