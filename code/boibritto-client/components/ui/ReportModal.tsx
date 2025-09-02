"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '@/lib/googleAuth';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'collection' | 'blog' | 'discussion' | 'comment' | 'userbook' | 'user';
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
  const [authInitialized, setAuthInitialized] = useState(false);

  // Check authentication status
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Wait for auth to initialize
    if (!authInitialized) {
      setError('Authentication is initializing. Please wait.');
      return;
    }

    // Check authentication
    if (!auth.currentUser) {
      setError('Please sign in to report content.');
      return;
    }
    
    if (!selectedReason) {
      setError('Please select a reason for reporting');
      return;
    }

    if (description.length > 200) {
      setError('Description must be 200 characters or less');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = await auth.currentUser.getIdToken();
      
      // Use reportType to match backend controller
      const reportData = {
        reportType: targetType, // Backend expects reportType, not targetType
        targetId: targetId.trim(),
        reason: selectedReason,
        ...(description.trim() && { description: description.trim() })
      };
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/reports`,
        reportData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setSelectedReason('');
          setDescription('');
        }, 2000);
      }
      
    } catch (err: any) {
      console.error('Failed to submit report:', err);
      
      if (err.response?.status === 400) {
        setError(err.response.data?.message || 'Invalid data. Please check all fields');
      } else if (err.response?.status === 404) {
        setError(`The ${targetType} you're trying to report was not found.`);
      } else if (err.response?.status === 409) {
        setError('You have already reported this content');
      } else if (err.response?.status === 401) {
        setError('Please sign in to report content');
      } else {
        setError(err.response?.data?.message || 'Failed to submit report. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
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
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
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
        ) : (
          <>
            <div className="flex items-center justify-between p-6 border-b border-amber-100">
              <h2 className="text-xl font-semibold text-gray-900">
                Report {targetType}
              </h2>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 p-1 disabled:opacity-50"
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

            <form onSubmit={handleSubmit} className="p-6">
              {targetTitle && (
                <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <span className="font-medium">Reporting:</span> {targetTitle}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Type: {targetType} | ID: {targetId}
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

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
                        onChange={(e) => setSelectedReason(e.target.value as ReasonValue)}
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