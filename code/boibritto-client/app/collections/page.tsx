"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";

interface User {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
}

interface Collection {
  _id: string;
  user: User;
  title: string;
  description: string;
  books: string[];
  tags: string[];
  visibility: "public" | "private" | "friends";
  createdAt: string;
  updatedAt: string;
  bookDetails?: any[]; // To store fetched book details
}

export default function CollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthInitialized(true);

      try {
        setLoading(true);

        let headers = {};

        if (user) {
          const token = await user.getIdToken();
          headers = {
            Authorization: `Bearer ${token}`
          };
        } else {
          // If not authenticated, redirect to signin
          router.push("/signin");
          return;
        }

        // Fetch all public collections (no query params)
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/collections`,
          {
            headers,
            withCredentials: true
          }
        );

        if (response.data.success) {
          const collectionsData = response.data.data.collections || [];

          // Fetch book details for each collection
          const collectionsWithBookDetails = await Promise.all(
            collectionsData.map(async (collection: Collection) => {
              // Fetch details for up to 5 books per collection to keep it manageable
              const bookDetailsPromises = collection.books
                .slice(0, 5)
                .map(async (volumeId) => {
                  try {
                    const bookResponse = await fetch(
                      `https://www.googleapis.com/books/v1/volumes/${volumeId}`
                    );
                    if (bookResponse.ok) {
                      return await bookResponse.json();
                    }
                    return null;
                  } catch (error) {
                    console.error(`Error fetching details for book ${volumeId}:`, error);
                    return null;
                  }
                });

              const bookDetails = await Promise.all(bookDetailsPromises);
              return { ...collection, bookDetails: bookDetails.filter(book => book !== null) };
            })
          );

          setCollections(collectionsWithBookDetails);
        } else {
          setError(response.data.message || "Failed to load collections");
        }
      } catch (error: any) {
        console.error("Error fetching collections:", error);
        setError(error?.response?.data?.message || error?.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get visibility badge
  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Public</span>;
      case "private":
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Private</span>;
      case "friends":
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Friends</span>;
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Public Collections</h1>
          <button
            className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800"
            onClick={() => router.push("/profile")}
          >
            My Collections
          </button>
        </div>

        {collections.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500 mb-4">No public collections found.</p>
            <button
              className="inline-block px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800"
              onClick={() => router.push("/profile")}
            >
              View My Collections
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {collections.map((collection) => (
              <Link
                key={collection._id}
                href={`/collections/${collection._id}`}
                className="block bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Collection Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {collection.title}
                      </h2>
                      {/* Creator info */}
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <Image
                          src={collection.user.avatar}
                          alt={collection.user.displayName}
                          width={20}
                          height={20}
                          className="rounded-full mr-2"
                          unoptimized
                        />
                        <span>by {collection.user.displayName} (@{collection.user.username})</span>
                      </div>
                    </div>
                    {getVisibilityBadge(collection.visibility)}
                  </div>

                  {/* Collection Description */}
                  <p className="text-gray-600 mb-4">
                    {collection.description || "No description"}
                  </p>

                  {/* Book Previews - New Section */}
                  <div className="mt-4 mb-4">
                    {collection.bookDetails && collection.bookDetails.length > 0 ? (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Books in this collection:</h3>
                        <div className="flex space-x-3 overflow-x-auto pb-2 -mx-1 px-1">
                          {collection.bookDetails.map((book, index) => (
                            <div key={index} className="flex-shrink-0 w-20">
                              <div className="w-20 h-28 bg-gray-100 rounded shadow-sm overflow-hidden">
                                {book?.volumeInfo?.imageLinks?.thumbnail ? (
                                  <Image
                                    src={book.volumeInfo.imageLinks.thumbnail}
                                    alt={book.volumeInfo.title || "Book cover"}
                                    width={80}
                                    height={112}
                                    className="h-full w-full object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center px-1">
                                    No cover
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-gray-700 mt-1 truncate" title={book?.volumeInfo?.title}>
                                {book?.volumeInfo?.title || "Unknown"}
                              </p>
                            </div>
                          ))}

                          {/* More books indicator */}
                          {collection.books.length > 5 && (
                            <div className="flex-shrink-0 w-20">
                              <div className="w-20 h-28 bg-amber-50 rounded shadow-sm flex items-center justify-center">
                                <span className="text-amber-700 font-medium text-sm">
                                  +{collection.books.length - 5} more
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : collection.books.length > 0 ? (
                      <div className="text-sm text-gray-600">
                        This collection has {collection.books.length} {collection.books.length === 1 ? 'book' : 'books'}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        This collection is empty
                      </div>
                    )}
                  </div>

                  {/* Collection Metadata */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <span>Created on {formatDate(collection.createdAt)}</span>
                    </div>

                    <div>
                      {collection.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {collection.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}