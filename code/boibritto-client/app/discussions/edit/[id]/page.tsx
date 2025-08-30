"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/googleAuth";
import { discussionsAPI } from "@/lib/discussionAPI";
import { fetchBookDetails } from "@/lib/googleBooks";
import { GENRES } from "@/lib/constants";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

interface DiscussionFormData {
  title: string;
  content: string;
  spoilerAlert: boolean;
  genres: string[];
}

interface BookInfo {
  id: string;
  title: string;
  authors?: string[];
  imageLinks?: {
    thumbnail?: string;
  };
  categories?: string[];
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export default function EditDiscussionPage() {
  const router = useRouter();
  const params = useParams();
  const [user, userLoading] = useAuthState(auth);
  const discussionId = params.id as string;

  const [formData, setFormData] = useState<DiscussionFormData>({
    title: "",
    content: "",
    spoilerAlert: false,
    genres: [],
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  // Book-related states
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [bookSearchResults, setBookSearchResults] = useState<BookInfo[]>([]);
  const [showBookSearch, setShowBookSearch] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Simple notification state
  const [notification, setNotification] = useState<{ message: string; show: boolean }>({
    message: "",
    show: false
  });

  // Show simple notification
  const showNotification = (message: string) => {
    setNotification({ message, show: true });
    setTimeout(() => {
      setNotification({ message: "", show: false });
    }, 3000);
  };

  // Real-time search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setBookSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.items) {
          const books = data.items.map((item: any) => ({
            id: item.id,
            title: item.volumeInfo.title,
            authors: item.volumeInfo.authors,
            imageLinks: item.volumeInfo.imageLinks,
            categories: item.volumeInfo.categories
          }));
          setBookSearchResults(books);
        } else {
          setBookSearchResults([]);
        }
      }
    } catch (error) {
      console.error("Error searching books:", error);
      setBookSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(performSearch, 300),
    [performSearch]
  );

  // Handle search query change
  useEffect(() => {
    debouncedSearch(bookSearchQuery);
  }, [bookSearchQuery, debouncedSearch]);

  // Add book reference to content
  const addBookReference = (book: BookInfo) => {
    const bookReference = `[book:${book.id}]`;
    setFormData(prev => ({
      ...prev,
      content: prev.content + bookReference
    }));
    showNotification(`📖 "${book.title}" reference added to your discussion!`);
    
    setShowBookSearch(false);
    setBookSearchResults([]);
    setBookSearchQuery("");
  };

  // Load existing discussion
  useEffect(() => {
    const loadDiscussion = async () => {
      if (!user || !discussionId) return;

      try {
        setInitialLoading(true);
        const response = await discussionsAPI.getDiscussion(discussionId);
        const discussion = response.discussion;

        // Check if user owns this discussion
        if (discussion.user.uid !== user.uid) {
          setError("You don't have permission to edit this discussion");
          return;
        }

        setFormData({
          title: discussion.title,
          content: discussion.content,
          spoilerAlert: discussion.spoilerAlert,
          genres: discussion.genres || [],
        });
      } catch (err) {
        console.error("Failed to load discussion:", err);
        setError("Failed to load discussion");
      } finally {
        setInitialLoading(false);
      }
    };

    if (!userLoading) {
      loadDiscussion();
    }
  }, [user, userLoading, discussionId]);

  // Redirect if not authenticated
  if (!userLoading && !user) {
    router.push("/signin");
    return null;
  }

  if (userLoading || initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700 mx-auto"></div>
          <p className="mt-4 text-amber-700 font-medium">
            {userLoading ? "Loading..." : "Loading discussion..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 mx-auto text-red-400 mb-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Error</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            href="/discussions"
            className="text-amber-700 hover:text-amber-800 font-medium"
          >
            Back to discussions →
          </Link>
        </div>
      </div>
    );
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Title and content are required");
      return;
    }

    if (formData.title.length > 100) {
      setError("Title must be 100 characters or less");
      return;
    }

    if (formData.content.length > 2000) {
      setError("Content must be 2000 characters or less");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const discussionData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        spoilerAlert: formData.spoilerAlert,
        genres: formData.genres,
      };

