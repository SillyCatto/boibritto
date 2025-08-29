import { getAuth } from 'firebase/auth';
import { initFirebase, auth } from '@/lib/googleAuth';

// Initialize Firebase
initFirebase();

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

// Discussion types
export interface User {
  _id: string;
  uid: string;
  username: string;
  displayName: string;
  avatar: string;
}

export interface Discussion {
  _id: string;
  user: User;
  title: string;
  content: string;
  visibility: "public" | "friends";
  spoilerAlert: boolean;
  genres: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscussionData {
  title: string;
  content: string;
  spoilerAlert: boolean;
  genres: string[];
}

export interface UpdateDiscussionData {
  title?: string;
  content?: string;
  spoilerAlert?: boolean;
  genres?: string[];
}

// Helper function to get auth token
const getAuthToken = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
};

// Helper function to make authenticated API calls
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

// Discussions API
export const discussionsAPI = {
  // Get discussions with optional filters
  getDiscussions: async (params?: {
    author?: string;
    search?: string;
  }): Promise<{ discussions: Discussion[] }> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const endpoint = `/discussions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiCall(endpoint, { method: 'GET' });
    return response.data;
  },

  // Get specific discussion by ID
  getDiscussion: async (id: string): Promise<{ discussion: Discussion }> => {
    const response = await apiCall(`/discussions/${id}`, { method: 'GET' });
    return response.data;
  },

  // Create new discussion
  createDiscussion: async (discussionData: CreateDiscussionData): Promise<{ discussion: Discussion }> => {
    const response = await apiCall('/discussions', {
      method: 'POST',
      body: JSON.stringify({ data: discussionData })
    });
    return response.data;
  },

  // Update discussion
  updateDiscussion: async (id: string, discussionData: UpdateDiscussionData): Promise<{ discussion: Discussion }> => {
    const response = await apiCall(`/discussions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ data: discussionData })
    });
    return response.data;
  },

  // Delete discussion
  deleteDiscussion: async (id: string): Promise<void> => {
    await apiCall(`/discussions/${id}`, { method: 'DELETE' });
  },
};
