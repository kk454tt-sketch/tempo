export type WebsiteStatus = 'draft' | 'published' | 'expired' | 'archived';

export interface EventPhoto {
  id: string;
  url: string;
  caption?: string;
  isCover?: boolean;
  altText?: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description: string;
  location?: string;
  icon?: string;
}

export interface StoryMilestone {
  id: string;
  date: string;
  title: string;
  description: string;
  icon?: string;
}

export interface TravelAccommodation {
  venueName: string;
  address: string;
  shuttleInfo?: string;
  hotelBlock?: {
    hotelName: string;
    description: string;
    groupCode: string;
    bookingUrl?: string;
  };
  dressCode?: {
    title: string;
    description: string;
  };
  mapImageUrl?: string;
}

export interface AppearanceSettings {
  atmosphere: string;
  palette: string;
  typography: string;
}

export interface ActiveSections {
  hero: boolean;
  countdown: boolean;
  story: boolean;
  schedule: boolean;
  venue: boolean;
  gallery: boolean;
  rsvp: boolean;
  guestbook: boolean;
  // Dynamic modular functions (Free vs Paid functions)
  classmatesDirectory?: boolean;
  hobbyMatchmaker?: boolean;
  studentEnrollment?: boolean;
  noticesBoard?: boolean;
  dynamicForms?: boolean;
  memoryWall?: boolean;
  spotifyVibe?: boolean;
  adminDesk?: boolean;
}

export interface RsvpSettings {
  enabled: boolean;
  deadline?: string;
  allowMealSelection?: boolean;
  allowDietaryNotes?: boolean;
  allowSongRequests?: boolean;
  allowPlusOnes?: boolean;
  mealOptions?: Array<{ id: string; label: string }>;
}

/* ================= STUDENT / ENROLLDESK TYPES ================= */

export interface StudentProfile {
  id: string;
  fullName: string;
  photoUrl?: string;
  department: string;
  academicYear: string;
  instagram?: string;
  whatsapp?: string; // Private by default
  gender?: string; // Private by default
  hobbies: string[];
  lookingFor?: string; // e.g. "Study Buddy", "Project Partner", "Casual Friends", "Hackathon Team"
  bio?: string;
  enrolledAt: string;
}

export interface CampusNotice {
  id: string;
  title: string;
  department: string;
  date: string;
  content: string;
  isUrgent?: boolean;
  author?: string;
  category?: 'Academic' | 'Event' | 'Club' | 'Administrative';
}

export interface CustomFormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

export interface DynamicFormItem {
  id: string;
  title: string;
  description: string;
  department: string;
  deadline: string;
  fields: CustomFormField[];
  submissionsCount?: number;
}

export interface ClassmateShoutout {
  id: string;
  fromName: string;
  toName: string;
  message: string;
  tag: string; // e.g. "MVP", "Study Hero", "Creative Soul", "Always Smiling"
  timestamp: string;
  likes: number;
}

export interface StudentHubData {
  portalName: string;
  tagline: string;
  collegeOrBatchName: string;
  adminPassword?: string;
  departments: string[];
  academicYears: string[];
  hobbiesList: string[];
  students: StudentProfile[];
  notices: CampusNotice[];
  forms: DynamicFormItem[];
  shoutouts: ClassmateShoutout[];
  defaultCopyMessage?: string;
  batchWhatsappLink?: string;
  batchDiscordLink?: string;
  activeFunctions?: {
    directory?: boolean;
    matchmaker?: boolean;
    notices?: boolean;
    shoutouts?: boolean;
    forms?: boolean;
    selfEnrollment?: boolean;
  };
}

export interface WeddingData {
  partner1: string;
  partner2: string;
  storyHeadline?: string;
  loveStory?: string;
  ceremonyTime?: string;
  ceremonyVenue?: string;
  receptionTime?: string;
  receptionVenue?: string;
  registryUrl?: string;
  shuttleInfo?: string;
  hotelInfo?: string;
  attireTitle?: string;
  attireDescription?: string;
  attireColors?: string[];
}

export interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  year: string;
  location?: string;
  image: string;
  description: string;
  link?: string;
}

export interface PortfolioHireConfig {
  label?: string;
  mode: 'whatsapp' | 'phone' | 'email' | 'telegram' | 'instagram' | 'linkedin' | 'custom';
  whatsapp?: string;
  waText?: string;
  phone?: string;
  email?: string;
  subject?: string;
  telegram?: string;
  instagram?: string;
  linkedin?: string;
  custom?: string;
  fallback?: string;
}

