"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";



interface ReadingItem {
  _id: string;
  user: string;
  volumeId: string;
  status: "interested" | "reading" | "completed";
  startedAt?: string;
  completedAt?: string;
  visibility: "public" | "private" | "friends";
  createdAt: string;
  updatedAt: string;
  bookDetails?: any; // Will store fetched book details
}

export default function ReadingItemsPage() {
  const router = useRouter();
  const [readingItems, setReadingItems] = useState<ReadingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/signin");
        return;
      }

      try {
        setLoading(true);
        const token = await user.getIdToken();
        
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/reading-list/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            withCredentials: true
          }
        );

        if (response.data.success) {
          const items = response.data.data.readingList || [];
          
          // Fetch book details for each item
          const itemsWithDetails = await Promise.all(
            items.map(async (item: ReadingItem) => {
              try {
                const bookResponse = await fetch(
                  `https://www.googleapis.com/books/v1/volumes/${item.volumeId}`
                );
                if (bookResponse.ok) {
                  const bookData = await bookResponse.json();
                  return { ...item, bookDetails: bookData };
                }
                return item;
              } catch (error) {
                console.error(`Error fetching details for book ${item.volumeId}:`, error);
                return item;
              }
            })
          );
          
          setReadingItems(itemsWithDetails);
        } else {
          setError(response.data.message || "Failed to load reading list");
        }
      } catch (error: any) {
        console.error("Error fetching reading list:", error);
        setError(error?.response?.data?.message || error?.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Helper function for status display
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "interested":
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Interested</span>;
      case "reading":
        return <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">Reading</span>;
      case "completed":
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Completed</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => router.push("/explore")}
          className="px-4 py-2 bg-amber-700 text-white rounded-md"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Reading List</h1>
        
        {readingItems.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500 mb-4">You haven't added any books to your reading list yet.</p>
            <Link 
              href="/explore" 
              className="inline-block px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800"
            >
              Explore Books
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {readingItems.map((item) => {
              const book = item.bookDetails?.volumeInfo || {};
              return (
                <div key={item._id} className="bg-white rounded-lg shadow overflow-hidden flex">
                  {/* Book cover */}
                  <div className="w-24 h-36 sm:w-32 sm:h-48 flex-shrink-0 bg-gray-100">
                    {book?.imageLinks?.thumbnail ? (
                      <Image
                        src={book.imageLinks.thumbnail}
                        alt={book.title || "Book cover"}
                        width={128}
                        height={192}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No cover
                      </div>
                    )}
                  </div>
                  
                  {/* Book details */}
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {book.title || "Unknown Title"}
                        </h2>
                        <p className="text-gray-600 mb-2">
                          {book.authors?.join(", ") || "Unknown Author"}
                        </p>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-500">
                      {item.status === "reading" && (
                        <p>Started: {formatDate(item.startedAt)}</p>
                      )}
                      {item.status === "completed" && (
                        <div>
                          <p>Started: {formatDate(item.startedAt)}</p>
                          <p>Completed: {formatDate(item.completedAt)}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex items-center gap-2">
                      <Link
                        href={`/book/${item.volumeId}`}
                        className="text-amber-700 hover:text-amber-800 text-sm"
                      >
                        View Book
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}