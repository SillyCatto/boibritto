"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {
  ArrowLeft,
  Book,
  Edit,
  Plus,
  Eye,
  EyeOff,
  Heart,
  Calendar,
  User as UserIcon,
  BookOpen,
  FileText,
  Settings,
  Trash2,
} from "lucide-react";
import { userBooksAPI, chaptersAPI } from "@/lib/userBooksAPI";
import { UserBook, Chapter } from "@/lib/types/userBooks";
import ReportModal from "@/components/ui/ReportModal";

interface BookPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BookPage({ params }: BookPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [book, setBook] = useState<UserBook | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteChapterId, setDeleteChapterId] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // Check if current user is the owner - matches your existing pattern
  const isOwner = currentUser && book && book.author._id === currentUser._id;

  // Google auth listener - matches your existing pattern
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthInitialized(true);
      if (!firebaseUser) {
        router.push("/signin");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (authInitialized && user) {
      fetchBookData();
    }
  }, [authInitialized, user, resolvedParams.id]);

  const fetchBookData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();

      // Fetch book, chapters, and current user profile - matches your existing pattern
      const [bookData, chaptersData, profileRes] = await Promise.all([
        userBooksAPI.getUserBook(resolvedParams.id),
        chaptersAPI.getChaptersForBook(resolvedParams.id),
        fetch(
          `${
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"
          }/api/profile/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        ),
      ]);

      setBook(bookData.book);
      setChapters(chaptersData.chapters);

      // Set current user profile for ownership checks
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success) {
          setCurrentUser(profileData.data.profile_data);
        }
      }
    } catch (error) {
      console.error("Error fetching book:", error);
      if (
        error instanceof Error &&
        error.message.includes("not authenticated")
      ) {
        router.push("/signin");
      } else {
        router.push("/books");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLikeBook = async () => {
    if (!book || !user) return;
    try {
      await userBooksAPI.likeUserBook(book._id);
      fetchBookData(); // Refresh to get updated like count
    } catch (error) {
      console.error("Error liking book:", error);
      if (
        error instanceof Error &&
        error.message.includes("not authenticated")
      ) {
        router.push("/signin");
      }
    }
  };

  const handleDeleteBook = async () => {
    if (!book || !user) return;
    try {
      await userBooksAPI.deleteUserBook(book._id);
      router.push("/books");
    } catch (error) {
      console.error("Error deleting book:", error);
      if (
        error instanceof Error &&
        error.message.includes("not authenticated")
      ) {
        router.push("/signin");
      }
    }
  };

  const handleDeleteChapter = async () => {
    if (!deleteChapterId || !user) return;
    try {
      await chaptersAPI.deleteChapter(deleteChapterId);
      setShowDeleteConfirm(false);
      setDeleteChapterId(null);
      fetchBookData(); // Refresh chapters
    } catch (error) {
      console.error("Error deleting chapter:", error);
      if (
        error instanceof Error &&
        error.message.includes("not authenticated")
      ) {
        router.push("/signin");
      }
    }
  };

  const handleLikeChapter = async (chapterId: string) => {
    if (!user) return;
    try {
      await chaptersAPI.likeChapter(chapterId);
      fetchBookData(); // Refresh to get updated like count
    } catch (error) {
      console.error("Error liking chapter:", error);
      if (
        error instanceof Error &&
        error.message.includes("not authenticated")
      ) {
        router.push("/signin");
      }
    }
  };

  const getNextChapterNumber = () => {
    if (chapters.length === 0) return 1;
    return Math.max(...chapters.map((c) => c.chapterNumber)) + 1;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Show loading screen while checking auth
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="aspect-[3/4] bg-gray-200 rounded-xl"></div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Book className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Book not found
          </h3>
          <p className="text-gray-600 mb-6">
            The book you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Link
            href="/books"
            className="inline-flex items-center gap-2 bg-amber-700 text-white px-6 py-3 rounded-full font-medium hover:bg-amber-800 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link
          href="/books"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back to Books
        </Link>

        {/* Book Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Cover Image */}
          <div className="lg:col-span-1">
            <div className="aspect-[3/4] bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl overflow-hidden relative">
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Book className="text-amber-600" size={80} />
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    book.isCompleted
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {book.isCompleted ? "Completed" : "In Progress"}
                </span>
              </div>

              {/* Visibility Badge */}
              <div className="absolute top-4 right-4">
                {book.visibility === "private" ? (
                  <div className="bg-white bg-opacity-90 rounded-full p-2">
                    <EyeOff className="text-gray-600" size={20} />
                  </div>
                ) : (
                  <div className="bg-white bg-opacity-90 rounded-full p-2">
                    <Eye className="text-green-600" size={20} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Book Info */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-4xl font-bold text-gray-900">{book.title}</h1>

              {isOwner && (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/books/${book._id}/edit`}
                    className="p-2 text-gray-500 hover:text-amber-600 transition-colors"
                  >
                    <Settings size={20} />
                  </Link>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Author */}
            <div className="flex items-center gap-2 text-lg text-gray-600 mb-4">
              <UserIcon size={20} />
              <span>by {book.author.displayName}</span>
            </div>

            {/* Synopsis */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Synopsis
              </h3>
              <p className="text-gray-700 leading-relaxed">{book.synopsis}</p>
            </div>

            {/* Genres */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {book.genres.map((genre) => (
                  <span
                    key={genre}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800"
                  >
                    {genre.charAt(0).toUpperCase() + genre.slice(1)}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-white rounded-lg border border-amber-100">
                <BookOpen className="mx-auto text-amber-600 mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-900">
                  {chapters.length}
                </div>
                <div className="text-sm text-gray-600">Chapters</div>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border border-amber-100">
                <Heart className="mx-auto text-red-500 mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-900">
                  {book.likes.length}
                </div>
                <div className="text-sm text-gray-600">Likes</div>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border border-amber-100">
                <FileText className="mx-auto text-blue-500 mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-900">
                  {book.totalWordCount || 0}
                </div>
                <div className="text-sm text-gray-600">Words</div>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border border-amber-100">
                <Calendar className="mx-auto text-green-500 mb-2" size={24} />
                <div className="text-sm font-medium text-gray-900">
                  {formatDate(book.createdAt)}
                </div>
                <div className="text-sm text-gray-600">Created</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleLikeBook}
                className="flex items-center gap-2 px-6 py-3 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
              >
                <Heart
                  size={20}
                  className={
                    book.likes.length > 0 ? "fill-red-500 text-red-500" : ""
                  }
                />
                Like ({book.likes.length})
              </button>

              {/* Report button - only show if not owner and user is logged in */}
              {user && !isOwner && (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  title="Report this book"
                >
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
                      d="M3 3l1.664 6L3 15l13.333-6L3 3z"
                    />
                  </svg>
                  Report
                </button>
              )}

              {isOwner && (
                <Link
                  href={`/chapters/create?bookId=${
                    book._id
                  }&chapterNumber=${getNextChapterNumber()}`}
                  className="flex items-center gap-2 bg-amber-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-800 transition-colors"
                >
                  <Plus size={20} />
                  Add Chapter
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Chapters</h2>
            {isOwner && chapters.length > 0 && (
              <Link
                href={`/chapters/create?bookId=${
                  book._id
                }&chapterNumber=${getNextChapterNumber()}`}
                className="flex items-center gap-2 bg-amber-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-800 transition-colors"
              >
                <Plus size={16} />
                Add Chapter
              </Link>
            )}
          </div>

          {chapters.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No chapters yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start writing your story by adding the first chapter.
              </p>
              {isOwner && (
                <Link
                  href={`/chapters/create?bookId=${book._id}&chapterNumber=1`}
                  className="inline-flex items-center gap-2 bg-amber-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-800 transition-colors"
                >
                  <Plus size={20} />
                  Write First Chapter
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {chapters.map((chapter) => (
                <ChapterCard
                  key={chapter._id}
                  chapter={chapter}
                  isOwner={isOwner}
                  onLike={handleLikeChapter}
                  onDelete={(chapterId) => {
                    setDeleteChapterId(chapterId);
                    setShowDeleteConfirm(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {deleteChapterId ? "Delete Chapter" : "Delete Book"}
            </h3>
            <p className="text-gray-600 mb-6">
              {deleteChapterId
                ? "Are you sure you want to delete this chapter? This action cannot be undone."
                : "Are you sure you want to delete this book and all its chapters? This action cannot be undone."}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteChapterId(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={
                  deleteChapterId ? handleDeleteChapter : handleDeleteBook
                }
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {user && !isOwner && book && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          targetType="userbook"
          targetId={resolvedParams.id}
          targetTitle={book?.title}
        />
      )}
    </div>
  );
}

// Chapter Card Component
interface ChapterCardProps {
  chapter: Chapter;
  isOwner: boolean;
  onLike: (chapterId: string) => void;
  onDelete: (chapterId: string) => void;
}

function ChapterCard({ chapter, isOwner, onLike, onDelete }: ChapterCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-amber-200 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Link href={`/chapters/${chapter._id}`} className="block group">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                Chapter {chapter.chapterNumber}
              </span>
              {chapter.visibility === "private" && (
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Private
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">
              {chapter.title}
            </h3>

            {/* Show preview only if content is available, otherwise show placeholder */}
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {chapter.content
                ? `${chapter.content.substring(0, 150)}...`
                : "Click to read this chapter..."}
            </p>
          </Link>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <FileText size={14} />
              <span>{chapter.wordCount || 0} words</span>
            </div>

            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate(chapter.createdAt)}</span>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                onLike(chapter._id);
              }}
              className="flex items-center gap-1 hover:text-red-500 transition-colors"
            >
              <Heart
                size={14}
                className={
                  chapter.likes.length > 0 ? "fill-red-500 text-red-500" : ""
                }
              />
              <span>{chapter.likes.length}</span>
            </button>
          </div>
        </div>

        {isOwner && (
          <div className="flex items-center gap-2 ml-4">
            <Link
              href={`/chapters/${chapter._id}/edit`}
              className="p-2 text-gray-500 hover:text-amber-600 transition-colors"
            >
              <Edit size={16} />
            </Link>

            <button
              onClick={() => onDelete(chapter._id)}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