      await discussionsAPI.updateDiscussion(discussionId, discussionData);
      showNotification("Discussion updated successfully!");
      router.push(`/discussions/${discussionId}`);
    } catch (error: unknown) {
      console.error("Failed to update discussion:", error);
      const errorMessage = (error as { message?: string })?.message || "Failed to update discussion";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle genre selection
  const handleGenreChange = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  return (
    <main className="bg-white text-gray-900 py-16 px-6 sm:px-10 min-h-screen">
      {/* Simple Native Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-amber-50 border-2 border-amber-200 text-amber-800 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300">
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Discussion</h1>
          <div className="flex items-center gap-2">
            {/* Link Book Button */}
            <button
              type="button"
              onClick={() => setShowBookSearch(!showBookSearch)}
              className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors flex items-center gap-2 font-medium shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              Link Book
            </button>
            <Link
              href={`/discussions/${discussionId}`}
              className="text-amber-700 hover:text-amber-800 flex items-center gap-1 font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
              Back to Discussion
            </Link>
          </div>
        </div>

        {/* Book Search Modal */}
        {showBookSearch && (
          <div className="mb-6 p-6 bg-amber-50 border-2 border-amber-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <h3 className="font-semibold text-amber-800 text-lg">Link a Book to Your Discussion</h3>
            </div>

            <div className="relative mb-4">
              <input
                type="text"
                value={bookSearchQuery}
                onChange={(e) => setBookSearchQuery(e.target.value)}
                placeholder="Search for books by title, author, or keyword..."
                className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800 placeholder-amber-600"
              />
              {searchLoading && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-amber-700"></div>
                </div>
              )}
            </div>
            
            {bookSearchQuery && (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {bookSearchResults.length > 0 ? (
                  <>
                    <p className="text-sm text-amber-700 font-medium mb-3">Click on a book to add its reference:</p>
                    {bookSearchResults.map((book) => (
                      <div
                        key={book.id}
                        onClick={() => addBookReference(book)}
                        className="flex items-start gap-4 p-4 bg-white rounded-lg border border-amber-200 cursor-pointer hover:bg-amber-50 hover:border-amber-300 transition-all duration-200 shadow-sm"
                      >
                        {book.imageLinks?.thumbnail ? (
                          <Image
                            src={book.imageLinks.thumbnail}
                            alt={book.title}
                            width={48}
                            height={72}
                            className="rounded shadow-sm flex-shrink-0"
                            unoptimized
                          />
                        ) : (
                          <div className="w-12 h-18 bg-amber-100 rounded flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-600">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 line-clamp-2 mb-1">{book.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {book.authors?.join(", ") || "Unknown Author"}
                          </p>
                          {book.categories && book.categories.length > 0 && (
                            <span className="inline-block text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                              {book.categories[0]}
                            </span>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-amber-600">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </>
                ) : bookSearchQuery && !searchLoading ? (
                  <div className="text-center py-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400 mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <p className="text-gray-500">No books found for "{bookSearchQuery}"</p>
                  </div>
                ) : null}
              </div>
            )}
            
            <div className="mt-4 p-3 bg-amber-100 rounded-lg border border-amber-200">
              <div className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189c.422-.131.813-.349 1.157-.646l1.07-1.07a4.5 4.5 0 00-6.364 0l1.07 1.07c.344.297.735.515 1.157.646M12 12.75a6.01 6.01 0 01-1.5-.189c-.422-.131-.813-.349-1.157-.646l-1.07-1.07a4.5 4.5 0 016.364 0l-1.07 1.07a4.502 4.502 0 01-1.157.646M12 12.75V7.5" />
                </svg>
                <div>
                  <p className="text-sm text-amber-800 font-medium">How to use Book Links:</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Search and click on a book to add its reference to your discussion content. 
                    The reference will automatically display as a clickable book link!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Discussion Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg"
              placeholder="What would you like to discuss?"
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Spoiler Alert */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.spoilerAlert}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    spoilerAlert: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Spoiler Alert
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Check this if your discussion contains spoilers
            </p>
          </div>

          {/* Genres */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Genres (Optional)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
              {GENRES.map((genre) => (
                <label
                  key={genre}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.genres.includes(genre)}
                    onChange={() => handleGenreChange(genre)}
                    className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700">
                    {genre.charAt(0).toUpperCase() + genre.slice(1).replace('-', ' ')}
                  </span>
                </label>
              ))}
            </div>
            {formData.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full"
                  >
                    {genre.charAt(0).toUpperCase() + genre.slice(1).replace('-', ' ')}
                    <button
                      type="button"
                      onClick={() => handleGenreChange(genre)}
                      className="ml-2 text-amber-600 hover:text-amber-800"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discussion Content * (Markdown supported)
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <MDEditor
                value={formData.content}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, content: value || "" }))
                }
                preview="edit"
                hideToolbar={false}
                height={400}
                data-color-mode="light"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.content.length}/2000 characters • Use [book:ID] format to reference books
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <Link
              href={`/discussions/${discussionId}`}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={
                loading || !formData.title.trim() || !formData.content.trim()
              }
              className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    />
                  </svg>
                  Update Discussion
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}