import React from 'react';
import { EventData } from './event';

export type EventCategory =
  | 'all'
  | 'wedding'
  | 'birthday'
  | 'party'
  | 'anniversary'
  | 'opening'
  | 'graduation'
  | 'student'
  | 'baby'
  | 'housewarming'
  | 'memorial'
  | 'custom';

export interface TemplateMetadata {
  id: string; // e.g., 'wedding-01', 'birthday-01', 'opening-01', 'party-01', 'enrolldesk-01'
  name: string; // e.g., 'Timeless', "Emma's 25th", 'The Coffee House', 'Evening With Friends', 'EnrollDesk'
  category: EventCategory;
  categoryLabel: string; // e.g., 'Wedding', 'Birthday', 'Dinner & Party', 'Student & Campus'
  subtitle?: string; // e.g., 'Rahul & Priya', 'October 17', 'Classmate Hub & Portal'
  description: string;
  previewImage: string;
  badge?: string; // e.g., 'Save the Date · RSVP', 'Intimate Gathering', 'Pro Functions Enabled'
  accentColor?: string;
  isFeatured?: boolean;
  tier?: 'free' | 'pro';
  availableFunctions?: string[]; // list of modular built-in functions
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
  onRsvpSubmit?: (rsvpData: Record<string, unknown>) => void;
  onStudentSubmit?: (student: Record<string, unknown>) => void;
}
