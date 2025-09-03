"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Eye, EyeOff, Edit, Share2, Bookmark, ChevronLeft, ChevronRight, User, Calendar, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chaptersAPI } from '@/lib/userBooksAPI';
import { Chapter } from '@/lib/types/userBooks';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface ChapterPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ChapterPage({ params }: ChapterPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [liked, setLiked] = useState(false);

  // Check if current user is the owner - matches your existing pattern
  const isOwner = currentUser && chapter && chapter.author._id === currentUser._id;

  // Find previous and next chapters
  const currentChapterIndex = allChapters.findIndex(ch => ch._id === chapter?._id);
  const previousChapter = currentChapterIndex > 0 ? allChapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < allChapters.length - 1 ? allChapters[currentChapterIndex + 1] : null;

  // Google auth listener - matches your existing pattern
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthInitialized(true);
      if (!firebaseUser) {
        router.push('/signin');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (authInitialized && user) {
      fetchChapter();
    }
  }, [authInitialized, user, resolvedParams.id]);

  const fetchChapter = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();

      // Fetch chapter and current user profile - matches your existing pattern
      const [chapterData, profileRes] = await Promise.all([
        chaptersAPI.getChapter(resolvedParams.id),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/profile/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
        })
      ]);

      setChapter(chapterData.chapter);

      // Fetch all chapters for the book to enable navigation
      if (chapterData.chapter.book && typeof chapterData.chapter.book === 'object') {
        try {
          const chaptersResponse = await chaptersAPI.getChaptersForBook(chapterData.chapter.book._id, { published: true });
          // Sort chapters by chapter number
          const sortedChapters = chaptersResponse.chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
          setAllChapters(sortedChapters);
        } catch (error) {
          console.error('Error fetching book chapters:', error);
          setAllChapters([]);
        }
      }

      // Set current user profile for ownership checks
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success) {
          setCurrentUser(profileData.data.profile_data);
          // Check if user has liked this chapter
          setLiked(chapterData.chapter.likes.includes(profileData.data.profile_data._id));
        }
      }
    } catch (error) {
      console.error('Error fetching chapter:', error);
      if (error instanceof Error && error.message.includes('not authenticated')) {
        router.push('/signin');
      } else {
        router.push('/books');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!chapter) return;

    try {
      const { liked: newLikedState, likeCount } = await chaptersAPI.likeChapter(chapter._id);
      setLiked(newLikedState);

      // Update chapter likes count
      setChapter(prev => prev ? {
        ...prev,
        likes: Array(likeCount).fill('user') // Simplified for demo
      } : null);
    } catch (error) {
      console.error('Error liking chapter:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: chapter?.title,
          text: `Read "${chapter?.title}" on BoiBritto`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  const estimatedReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Chapter not found</h2>
          <p className="text-gray-600 mb-6">This chapter doesn't exist or you don't have access to it.</p>
          <Link
            href="/books"
            className="bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800 transition-colors"
          >
            Back to Books
          </Link>
        </div>
      </div>
    );
  }

  const book = typeof chapter.book === 'object' ? chapter.book : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href={book ? `/books/${book._id}` : '/books'}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            {book ? `Back to ${book.title}` : 'Back to Books'}
          </Link>

          {isOwner && (
            <Link
              href={`/chapters/${chapter._id}/edit`}
              className="flex items-center gap-2 bg-white border border-amber-200 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-50 transition-colors"
            >
              <Edit size={16} />
              Edit Chapter
            </Link>
          )}
        </div>

        {/* Chapter Header */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full">
              Chapter {chapter.chapterNumber}
            </span>

            {chapter.visibility === 'private' && (
              <div className="flex items-center gap-1 text-gray-500">
                <EyeOff size={16} />
                <span className="text-sm">Private</span>
              </div>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">{chapter.title}</h1>

          {/* Chapter Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>by {chapter.author.displayName}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>Published {new Date(chapter.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2">
              <BookOpen size={16} />
              <span>{chapter.wordCount} words</span>
            </div>

            <div className="flex items-center gap-2">
              <Eye size={16} />
              <span>{estimatedReadingTime(chapter.content)} min read</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                liked
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Heart size={16} className={liked ? 'fill-current' : ''} />
              <span>{liked ? 'Liked' : 'Like'} ({chapter.likes.length})</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>

            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
              <Bookmark size={16} />
              <span>Bookmark</span>
            </button>
          </div>
        </div>

        {/* Chapter Content */}
        <article className="bg-white rounded-xl shadow-sm border border-amber-100 p-8 mb-8">
          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-em:text-gray-700 prose-blockquote:border-amber-200 prose-blockquote:bg-amber-50 prose-code:bg-gray-100 prose-code:text-gray-800 prose-pre:bg-gray-900">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {chapter.content}
            </ReactMarkdown>
          </div>
        </article>

        {/* Chapter Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
          <div className="flex items-center justify-between">
            {/* Previous Chapter */}
            {previousChapter ? (
              <Link
                href={`/chapters/${previousChapter._id}`}
                className="flex items-center gap-2 text-gray-600 hover:text-amber-700 transition-colors group"
              >
                <ChevronLeft size={20} className="group-hover:transform group-hover:-translate-x-1 transition-transform" />
                <div className="text-left">
                  <p className="text-sm text-gray-500">Previous Chapter</p>
                  <p className="font-medium">Chapter {previousChapter.chapterNumber}: {previousChapter.title}</p>
                </div>
              </Link>
            ) : (
              <div className="w-48"></div> // Spacer to maintain layout
            )}

            <Link
              href={book ? `/books/${book._id}` : '/books'}
              className="text-center"
            >
              <p className="text-sm text-gray-500">Back to</p>
              <p className="font-medium text-amber-700 hover:text-amber-800 transition-colors">
                {book ? book.title : 'Books'}
              </p>
            </Link>

            {/* Next Chapter */}
            {nextChapter ? (
              <Link
                href={`/chapters/${nextChapter._id}`}
                className="flex items-center gap-2 text-gray-600 hover:text-amber-700 transition-colors group"
              >
                <div className="text-right">
                  <p className="text-sm text-gray-500">Next Chapter</p>
                  <p className="font-medium">Chapter {nextChapter.chapterNumber}: {nextChapter.title}</p>
                </div>
                <ChevronRight size={20} className="group-hover:transform group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <div className="w-48"></div> // Spacer to maintain layout
            )}
          </div>
        </div>

      
      </div>
    </div>
  );
}
