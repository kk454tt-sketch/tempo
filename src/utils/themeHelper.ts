import { AppearanceSettings } from '@/types';

export interface ThemeStyles {
  paletteClass: string;
  fontHeadlineClass: string;
  fontBodyClass: string;
  cardClass: string;
  bgStyle: { backgroundColor?: string; color?: string };
  primaryColor: string;
  secondaryColor: string;
}

export function getThemeStyles(appearance?: AppearanceSettings): ThemeStyles {
  const settings = appearance || {
    atmosphere: 'classic-elegance',
    palette: 'terracotta-ivory-olive',
    typography: 'playfair-sans',
  };

  // 1. Palette Mapping
  let bgStyle = { backgroundColor: '#FCF9F5', color: '#1C1C1A' };
  let primaryColor = '#8F3C2C';
  let secondaryColor = '#556254';
  let paletteClass = 'palette-terracotta';

  switch (settings.palette) {
    case 'sage-cream':
      bgStyle = { backgroundColor: '#F4F1EA', color: '#2A332C' };
      primaryColor = '#4A5D4E';
      secondaryColor = '#C2B490';
      paletteClass = 'palette-sage';
      break;
    case 'midnight-gilding':
      bgStyle = { backgroundColor: '#0F172A', color: '#F8FAFC' };
      primaryColor = '#E2B142';
      secondaryColor = '#94A3B8';
      paletteClass = 'palette-midnight text-white';
      break;
    case 'navy-gold-coral':
      bgStyle = { backgroundColor: '#F8FAFC', color: '#0F172A' };
      primaryColor = '#1E3A8A';
      secondaryColor = '#D97706';
      paletteClass = 'palette-navy';
      break;
    case 'terracotta-ivory-olive':
    default:
      bgStyle = { backgroundColor: '#FCF9F5', color: '#1C1C1A' };
      primaryColor = '#8F3C2C';
      secondaryColor = '#556254';
      paletteClass = 'palette-terracotta';
      break;
  }

  // 2. Typography Mapping
  let fontHeadlineClass = "font-['Playfair_Display',serif]";
  let fontBodyClass = "font-['Plus_Jakarta_Sans',sans-serif]";

  switch (settings.typography) {
    case 'modern-grotesque':
      fontHeadlineClass = "font-['Plus_Jakarta_Sans',sans-serif] tracking-tight font-extrabold";
      fontBodyClass = "font-['Plus_Jakarta_Sans',sans-serif]";
      break;
    case 'space-inter':
      fontHeadlineClass = "font-['Inter',sans-serif] tracking-tight font-bold";
      fontBodyClass = "font-['Inter',sans-serif]";
      break;
    case 'playfair-sans':
    default:
      fontHeadlineClass = "font-['Playfair_Display',serif]";
      fontBodyClass = "font-['Plus_Jakarta_Sans',sans-serif]";
      break;
  }

  // 3. Atmosphere & Card Styling
  let cardClass = 'bg-white/80 backdrop-blur-sm rounded-2xl border border-black/5 shadow-sm';

  switch (settings.atmosphere) {
    case 'modernist-warmth':
      cardClass = 'bg-white rounded-xl border border-black/10 shadow-none';
      break;
    case 'sunlit-botanical':
      cardClass = 'bg-white/90 backdrop-blur-md rounded-3xl border border-emerald-900/10 shadow-md';
      break;
    case 'monochrome-pure':
      cardClass = 'bg-white rounded-none border-2 border-black shadow-none';
      break;
    case 'campus-academic':
      cardClass = 'bg-white rounded-2xl border border-slate-200 shadow-sm';
      break;
    case 'classic-elegance':
    default:
      cardClass = 'bg-white/80 backdrop-blur-sm rounded-2xl border border-black/5 shadow-sm';
      break;
  }

  return {
    paletteClass,
    fontHeadlineClass,
    fontBodyClass,
    cardClass,
    bgStyle,
    primaryColor,
    secondaryColor,
  };
}