export interface PortfolioNavConfig {
  l1: string;
  u1: string;
  l2: string;
  u2: string;
}

export interface PortfolioCardData {
  id: 'card-1' | 'card-2' | string;
  name: string;
  word?: string;
  role: string;
  titleLines?: [string, string];
  metaLines?: [string, string];
  stack: string[];
  bgImage?: string;
  bgColor?: string;
  sideText: string;
  characterImage: string;
  characterAlt?: string;
  characterAr?: number;
  phone?: string;
  websiteLink?: string;
  githubProfileLink?: string;
  resumeLink?: string;
  githubProjectLink?: string;
  links?: Array<{ text: string; url: string }>;
  prompt?: string;
}

export interface PortfolioData {
  creatorName?: string;
  brand?: string;
  title?: string;
  discipline?: string;
  manifesto?: string;
  statement?: string;
  projects?: PortfolioProject[];
  services?: string[];
  clients?: string[];
  inquiryEmail?: string;
  card1?: PortfolioCardData;
  card2?: PortfolioCardData;
  activeCardIndex?: number;
  hire?: PortfolioHireConfig;
  nav?: PortfolioNavConfig;
}

export interface TastingCourseItem {
  id: string;
  course: string;
  name: string;
  pairing?: string;
  desc: string;
  price?: string;
}

export interface RestaurantData {
  cuisine?: string;
  chefStory?: string;
  hours?: string;
  pricePerGuest?: string;
  menu: TastingCourseItem[];
  bookingUrl?: string;
  phone?: string;
}

export interface SaasFeatureItem {
  id: string;
  title: string;
  desc: string;
  icon?: string;
}

export interface SaasPricingTier {
  id: string;
  tier: string;
  price: string;
  frequency?: string;
  features: string[];
  highlighted?: boolean;
}

export interface SaasData {
  heroHeadline?: string;
  valueProp?: string;
  features: SaasFeatureItem[];
  ctaText?: string;
  ctaLink?: string;
  pricing: SaasPricingTier[];
}

export interface EventData {
  title: string; // e.g. "Rahul & Priya" or "EnrollDesk Class of 2027"
  tagline: string; // e.g. "Save the Date" or "Classmate Lounge & Portal"
  eventType: string; // e.g. "Wedding", "Birthday", "Student Portal", "Graduation"
  date: string; // e.g. "14 February 2027"
  targetDateIso?: string; // ISO string for countdown timer calculation
  time: string; // e.g. "4:30 PM Sunset Ceremony"
  venue: string; // e.g. "The Glasshouse Pavilion"
  address: string; // e.g. "Palmetto Bay, Carmel-by-the-Sea, California"
  note: string; // Invitation letter/welcome message
  quote?: {
    text: string;
    author: string;
  };
  photos: EventPhoto[];
  schedule?: ScheduleItem[];
  storyMilestones?: StoryMilestone[];
  travelInfo?: TravelAccommodation;
  appearance: AppearanceSettings;
  activeSections: ActiveSections;
  rsvpSettings: RsvpSettings;
  musicUrl?: string;
  dressCode?: string | {
    title?: string;
    description: string;
    colors?: string[];
  };
  locationMap?: {
    lat: number;
    lng: number;
    zoom?: number;
    query?: string;
    mapUrl?: string;
    embedUrl?: string;
    label?: string;
  };
  musicSettings?: {
    enabled: boolean;
    url?: string;
    trackName?: string;
    artist?: string;
    autoPlay?: boolean;
    volume?: number;
    isCustom?: boolean;
  };
  milestoneAge?: string;
  weddingData?: WeddingData;
  portfolioData?: PortfolioData;
  restaurantData?: RestaurantData;
  saasData?: SaasData;
  studentHub?: StudentHubData; // Student lounge & function suite data
  slug?: string;
}

export interface EventWebsite {
  id: string;
  userId: string;
  templateId: string;
  eventType: string;
  title: string;
  slug: string;
  status: WebsiteStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  isLifetime: boolean;
  proInteractiveEnabled?: boolean;
  tier?: 'free' | 'pro';
  metrics: {
    rsvpsCount: number;
    viewsCount: number;
    dietaryCount: number;
    isGuestListClosed?: boolean;
    studentsCount?: number;
  };
  eventData: EventData;
}
