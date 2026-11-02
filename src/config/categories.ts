import { EventCategory } from '@/types';

export interface CategoryFilterItem {
  id: EventCategory;
  label: string;
  count?: number;
}

export const eventCategories: CategoryFilterItem[] = [
  { id: 'all', label: 'All' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'birthday', label: 'Birthday' },
  { id: 'wedding', label: 'Wedding' },
];

export interface MomentGridItem {
  number: string;
  category: EventCategory;
  title: string;
  subtitle: string;
  count: string;
  imageUrl: string;
}

export const momentCategories: MomentGridItem[] = [
  {
    number: '01',
    category: 'portfolio',
    title: 'Creator & Developer Portfolios',
    subtitle: '3D avatars, brutalist archives, Minecraft creators, motion reels & kinetic typography',
    count: '6 Templates',
    imageUrl: '/templates/web-developer-portfolio-poster.png',
  },
  {
    number: '02',
    category: 'birthday',
    title: 'Birthday & Celebrations',
    subtitle: 'Keepsake envelopes, wax seals, music & party hubs',
    count: '10 Templates',
    imageUrl: '/templates/keepsake-preview.jpg',
  },
  {
    number: '03',
    category: 'wedding',
    title: 'Weddings & RSVP',
    subtitle: 'Ceremonies, 3D cinematic experiences & botanical evenings',
    count: '2 Templates',
    imageUrl: '/templates/cinematic-elena-julian-wedding-screen.png',
  },
];
