/**
 * Utility functions for managing book icon colors
 */

const DEFAULT_BOOK_COLOR = '#d97706'; // Default amber color

/**
 * Get the icon color for a specific book
 * Falls back to default color if no custom color is set
 */
export const getBookIconColor = (bookId: string): string => {
  if (typeof window === 'undefined') return DEFAULT_BOOK_COLOR;
  
  try {
    const stored = localStorage.getItem(`book-icon-color-${bookId}`);
    return stored || DEFAULT_BOOK_COLOR;
  } catch {
    return DEFAULT_BOOK_COLOR;
  }
};

/**
 * Set the icon color for a specific book
 */
export const setBookIconColor = (bookId: string, color: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    if (color === DEFAULT_BOOK_COLOR) {
      // Remove if it's the default color to save space
      localStorage.removeItem(`book-icon-color-${bookId}`);
    } else {
      localStorage.setItem(`book-icon-color-${bookId}`, color);
    }
  } catch {
    // Silently fail if localStorage is not available
  }
};

/**
 * Generate a deterministic color based on book title
 * This provides a consistent color for each book based on its title
 */
export const generateBookColor = (title: string): string => {
  const colors = [
    '#d97706', // amber
    '#2563eb', // blue
    '#16a34a', // green
    '#9333ea', // purple
    '#dc2626', // red
    '#e11d48', // pink
    '#4f46e5', // indigo
    '#0d9488', // teal
    '#ea580c', // orange
    '#6b7280', // gray
  ];
  
  // Simple hash function to get consistent color based on title
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    const char = title.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export { DEFAULT_BOOK_COLOR };
