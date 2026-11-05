import { PlatformItem, CarouselSlide, ChatMessage } from '../types.ts';
import { INITIAL_PLATFORMS } from '../data/platforms.ts';
import { INITIAL_SLIDES } from '../data/carousel.ts';

const STORAGE_KEYS = {
  PLATFORMS: 'gb_study_server_platforms_v4',
  CAROUSEL: 'gb_study_server_carousel_v4',
  MESSAGES: 'gb_study_server_messages_v4',
};

// Global in-memory subscribers for real-time reactivity
const platformListeners = new Set<(platforms: PlatformItem[]) => void>();
const carouselListeners = new Set<(slides: CarouselSlide[]) => void>();
const messageListeners = new Set<(messages: ChatMessage[]) => void>();

export function getFirestoreQuotaStatus() {
  return {
    isQuotaExceeded: false,
    message: 'GB Native Realtime Engine Active (100% Free & Unlimited)',
    consoleUrl: '',
  };
}

/* -------------------- LOCAL PERSISTENCE HELPERS -------------------- */

export function getStoredPlatforms(): PlatformItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLATFORMS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored platforms:', e);
  }
  return INITIAL_PLATFORMS;
}

export function saveStoredPlatforms(items: PlatformItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PLATFORMS, JSON.stringify(items));
  } catch (e) {
    console.warn('Error saving stored platforms:', e);
  }
}

export function getStoredCarousel(): CarouselSlide[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CAROUSEL);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored carousel:', e);
  }
  return INITIAL_SLIDES;
}

export function saveStoredCarousel(slides: CarouselSlide[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CAROUSEL, JSON.stringify(slides));
  } catch (e) {
    console.warn('Error saving stored carousel:', e);
  }
}

export function getStoredMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored messages:', e);
  }
  return [];
}

export function saveStoredMessages(messages: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  } catch (e) {
    console.warn('Error saving stored messages:', e);
  }
}

function notifyPlatformListeners(items: PlatformItem[]) {
  saveStoredPlatforms(items);
  platformListeners.forEach((fn) => {
    try {
      fn(items);
    } catch (e) {
      console.warn('Error in platform listener:', e);
    }
  });
}

function notifyCarouselListeners(items: CarouselSlide[]) {
  saveStoredCarousel(items);
  carouselListeners.forEach((fn) => {
    try {
      fn(items);
    } catch (e) {
      console.warn('Error in carousel listener:', e);
    }
  });
}

function notifyMessageListeners(items: ChatMessage[]) {
  saveStoredMessages(items);
  messageListeners.forEach((fn) => {
    try {
      fn(items);
    } catch (e) {
      console.warn('Error in message listener:', e);
    }
  });
}

/* -------------------- REAL-TIME SERVER-SENT EVENTS (SSE) STREAM -------------------- */

let eventSourceInstance: EventSource | null = null;
let sseReconnectTimeout: NodeJS.Timeout | null = null;

function initRealtimeSync() {
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;
  if (eventSourceInstance && eventSourceInstance.readyState !== EventSource.CLOSED) return;

  try {
    eventSourceInstance = new EventSource('/api/events');

    eventSourceInstance.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (!data) return;

        if (data.type === 'init') {
          if (Array.isArray(data.platforms)) notifyPlatformListeners(data.platforms);
          if (Array.isArray(data.carousel)) notifyCarouselListeners(data.carousel);
          if (Array.isArray(data.messages)) notifyMessageListeners(data.messages);
        } else if (data.type === 'platforms' && Array.isArray(data.payload)) {
          notifyPlatformListeners(data.payload);
        } else if (data.type === 'carousel' && Array.isArray(data.payload)) {
          notifyCarouselListeners(data.payload);
        } else if (data.type === 'messages' && Array.isArray(data.payload)) {
          notifyMessageListeners(data.payload);
        }
      } catch (err) {
        console.warn('Error processing realtime SSE message:', err);
      }
    };

    eventSourceInstance.onerror = () => {
      if (eventSourceInstance) {
        eventSourceInstance.close();
        eventSourceInstance = null;
      }
      if (!sseReconnectTimeout) {
        sseReconnectTimeout = setTimeout(() => {
          sseReconnectTimeout = null;
          initRealtimeSync();
        }, 3000);
      }
    };
  } catch (err) {
    console.warn('Error initializing realtime SSE connection:', err);
  }
}

// Start SSE stream immediately
if (typeof window !== 'undefined') {
  initRealtimeSync();
}

/* -------------------- HTTP FALLBACK POLLING -------------------- */

