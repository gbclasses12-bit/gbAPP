export type OpenMode = 'internal' | 'external' | 'new_tab' | 'same_tab';

export interface PlatformItem {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  targetUrl?: string;
  openMode: OpenMode;
  badge?: string;
  color?: string;
  order?: number;
  featured?: boolean;
}

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  targetUrl?: string;
  openMode?: OpenMode;
  order?: number;
}

export interface ChatMessage {
  id: string;
  text?: string;
  senderName: string;
  senderId: string;
  senderEmail?: string;
  isOwner?: boolean;
  isAdmin?: boolean;
  avatar?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface BatchItem {
  id: string;
  title: string;
  badge: string;
  badgeColor?: string;
  image: string;
  language: string;
  tags: string;
  target: string;
  startDate: string;
  endDate: string;
  price: string;
  originalPrice: string;
  discountTag: string;
  subjects: string[];
}

export interface UserProfile {
  name: string;
  joinDate: string;
  activeSeconds: number;
  accessType: string;
}
