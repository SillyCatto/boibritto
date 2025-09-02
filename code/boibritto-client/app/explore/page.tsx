"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from "axios";
import { fetchBookDetails } from "@/lib/googleBooks";

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

interface RecommendedBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: {
      thumbnail?: string;
    };
  };
  source: 'reading-list' | 'collection' | 'activity' | 'mixed';
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

// Expandable Section Component
interface ExpandableSectionProps {
  title: string;
  icon: React.ReactNode;
  books: RecommendedBook[];
  onLoadMore: () => void;
  loading: boolean;
  hasMore: boolean;
  expanded: boolean;
  onToggle: () => void;
  emptyMessage: string;
  emptyAction?: {
    text: string;
    href: string;
  };
}

function ExpandableSection({
  title,
  icon,
  books,
  onLoadMore,
  loading,
  hasMore,
  expanded,
  onToggle,
  emptyMessage,
  emptyAction
}: ExpandableSectionProps) {
  if (!expanded && books.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Section Header */}
      <div
        onClick={onToggle}
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500">{books.length} books available</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">
            {expanded ? 'Collapse' : 'Expand'}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Section Content */}
      {expanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          {books.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mt-4">
                {books.map((book) => (
                  <Link href={`/book/${book.id}`} key={book.id} className="block group">
                    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-300 overflow-hidden">
                      <div className="aspect-[2/3] relative">
                        {book.volumeInfo.imageLinks?.thumbnail ? (
                          <Image
                            src={book.volumeInfo.imageLinks.thumbnail}
                            alt={book.volumeInfo.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                            No cover
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <h4 className="font-medium text-gray-800 text-xs line-clamp-2 mb-1">
                          {book.volumeInfo.title}
                        </h4>
                        <p className="text-gray-500 text-xs line-clamp-1">
                          {book.volumeInfo.authors?.join(", ") || "Unknown"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {hasMore && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={onLoadMore}
                    disabled={loading}
                    className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 disabled:opacity-50 font-medium transition-colors"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Loading...
                      </div>
                    ) : (
                      'Load More Books'
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">{emptyMessage}</p>
              {emptyAction && (
                <Link
                  href={emptyAction.href}
                  className="inline-block px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-medium"
                >
                  {emptyAction.text}
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const maxResults = 20; // Books per page
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'for-you' | 'explore'>('for-you');
  
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Recommendation states
  const [readingListRecommendations, setReadingListRecommendations] = useState<RecommendedBook[]>([]);
  const [collectionRecommendations, setCollectionRecommendations] = useState<RecommendedBook[]>([]);
  const [activityBasedRecommendations, setActivityBasedRecommendations] = useState<RecommendedBook[]>([]);
  const [mixedRecommendations, setMixedRecommendations] = useState<RecommendedBook[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [hasReadingList, setHasReadingList] = useState(false);
  const [hasCollections, setHasCollections] = useState(false);
  const [hasUserData, setHasUserData] = useState(false);
  const [userTopTag, setUserTopTag] = useState<string>("");
  const [recommendationsInitialized, setRecommendationsInitialized] = useState(false);
  
  // Expansion states
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    'reading-list': false,
    'collection': false,
    'activity': false,
    'mixed': false,
  });
  
  // Loading more states
  const [loadingMore, setLoadingMore] = useState<{[key: string]: boolean}>({});
  const [hasMore, setHasMore] = useState<{[key: string]: boolean}>({
    'reading-list': true,
    'collection': true,
    'activity': true,
    'mixed': true,
  });
  const [pageCounters, setPageCounters] = useState<{[key: string]: number}>({
    'reading-list': 0,
    'collection': 0,
    'activity': 0,
    'mixed': 0,
  });
  
  // Show all genres in the main view instead of splitting them
  const mainGenres = GENRES;
  const extraGenres: string[] = [];
  const [showAllGenres, setShowAllGenres] = useState(false);

  // Initialize Firebase Auth
  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.uid || 'No user');
      setUser(firebaseUser);
      setAuthLoading(false);
      
      // Fetch recommendations when user is authenticated
      if (firebaseUser && !recommendationsInitialized) {
        fetchRecommendations(firebaseUser);
      } else if (!firebaseUser) {
        // Reset state when user is not authenticated
        setHasUserData(false);
        setHasReadingList(false);
        setHasCollections(false);
        setRecommendationsInitialized(false);
        setReadingListRecommendations([]);
        setCollectionRecommendations([]);
        setActivityBasedRecommendations([]);
        setMixedRecommendations([]);
      }
    });

    return () => unsubscribe();
  }, [recommendationsInitialized]);

  useEffect(() => {
    fetchBooks();
  }, [category, currentPage]); // Fetch books when category or page changes

  const fetchBooks = async () => {
    setLoading(true);
    setError("");
    try {
      let searchTerm = "";
      if (category === "all") {
        searchTerm = query.trim() !== "" ? query : "book"; // Default term for "All"
      } else {
        searchTerm = category;
      }
      const startIndex = currentPage * maxResults;

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerm)}&maxResults=${maxResults}&startIndex=${startIndex}`
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

  const fetchRecommendations = async (firebaseUser?: any) => {
    if (recommendationsInitialized) return;
    
    setLoadingRecommendations(true);
    console.log('Fetching recommendations for user:', firebaseUser?.uid || user?.uid);
    
    try {
      const currentUser = firebaseUser || user;
      if (!currentUser) {
        console.log('No user available for recommendations');
        setLoadingRecommendations(false);
        return;
      }

      const token = await currentUser.getIdToken();
      console.log('Got user token, making API calls...');
      
      // Fetch user's reading list, collections, and reading stats
      const [readingListRes, collectionsRes, statsRes] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/reading-list/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        ).catch((error) => {
          console.error('Reading list API error:', error);
          return { data: { success: false } };
        }),
        axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/collections?owner=me`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        ).catch((error) => {
          console.error('Collections API error:', error);
          return { data: { success: false } };
        }),
        axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/reading-list/recommendations`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        ).catch((error) => {
          console.error('Stats API error:', error);
          return { data: { success: false } };
        })
      ]);

      console.log('API responses:', {
        readingList: readingListRes.data.success,
        collections: collectionsRes.data.success,
        stats: statsRes.data.success
      });

      // Process reading list
      const readingList = readingListRes.data.success ? readingListRes.data.data.readingList || [] : [];
      const readingListBookIds = readingList.map((item: any) => item.volumeId).filter(Boolean);
      setHasReadingList(readingListBookIds.length > 0);
      console.log('Reading list book IDs:', readingListBookIds.length);

      // Process collections
      const collections = collectionsRes.data.success ? collectionsRes.data.data.collections || [] : [];
      const allCollectionBooks = collections.flatMap((collection: any) =>
        (collection.books || []).map((book: any) => book.volumeId)
      ).filter(Boolean);
      setHasCollections(allCollectionBooks.length > 0);
      console.log('Collection book IDs:', allCollectionBooks.length);

      // Check if user has any data
      const userHasData = readingListBookIds.length > 0 || allCollectionBooks.length > 0;
      setHasUserData(userHasData);
      console.log('User has data:', userHasData);

      // Get user's top tag for recommendations
      let topTag = "";
      if (statsRes.data.success && statsRes.data.data.topGenres && statsRes.data.data.topGenres.length > 0) {
        const topGenres = statsRes.data.data.topGenres;
        const tagMap = new Map<string, number>();
        
        topGenres.forEach((genre: any) => {
          const tags = genre.genre
            .split(/[\/\-\s&,]+/)
            .filter((part: string) => part.trim().length > 1)
            .map((part: string) => part.trim().toLowerCase());
          
          tags.forEach((tag: string) => {
            tagMap.set(tag, (tagMap.get(tag) || 0) + genre.count);
          });
        });

        const sortedTags = Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1]);
        if (sortedTags.length > 0) {
          topTag = sortedTags[0][0];
          setUserTopTag(topTag);
          console.log('User top tag:', topTag);
        }
      }

      // READING LIST RECOMMENDATIONS
      if (readingListBookIds.length > 0) {
        console.log('Fetching reading list recommendations...');
        const randomReadingListId = readingListBookIds[Math.floor(Math.random() * readingListBookIds.length)];
        try {
          const randomBookDetails = await fetchBookDetails(randomReadingListId);
          if (randomBookDetails.categories && randomBookDetails.categories.length > 0) {
            const randomCategory = randomBookDetails.categories[Math.floor(Math.random() * randomBookDetails.categories.length)];
            const readingListRecResponse = await fetch(
              `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(randomCategory)}&maxResults=16&startIndex=0`
            );
            if (readingListRecResponse.ok) {
              const data = await readingListRecResponse.json();
              if (data.items) {
                const readingListRecs = data.items
                  .map((item: any) => ({ ...item, source: 'reading-list' as const }));
                setReadingListRecommendations(readingListRecs);
                console.log('Set reading list recommendations:', readingListRecs.length);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching reading list recommendations:", error);
        }
      }

      // COLLECTION RECOMMENDATIONS
      if (allCollectionBooks.length > 0) {
        console.log('Fetching collection recommendations...');
        const randomCollectionId = allCollectionBooks[Math.floor(Math.random() * allCollectionBooks.length)];
        try {
          const randomBookDetails = await fetchBookDetails(randomCollectionId);
          if (randomBookDetails.categories && randomBookDetails.categories.length > 0) {
            const randomCategory = randomBookDetails.categories[Math.floor(Math.random() * randomBookDetails.categories.length)];
            const collectionRecResponse = await fetch(
              `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(randomCategory)}&maxResults=16&startIndex=0`
            );
            if (collectionRecResponse.ok) {
              const data = await collectionRecResponse.json();
              if (data.items) {
                const collectionRecs = data.items
                  .filter((item: any) => !readingListRecommendations.some(b => b.id === item.id))
                  .map((item: any) => ({ ...item, source: 'collection' as const }));
                setCollectionRecommendations(collectionRecs);
                console.log('Set collection recommendations:', collectionRecs.length);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching collection recommendations:", error);
        }
      }

      // ACTIVITY-BASED RECOMMENDATIONS (Based on user's reading activity)
      if (topTag) {
        console.log('Fetching activity-based recommendations...');
        try {
          const activityRecResponse = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(topTag)}&maxResults=16&startIndex=0&orderBy=newest`
          );
          if (activityRecResponse.ok) {
            const data = await activityRecResponse.json();
            if (data.items) {
              const activityRecs = data.items
                .map((item: any) => ({ ...item, source: 'activity' as const }));
              setActivityBasedRecommendations(activityRecs);
              console.log('Set activity-based recommendations:', activityRecs.length);
            }
          }
        } catch (error) {
          console.error("Error fetching activity-based recommendations:", error);
        }
      }

      // MIXED RECOMMENDATIONS (Books For You - mixture of different categories)
      console.log('Fetching mixed recommendations...');
      try {
        // Get a mixture of different genres/categories
        const mixedCategories = ['fiction', 'mystery', 'biography', 'science', 'fantasy'];
        const randomCategory = mixedCategories[Math.floor(Math.random() * mixedCategories.length)];
        
        // If user has a top tag, mix it with random categories
        const searchTerm = topTag ? `${topTag} OR ${randomCategory}` : randomCategory;
        
        const mixedRecResponse = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerm)}&maxResults=32&startIndex=0&orderBy=relevance`
        );
        
        if (mixedRecResponse.ok) {
          const data = await mixedRecResponse.json();
          if (data.items) {
            // Filter out books already in other recommendations and shuffle for variety
            const allExistingBooks = [
              ...readingListRecommendations,
              ...collectionRecommendations,
              ...activityBasedRecommendations
            ];
            
            const mixedRecs = data.items
              .filter((item: any) => !allExistingBooks.some(b => b.id === item.id))
              .map((item: any) => ({ ...item, source: 'mixed' as const }))
              .sort(() => Math.random() - 0.5) // Shuffle the results
              .slice(0, 16); // Take only 16 books
            
            setMixedRecommendations(mixedRecs);
            console.log('Set mixed recommendations:', mixedRecs.length);
          }
        }
      } catch (error) {
        console.error("Error fetching mixed recommendations:", error);
      }

      setRecommendationsInitialized(true);
      console.log('Recommendations initialization complete');

    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const loadMoreBooks = async (sectionKey: string) => {
    if (loadingMore[sectionKey] || !hasMore[sectionKey]) return;
    
    setLoadingMore(prev => ({ ...prev, [sectionKey]: true }));
    
    try {
      const nextPage = pageCounters[sectionKey] + 1;
      const startIndex = nextPage * 16; // 16 books per page
      
      let searchQuery = "";
      let orderBy = "relevance";
      
      switch (sectionKey) {
        case 'reading-list':
          searchQuery = `subject:fiction`; // Fallback category
          break;
        case 'collection':
          searchQuery = `subject:literature`;
          break;
        case 'activity':
          searchQuery = userTopTag || 'fiction';
          orderBy = 'newest';
          break;
        case 'mixed':
          const mixedCategories = ['fiction', 'mystery', 'biography', 'science', 'fantasy', 'romance', 'thriller'];
          const randomCategory = mixedCategories[Math.floor(Math.random() * mixedCategories.length)];
          searchQuery = userTopTag ? `${userTopTag} OR ${randomCategory}` : randomCategory;
          break;
      }
      
      if (searchQuery) {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=16&startIndex=${startIndex}&orderBy=${orderBy}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            const currentBooks = sectionKey === 'reading-list' ? readingListRecommendations :
                               sectionKey === 'collection' ? collectionRecommendations :
                               sectionKey === 'activity' ? activityBasedRecommendations :
                               mixedRecommendations;
            
            const newBooks = data.items
              .filter((item: any) => !currentBooks.some(b => b.id === item.id))
              .map((item: any) => ({ ...item, source: sectionKey as any }));
            
            // For mixed recommendations, shuffle the new books
            if (sectionKey === 'mixed') {
              newBooks.sort(() => Math.random() - 0.5);
            }
            
            // Update the appropriate state
            switch (sectionKey) {
              case 'reading-list':
                setReadingListRecommendations(prev => [...prev, ...newBooks]);
                break;
              case 'collection':
                setCollectionRecommendations(prev => [...prev, ...newBooks]);
                break;
              case 'activity':
                setActivityBasedRecommendations(prev => [...prev, ...newBooks]);
                break;
              case 'mixed':
                setMixedRecommendations(prev => [...prev, ...newBooks]);
                break;
            }
            
            setPageCounters(prev => ({ ...prev, [sectionKey]: nextPage }));
            
            // Check if there are more books
            if (data.items.length < 16) {
              setHasMore(prev => ({ ...prev, [sectionKey]: false }));
            }
          } else {
            setHasMore(prev => ({ ...prev, [sectionKey]: false }));
          }
        }
      }
    } catch (error) {
      console.error(`Error loading more ${sectionKey} books:`, error);
    } finally {
      setLoadingMore(prev => ({ ...prev, [sectionKey]: false }));
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
              className="px-4 py-3 rounded-lg flex-grow text-gray-800 ring-1 ring-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
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

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('for-you')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'for-you'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>For You</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'explore'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Explore</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'for-you' ? (
        // FOR YOU TAB
        <div className="max-w-7xl mx-auto px-6 py-8">
          {authLoading ? (
            <div className="flex justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your profile...</p>
              </div>
            </div>
          ) : !user ? (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-6">
                <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-4">Sign in to get personalized recommendations</h3>
              <p className="text-gray-600 mb-8">Create an account or sign in to see books curated just for you</p>
              <Link
                href="/signin"
                className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-medium"
              >
                Sign In
              </Link>
            </div>
          ) : hasUserData ? (
            loadingRecommendations ? (
              <div className="flex justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading personalized recommendations...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Personalized Recommendations</h2>
                  <p className="text-gray-600">Books curated based on your reading activity</p>
                </div>

                {/* Books For You (Mixed Recommendations) */}
                <ExpandableSection
                  title="Books For You"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  }
                  books={mixedRecommendations}
                  onLoadMore={() => loadMoreBooks('mixed')}
                  loading={loadingMore['mixed'] || false}
                  hasMore={hasMore['mixed'] || false}
                  expanded={expandedSections['mixed'] || false}
                  onToggle={() => toggleSection('mixed')}
                  emptyMessage="Start reading books to get personalized recommendations"
                  emptyAction={{
                    text: "Explore Books",
                    href: "#"
                  }}
                />

                {/* Reading List Recommendations */}
                <ExpandableSection
                  title="Based on Your Reading List"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  }
                  books={readingListRecommendations}
                  onLoadMore={() => loadMoreBooks('reading-list')}
                  loading={loadingMore['reading-list'] || false}
                  hasMore={hasMore['reading-list'] || false}
                  expanded={expandedSections['reading-list'] || false}
                  onToggle={() => toggleSection('reading-list')}
                  emptyMessage="Add books to your reading list to get personalized recommendations"
                  emptyAction={{
                    text: "Go to Reading List",
                    href: "/readingitems"
                  }}
                />

                {/* Collection Recommendations */}
                <ExpandableSection
                  title="Based on Your Collections"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  }
                  books={collectionRecommendations}
                  onLoadMore={() => loadMoreBooks('collection')}
                  loading={loadingMore['collection'] || false}
                  hasMore={hasMore['collection'] || false}
                  expanded={expandedSections['collection'] || false}
                  onToggle={() => toggleSection('collection')}
                  emptyMessage="Create collections and add books to get recommendations"
                  emptyAction={{
                    text: "Go to Collections",
                    href: "/collections"
                  }}
                />

                {/* Activity-based Recommendations */}
                <ExpandableSection
                  title="Based on Your Activity"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  }
                  books={activityBasedRecommendations}
                  onLoadMore={() => loadMoreBooks('activity')}
                  loading={loadingMore['activity'] || false}
                  hasMore={hasMore['activity'] || false}
                  expanded={expandedSections['activity'] || false}
                  onToggle={() => toggleSection('activity')}
                  emptyMessage="Start reading books to get activity-based recommendations"
                  emptyAction={{
                    text: "Explore Books",
                    href: "#"
                  }}
                />
              </div>
            )
          ) : (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-6">
                <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-4">Get Personalized Recommendations</h3>
              <p className="text-gray-600 mb-8">Start building your reading list and collections to see personalized book recommendations</p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/readingitems"
                  className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-medium"
                >
                  Start Reading List
                </Link>
                <Link
                  href="/collections"
                  className="px-6 py-3 border border-amber-700 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors font-medium"
                >
                  Create Collection
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        // EXPLORE TAB
        <div>
          {/* Categories filter */}
          <div className="bg-white border-b border-gray-200 shadow-sm">
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
      )}
    </div>
  );
}