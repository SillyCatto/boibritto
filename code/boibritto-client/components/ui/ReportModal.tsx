"use client";

import { useState } from 'react';
import { reportsAPI, type ReportData } from '@/lib/reportsAPI';

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

  // Debug logging when modal opens
  if (isOpen) {
    console.log('🚩 ReportModal Debug - Props received:', {
      targetType,
      targetId,
      targetTitle,
      targetIdExists: !!targetId,
      targetIdLength: targetId?.length,
      targetTypeValid: ['discussion', 'comment', 'user', 'book', 'chapter'].includes(targetType)
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚩 FORM SUBMIT TRIGGERED');
    console.log('🚩 Current selectedReason state:', selectedReason);
    console.log('🚩 Current description state:', description);
    
    console.log('🚩 ReportModal - Form submission started');
    
    // Detailed pre-validation with debug output
    console.log('🚩 Validation Debug:', {
      selectedReasonProvided: !!selectedReason,
      selectedReasonValue: selectedReason,
      targetIdProvided: !!targetId,
      targetIdValue: targetId,
      targetIdType: typeof targetId,
      targetTypeProvided: !!targetType,
      targetTypeValue: targetType,
      allFieldsPresent: !!selectedReason && !!targetId && !!targetType
    });
    
    if (!selectedReason) {
      console.log('❌ Validation failed: No reason selected');
      setError('Please select a reason for reporting');
      return;
    }

    if (!targetType) {
      console.log('❌ Validation failed: No target type');
      setError('Target type is required');
      return;
    }

    if (!targetId) {
      console.log('❌ Validation failed: No target ID');
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
      const reportData = {
        targetType: targetType,
        targetId: targetId,
        reason: selectedReason,
        ...(description.trim() && { description: description.trim() })
      };
      
      console.log('🚩 Final report data being submitted:', JSON.stringify(reportData, null, 2));
      console.log('🚩 Report data validation before API call:', {
        hasTargetType: !!reportData.targetType,
        hasTargetId: !!reportData.targetId,
        hasReason: !!reportData.reason,
        targetTypeValue: reportData.targetType,
        targetIdValue: reportData.targetId,
        reasonValue: reportData.reason
      });
      
      await reportsAPI.submitReport(reportData);
      console.log('✅ Report submitted successfully');
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setSelectedReason('');
        setDescription('');
      }, 2000);
    } catch (err: unknown) {
      console.error('❌ Report submission failed with error:', err);
      
      // Enhanced error handling
      if (err instanceof Error) {
        console.log('❌ Error message:', err.message);
        if (err.message.includes('required')) {
          setError('Server says required fields are missing. Check console for details.');
        } else if (err.message.includes('authentication')) {
          setError('Please sign in to report content');
        } else {
          setError(err.message);
        }
      } else {
        console.log('❌ Unknown error type:', typeof err, err);
        setError('Failed to submit report. Please try again.');
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
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Reason Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why are you reporting this {targetType}?
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
                          console.log('🚩 Reason selected:', e.target.value);
                          setSelectedReason(e.target.value as ReportData['reason']);
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