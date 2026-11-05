import { CarouselSlide } from '../types.ts';

export const INITIAL_SLIDES: CarouselSlide[] = [
  {
    id: 'gb-study-main',
    image: '/assets/banner_study.png',
    title: 'GB STUDY',
    subtitle: 'Sarvottam Yadav • Official Ultra Hub',
    targetUrl: '',
    openMode: 'internal',
    order: 1,
  },
  {
    id: 'cricket-live',
    image: '/assets/banner_cricket.png',
    title: 'CRIC GB LIVE',
    subtitle: 'Free cricket by Sarvottam Yadav',
    targetUrl: 'https://crichrry.live',
    openMode: 'internal',
    order: 2,
  },
  {
    id: 'gb-tv',
    image: '/assets/banner_tv.png',
    title: 'GB TV',
    subtitle: 'Live TV from every country',
    targetUrl: '',
    openMode: 'internal',
    order: 3,
  },
  {
    id: 'tutorial-dev',
    image: '/assets/banner_tutorial.png',
    title: 'Website & App Builder',
    subtitle: 'How to make Apps in 5 Minutes - Coming soon',
    targetUrl: '',
    openMode: 'internal',
    order: 4,
  },
];
