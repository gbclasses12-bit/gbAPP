import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase.ts';
import { PlatformItem, CarouselSlide, ChatMessage } from '../types.ts';
import { INITIAL_PLATFORMS } from '../data/platforms.ts';
import { INITIAL_SLIDES } from '../data/carousel.ts';

const PLATFORMS_PATH = 'platforms';
const CAROUSEL_PATH = 'carousel';
const MESSAGES_PATH = 'messages';

/**
 * Seed initial platforms to Firestore if empty.
 */
export async function seedInitialPlatformsIfEmpty() {
  try {
    const snap = await getDocs(collection(db, PLATFORMS_PATH));
    if (snap.empty) {
      console.log('Seeding initial platforms to Firestore...');
      const batch = writeBatch(db);
      for (const p of INITIAL_PLATFORMS) {
        const ref = doc(db, PLATFORMS_PATH, p.id);
        const cleanP: Record<string, any> = {
          id: p.id,
          name: p.name,
          subtitle: p.subtitle,
          icon: p.icon,
          openMode: p.openMode || 'internal',
          order: p.order || 999,
          updatedAt: new Date().toISOString(),
        };
        if (p.badge) cleanP.badge = p.badge;
        if (p.targetUrl) cleanP.targetUrl = p.targetUrl;
        batch.set(ref, cleanP);
      }
      await batch.commit();
    }
  } catch (err) {
    console.warn('Initial platforms seeding status:', err);
  }
}

/**
 * Seed initial carousel slides to Firestore if empty.
 */
export async function seedInitialCarouselIfEmpty() {
  try {
    const snap = await getDocs(collection(db, CAROUSEL_PATH));
    if (snap.empty) {
      console.log('Seeding initial carousel to Firestore...');
      const batch = writeBatch(db);
      for (const slide of INITIAL_SLIDES) {
        const ref = doc(db, CAROUSEL_PATH, slide.id);
        const cleanSlide: Record<string, any> = {
          id: slide.id,
          title: slide.title,
          subtitle: slide.subtitle,
          image: slide.image,
          openMode: slide.openMode || 'internal',
          order: slide.order || 999,
          updatedAt: new Date().toISOString(),
        };
        if (slide.targetUrl) cleanSlide.targetUrl = slide.targetUrl;
        batch.set(ref, cleanSlide);
      }
      await batch.commit();
    }
  } catch (err) {
    console.warn('Initial carousel seeding status:', err);
  }
}

/**
 * Seed initial welcoming messages to GB Chat discussion group if empty.
 */
export async function seedInitialMessagesIfEmpty() {
  try {
    const snap = await getDocs(collection(db, MESSAGES_PATH));
    if (snap.empty) {
      console.log('Seeding initial welcome message in GB Chat...');
      const initialMsg: ChatMessage = {
        id: 'msg-welcome-1',
        text: 'Namaste sabhi students! Swagat hai GB Study Official Discussion Group me 🚀 Yahan aap apne doubts, study notes, updates aur discussion share kar sakte hain. - Sarvottam Yadav',
        senderName: 'Sarvottam Yadav',
        senderId: 'owner-sarvottam',
        senderEmail: 'sarvottamyadav789@gmail.com',
        isOwner: true,
        isAdmin: true,
        avatar: '/assets/gb_study_icon.png',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      };
      await setDoc(doc(db, MESSAGES_PATH, initialMsg.id), initialMsg);
    }
  } catch (err) {
    console.error('Error seeding initial message:', err);
  }
}

/**
 * Real-time listener for platforms.
 */
export function subscribeToPlatforms(onUpdate: (platforms: PlatformItem[]) => void) {
  return onSnapshot(
    collection(db, PLATFORMS_PATH),
    (snapshot) => {
      if (snapshot.empty) {
        seedInitialPlatformsIfEmpty();
        onUpdate(INITIAL_PLATFORMS);
        return;
      }
      const items: PlatformItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as PlatformItem;
        items.push({
          ...data,
          id: docSnap.id,
        });
      });
      items.sort((a, b) => (a.order || 999) - (b.order || 999));
      onUpdate(items);
    },
    (error) => {
      console.warn('Realtime platforms sync notice:', error);
      onUpdate(INITIAL_PLATFORMS);
    }
  );
}

/**
 * Real-time listener for carousel slides.
 */
export function subscribeToCarousel(onUpdate: (slides: CarouselSlide[]) => void) {
  return onSnapshot(
    collection(db, CAROUSEL_PATH),
    (snapshot) => {
      if (snapshot.empty) {
        seedInitialCarouselIfEmpty();
        onUpdate(INITIAL_SLIDES);
        return;
      }
      const items: CarouselSlide[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as CarouselSlide;
        items.push({
          ...data,
          id: docSnap.id,
        });
      });
      items.sort((a, b) => (a.order || 999) - (b.order || 999));
      onUpdate(items);
    },
    (error) => {
      console.warn('Realtime carousel sync notice:', error);
      onUpdate(INITIAL_SLIDES);
    }
  );
}

