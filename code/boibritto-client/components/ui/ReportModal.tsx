"use client";
import { useState } from 'react';
import { reportsAPI, ReportData } from '@/lib/reportsAPI';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportData['targetType'];
  targetId: string;
  targetTitle: string;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or unwanted commercial content' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'hate_speech', label: 'Hate speech or discriminatory content' },
  { value: 'violence', label: 'Violence or threats' },
  { value: 'adult_content', label: 'Adult or sexual content' },
  { value: 'copyright_violation', label: 'Copyright violation' },
  { value: 'misinformation', label: 'False or misleading information' },
  { value: 'self_harm', label: 'Self-harm or suicide content' },
  { value: 'bullying', label: 'Bullying or intimidation' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'other', label: 'Other (please specify)' },
] as const;

export default function ReportModal({ isOpen, onClose, targetType, targetId, targetTitle }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportData['reason'] | ''>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReason) {
      setError('Please select a reason for reporting');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await reportsAPI.submitReport({
        targetType,
        targetId,
        reason: selectedReason,
        description: description.trim() || undefined,
      });
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedReason('');
    setDescription('');
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      resetForm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {success ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Submitted</h3>
              <p className="text-gray-600">Thank you for helping keep our community safe. We'll review your report and take appropriate action.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Report Content</h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content being reported */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Reporting:</p>
                <p className="font-medium text-gray-900">{targetTitle}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">{targetType}</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Reason selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Why are you reporting this content? *
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {REPORT_REASONS.map((reason) => (
                      <label key={reason.value} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="reason"
                          value={reason.value}
                          checked={selectedReason === reason.value}
                          onChange={(e) => setSelectedReason(e.target.value as ReportData['reason'])}
                          className="mt-1 w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                          disabled={loading}
                        />
                        <span className="text-sm text-gray-700">{reason.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Additional details */}
                <div className="mb-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional details (optional)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide any additional context that might help us understand the issue..."
                    maxLength={200}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">{description.length}/200 characters</p>
                </div>

                {/* Submit buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    disabled={loading || !selectedReason}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Report'
                    )}
                  </button>
                </div>
              </form>

              {/* Disclaimer */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  <strong>Note:</strong> False reports may result in action taken against your account. 
                  Only report content that violates our community guidelines.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
