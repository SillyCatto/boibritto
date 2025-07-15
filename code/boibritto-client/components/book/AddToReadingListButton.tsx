"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import axios from "axios";

interface AddToReadingListButtonProps {
  bookId: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  className?: string;
}

export default function AddToReadingListButton({
  bookId,
  onSuccess,
  onError,
  className = "w-full mt-4 px-6 py-3 rounded-lg bg-amber-700 text-white font-semibold shadow hover:bg-amber-800 transition"
}: AddToReadingListButtonProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState<"interested" | "reading" | "completed">("interested");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [visibility, setVisibility] = useState<"public" | "private" | "friends">("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Reset dates when status changes
  useEffect(() => {
    if (status === "interested") {
      setStartDate("");
      setEndDate("");
    } else if (status === "reading") {
      setStartDate(new Date().toISOString().split("T")[0]); // Today
      setEndDate("");
    } else if (status === "completed") {
      if (!startDate) {
        setStartDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]); // 7 days ago
      }
      setEndDate(new Date().toISOString().split("T")[0]); // Today
    }
  }, [status]);

  const handleAddToReadingList = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError("Please sign in to add books to your reading list");
        router.push("/signin");
        return;
      }

      const idToken = await user.getIdToken();

      // Prepare request data based on status
      const requestData: any = {
        volumeId: bookId,
        status,
        visibility
      };

      // Add dates based on status requirements
      if (status === "reading" || status === "completed") {
        requestData.startedAt = startDate ? new Date(startDate).toISOString() : null;
      }

      if (status === "completed") {
        requestData.completedAt = endDate ? new Date(endDate).toISOString() : null;
      }

      // Validate dates based on requirements
      if ((status === "reading" || status === "completed") && !startDate) {
        setError("Start date is required for 'Reading' or 'Completed' status");
        setIsSubmitting(false);
        return;
      }

      if (status === "completed" && !endDate) {
        setError("Completion date is required for 'Completed' status");
        setIsSubmitting(false);
        return;
      }

      if (status === "completed" && new Date(endDate) < new Date(startDate)) {
        setError("Completion date cannot be earlier than start date");
        setIsSubmitting(false);
        return;
      }

      // Send request to API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/reading-list`,
        {
          data: requestData
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`
          },
          withCredentials: true
        }
      );

      onSuccess?.("Book added to your reading list!");
      setIsModalOpen(false);

    } catch (err: any) {
      const errorMessage = err?.response?.data?.message ||
        err?.message ||
        "Failed to add book to reading list";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={className}
      >
        Add to Reading List
      </button>

      {/* Reading List Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-amber-700/5 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-amber-50 rounded-t-lg px-6 py-4 border-b border-amber-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-amber-800">Add to Reading List</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full text-amber-500 hover:bg-amber-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {error && (
                <div className="mb-5 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-5">
                {/* Reading Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reading Status
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <select
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                    >
                      <option value="interested">Interested</option>
                      <option value="reading">Currently Reading</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Start Date - show if status is 'reading' or 'completed' */}
                {(status === "reading" || status === "completed") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                )}

                {/* End Date - show if status is 'completed' */}
                {status === "completed" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Completion Date
                    </label>
                    <input
                      type="date"
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                )}

                {/* Visibility */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibility
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <select
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all"
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as any)}
                    >
                      <option value="public">Public - Everyone can see</option>
                      <option value="private">Private - Only you can see</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 rounded-b-lg flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToReadingList}
                disabled={isSubmitting}
                className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  "Add to Reading List"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
