import React from 'react';
import { EventData } from './event';

export type EventCategory =
  | 'all'
  | 'birthday'
  | 'wedding'
  | 'portfolio'
  | 'business'
  | 'restaurant'
  | 'events'
  | 'saas'
  | 'ecommerce'
  | 'education'
  | 'personal'
  | 'student'
  | 'party'
  | 'opening'
  | 'anniversary'
  | 'graduation'
  | 'baby'
  | 'housewarming'
  | 'memorial'
  | 'custom';

export interface TemplateMetadata {
  id: string;
  name: string;
  category: EventCategory;
  categoryLabel: string;
  subtitle?: string;
  description: string;
  previewImage: string;
  badge?: string;
  author?: string;
  authorAvatar?: string;
  price?: number;
  priceLabel?: string;
  isFree?: boolean;
  rating?: number;
  reviewsCount?: number;
  techStack?: string;
  version?: string;
  releaseDate?: string;
  isFeatured?: boolean;
  tier?: 'free' | 'pro';
  galleryImages?: string[];
  availableFunctions?: string[];
  featuredDetails?: {
    headline: string;
    subheadline: string;
    description: string;
    features: string[];
  };
}

export interface TemplateDefinition extends TemplateMetadata {
  component: React.ComponentType<TemplateProps>;
  defaultData: EventData;
}

export interface TemplateProps {
  data: EventData;
  isLivePreview?: boolean;
  onRsvpSubmit?: (rsvpData: Record<string, unknown>) => void | Promise<void>;
  onStudentSubmit?: (student: Record<string, unknown>) => void;
}
