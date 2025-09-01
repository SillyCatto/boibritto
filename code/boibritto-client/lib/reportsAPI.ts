import { getAuth } from 'firebase/auth';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export interface ReportData {
  targetType: 'discussion' | 'comment' | 'user' | 'blog' | 'chapter';
  targetId: string;
  reason: 'spam' | 'harassment' | 'hate_speech' | 'violence' | 'adult_content' | 'copyright_violation' | 'misinformation' | 'self_harm' | 'bullying' | 'impersonation' | 'other';
  description?: string;
}

export interface Report {
  _id: string;
  targetType: string;
  targetId: string;
  reason: string;
  description?: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt: string;
}

export interface ReportsResponse {
  success: boolean;
  message: string;
  data: {
    reports: Report[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalReports: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

// Get authentication headers
const getAuthHeaders = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const token = await user.getIdToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const reportsAPI = {
  // Submit a report
  submitReport: async (reportData: ReportData) => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.post(
        `${API_BASE_URL}/api/reports`,
        reportData,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error submitting report:', error);
      throw new Error(error.response?.data?.message || 'Failed to submit report');
    }
  },

  // Get user's reports
  getMyReports: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    targetType?: string;
  }): Promise<ReportsResponse> => {
    try {
      const headers = await getAuthHeaders();
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.targetType) queryParams.append('targetType', params.targetType);
      
      const response = await axios.get(
        `${API_BASE_URL}/api/reports/my-reports?${queryParams.toString()}`,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch reports');
    }
  },
};
