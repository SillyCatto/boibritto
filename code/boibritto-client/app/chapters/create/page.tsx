"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { ArrowLeft, Save, Eye, EyeOff, BookOpen } from 'lucide-react';
import { chaptersAPI, userBooksAPI } from '@/lib/userBooksAPI';
import { UserBook } from '@/lib/types/userBooks';

export default function CreateChapterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookId');
  const chapterNumber = parseInt(searchParams.get('chapterNumber') || '1');

  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [book, setBook] = useState<UserBook | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    visibility: 'private' as 'public' | 'private'
  });

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
    if (authInitialized && user && bookId) {
      fetchBook();
    } else if (authInitialized && user && !bookId) {
      router.push('/books');
    }
  }, [authInitialized, user, bookId, router]);

  const fetchBook = async () => {
    if (!bookId || !user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();

      // Fetch book and current user profile - matches your existing pattern
      const [bookData, profileRes] = await Promise.all([
        userBooksAPI.getUserBook(bookId),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/profile/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
        })
      ]);

      setBook(bookData.book);

      // Set current user profile for ownership checks
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success) {
          setCurrentUser(profileData.data.profile_data);

          // Check if user is the owner of the book
          if (bookData.book.author._id !== profileData.data.profile_data._id) {
            router.push('/books');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching book:', error);
      if (error instanceof Error && error.message.includes('not authenticated')) {
        router.push('/signin');
      } else {
        router.push('/books');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookId || !formData.title.trim() || !formData.content.trim() || !user) return;

    try {
      setSaving(true);
      const chapterData = {
        bookId,
        title: formData.title.trim(),
        content: formData.content.trim(),
        chapterNumber,
        visibility: formData.visibility
      };

      const response = await chaptersAPI.createChapter(chapterData);
      router.push(`/chapters/${response.chapter._id}`);
    } catch (error) {
      console.error('Error creating chapter:', error);
      if (error instanceof Error && error.message.includes('not authenticated')) {
        router.push('/signin');
      } else {
        alert('Failed to create chapter. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Book not found</h2>
          <p className="text-gray-600 mb-6">Unable to load the book for this chapter.</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href={`/books/${book._id}`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to {book.title}
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleInputChange('visibility', formData.visibility === 'private' ? 'public' : 'private')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                formData.visibility === 'public'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              {formData.visibility === 'public' ? <Eye size={16} /> : <EyeOff size={16} />}
              <span className="text-sm font-medium">
                {formData.visibility === 'public' ? 'Public' : 'Private'}
              </span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Chapter Info */}
          <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full">
                Chapter {chapterNumber}
              </span>
              <span className="text-sm text-gray-500">for "{book.title}"</span>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter chapter title..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  maxLength={200}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/200 characters
                </p>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-4">
              Chapter Content *
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Write your chapter content here... You can use Markdown formatting."
              className="w-full h-96 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              maxLength={50000}
              required
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Supports Markdown formatting (headings, bold, italic, links, etc.)
              </p>
              <p className="text-xs text-gray-500">
                {formData.content.length}/50,000 characters
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Link
              href={`/books/${book._id}`}
              className="px-6 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving || !formData.title.trim() || !formData.content.trim()}
              className="flex items-center gap-2 bg-amber-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {saving ? 'Creating...' : 'Create Chapter'}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="bg-amber-50 rounded-lg p-4 mt-8">
          <h3 className="font-medium text-amber-900 mb-2">Writing Tips</h3>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• Use Markdown for formatting: **bold**, *italic*, # headings</li>
            <li>• Private chapters are only visible to you</li>
            <li>• Public chapters can be seen by anyone if your book is public</li>
            <li>• You can always edit and change visibility later</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
