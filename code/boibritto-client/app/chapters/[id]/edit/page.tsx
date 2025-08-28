"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, EyeOff, BookOpen, Trash2 } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { chaptersAPI } from '@/lib/userBooksAPI';
import { Chapter, UpdateChapterData } from '@/lib/types/userBooks';

interface EditChapterPageProps {
  params: {
    id: string;
  };
}

export default function EditChapterPage({ params }: EditChapterPageProps) {
  const router = useRouter();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<UpdateChapterData>({
    title: '',
    content: '',
    visibility: 'private',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [wordCount, setWordCount] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchChapter();
  }, [params.id]);

  useEffect(() => {
    // Calculate word count
    const count = formData.content
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
    setWordCount(count);
  }, [formData.content]);

  const fetchChapter = async () => {
    try {
      const { chapter: chapterData } = await chaptersAPI.getChapter(params.id);
      setChapter(chapterData);
      setFormData({
        title: chapterData.title,
        content: chapterData.content,
        visibility: chapterData.visibility,
      });
    } catch (error) {
      console.error('Error fetching chapter:', error);
      router.push('/books');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Chapter title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }

    if (!formData.content?.trim()) {
      newErrors.content = 'Chapter content is required';
    } else if (formData.content.length > 50000) {
      newErrors.content = 'Content cannot exceed 50,000 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const { chapter: updatedChapter } = await chaptersAPI.updateChapter(params.id, formData);
      router.push(`/chapters/${updatedChapter._id}`);
    } catch (error: any) {
      console.error('Error updating chapter:', error);
      setErrors({
        general: error.response?.data?.message || 'Failed to update chapter'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await chaptersAPI.deleteChapter(params.id);
      const book = typeof chapter?.book === 'object' ? chapter.book : null;
      router.push(book ? `/books/${book._id}` : '/books');
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
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
          <p className="text-gray-600 mb-6">This chapter doesn't exist or you don't have permission to edit it.</p>
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
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href={`/chapters/${chapter._id}`}
              className="p-2 rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Chapter</h1>
              <p className="text-gray-600">Chapter {chapter.chapterNumber} of "{book?.title}"</p>
            </div>
          </div>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 size={16} />
            Delete Chapter
          </button>
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
                  <p className="text-gray-500 text-sm ml-auto">{formData.title?.length || 0}/200</p>
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
                    <span>{formData.content?.length || 0}/50,000 characters</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6 sticky top-8 space-y-6">
                {/* Chapter Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Chapter Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number:</span>
                      <span className="font-medium">Chapter {chapter.chapterNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{new Date(chapter.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Likes:</span>
                      <span className="font-medium">{chapter.likes.length}</span>
                    </div>
                  </div>
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
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <Eye size={14} />
                          <span className="text-sm font-medium">Public</span>
                        </div>
                        <p className="text-xs text-gray-500">Everyone can read this chapter</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Writing Stats */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Writing Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Words:</span>
                      <span className="font-medium">{wordCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Characters:</span>
                      <span className="font-medium">{formData.content?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Est. Reading:</span>
                      <span className="font-medium">{Math.ceil(wordCount / 200)} min</span>
                    </div>
                  </div>
                </div>

                {/* Book Info */}
                {book && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen size={16} className="text-amber-600" />
                      <span className="text-sm font-medium text-gray-700">Book</span>
                    </div>
                    <Link
                      href={`/books/${book._id}`}
                      className="text-sm text-amber-700 hover:text-amber-800 transition-colors"
                    >
                      {book.title}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Link
              href={`/chapters/${chapter._id}`}
              className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading || !formData.title?.trim() || !formData.content?.trim()}
              className="flex items-center gap-2 bg-amber-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Chapter</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{chapter.title}"? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