async function fetchServerPlatforms() {
  try {
    const res = await fetch('/api/platforms');
    if (!res.ok) return;
    const data = await res.json();
    if (data && Array.isArray(data.platforms)) {
      notifyPlatformListeners(data.platforms);
    }
  } catch (err) {
    console.warn('Server platforms fetch notice:', err);
  }
}

async function fetchServerCarousel() {
  try {
    const res = await fetch('/api/carousel');
    if (!res.ok) return;
    const data = await res.json();
    if (data && Array.isArray(data.carousel)) {
      notifyCarouselListeners(data.carousel);
    }
  } catch (err) {
    console.warn('Server carousel fetch notice:', err);
  }
}

async function fetchServerMessages() {
  try {
    const res = await fetch('/api/messages');
    if (!res.ok) return;
    const data = await res.json();
    if (data && Array.isArray(data.messages)) {
      notifyMessageListeners(data.messages);
    }
  } catch (err) {
    console.warn('Server messages fetch notice:', err);
  }
}

/* -------------------- SUBSCRIPTION EXPORTS -------------------- */

export async function seedInitialPlatformsIfEmpty() {}
export async function seedInitialCarouselIfEmpty() {}
export async function seedInitialMessagesIfEmpty() {}

/**
 * Real-time listener for platforms across ALL devices.
 */
export function subscribeToPlatforms(onUpdate: (platforms: PlatformItem[]) => void) {
  platformListeners.add(onUpdate);

  // 1. Deliver local cache instantly (0ms)
  onUpdate(getStoredPlatforms());

  // 2. Fetch authoritative state from server
  fetchServerPlatforms();
  initRealtimeSync();

  // 3. Heartbeat polling every 4 seconds to guarantee sync even across sleeping phone screens
  const interval = setInterval(fetchServerPlatforms, 4000);

  return () => {
    platformListeners.delete(onUpdate);
    clearInterval(interval);
  };
}

/**
 * Real-time listener for carousel banners across ALL devices.
 */
export function subscribeToCarousel(onUpdate: (slides: CarouselSlide[]) => void) {
  carouselListeners.add(onUpdate);

  onUpdate(getStoredCarousel());
  fetchServerCarousel();
  initRealtimeSync();

  const interval = setInterval(fetchServerCarousel, 4000);

  return () => {
    carouselListeners.delete(onUpdate);
    clearInterval(interval);
  };
}

/**
 * Real-time listener for community messages across ALL devices.
 */
export function subscribeToMessages(onUpdate: (messages: ChatMessage[]) => void) {
  messageListeners.add(onUpdate);

  onUpdate(getStoredMessages());
  fetchServerMessages();
  initRealtimeSync();

  const interval = setInterval(fetchServerMessages, 3000);

  return () => {
    messageListeners.delete(onUpdate);
    clearInterval(interval);
  };
}

/* -------------------- PLATFORM MUTATIONS -------------------- */

/**
 * Save or update a platform.
 * Server immediately persists to database and broadcasts to ALL connected phones.
 */
export async function savePlatform(platform: PlatformItem): Promise<{ syncedToCloud: boolean }> {
  const cleanPlatform: PlatformItem = {
    id: platform.id,
    name: platform.name ? platform.name.trim() : 'Platform',
    subtitle: platform.subtitle ? platform.subtitle.trim() : '',
    icon: platform.icon || '/assets/gb_study_icon.png',
    openMode: platform.openMode || 'internal',
    order: Number(platform.order) || 1,
    targetUrl: platform.targetUrl ? platform.targetUrl.trim() : '',
    badge: platform.badge ? platform.badge.trim() : undefined,
  };

  // Optimistic local update
  const current = getStoredPlatforms();
  const existingIdx = current.findIndex((p) => p.id === cleanPlatform.id);
  let updatedList: PlatformItem[];

  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = cleanPlatform;
  } else {
    updatedList = [cleanPlatform, ...current];
  }

  updatedList.sort((a, b) => (Number(a.order) || 999) - (Number(b.order) || 999));
  notifyPlatformListeners(updatedList);

  let synced = false;
  try {
    const res = await fetch('/api/platforms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanPlatform),
    });
    synced = res.ok;
  } catch (err) {
    console.warn('Server save platform warning:', err);
  }

  return { syncedToCloud: synced };
}

/**
 * Delete a platform permanently.
 * Server deletes it from database and instantly broadcasts deletion to ALL users' phones.
 */
