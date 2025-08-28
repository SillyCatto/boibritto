"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, EyeOff, BookOpen } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { chaptersAPI, userBooksAPI } from '@/lib/userBooksAPI';
import { CreateChapterData, UserBook } from '@/lib/types/userBooks';

interface CreateChapterPageProps {
  params: {
    id: string; // book ID
  };
}

export default function CreateChapterPage({ params }: CreateChapterPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [book, setBook] = useState<UserBook | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateChapterData>({
    bookId: params.id,
    title: '',
    content: '',
    chapterNumber: parseInt(searchParams.get('number') || '1'),
    visibility: 'private',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    fetchBook();
  }, [params.id]);

  useEffect(() => {
    // Calculate word count
    const count = formData.content
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
    setWordCount(count);
  }, [formData.content]);

  const fetchBook = async () => {
    try {
      const { book } = await userBooksAPI.getUserBook(params.id);
      setBook(book);

      // Set default visibility based on book visibility
      setFormData(prev => ({
        ...prev,
        visibility: book.visibility === 'public' ? 'public' : 'private'
      }));
    } catch (error) {
      console.error('Error fetching book:', error);
      router.push('/books');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Chapter title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Chapter content is required';
    } else if (formData.content.length > 50000) {
      newErrors.content = 'Content cannot exceed 50,000 characters';
    }

    if (formData.chapterNumber < 1) {
      newErrors.chapterNumber = 'Chapter number must be at least 1';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const { chapter } = await chaptersAPI.createChapter(formData);
      router.push(`/chapters/${chapter._id}`);
    } catch (error: any) {
      console.error('Error creating chapter:', error);
      setErrors({
        general: error.response?.data?.message || 'Failed to create chapter'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/books/${book._id}`}
            className="p-2 rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Chapter</h1>
            <p className="text-gray-600">for "{book.title}"</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Editor */}
            <div className="lg:col-span-3 space-y-6">
              {/* Chapter Title */}
              <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter chapter title..."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-200'
                  }`}
                  maxLength={200}
                />
                <div className="flex justify-between items-center mt-2">
                  {errors.title && <p className="text-red-600 text-sm">{errors.title}</p>}
                  <p className="text-gray-500 text-sm ml-auto">{formData.title.length}/200</p>
                </div>
              </div>

              {/* Chapter Content */}
              <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter Content *
                </label>
                <div className={`border rounded-lg ${errors.content ? 'border-red-300' : 'border-gray-200'}`}>
                  <MDEditor
                    value={formData.content}
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value || '' }))}
                    height={500}
                    preview="edit"
                    hideToolbar={false}
                    visibleDragBar={false}
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  {errors.content && <p className="text-red-600 text-sm">{errors.content}</p>}
                  <div className="flex items-center gap-4 text-sm text-gray-500 ml-auto">
                    <span>{wordCount} words</span>
                    <span>{formData.content.length}/50,000 characters</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6 sticky top-8 space-y-6">
                {/* Chapter Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chapter Number *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.chapterNumber}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      chapterNumber: parseInt(e.target.value) || 1
                    }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      errors.chapterNumber ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.chapterNumber && (
                    <p className="text-red-600 text-sm mt-1">{errors.chapterNumber}</p>
                  )}
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Visibility
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="private"
                        checked={formData.visibility === 'private'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          visibility: e.target.value as 'public' | 'private'
                        }))}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <EyeOff size={14} />
                          <span className="text-sm font-medium">Private</span>
                        </div>
                        <p className="text-xs text-gray-500">Only you can see this chapter</p>
                      </div>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="public"
                        checked={formData.visibility === 'public'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          visibility: e.target.value as 'public' | 'private'
                        }))}
                        disabled={book.visibility === 'private'}
                        className="text-amber-600 focus:ring-amber-500 disabled:opacity-50"
                      />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <Eye size={14} />
                          <span className="text-sm font-medium">Public</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {book.visibility === 'private'
                            ? 'Book must be public first'
                            : 'Everyone can read this chapter'
                          }
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Word Count Stats */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Writing Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Words:</span>
                      <span className="font-medium">{wordCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Characters:</span>
                      <span className="font-medium">{formData.content.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Est. Reading:</span>
                      <span className="font-medium">{Math.ceil(wordCount / 200)} min</span>
                    </div>
                  </div>
                </div>

                {/* Book Info */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen size={16} className="text-amber-600" />
                    <span className="text-sm font-medium text-gray-700">Book Info</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{book.title}</p>
                  <p className="text-xs text-gray-500">
                    {book.chapterCount || 0} existing chapters
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Link
              href={`/books/${book._id}`}
              className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
              className="flex items-center gap-2 bg-amber-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Create Chapter
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
