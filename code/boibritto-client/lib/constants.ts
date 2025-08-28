export const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

// Book Genres - These should match the backend GENRES constant
export const GENRES = [
  'fiction',
  'non-fiction',
  'mystery',
  'thriller',
  'romance',
  'fantasy',
  'sci-fi',
  'horror',
  'biography',
  'history',
  'science',
  'technology',
  'self-help',
  'health',
  'cooking',
  'travel',
  'children',
  'young-adult',
  'poetry',
  'drama',
  'adventure',
  'crime',
  'literary-fiction',
  'contemporary',
  'classics',
  'memoir',
  'philosophy',
  'religion',
  'spirituality',
  'politics',
  'economics',
  'business',
  'psychology',
  'education',
  'art',
  'music',
  'sports',
  'humor',
  'comics',
  'graphic-novels'
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
