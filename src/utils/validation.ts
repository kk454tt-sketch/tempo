/**
 * Validation utilities for Tempo event website builder
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email address is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true };
};

export const validateSlug = (slug: string): ValidationResult => {
  if (!slug || !slug.trim()) {
    return { isValid: false, error: 'Event URL slug is required' };
  }
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug.trim())) {
    return { isValid: false, error: 'Slug must contain only lowercase letters, numbers, and hyphens' };
  }
  if (slug.length < 3 || slug.length > 60) {
    return { isValid: false, error: 'Slug must be between 3 and 60 characters' };
  }
  return { isValid: true };
};

export const validateEventTitle = (title: string): ValidationResult => {
  if (!title || !title.trim()) {
    return { isValid: false, error: 'Event title is required' };
  }
  if (title.trim().length < 2) {
    return { isValid: false, error: 'Event title must be at least 2 characters' };
  }
  return { isValid: true };
};

export const validateEventDate = (dateStr: string): ValidationResult => {
  if (!dateStr || !dateStr.trim()) {
    return { isValid: false, error: 'Event date is required' };
  }
  return { isValid: true };
};

export const validateImageUpload = (file: File): ValidationResult => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSizeBytes = 25 * 1024 * 1024; // 25MB

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Supported image formats are JPG, PNG, WEBP, and GIF' };
  }

  if (file.size > maxSizeBytes) {
    return { isValid: false, error: 'Image size must be less than 25MB' };
  }

  return { isValid: true };
};
