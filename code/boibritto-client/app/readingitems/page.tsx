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
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<{ id: string; title: string } | null>(null);

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

  // Function to handle removing a book from reading list
  const handleRemoveBook = async (itemId: string, bookTitle: string) => {
    setBookToDelete({ id: itemId, title: bookTitle });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;

    setDeletingItems(prev => new Set(prev).add(bookToDelete.id));
    setShowDeleteModal(false);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setError("User not authenticated");
        return;
      }

      const token = await user.getIdToken();

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/reading-list/${bookToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        // Remove the item from the local state
        setReadingItems(prev => prev.filter(item => item._id !== bookToDelete.id));
      } else {
        alert(response.data.message || "Failed to remove book from reading list");
      }
    } catch (error: any) {
      console.error("Error removing book from reading list:", error);
      alert(error?.response?.data?.message || error?.message || "Failed to remove book");
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookToDelete.id);
        return newSet;
      });
      setBookToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setBookToDelete(null);
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Reading List</h1>
          <Link
            href="/profile"
            className="text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Profile
          </Link>
        </div>



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
                  <div className="p-4 flex-1 relative">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-12">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {book.title || "Unknown Title"}
                        </h2>
                        <p className="text-gray-600 mb-2">
                          {book.authors?.join(", ") || "Unknown Author"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.status)}
                      </div>
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

                    <div className="mt-4 flex items-center justify-between">
                      <Link
                        href={`/book/${item.volumeId}`}
                        className="text-amber-700 hover:text-amber-800 text-sm"
                      >
                        View Book
                      </Link>

                      {/* Delete button in bottom right corner */}
                      <button
                        onClick={() => handleRemoveBook(item._id, book.title || "Unknown Title")}
                        disabled={deletingItems.has(item._id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove from reading list"
                      >
                        {deletingItems.has(item._id) ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600"></div>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && bookToDelete && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={cancelDelete}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Remove Book</h2>
                <button
                  onClick={cancelDelete}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to remove this book from your reading list?
                </p>
                <p className="text-gray-900 font-semibold">
                  "{bookToDelete.title}"
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}