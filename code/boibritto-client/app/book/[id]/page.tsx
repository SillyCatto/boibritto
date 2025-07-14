"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAuth } from "firebase/auth";
import axios from "axios";

// Helper to safely render <p> tags as real paragraphs
function renderDescription(desc?: string) {
  if (!desc) return <span>No description available.</span>;
  // Replace <br> and <br/> with newlines for safety
  let clean = desc.replace(/<br\s*\/?>/gi, "\n");
  // Split by <p> tags
  const paragraphs = clean
    .split(/<\/?p>/gi)
    .map(s => s.trim())
    .filter(Boolean);
  return paragraphs.map((para, idx) => (
    <p key={idx} className="mb-3 last:mb-0 text-gray-800 text-sm">{para}</p>
  ));
}

export default function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // New states for reading list functionality
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState<"interested" | "reading" | "completed">("interested");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [visibility, setVisibility] = useState<"public" | "private" | "friends">("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchBook() {
      setLoading(true);
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
      const data = await res.json();
      setBook(data);
      setLoading(false);
    }
    if (id) fetchBook();
  }, [id]);

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
    setSuccess("");
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        setError("Please sign in to add books to your reading list");
        setIsSubmitting(false);
        return;
      }
      
      const idToken = await user.getIdToken();
      
      // Prepare request data based on status
      const requestData: any = {
        volumeId: id,
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
      
      setSuccess("Book added to your reading list!");
      setIsModalOpen(false);
      
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 
        err?.message || 
        "Failed to add book to reading list"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Book not found.
      </div>
    );
  }

  const info = book.volumeInfo || {};
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12 px-4">
      {/* Success message */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 flex items-center shadow-md">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
          <span>{success}</span>
          <button 
            onClick={() => setSuccess("")} 
            className="ml-4 text-green-700"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Main content */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 bg-white rounded-2xl shadow-lg p-8">
        {/* Book Cover Tile */}
        <div className="col-span-1 flex flex-col items-center">
          <div className="w-48 h-72 bg-gray-100 rounded-lg shadow flex items-center justify-center overflow-hidden mb-4">
            {info.imageLinks?.thumbnail ? (
              <Image
                src={info.imageLinks.thumbnail}
                alt={info.title}
                width={200}
                height={300}
                className="rounded-lg object-cover"
                unoptimized
              />
            ) : (
              <span className="text-gray-400">No image available</span>
            )}
          </div>
          
          {/* Add to Reading List Button (now enabled) */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full mt-4 px-6 py-3 rounded-lg bg-amber-700 text-white font-semibold shadow hover:bg-amber-800 transition"
          >
            Add to Reading List
          </button>
          
          {/* Add to Collection Button (still disabled) */}
          <button
            disabled
            className="w-full mt-4 px-6 py-3 rounded-lg bg-amber-700 text-white font-semibold shadow hover:bg-amber-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            // TODO: Implement add to collection functionality
          >
            Add to Collection List
          </button>
          
          {/* Back to Explore Button */}
          <Link
            href="/explore"
            className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-amber-200 bg-white text-amber-700 font-semibold shadow hover:bg-amber-50 hover:text-amber-800 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Explore
          </Link>
        </div>

        {/* Book Details Tile */}
        <div className="col-span-2 flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-700 mb-2">{info.title}</h1>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Author(s):</span> {info.authors?.join(", ") || "Unknown"}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Published:</span> {info.publishedDate || "Unknown"}
            </p>
            {info.categories && (
              <div className="mb-2 flex flex-wrap gap-2">
                {info.categories.map((cat: string, idx: number) => (
                  <span key={idx} className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
                    {cat}
                  </span>
                ))}
              </div>
            )}
            {info.averageRating && (
              <div className="mb-2 text-amber-600 font-medium">
                Rating: {info.averageRating} / 5
              </div>
            )}
          </div>
          <div className="bg-amber-50 rounded-lg p-4 shadow-inner">
            <h2 className="text-lg font-semibold text-amber-700 mb-2">Description</h2>
            <div>
              {renderDescription(info.description)}
            </div>
          </div>
        </div>
      </div>

      {/* Reading List Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add to Reading List</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              {/* Reading Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reading Status
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="interested">Interested</option>
                  <option value="reading">Currently Reading</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              {/* Start Date - show if status is 'reading' or 'completed' */}
              {(status === "reading" || status === "completed") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              )}
              
              {/* End Date - show if status is 'completed' */}
              {status === "completed" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              )}
              
              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                >
                  <option value="public">Public - Everyone can see</option>
                  <option value="friends">Friends - Only friends can see</option>
                  <option value="private">Private - Only you can see</option>
                </select>
              </div>
              
              {/* Submit Button */}
              <button
                onClick={handleAddToReadingList}
                disabled={isSubmitting}
                className="w-full py-2 px-4 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  "Add to My Reading List"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}