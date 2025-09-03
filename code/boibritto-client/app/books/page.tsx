"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { Plus, Search, Filter, Book, Eye, EyeOff, Heart, Calendar, User as UserIcon, BookOpen } from 'lucide-react';
import { userBooksAPI } from '@/lib/userBooksAPI';
import { UserBook } from '@/lib/types/userBooks';
import { GENRES } from '@/lib/constants';

export default function BooksPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [books, setBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [authorFilter, setAuthorFilter] = useState('all'); // 'all', 'me', or specific author
  const [completedFilter, setCompletedFilter] = useState<boolean | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  // Google auth listener - matches your existing pattern
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        router.push('/signin');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchBooks();
    }
  }, [user, searchTerm, selectedGenre, authorFilter, completedFilter]);

  const fetchBooks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const params: any = {};

      if (searchTerm) params.search = searchTerm;
      if (selectedGenre) params.genre = selectedGenre;
      if (authorFilter !== 'all') params.author = authorFilter;
      if (completedFilter !== undefined) params.completed = completedFilter;

      const data = await userBooksAPI.getUserBooks(params);
      setBooks(data.books);
    } catch (error) {
      console.error('Error fetching books:', error);
      // Handle auth errors by redirecting to signin
      if (error instanceof Error && error.message.includes('not authenticated')) {
        router.push('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLikeBook = async (bookId: string) => {
    if (!user) return;

    try {
      await userBooksAPI.likeUserBook(bookId);
      // Refresh the book to get updated like count
      fetchBooks();
    } catch (error) {
      console.error('Error liking book:', error);
      if (error instanceof Error && error.message.includes('not authenticated')) {
        router.push('/signin');
      }
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Books</h1>
            <p className="text-gray-600">Discover stories written by our community</p>
          </div>

          <Link
            href="/books/create"
            className="inline-flex items-center gap-2 bg-amber-700 text-white px-6 py-3 rounded-full font-medium hover:bg-amber-800 transition-colors"
          >
            <Plus size={20} />
            Write New Book
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search books by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={20} />
              Filters
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
              {/* Author Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                <select
                  value={authorFilter}
                  onChange={(e) => setAuthorFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">All Authors</option>
                  <option value="me">My Books</option>
                </select>
              </div>

              {/* Genre Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">All Genres</option>
                  {GENRES.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre.charAt(0).toUpperCase() + genre.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Completion Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={completedFilter === undefined ? '' : completedFilter.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCompletedFilter(value === '' ? undefined : value === 'true');
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">All Books</option>
                  <option value="true">Completed</option>
                  <option value="false">In Progress</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-amber-100 p-6 animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <Book className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedGenre || authorFilter !== 'all' || completedFilter !== undefined
                ? 'Try adjusting your filters to see more results.'
                : 'Be the first to write and share a book!'}
            </p>
            <Link
              href="/books/create"
              className="inline-flex items-center gap-2 bg-amber-700 text-white px-6 py-3 rounded-full font-medium hover:bg-amber-800 transition-colors"
            >
              <Plus size={20} />
              Write Your First Book
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book._id} book={book} onLike={handleLikeBook} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Book Card Component
interface BookCardProps {
  book: UserBook;
  onLike: (bookId: string) => void;
}

function BookCard({ book, onLike }: BookCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/books/${book._id}`} className="block">
        {/* Cover Image */}
        <div className="aspect-[3/4] bg-gradient-to-br from-amber-100 to-amber-200 relative overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <Book className="text-amber-600" size={48} />
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              book.isCompleted 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {book.isCompleted ? 'Completed' : 'In Progress'}
            </span>
          </div>

          {/* Visibility Badge */}
          <div className="absolute top-3 right-3">
            {book.visibility === 'private' ? (
              <EyeOff className="text-gray-600" size={16} />
            ) : (
              <Eye className="text-green-600" size={16} />
            )}
          </div>
        </div>
      </Link>

      {/* Book Info */}
      <div className="p-4">
        <Link href={`/books/${book._id}`}>
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-amber-700 transition-colors">
            {book.title}
          </h3>
        </Link>

        {/* Author */}
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
          <UserIcon size={14} />
          <span>{book.author.displayName}</span>
        </div>

        {/* Synopsis */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {book.synopsis}
        </p>

        {/* Genres */}
        <div className="flex flex-wrap gap-1 mb-3">
          {book.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
            >
              {genre.charAt(0).toUpperCase() + genre.slice(1)}
            </span>
          ))}
          {book.genres.length > 2 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              +{book.genres.length - 2}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <BookOpen size={14} />
              <span>{book.chapterCount || 0}</span>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                onLike(book._id);
              }}
              className="flex items-center gap-1 hover:text-red-500 transition-colors"
            >
              <Heart size={14} className={book.likes.length > 0 ? 'fill-red-500 text-red-500' : ''} />
              <span>{book.likes.length}</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{formatDate(book.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
