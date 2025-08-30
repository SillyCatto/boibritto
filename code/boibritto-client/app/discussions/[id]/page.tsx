"use client";
import { useState, useEffect } from "react";
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

  // Search for books
  const searchBooks = async () => {
    if (!bookSearchQuery.trim()) return;
    
    setLoadingBooks(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(bookSearchQuery)}&maxResults=5`
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
        }
      }
    } catch (error) {
      console.error("Error searching books:", error);
    } finally {
      setLoadingBooks(false);
    }
  };

  // Add book reference to clipboard
  const addBookReference = (book: BookInfo) => {
    const bookReference = `[book:${book.id}]`;
    navigator.clipboard.writeText(bookReference).then(() => {
      alert(`Book reference copied to clipboard: ${bookReference}\nPaste this in comments to reference "${book.title}"`);
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
        elements.push(
          <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>
            {parts[i]}
          </ReactMarkdown>
        );
      } else {
        // Book ID - replace with clickable link
        const bookId = parts[i];
        const book = linkedBooks.find(b => b.id === bookId);
        if (book) {
          elements.push(
            <Link 
              key={i} 
              href={`/book/${bookId}`}
              className="inline-flex items-center mx-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors text-sm"
            >
              📖 {book.title}
            </Link>
          );
        } else {
          elements.push(
            <span key={i} className="text-gray-500 text-sm">
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
      router.push("/discussions");
    } catch (err) {
      console.error("Failed to delete discussion:", err);
      setError("Failed to delete discussion");
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
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
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/discussions"
              className="text-amber-700 hover:text-amber-800 flex items-center gap-1"
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
              {/* Link Book Button */}
              <button
                onClick={() => setShowBookSearch(!showBookSearch)}
                className="px-4 py-2 text-blue-700 border border-blue-700 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                Link Book
              </button>

              {isOwner && (
                <>
                  <Link
                    href={`/discussions/edit/${discussion._id}`}
                    className="px-4 py-2 text-amber-700 border border-amber-700 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-1"
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
                    className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 disabled:opacity-50"
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
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Book Search Modal */}
          {showBookSearch && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-3">Link a Book to This Discussion</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={bookSearchQuery}
                  onChange={(e) => setBookSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchBooks()}
                  placeholder="Search for books..."
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={searchBooks}
                  disabled={loadingBooks}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loadingBooks ? "..." : "Search"}
                </button>
              </div>
              
              {bookSearchResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-blue-700 mb-2">Click on a book to copy its reference code:</p>
                  {bookSearchResults.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => addBookReference(book)}
                      className="flex items-center gap-3 p-2 bg-white rounded border cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                      {book.imageLinks?.thumbnail && (
                        <Image
                          src={book.imageLinks.thumbnail}
                          alt={book.title}
                          width={32}
                          height={48}
                          className="rounded"
                          unoptimized
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{book.title}</h4>
                        <p className="text-xs text-gray-600">
                          {book.authors?.join(", ") || "Unknown Author"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-3 p-3 bg-blue-100 rounded">
                <p className="text-xs text-blue-800">
                  <strong>How to use:</strong> Search and click on a book to copy its reference code. 
                  Then paste the code in your comments to reference the book. 
                  The code will automatically turn into a clickable book link.
                </p>
              </div>
            </div>
          )}

          {/* Spoiler alert */}
          {discussion.spoilerAlert && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.75 3.25h19.5m-19.5 0a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25m-19.5 0V9.75A2.25 2.25 0 014.5 7.5h15a2.25 2.25 0 012.25 2.25v6.5z"
                  />
                </svg>
                <span className="font-medium">Spoiler Alert!</span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                This discussion contains spoilers about books or stories.
              </p>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {discussion.title}
          </h1>

          {/* Author and date info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-full overflow-hidden">
                <Image
                  src={discussion.user.avatar}
                  alt={discussion.user.displayName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
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
                  className="bg-amber-50 text-amber-800 text-sm px-3 py-1 rounded-full"
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
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              Books Referenced in This Discussion
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {linkedBooks.map((book) => (
                <Link 
                  key={book.id} 
                  href={`/book/${book.id}`}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {book.imageLinks?.thumbnail && (
                    <Image
                      src={book.imageLinks.thumbnail}
                      alt={book.title}
                      width={48}
                      height={72}
                      className="rounded"
                      unoptimized
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{book.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {book.authors?.join(", ") || "Unknown Author"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-8">
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