"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface BookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    publishedDate?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    categories?: string[];
    averageRating?: number;
  };
}

const GENRES = [
  "all",
  "fiction",
  "non-fiction",
  "fantasy",
  "sci-fi",
  "mystery",
  "romance",
  "thriller",
  "historical",
  "biography",
  "poetry",
  "self-help",
  "horror",
  "drama",
  "adventure",
  "comedy",
  "spirituality",
  "philosophy",
  "science",
  "psychology",
  "young-adult",
  "children",
  "classic",
  "graphic-novel",
  "memoir",
  "education",
  "others"
];

export default function ExplorePage() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const maxResults = 20; // Books per page
  
  // Show all genres in the main view instead of splitting them
  const mainGenres = GENRES;
  const extraGenres: string[] = [];
  const [showAllGenres, setShowAllGenres] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, [category, currentPage]); // Fetch books when category or page changes

  const fetchBooks = async () => {
    setLoading(true);
    setError("");
    
    try {
      const searchTerm = category === "all" ? query : category;
      const startIndex = currentPage * maxResults;
      
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${searchTerm}&maxResults=${maxResults}&startIndex=${startIndex}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }
      
      const data = await response.json();
      setBooks(data.items || []);
      setTotalItems(data.totalItems || 0);
    } catch (err) {
      setError("Error fetching books. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0); // Reset to first page on new search
    fetchBooks();
  };
  
  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setCurrentPage(0); // Reset to first page when changing category
  };
  
  const totalPages = Math.ceil(totalItems / maxResults);
  
  // Format genre name for display (capitalize, replace hyphens)
  const formatGenre = (genre: string) => {
    if (genre === "all") return "All";
    return genre
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header section */}
      <div className="bg-amber-700 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Explore Books</h1>
          <p className="text-amber-100 max-w-2xl mb-8">
            Discover new books across various genres and add them to your collections.
            Search for your favorite authors, titles, or topics.
          </p>
          
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, or keyword..."
              className="px-4 py-3 rounded-lg flex-grow text-white ring-1 ring-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Search books"
            />
            <button
              type="submit"
              className="bg-amber-900 hover:bg-amber-950 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>
      
      {/* Categories filter */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 overflow-x-auto">
          <div className="flex space-x-4 items-center">
            {/* Main genres */}
            {mainGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => handleCategoryChange(genre)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium ${
                  category === genre
                    ? "bg-amber-700 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {formatGenre(genre)}
              </button>
            ))}
            
            {/* "More" dropdown button */}
            <div className="relative">
              <button 
                onClick={() => setShowAllGenres(!showAllGenres)}
                className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center"
              >
                More 
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showAllGenres && (
                <div className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-lg p-4 z-20 grid grid-cols-2 sm:grid-cols-3 gap-2 w-[300px]">
                  {extraGenres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => {
                        handleCategoryChange(genre);
                        setShowAllGenres(false);
                      }}
                      className={`whitespace-nowrap px-3 py-1.5 text-sm font-medium text-left rounded ${
                        category === genre
                          ? "bg-amber-700 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {formatGenre(genre)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Books grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search results info */}
        {!loading && books.length > 0 && (
          <div className="mb-6 text-sm text-gray-500">
            Showing {currentPage * maxResults + 1}-{Math.min((currentPage + 1) * maxResults, totalItems)} of {totalItems} results
          </div>
        )}
      
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">
            {error}
          </div>
        )}
        
        {!loading && books.length === 0 && !error && (
          <div className="text-center py-20">
            <h3 className="text-xl font-medium text-gray-700">No books found</h3>
            <p className="text-gray-500 mt-2">Try a different search term</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              <div className="relative h-56 bg-gray-200">
                {book.volumeInfo.imageLinks ? (
                  <Image
                    src={book.volumeInfo.imageLinks.thumbnail || ""}
                    alt={book.volumeInfo.title}
                    fill
                    style={{ objectFit: "cover" }}
                    className="p-2"
                    unoptimized // Use unoptimized for external images
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
              
              <div className="p-4 flex-grow">
                <h3 className="font-semibold text-lg truncate text-gray-800">
                  {book.volumeInfo.title}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {book.volumeInfo.authors?.join(", ") || "Unknown Author"}
                </p>
                
                {book.volumeInfo.categories && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {book.volumeInfo.categories.slice(0, 2).map((category, index) => (
                      <span
                        key={index}
                        className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
                
                <p className="text-gray-500 text-sm mt-3 line-clamp-3">
                  {book.volumeInfo.description || "No description available"}
                </p>
              </div>
              
              <div className="p-4 border-t border-gray-100">
                <Link
                  href={`/book/${book.id}`}
                  className="block w-full text-center py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium rounded-lg transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        {books.length > 0 && !loading && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <div className="px-4 py-2 text-sm">
                Page {currentPage + 1} of {totalPages || 1}
              </div>
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!books.length || books.length < maxResults}
                className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}