"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/googleAuth";
import { discussionsAPI, Discussion } from "@/lib/discussionAPI";
import { fetchBookDetails } from "@/lib/googleBooks";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Comments } from "@/components/comments";

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

export default function DiscussionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user] = useAuthState(auth);
  const discussionId = params.id as string;

  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  
  // Book-related states
  const [linkedBooks, setLinkedBooks] = useState<BookInfo[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
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

  // Load discussion
  useEffect(() => {
    const loadDiscussion = async () => {
      try {
        setLoading(true);
        const response = await discussionsAPI.getDiscussion(discussionId);
        setDiscussion(response.discussion);
        
        // Extract book IDs from discussion content (if any)
        extractBooksFromContent(response.discussion.content);
      } catch (err) {
        console.error("Failed to load discussion:", err);
        setError("Failed to load discussion");
      } finally {
        setLoading(false);
      }
    };

    if (user && discussionId) {
      loadDiscussion();
    }
  }, [user, discussionId]);

  // Extract book IDs from discussion content using pattern [book:ID]
  const extractBooksFromContent = async (content: string) => {
    const bookIdRegex = /\[book:([a-zA-Z0-9_-]+)\]/g;
    const matches = content.match(bookIdRegex);
    
    if (matches) {
      setLoadingBooks(true);
      const bookIds = matches.map(match => match.replace(/\[book:([a-zA-Z0-9_-]+)\]/, '$1'));
      const uniqueBookIds = [...new Set(bookIds)];
      
      try {
        const bookPromises = uniqueBookIds.map(async (bookId) => {
          try {
            const bookData = await fetchBookDetails(bookId);
            return {
              id: bookId,
              title: bookData.title,
              authors: bookData.authors,
              imageLinks: bookData.imageLinks,
              categories: bookData.categories
            };
          } catch (error) {
            console.error(`Failed to fetch book ${bookId}:`, error);
            return null;
          }
        });
        
        const books = await Promise.all(bookPromises);
        setLinkedBooks(books.filter(book => book !== null) as BookInfo[]);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoadingBooks(false);
      }
    }
  };

  // Add book reference to clipboard with simple notification
  const addBookReference = (book: BookInfo) => {
    const bookReference = `[book:${book.id}]`;
    navigator.clipboard.writeText(bookReference).then(() => {
      showNotification(`📖 "${book.title}" reference copied! Paste it in your comments to link this book.`);
    }).catch(() => {
      showNotification("Failed to copy book reference. Please try again.");
    });
    
    setShowBookSearch(false);
    setBookSearchResults([]);
    setBookSearchQuery("");
  };

  // Render book references in content
  const renderContentWithBooks = (content: string) => {
    const bookIdRegex = /\[book:([a-zA-Z0-9_-]+)\]/g;
    const parts = content.split(bookIdRegex);
    
    const elements = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Regular text
        if (parts[i]) {
          elements.push(
            <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>
              {parts[i]}
            </ReactMarkdown>
          );
        }
      } else {
        // Book ID - replace with clickable link
        const bookId = parts[i];
        const book = linkedBooks.find(b => b.id === bookId);
        if (book) {
          elements.push(
            <Link 
              key={i} 
              href={`/book/${bookId}`}
              className="inline-flex items-center mx-1 px-3 py-2 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors text-sm font-medium border border-amber-200"
            >
              📖 {book.title}
            </Link>
          );
        } else {
          elements.push(
            <span key={i} className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded">
              [Book: {bookId}]
            </span>
          );
        }
      }
    }
    return elements;
  };

  // Handle delete
  const handleDelete = async () => {
    if (
      !discussion ||
      !window.confirm("Are you sure you want to delete this discussion?")
    ) {
      return;
    }

    try {
      setDeleting(true);
      await discussionsAPI.deleteDiscussion(discussion._id);
      showNotification("Discussion deleted successfully");
      router.push("/discussions");
    } catch (err) {
      console.error("Failed to delete discussion:", err);
      setError("Failed to delete discussion");
      showNotification("Failed to delete discussion");
    } finally {
      setDeleting(false);
    }
  };

  // Check if user owns the discussion
  const isOwner = user && discussion && user.uid === discussion.user.uid;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 mx-auto text-gray-400 mb-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            Sign in required
          </h3>
          <p className="text-gray-500 mb-6">
            You need to sign in to view discussions.
          </p>
          <Link
            href="/signin"
            className="text-amber-700 hover:text-amber-800 font-medium"
          >
            Sign in to continue →
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700 mx-auto"></div>
          <p className="mt-4 text-amber-700 font-medium">Loading discussion...</p>
        </div>
      </div>
    );
  }

  if (error || !discussion) {
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
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            Discussion not found
          </h3>
          <p className="text-gray-500 mb-6">
            {error ||
              "The discussion you're looking for doesn't exist or you don't have permission to view it."}
          </p>
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

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Simple Native Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-amber-50 border-2 border-amber-200 text-amber-800 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300">
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/discussions"
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
              Back to Discussions
            </Link>

            <div className="flex items-center gap-2">
              {/* Link Book Button - Only for discussion owner */}
              {isOwner && (
                <button
                  onClick={() => setShowBookSearch(!showBookSearch)}
                  className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors flex items-center gap-2 font-medium shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                  Link Book
                </button>
              )}

              {isOwner && (
                <>
                  <Link
                    href={`/discussions/edit/${discussion._id}`}
                    className="px-4 py-2 text-amber-700 border-2 border-amber-700 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-1 font-medium"
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
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                      />
                    </svg>
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 disabled:opacity-50 font-medium"
                  >
                    {deleting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600"></div>
                    ) : (
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
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    )}
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Book Search Modal - Only for discussion owner */}
          {isOwner && showBookSearch && (
            <div className="mb-6 p-6 bg-amber-50 border-2 border-amber-200 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                <h3 className="font-semibold text-amber-800 text-lg">Link a Book to This Discussion</h3>
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
                      <p className="text-sm text-amber-700 font-medium mb-3">Click on a book to copy its reference:</p>
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
                      Search and click on a book to copy its reference code. 
                      Paste the code in your comments to create clickable book links!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Spoiler alert */}
          {discussion.spoilerAlert && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="flex items-center gap-3 text-red-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 flex-shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.75 3.25h19.5m-19.5 0a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25m-19.5 0V9.75A2.25 2.25 0 014.5 7.5h15a2.25 2.25 0 012.25 2.25v6.5z"
                  />
                </svg>
                <div>
                  <span className="font-semibold">Spoiler Alert!</span>
                  <p className="text-red-700 text-sm mt-1">
                    This discussion contains spoilers about books or stories.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {discussion.title}
          </h1>

          {/* Author and date info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-amber-200">
                <Image
                  src={discussion.user.avatar}
                  alt={discussion.user.displayName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {discussion.user.displayName}
                </h3>
                <p className="text-gray-500 text-sm">
                  @{discussion.user.username}
                </p>
              </div>
            </div>
            <div className="text-gray-400 text-sm">
              <p>
                Created{" "}
                {new Date(discussion.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              {discussion.updatedAt !== discussion.createdAt && (
                <p>
                  Updated{" "}
                  {new Date(discussion.updatedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Genres */}
          {discussion.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {discussion.genres.map((genre) => (
                <span
                  key={genre}
                  className="bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full font-medium border border-amber-200"
                >
                  {genre.charAt(0).toUpperCase() +
                    genre.slice(1).replace("-", " ")}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 mt-8">
        {/* Linked Books Section */}
        {linkedBooks.length > 0 && (
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6 border border-amber-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-amber-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              Books Referenced in This Discussion
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {linkedBooks.map((book) => (
                <Link 
                  key={book.id} 
                  href={`/book/${book.id}`}
                  className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors border border-amber-200 hover:border-amber-300"
                >
                  {book.imageLinks?.thumbnail && (
                    <Image
                      src={book.imageLinks.thumbnail}
                      alt={book.title}
                      width={48}
                      height={72}
                      className="rounded shadow-sm"
                      unoptimized
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{book.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {book.authors?.join(", ") || "Unknown Author"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
          <div className="prose prose-lg max-w-none text-gray-800">
            {renderContentWithBooks(discussion.content)}
          </div>
        </div>

        {/* Comments section */}
        <div className="mt-8">
          <Comments
            discussionId={discussion._id}
            discussionOwnerId={discussion.user.uid}
          />
        </div>
      </div>
    </div>
  );
}