import { getAuth } from 'firebase/auth';
import { initFirebase, auth } from '@/lib/googleAuth';
import { UserBook, Chapter, CreateUserBookData, UpdateUserBookData, CreateChapterData, UpdateChapterData } from '@/lib/types/userBooks';

// Initialize Firebase
initFirebase();

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

// Helper function to get auth token - matches your existing pattern
const getAuthToken = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
};

// Helper function to make authenticated API calls - matches your existing pattern
const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};

// User Books API
export const userBooksAPI = {
  // List user books with optional filters
  getUserBooks: async (params?: {
    author?: string;
    search?: string;
    genre?: string;
    completed?: boolean;
    page?: number;
  }): Promise<{ books: UserBook[] }> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const endpoint = `/user-books${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiCall(endpoint, { method: 'GET' });
    return response.data;
  },

  // Get specific user book by ID
  getUserBook: async (id: string): Promise<{ book: UserBook }> => {
    const response = await apiCall(`/user-books/${id}`, { method: 'GET' });
    return response.data;
  },

  // Create new user book
  createUserBook: async (bookData: CreateUserBookData): Promise<{ book: UserBook }> => {
    const response = await apiCall('/user-books', {
      method: 'POST',
      body: JSON.stringify({ data: bookData })
    });
    return response.data;
  },

  // Update user book
  updateUserBook: async (id: string, bookData: UpdateUserBookData): Promise<{ book: UserBook }> => {
    const response = await apiCall(`/user-books/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ data: bookData })
    });
    return response.data;
  },

  // Delete user book
  deleteUserBook: async (id: string): Promise<void> => {
    await apiCall(`/user-books/${id}`, { method: 'DELETE' });
  },

  // Like/unlike user book
  likeUserBook: async (id: string): Promise<{ liked: boolean; likeCount: number }> => {
    const response = await apiCall(`/user-books/${id}/like`, { method: 'POST' });
    return response.data;
  },
};

// Chapters API
export const chaptersAPI = {
  // Get chapters for a book
  getChaptersForBook: async (bookId: string, params?: {
    published?: boolean;
  }): Promise<{ chapters: Chapter[] }> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const endpoint = `/user-books/${bookId}/chapters${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiCall(endpoint, { method: 'GET' });
    return response.data;
  },

  // Get specific chapter by ID
  getChapter: async (id: string): Promise<{ chapter: Chapter }> => {
    const response = await apiCall(`/chapters/${id}`, { method: 'GET' });
    return response.data;
  },

  // Create new chapter
  createChapter: async (chapterData: CreateChapterData): Promise<{ chapter: Chapter }> => {
    const response = await apiCall('/chapters', {
      method: 'POST',
      body: JSON.stringify({ data: chapterData })
    });
    return response.data;
  },

  // Update chapter
  updateChapter: async (id: string, chapterData: UpdateChapterData): Promise<{ chapter: Chapter }> => {
    const response = await apiCall(`/chapters/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ data: chapterData })
    });
    return response.data;
  },

  // Delete chapter
  deleteChapter: async (id: string): Promise<void> => {
    await apiCall(`/chapters/${id}`, { method: 'DELETE' });
  },

  // Like/unlike chapter
  likeChapter: async (id: string): Promise<{ liked: boolean; likeCount: number }> => {
    const response = await apiCall(`/chapters/${id}/like`, { method: 'POST' });
    return response.data;
  },
};

// Upload cover image to Firebase Storage (placeholder - you'll need to implement Firebase storage)
export const uploadCoverImage = async (file: File): Promise<string> => {
  // This would integrate with Firebase Storage
  // For now, return a placeholder URL
  return 'https://via.placeholder.com/400x600?text=Book+Cover';
};
