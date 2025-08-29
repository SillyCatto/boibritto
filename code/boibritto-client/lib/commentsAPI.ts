import { getAuth } from "firebase/auth";
import { initFirebase, auth } from "@/lib/googleAuth";

// Initialize Firebase
initFirebase();

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

// Comment types
export interface User {
  _id: string;
  uid: string;
  username: string;
  displayName: string;
  avatar: string;
}

export interface Comment {
  _id: string;
  discussion: string;
  user: User;
  content: string;
  spoilerAlert: boolean;
  parentComment: string | null;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[]; // For hierarchical structure
}

export interface CreateCommentData {
  discussionId: string;
  content: string;
  spoilerAlert: boolean;
  parentComment?: string;
}

export interface UpdateCommentData {
  content?: string;
  spoilerAlert?: boolean;
}

// Helper function to get auth token
const getAuthToken = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  return await user.getIdToken();
};

// Helper function to make authenticated API calls
const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};

// Comments API
export const commentsAPI = {
  // Get comments for a discussion
  getComments: async (
    discussionId: string
  ): Promise<{ comments: Comment[] }> => {
    const response = await apiCall(`/comments/${discussionId}`, {
      method: "GET",
    });
    return response.data;
  },

  // Create new comment
  createComment: async (
    commentData: CreateCommentData
  ): Promise<{ comment: Comment }> => {
    const response = await apiCall("/comments", {
      method: "POST",
      body: JSON.stringify({ data: commentData }),
    });
    return response.data;
  },

  // Update comment
  updateComment: async (
    id: string,
    commentData: UpdateCommentData
  ): Promise<{ comment: Comment }> => {
    const response = await apiCall(`/comments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ data: commentData }),
    });
    return response.data;
  },

  // Delete comment
  deleteComment: async (id: string): Promise<void> => {
    await apiCall(`/comments/${id}`, { method: "DELETE" });
  },
};
