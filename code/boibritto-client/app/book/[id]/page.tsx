"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchBookDetails } from "@/lib/googleBooks";
import AddToCollectionButton from "@/components/book/AddToCollectionButton";
import AddToReadingListButton from "@/components/book/AddToReadingListButton";
import { auth } from "@/lib/googleAuth";
import axios from "axios";

interface RecommendedBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: {
      thumbnail?: string;
    };
  };
  source: 'tag' | 'search' | 'personal';
}

function Toast({ msg, type = "success" }: { msg: string; type?: "success" | "error" }) {
  if (!msg) return null;

  if (type === "success") {
    return (
      <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 flex items-center shadow-md">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
        </svg>
        <span>{msg}</span>
      </div>
    );
  }

  return (
    <div className="fixed top-5 right-5 bg-amber-700 text-white px-4 py-3 rounded shadow-lg z-50 animate-fade">
      {msg}
    </div>
  );
}

function renderDescription(desc?: string) {
  if (!desc) return <span>No description available.</span>;

  const paragraphs = desc
    .replace(/<br\s*\/?\>/gi, "\n")
    .split(/<\/?p>/gi)
    .map((s) => s.trim())
    .filter(Boolean);

  return paragraphs.map((p, i) => (
    <p key={i} className="mb-3 last:mb-0 text-gray-800 text-sm">
      {p}
    </p>
  ));
}

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [book, setBook] = useState<any>(null);
  const [loadingBook, setLoadingBook] = useState(true);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [recommendations, setRecommendations] = useState<RecommendedBook[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [personalRecommendations, setPersonalRecommendations] = useState<RecommendedBook[]>([]);
  const [loadingPersonalRecommendations, setLoadingPersonalRecommendations] = useState(false);
  const [hasReadingHistory, setHasReadingHistory] = useState(false);

  // Fetch book details
  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoadingBook(true);
      try {
        const data = await fetchBookDetails(id);
        setBook(data);
      } catch (e) {
        console.error("Failed to load book", e);
      } finally {
        setLoadingBook(false);
      }
    })();
  }, [id]);

  // Fetch recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!book) return;
      
      setLoadingRecommendations(true);
      try {
        // 1. Get recommendations based on book categories (for positions 1,3,5,7,9)
        let tagBasedBooks: RecommendedBook[] = [];
        if (book.categories && book.categories.length > 0) {
          const randomCategory = book.categories[Math.floor(Math.random() * book.categories.length)];
          const tagResponse = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(randomCategory)}&maxResults=5`
          );
          
          if (tagResponse.ok) {
            const data = await tagResponse.json();
            if (data.items) {
              tagBasedBooks = data.items
                .filter((item: any) => item.id !== id)
                .map((item: any) => ({...item, source: 'tag' as const}));
            }
          }
        }
        
        // 2. Get recommendations based on book title search (for positions 2,4,6,8,10)
        let searchBasedBooks: RecommendedBook[] = [];
        const searchResponse = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(book.title)}&maxResults=5`
        );
        
        if (searchResponse.ok) {
          const data = await searchResponse.json();
          if (data.items) {
            searchBasedBooks = data.items
              .filter((item: any) => item.id !== id && !tagBasedBooks.some(b => b.id === item.id))
              .map((item: any) => ({...item, source: 'search' as const}));
          }
        }
        
        // 3. Blend the recommendations (alternating pattern)
        const blendedRecommendations: RecommendedBook[] = [];
        for (let i = 0; i < 5; i++) {
          if (i < tagBasedBooks.length) {
            blendedRecommendations.push(tagBasedBooks[i]); // Positions 0,2,4,6,8 (1-indexed: 1,3,5,7,9)
          }
          
          if (i < searchBasedBooks.length) {
            blendedRecommendations.push(searchBasedBooks[i]); // Positions 1,3,5,7,9 (1-indexed: 2,4,6,8,10)
          }
        }
        
        setRecommendations(blendedRecommendations.slice(0, 10));
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoadingRecommendations(false);
      }
    };
    
    fetchRecommendations();
  }, [book, id]);

  // Fetch personal recommendations based on user's reading list and collections
  useEffect(() => {
    const fetchPersonalRecommendations = async () => {
      if (!book) return;
      
      setLoadingPersonalRecommendations(true);
      try {
        // Check if user is authenticated
        const user = auth.currentUser;
        if (!user) {
          setHasReadingHistory(false);
          setLoadingPersonalRecommendations(false);
          return;
        }
        
        const token = await user.getIdToken();
        
        // Fetch user's reading list and collections
        const [readingListRes, collectionsRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/reading-list/me`,
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            }
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/collections?owner=me`,
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            }
          )
        ]);
        
        const readingList = readingListRes.data.success ? readingListRes.data.data.readingList || [] : [];
        const collections = collectionsRes.data.success ? collectionsRes.data.data.collections || [] : [];
        
        // Check if user has any reading history
        if (readingList.length === 0 && collections.every((c: { books: any[] }) => c.books.length === 0)) {
          setHasReadingHistory(false);
          setLoadingPersonalRecommendations(false);
          return;
        }
        
        setHasReadingHistory(true);
        
        // Get all book IDs from user's reading list and collections
        const allBookIds = new Set<string>();
        
        readingList.forEach((item: any) => allBookIds.add(item.volumeId));
        collections.forEach((collection: any) => {
          collection.books.forEach((book: any) => allBookIds.add(book.volumeId));
        });
        
        // Exclude the current book
        allBookIds.delete(id as string);
        
        // If user has reading history, get recommendations based on a random book
        if (allBookIds.size > 0) {
          const randomBookId = Array.from(allBookIds)[Math.floor(Math.random() * allBookIds.size)];
          
          // Fetch the random book details to get its categories
          const randomBookDetails = await fetchBookDetails(randomBookId);
          
          if (randomBookDetails.categories && randomBookDetails.categories.length > 0) {
            const randomCategory = randomBookDetails.categories[Math.floor(Math.random() * randomBookDetails.categories.length)];
            
            const personalRecResponse = await fetch(
              `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(randomCategory)}&maxResults=5`
            );
            
            if (personalRecResponse.ok) {
              const data = await personalRecResponse.json();
              if (data.items) {
                const personalRecs = data.items
                  .filter((item: any) => item.id !== id)
                  .map((item: any) => ({...item, source: 'personal' as const}));
                  
                setPersonalRecommendations(personalRecs);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching personal recommendations:", error);
      } finally {
        setLoadingPersonalRecommendations(false);
      }
    };
    
    fetchPersonalRecommendations();
  }, [book, id]);

  const handleCollectionSuccess = (message: string) => {
    setToast(message);
    setToastType("success");
    setTimeout(() => setToast(""), 3000);
  };

  const handleCollectionError = (message: string) => {
    setToast(message);
    setToastType("error");
    setTimeout(() => setToast(""), 3000);
  };

  const handleReadingListSuccess = (message: string) => {
    setToast(message);
    setToastType("success");
    setTimeout(() => setToast(""), 3000);
  };

  const handleReadingListError = (message: string) => {
    setToast(message);
    setToastType("error");
    setTimeout(() => setToast(""), 3000);
  };

  if (loadingBook)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    );

  if (!book)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Book not found.
      </div>
    );

  const info = book;

  return (
    <>
      <Toast msg={toast} type={toastType} />
      {/* ----------- page body ----------- */}
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Two-column layout for main content and sidebar */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content area */}
            <div className="lg:flex-1">
              {/* Book Details Section */}
              <div className="grid md:grid-cols-3 gap-8 bg-white rounded-2xl shadow-lg p-8 mb-10">
                {/* Book Cover Tile */}
                <div className="col-span-1 flex flex-col items-center">
                  <div className="w-48 h-72 bg-gray-100 rounded-lg shadow flex items-center justify-center overflow-hidden mb-4">
                    {info.imageLinks?.thumbnail ? (
                      <Image
                        src={info.imageLinks.thumbnail}
                        alt={info.title}
                        width={200}
                        height={300}
                        className="rounded-lg object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-gray-400">No image available</span>
                    )}
                  </div>

                  {/* -------- Add to Collection button -------- */}
                  <AddToCollectionButton
                    bookId={id}
                    onSuccess={handleCollectionSuccess}
                    onError={handleCollectionError}
                  />

                  {/* -------- Add to Reading List button -------- */}
                  <AddToReadingListButton
                    bookId={id}
                    onSuccess={handleReadingListSuccess}
                    onError={handleReadingListError}
                  />

                  <Link
                    href="/explore"
                    className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-amber-200 bg-white text-amber-700 font-semibold shadow hover:bg-amber-50 hover:text-amber-800 transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Explore
                  </Link>
                </div>

                {/* Book Details Tile */}
                <div className="col-span-2 flex flex-col gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-amber-700 mb-2">{info.title}</h1>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Author(s):</span> {info.authors?.join(", ") || "Unknown"}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Published:</span> {info.publishedDate || "Unknown"}
                    </p>
                    {info.categories && (
                      <div className="mb-2 flex flex-wrap gap-2">
                        {info.categories.map((c: string, i: number) => (
                          <span key={i} className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                    {info.averageRating && (
                      <div className="mb-2 text-amber-600 font-medium">Rating: {info.averageRating} / 5</div>
                    )}
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 shadow-inner">
                    <h2 className="text-lg font-semibold text-amber-700 mb-2">Description</h2>
                    {renderDescription(info.description)}
                  </div>
                </div>
              </div>
              
              {/* Personal Recommendations Section */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-amber-700 mb-4">Books For You</h2>
                
                {loadingPersonalRecommendations ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-700"></div>
                  </div>
                ) : hasReadingHistory && personalRecommendations.length > 0 ? (
                  <>
                    <p className="text-gray-600 mb-6">Based on your collection and reading list</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {personalRecommendations.map((book) => (
                        <Link href={`/book/${book.id}`} key={book.id} className="block group">
                          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                                  No cover
                                </div>
                              )}
                            </div>
                            <div className="p-3">
                              <h3 className="font-medium text-gray-800 text-sm line-clamp-1">{book.volumeInfo.title}</h3>
                              <p className="text-gray-500 text-xs line-clamp-1">{book.volumeInfo.authors?.join(", ") || "Unknown"}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 p-8 text-center rounded-lg">
                    <p className="text-gray-500">Nothing to show! Start adding books to your collections and reading list.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sidebar for Similar Books */}
            <div className="lg:w-80 w-full">
              <div className="bg-white rounded-xl shadow p-5 sticky top-24">
                <h2 className="text-xl font-bold text-amber-700 mb-4 uppercase">Books Based on This</h2>
                
                {loadingRecommendations ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-700"></div>
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {recommendations.map((book, index) => (
                      <Link href={`/book/${book.id}`} key={book.id} className="flex gap-3 hover:bg-amber-50 rounded-lg p-2 transition-colors">
                        <div className="w-12 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                          {book.volumeInfo.imageLinks?.thumbnail ? (
                            <Image
                              src={book.volumeInfo.imageLinks.thumbnail}
                              alt={book.volumeInfo.title}
                              width={48}
                              height={64}
                              className="object-cover w-full h-full"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                              No cover
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-medium text-gray-800 line-clamp-2">{book.volumeInfo.title}</h3>
                            <span className="bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1">
                              #{index + 1}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                            {book.volumeInfo.authors?.join(", ") || "Unknown"}
                          </p>
                          <div className="mt-1 text-xs text-amber-600">
                            {book.source === 'tag' ? 'Based on category' : 'Based on search'}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No similar books found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}