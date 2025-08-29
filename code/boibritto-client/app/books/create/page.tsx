"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Book, Eye, EyeOff, Save } from 'lucide-react';
import { userBooksAPI, uploadCoverImage } from '@/lib/userBooksAPI';
import { CreateUserBookData } from '@/lib/types/userBooks';
import { GENRES } from '@/lib/constants';

export default function CreateBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateUserBookData>({
    title: '',
    synopsis: '',
    genres: [],
    visibility: 'private',
    coverImage: '',
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
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

      const bookData: CreateUserBookData = {
        ...formData,
        coverImage: coverImageUrl,
      };

      const { book } = await userBooksAPI.createUserBook(bookData);

      // Redirect to the new book's page
      router.push(`/books/${book._id}`);
    } catch (error: any) {
      console.error('Error creating book:', error);
      setErrors({ general: error.response?.data?.message || 'Failed to create book' });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/books"
            className="p-2 rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Book</h1>
            <p className="text-gray-600">Start writing your story</p>
          </div>
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
                  <p className="text-gray-500 text-sm ml-auto">{formData.title.length}/500</p>
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

              {/* Visibility */}
              <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
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

            {/* Sidebar - Cover Image */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6 sticky top-8">
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
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/books"
              className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
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
                  Create Book
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
