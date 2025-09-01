"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'discussion' | 'comment' | 'user' | 'book' | 'chapter';
  targetId: string;
  targetTitle?: string;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or unwanted commercial content' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'hate_speech', label: 'Hate speech or discrimination' },
  { value: 'violence', label: 'Violence or threats' },
  { value: 'adult_content', label: 'Adult or inappropriate content' },
  { value: 'copyright_violation', label: 'Copyright violation' },
  { value: 'misinformation', label: 'Misinformation or false content' },
  { value: 'self_harm', label: 'Self-harm or suicide content' },
  { value: 'bullying', label: 'Bullying or intimidation' },
  { value: 'impersonation', label: 'Impersonation or fake identity' },
  { value: 'other', label: 'Other (please specify in description)' },
] as const;

type ReasonValue = typeof REPORT_REASONS[number]['value'];

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReasonValue | ''>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [firebaseToken, setFirebaseToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Directly set API URL to known port 5001
  const apiUrl = 'http://localhost:5001';
  
  // Fetch Firebase token when modal opens
  useEffect(() => {
    if (isOpen) {
      const auth = getAuth();
      
      // Get current user and token
      const fetchToken = async () => {
        try {
          const currentUser = auth.currentUser;
          
          if (currentUser) {
            const token = await currentUser.getIdToken(true); // Force refresh token
            setFirebaseToken(token);
            setIsAuthenticated(true);
            console.log('🔐 Firebase auth: User is authenticated');
          } else {
            console.log('🔐 Firebase auth: No user is logged in');
            setIsAuthenticated(false);
            setFirebaseToken(null);
            
            // Try to get from localStorage as fallback
            const storedToken = localStorage.getItem('token') || 
                               localStorage.getItem('authToken') || 
                               localStorage.getItem('firebaseToken');
            
            if (storedToken) {
              setFirebaseToken(storedToken);
              setIsAuthenticated(true);
              console.log('🔐 Found token in localStorage');
            }
          }
        } catch (error) {
          console.error('🔐 Error getting Firebase token:', error);
        }
      };

      fetchToken();
      
      // Listen for auth state changes
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          user.getIdToken().then(token => {
            setFirebaseToken(token);
            setIsAuthenticated(true);
          });
        } else {
          setIsAuthenticated(false);
          setFirebaseToken(null);
        }
      });
      
      return () => unsubscribe();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚩 FORM SUBMIT TRIGGERED');
    
    // Check authentication first
    if (!isAuthenticated || !firebaseToken) {
      setError('Authentication required to report content. Please sign in.');
      return;
    }
    
    // Validation - ensure all required fields are present and correct
    if (!selectedReason) {
      setError('Please select a reason for reporting');
      return;
    }

    if (!targetType || (
      targetType !== 'discussion' && 
      targetType !== 'comment' && 
      targetType !== 'user' && 
      targetType !== 'book' && 
      targetType !== 'chapter'
    )) {
      setError('Valid target type is required');
      return;
    }

    if (!targetId || targetId.trim() === '') {
      setError('Target ID is required');
      return;
    }

    if (description.length > 200) {
      setError('Description must be 200 characters or less');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Create the payload according to the API documentation
      const reportData = {
        targetType: targetType,
        targetId: targetId.trim(),
        reason: selectedReason,
        description: description.trim() || undefined // Only include if not empty
      };
      
      console.log('🚩 Sending report data:', JSON.stringify(reportData, null, 2));
      console.log('🚩 API endpoint:', `${apiUrl}/api/reports`);
      
      // Use axios for the API call
      const response = await axios({
        method: 'post',
        url: `${apiUrl}/api/reports`,
        data: reportData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        },
        timeout: 10000 // 10 seconds timeout
      });
      
      console.log('✅ Report submitted successfully:', response.data);
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setSelectedReason('');
        setDescription('');
      }, 2000);
    } catch (err: unknown) {
      console.error('❌ Report submission failed with error:', err);
      
      // Enhanced error handling for axios errors
      if (axios.isAxiosError(err)) {
        console.log('❌ Axios error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          message: err.message,
          code: err.code
        });
        
        // Get detailed error message from response
        const errorMessage = err.response?.data?.message || err.message;
        
        if (err.response?.status === 400) {
          // Handle specific validation errors
          if (errorMessage.includes('required')) {
            setError('All required fields must be provided: Report type, target ID, and reason');
          } else {
            setError(errorMessage || 'Invalid data. Please check all fields');
          }
        } else if (err.response?.status === 404) {
          setError('Content not found or no longer available');
        } else if (err.response?.status === 409) {
          setError('You have already reported this content');
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          // Try to refresh the token
          try {
            const auth = getAuth();
            const currentUser = auth.currentUser;
            if (currentUser) {
              const newToken = await currentUser.getIdToken(true); // Force refresh
              setFirebaseToken(newToken);
              setError('Your session was refreshed. Please try again.');
            } else {
              setError('Please sign in to report content');
              setIsAuthenticated(false);
            }
          } catch (refreshError) {
            setError('Authentication failed. Please sign in again to report content');
            setIsAuthenticated(false);
          }
        } else if (err.code === 'ECONNABORTED') {
          setError('Request timed out. Please try again.');
        } else if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
          setError(`Cannot connect to server at ${apiUrl}. Please verify the server is running on port 5001.`);
        } else {
          setError(errorMessage || 'Failed to submit report');
        }
      } else if (err instanceof Error) {
        console.log('❌ Standard error:', err.message);
        setError(err.message);
      } else {
        console.log('❌ Unknown error type:', typeof err, err);
        setError('Failed to submit report. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debugging function - test API connection
  const testConnection = async () => {
    try {
      console.log('🧪 Testing API connection to:', apiUrl);
      const response = await axios.get(`${apiUrl}/api/health`, {
        timeout: 3000
      });
      console.log('🧪 Health check response:', response.status, response.statusText);
      console.log('🧪 Health check data:', response.data);
      setError(`Server at ${apiUrl} is reachable`);
      return true;
    } catch (error) {
      console.error('🧪 Health check failed:', error);
      setError(`Cannot connect to server at ${apiUrl}. Make sure it's running on port 5001.`);
      return false;
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setError('');
      setSuccess(false);
      setSelectedReason('');
      setDescription('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Glass morphism backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-amber-200">
        {success ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Report Submitted
            </h3>
            <p className="text-gray-600">
              Thank you for helping keep our community safe. We&apos;ll review your report shortly.
            </p>
          </div>
        ) : !isAuthenticated ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Authentication Required
            </h3>
            <p className="text-gray-600 mb-4">
              Please sign in to report content. Creating an account helps us prevent abuse and verify reports.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <a
                href="/signin?redirect=back"
                className="flex-1 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-medium text-center"
              >
                Sign In
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-amber-100">
              <h2 className="text-xl font-semibold text-gray-900">
                Report {targetType}
              </h2>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6">
              {targetTitle && (
                <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <span className="font-medium">Reporting:</span> {targetTitle}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    ID: {targetId}
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                  {error.includes('server') && (
                    <button
                      type="button"
                      onClick={() => testConnection()}
                      className="mt-2 text-xs text-blue-600 underline"
                    >
                      Test connection to {apiUrl}
                    </button>
                  )}
                </div>
              )}

              {/* Reason Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why are you reporting this {targetType}? *
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {REPORT_REASONS.map((reason) => (
                    <label
                      key={reason.value}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-amber-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={reason.value}
                        checked={selectedReason === reason.value}
                        onChange={(e) => {
                          setSelectedReason(e.target.value as ReasonValue);
                          console.log('Selected reason:', e.target.value);
                        }}
                        className="mt-1 text-amber-600 focus:ring-amber-500"
                        disabled={isSubmitting}
                      />
                      <span className="text-sm text-gray-700 leading-tight">
                        {reason.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide any additional context that might help us understand your report..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  rows={3}
                  maxLength={200}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {description.length}/200 characters
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedReason}
                  className="flex-1 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Report'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}