/**
 * Real-time listener for Telegram-style GB Chat community messages.
 */
export function subscribeToMessages(onUpdate: (messages: ChatMessage[]) => void) {
  return onSnapshot(
    collection(db, MESSAGES_PATH),
    (snapshot) => {
      if (snapshot.empty) {
        seedInitialMessagesIfEmpty();
        onUpdate([]);
        return;
      }
      const items: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as ChatMessage;
        items.push({
          ...data,
          id: docSnap.id,
        });
      });
      // Sort chronologically ascending
      items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      onUpdate(items);
    },
    (error) => {
      console.warn('Realtime messages sync notice:', error);
      onUpdate([]);
    }
  );
}

/**
 * Save or update a platform document in Firestore.
 * Supports unlimited platforms (150+ platforms) synced in real-time.
 */
export async function savePlatform(platform: PlatformItem): Promise<void> {
  const path = `${PLATFORMS_PATH}/${platform.id}`;
  try {
    const cleanPlatform: Record<string, any> = {
      id: platform.id,
      name: platform.name ? platform.name.trim() : 'Platform',
      subtitle: platform.subtitle ? platform.subtitle.trim() : '',
      icon: platform.icon || '/assets/gb_study_icon.png',
      openMode: platform.openMode || 'internal',
      order: Number(platform.order) || 999,
      updatedAt: new Date().toISOString(),
    };
    if (platform.targetUrl && platform.targetUrl.trim()) {
      cleanPlatform.targetUrl = platform.targetUrl.trim();
    }
    if (platform.badge && platform.badge.trim()) {
      cleanPlatform.badge = platform.badge.trim();
    }

    const ref = doc(db, PLATFORMS_PATH, platform.id);
    await setDoc(ref, cleanPlatform);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Delete a platform from Firestore.
 */
export async function deletePlatformFromDb(platformId: string): Promise<void> {
  const path = `${PLATFORMS_PATH}/${platformId}`;
  try {
    const ref = doc(db, PLATFORMS_PATH, platformId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

/**
 * Save or update a carousel slide in Firestore.
 */
export async function saveCarouselSlide(slide: CarouselSlide): Promise<void> {
  const path = `${CAROUSEL_PATH}/${slide.id}`;
  try {
    const cleanSlide: Record<string, any> = {
      id: slide.id,
      title: slide.title ? slide.title.trim() : 'Banner',
      subtitle: slide.subtitle ? slide.subtitle.trim() : '',
      image: slide.image || '',
      openMode: slide.openMode || 'internal',
      order: Number(slide.order) || 999,
      updatedAt: new Date().toISOString(),
    };
    if (slide.targetUrl && slide.targetUrl.trim()) {
      cleanSlide.targetUrl = slide.targetUrl.trim();
    }

    const ref = doc(db, CAROUSEL_PATH, slide.id);
    await setDoc(ref, cleanSlide);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Delete a carousel slide from Firestore.
 */
export async function deleteCarouselSlideFromDb(slideId: string): Promise<void> {
  const path = `${CAROUSEL_PATH}/${slideId}`;
  try {
    const ref = doc(db, CAROUSEL_PATH, slideId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

/**
 * Send a message to GB Chat in Firestore.
 * Automatically strips all undefined values to ensure Firestore write succeeds without error.
 */
export async function sendMessageToDb(message: ChatMessage): Promise<void> {
  const path = `${MESSAGES_PATH}/${message.id}`;
  try {
    const cleanMsg: Record<string, any> = {
      id: message.id,
      senderName: message.senderName || 'Student',
      senderId: message.senderId || 'student-user',
      isOwner: Boolean(message.isOwner),
      isAdmin: Boolean(message.isAdmin),
      createdAt: message.createdAt || new Date().toISOString(),
    };

    if (message.text && message.text.trim()) {
      cleanMsg.text = message.text.trim();
    }
    if (message.imageUrl) {
      cleanMsg.imageUrl = message.imageUrl;
    }
    if (message.senderEmail && message.senderEmail.trim()) {
      cleanMsg.senderEmail = message.senderEmail.trim();
    }
    if (message.avatar && message.avatar.trim()) {
      cleanMsg.avatar = message.avatar.trim();
    }

    const ref = doc(db, MESSAGES_PATH, message.id);
    await setDoc(ref, cleanMsg);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Delete a message from GB Chat.
 */
export async function deleteMessageFromDb(messageId: string): Promise<void> {
  const path = `${MESSAGES_PATH}/${messageId}`;
  try {
    const ref = doc(db, MESSAGES_PATH, messageId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}
