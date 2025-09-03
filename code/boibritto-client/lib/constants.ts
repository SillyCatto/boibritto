export const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

// Book Genres - These should match the backend GENRES constant
export const GENRES = [
  'fiction',
  'non-fiction',
  'fantasy',
  'sci-fi',
  'mystery',
  'romance',
  'thriller',
  'history',
  'historical',
  'biography',
  'poetry',
  'self-help',
  'horror',
  'drama',
  'dystopian',
  'adventure',
  'comedy',
  'spirituality',
  'literary',
  'literature',
  'reading',
  'lifestyle',
  'contemporary',
  'diversity',
  'philosophy',
  'science',
  'timeless',
  'psychology',
  'modern',
  'young-adult',
  'children',
  'classic',
  'graphic-novel',
  'memoir',
  'education',
  'community',
  'others'
] as const;

export type Genre = typeof GENRES[number];

// Reading List Status
export const READING_STATUS = [
  'interested',
  'reading',
  'completed'
] as const;

export type ReadingStatus = typeof READING_STATUS[number];

// Visibility Options
export const VISIBILITY_OPTIONS = [
  'public',
  'private'
] as const;

export type Visibility = typeof VISIBILITY_OPTIONS[number];

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;