export async function deletePlatformFromDb(platformId: string): Promise<void> {
  // Optimistic local deletion
  const current = getStoredPlatforms();
  const remaining = current.filter((p) => p.id !== platformId);
  notifyPlatformListeners(remaining);

  // Authoritative server delete (broadcasts to all devices)
  try {
    await fetch(`/api/platforms/${encodeURIComponent(platformId)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Server delete platform warning:', err);
  }
}

/* -------------------- CAROUSEL MUTATIONS -------------------- */

export async function saveCarouselSlide(slide: CarouselSlide): Promise<{ syncedToCloud: boolean }> {
  const cleanSlide: CarouselSlide = {
    id: slide.id,
    title: slide.title ? slide.title.trim() : 'Banner',
    subtitle: slide.subtitle ? slide.subtitle.trim() : '',
    image: slide.image || '',
    openMode: slide.openMode || 'internal',
    order: Number(slide.order) || 1,
    targetUrl: slide.targetUrl ? slide.targetUrl.trim() : undefined,
  };

  const current = getStoredCarousel();
  const existingIdx = current.findIndex((s) => s.id === cleanSlide.id);
  let updatedList: CarouselSlide[];

  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = cleanSlide;
  } else {
    updatedList = [cleanSlide, ...current];
  }

  updatedList.sort((a, b) => (Number(a.order) || 999) - (Number(b.order) || 999));
  notifyCarouselListeners(updatedList);

  let synced = false;
  try {
    const res = await fetch('/api/carousel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanSlide),
    });
    synced = res.ok;
  } catch (err) {
    console.warn('Server save carousel warning:', err);
  }

  return { syncedToCloud: synced };
}

export async function deleteCarouselSlideFromDb(slideId: string): Promise<void> {
  const current = getStoredCarousel();
  const remaining = current.filter((s) => s.id !== slideId);
  notifyCarouselListeners(remaining);

  try {
    await fetch(`/api/carousel/${encodeURIComponent(slideId)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Server delete slide warning:', err);
  }
}

/* -------------------- CHAT MUTATIONS -------------------- */

export async function sendMessageToDb(message: ChatMessage): Promise<void> {
  const cleanMsg: ChatMessage = {
    id: message.id,
    senderName: message.senderName || 'Student',
    senderId: message.senderId || 'student-user',
    isOwner: Boolean(message.isOwner),
    isAdmin: Boolean(message.isAdmin),
    createdAt: message.createdAt || new Date().toISOString(),
    text: message.text ? message.text.trim() : '',
    imageUrl: message.imageUrl,
    senderEmail: message.senderEmail ? message.senderEmail.trim() : undefined,
    avatar: message.avatar ? message.avatar.trim() : undefined,
  };

  const current = getStoredMessages();
  notifyMessageListeners([...current, cleanMsg]);

  try {
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanMsg),
    });
  } catch (err) {
    console.warn('Server send message warning:', err);
  }
}

export async function deleteMessageFromDb(messageId: string): Promise<void> {
  const current = getStoredMessages();
  const remaining = current.filter((m) => m.id !== messageId);
  notifyMessageListeners(remaining);

  try {
    await fetch(`/api/messages/${encodeURIComponent(messageId)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Server delete message warning:', err);
  }
}

/* -------------------- BACKUP & RESET -------------------- */

export function exportDataBackup(): string {
  const data = {
    platforms: getStoredPlatforms(),
    carouselSlides: getStoredCarousel(),
    exportedAt: new Date().toISOString(),
    version: '4.0-realtime',
  };
  return JSON.stringify(data, null, 2);
}

export async function importDataBackup(jsonString: string): Promise<{ success: boolean; count: { platforms: number; slides: number } }> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || (!parsed.platforms && !parsed.carouselSlides)) {
      throw new Error('Invalid backup file format');
    }

    if (Array.isArray(parsed.platforms)) {
      notifyPlatformListeners(parsed.platforms);
    }
    if (Array.isArray(parsed.carouselSlides)) {
      notifyCarouselListeners(parsed.carouselSlides);
    }

    try {
      await fetch('/api/backup/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms: parsed.platforms,
          carousel: parsed.carouselSlides,
        }),
      });
    } catch {
      // Ignore
    }

    return {
      success: true,
      count: {
        platforms: Array.isArray(parsed.platforms) ? parsed.platforms.length : 0,
        slides: Array.isArray(parsed.carouselSlides) ? parsed.carouselSlides.length : 0,
      },
    };
  } catch (err) {
    console.error('Error importing backup:', err);
    throw err;
  }
}

export async function resetPlatformsToDefault(): Promise<PlatformItem[]> {
  const defaults = [...INITIAL_PLATFORMS];
  notifyPlatformListeners(defaults);

  try {
    await fetch('/api/platforms/reset', { method: 'POST' });
  } catch {
    // Ignore
  }

  return defaults;
}
