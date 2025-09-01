"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Book, Eye, EyeOff, Save, Trash2 } from 'lucide-react';
import { userBooksAPI, uploadCoverImage } from '@/lib/userBooksAPI';
import { UserBook, UpdateUserBookData } from '@/lib/types/userBooks';
import { GENRES } from '@/lib/constants';

interface EditBookPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditBookPage({ params }: EditBookPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [book, setBook] = useState<UserBook | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<UpdateUserBookData>({
    title: '',
    synopsis: '',
    genres: [],
    visibility: 'private',
    coverImage: '',
    isCompleted: false,
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchBook();
  }, [resolvedParams.id]);

  const fetchBook = async () => {
    try {
      const { book: bookData } = await userBooksAPI.getUserBook(resolvedParams.id);
      setBook(bookData);
      setFormData({
        title: bookData.title,
        synopsis: bookData.synopsis || '',
        genres: bookData.genres,
        visibility: bookData.visibility,
        coverImage: bookData.coverImage || '',
        isCompleted: bookData.isCompleted,
      });
    } catch (error) {
      console.error('Error fetching book:', error);
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
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 500) {
      newErrors.title = 'Title cannot exceed 500 characters';
    }

    if (formData.synopsis && formData.synopsis.length > 1000) {
      newErrors.synopsis = 'Synopsis cannot exceed 1000 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      // Upload cover image if selected
      let coverImageUrl = formData.coverImage;
      if (coverImageFile) {
        coverImageUrl = await uploadCoverImage(coverImageFile);
      }

      const bookData: UpdateUserBookData = {
        ...formData,
        coverImage: coverImageUrl,
      };

      const { book: updatedBook } = await userBooksAPI.updateUserBook(resolvedParams.id, bookData);
      router.push(`/books/${updatedBook._id}`);
    } catch (error: any) {
      console.error('Error updating book:', error);
      setErrors({ general: error.response?.data?.message || 'Failed to update book' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres?.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...(prev.genres || []), genre]
    }));
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, coverImage: previewUrl }));
    }
  };

  const handleDelete = async () => {
    try {
      await userBooksAPI.deleteUserBook(resolvedParams.id);
      router.push('/books');
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
              <div className="lg:col-span-1">
                <div className="aspect-[3/4] bg-gray-200 rounded"></div>
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Book not found</h2>
          <p className="text-gray-600 mb-6">This book doesn't exist or you don't have permission to edit it.</p>
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
          <div className="flex items-center gap-4">
            <Link
              href={`/books/${book._id}`}
              className="p-2 rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Book</h1>
              <p className="text-gray-600">Update your book details</p>
            </div>
          </div>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 size={16} />
            Delete Book
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{errors.general}</p>
                </div>
              )}

              {/* Title */}
              <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Book Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your book title..."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-200'
                  }`}
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  {errors.title && <p className="text-red-600 text-sm">{errors.title}</p>}
                  <p className="text-gray-500 text-sm ml-auto">{formData.title?.length || 0}/500</p>
                </div>
              </div>

              {/* Synopsis */}
              <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Synopsis
                </label>
                <textarea
                  value={formData.synopsis}
                  onChange={(e) => setFormData(prev => ({ ...prev, synopsis: e.target.value }))}
                  placeholder="Write a brief description of your book..."
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none ${
                    errors.synopsis ? 'border-red-300' : 'border-gray-200'
                  }`}
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-2">
                  {errors.synopsis && <p className="text-red-600 text-sm">{errors.synopsis}</p>}
                  <p className="text-gray-500 text-sm ml-auto">{formData.synopsis?.length || 0}/1000</p>
                </div>
              </div>

              {/* Genres */}
              <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Genres
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {GENRES.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => handleGenreToggle(genre)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        formData.genres?.includes(genre)
                          ? 'bg-amber-100 border-amber-300 text-amber-800'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {genre.charAt(0).toUpperCase() + genre.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status and Visibility */}
              <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Completion Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Completion Status
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={!formData.isCompleted}
                          onChange={() => setFormData(prev => ({ ...prev, isCompleted: false }))}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <div className="ml-3">
                          <span className="font-medium text-blue-700">In Progress</span>
                          <p className="text-sm text-gray-500">Still writing chapters</p>
                        </div>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.isCompleted}
                          onChange={() => setFormData(prev => ({ ...prev, isCompleted: true }))}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <div className="ml-3">
                          <span className="font-medium text-green-700">Completed</span>
                          <p className="text-sm text-gray-500">Book is finished</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Visibility */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Visibility
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="private"
                          checked={formData.visibility === 'private'}
                          onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as 'public' | 'private' }))}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <div className="ml-3">
                          <div className="flex items-center gap-2">
                            <EyeOff size={16} />
                            <span className="font-medium">Private</span>
                          </div>
                          <p className="text-sm text-gray-500">Only you can see this book</p>
                        </div>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="public"
                          checked={formData.visibility === 'public'}
                          onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as 'public' | 'private' }))}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <div className="ml-3">
                          <div className="flex items-center gap-2">
                            <Eye size={16} />
                            <span className="font-medium">Public</span>
                          </div>
                          <p className="text-sm text-gray-500">Everyone can discover and read this book</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Cover Image and Stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* Cover Image */}
              <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Cover Image
                </label>

                <div className="aspect-[3/4] border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center bg-gray-50 mb-4 relative overflow-hidden">
                  {formData.coverImage ? (
                    <img
                      src={formData.coverImage}
                      alt="Book cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Book className="mx-auto text-gray-400 mb-2" size={48} />
                      <p className="text-sm text-gray-500">No cover image</p>
                    </div>
                  )}
                </div>

                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <Upload size={16} />
                    <span className="text-sm">
                      {formData.coverImage ? 'Change Cover' : 'Upload Cover'}
                    </span>
                  </div>
                </label>

                <p className="text-xs text-gray-500 mt-2">
                  Recommended: 400x600px, JPG or PNG
                </p>
              </div>

              {/* Book Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Book Statistics</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chapters:</span>
                    <span className="font-medium">{book.chapterCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Words:</span>
                    <span className="font-medium">{book.totalWordCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Likes:</span>
                    <span className="font-medium">{book.likes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{new Date(book.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Updated:</span>
                    <span className="font-medium">{new Date(book.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href={`/books/${book._id}`}
              className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading || !formData.title?.trim()}
              className="flex items-center gap-2 bg-amber-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Updating...
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Book</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{book.title}"? This action cannot be undone and will also delete all chapters.
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
