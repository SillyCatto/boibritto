/**
 * API utilities for Reading List operations
 */

import { auth } from './googleAuth';

interface AddToReadingListData {
  volumeId: string;
  status?: string;
  visibility?: string;
  genres?: string[];
}

interface TopGenre {
  genre: string;
  count: number;
}

interface RecommendationsResponse {
  success: boolean;
  message: string;
  data: {
    topGenres: TopGenre[];
    totalBooks: number;
  };
}

/**
 * Add book to reading list with genres
 */
export const addToReadingList = async (
  data: AddToReadingListData,
  token: string
): Promise<any> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/reading-list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to add to reading list:', error);
    throw error;
  }
};

/**
 * Get user's reading recommendations
 */
export const getRecommendations = async (): Promise<RecommendationsResponse> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/reading-list/recommendations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch recommendations:', error);
    throw error;
  }
};