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
  source: 'tag' | 'search' | 'personal' | 'reading-list' | 'collection';
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
  
  // Separate recommendations state for reading list and collections
  const [readingListRecommendations, setReadingListRecommendations] = useState<RecommendedBook[]>([]);
  const [collectionRecommendations, setCollectionRecommendations] = useState<RecommendedBook[]>([]);
  const [loadingReadingListRecommendations, setLoadingReadingListRecommendations] = useState(false);
  const [loadingCollectionRecommendations, setLoadingCollectionRecommendations] = useState(false);
  const [hasReadingList, setHasReadingList] = useState(false);
  const [hasCollections, setHasCollections] = useState(false);

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

  // Fetch general recommendations
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


// Fetch separate reading list and collection recommendations
useEffect(() => {
  const fetchPersonalRecommendations = async () => {
    if (!book) return;

    setLoadingReadingListRecommendations(true);
    setLoadingCollectionRecommendations(true);

    try {
      // Check if user is authenticated
      const user = auth.currentUser;
      if (!user) {
        setHasReadingList(false);
        setHasCollections(false);
        setLoadingReadingListRecommendations(false);
        setLoadingCollectionRecommendations(false);
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

      // --- READING LIST ---
      const readingList: any[] = readingListRes.data.success ? readingListRes.data.data.readingList || [] : [];
      // Only use items with a valid volumeId
      const readingListBookIds = readingList.map(item => item.volumeId).filter(Boolean);
      setHasReadingList(readingListBookIds.length > 0);

      if (readingListBookIds.length > 0) {
        // Exclude current book
        const filteredReadingListIds = readingListBookIds.filter((bookId: string) => bookId !== id);
        if (filteredReadingListIds.length > 0) {
          const randomReadingListId = filteredReadingListIds[Math.floor(Math.random() * filteredReadingListIds.length)];
          const randomBookDetails = await fetchBookDetails(randomReadingListId);

          if (randomBookDetails.categories && randomBookDetails.categories.length > 0) {
            const randomCategory = randomBookDetails.categories[Math.floor(Math.random() * randomBookDetails.categories.length)];
            const readingListRecResponse = await fetch(
              `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(randomCategory)}&maxResults=5`
            );
            if (readingListRecResponse.ok) {
              const data = await readingListRecResponse.json();
              if (data.items) {
                const readingListRecs = data.items
                  .filter((item: any) => item.id !== id)
                  .map((item: any) => ({ ...item, source: 'reading-list' as const }));
                setReadingListRecommendations(readingListRecs);
              }
            }
          }
        } else {
          setReadingListRecommendations([]);
        }
      } else {
        setReadingListRecommendations([]);
      }

      // --- COLLECTIONS ---
      const collections: any[] = collectionsRes.data.success ? collectionsRes.data.data.collections || [] : [];
      const allCollectionBooks = collections.flatMap((collection: any) =>
        (collection.books || []).map((book: any) => book.volumeId)
      ).filter(Boolean);
      setHasCollections(allCollectionBooks.length > 0);

      const filteredCollectionIds = allCollectionBooks.filter((bookId: string) => bookId !== id);
      if (filteredCollectionIds.length > 0) {
        const randomCollectionId = filteredCollectionIds[Math.floor(Math.random() * filteredCollectionIds.length)];
        const randomBookDetails = await fetchBookDetails(randomCollectionId);

        if (randomBookDetails.categories && randomBookDetails.categories.length > 0) {
          const randomCategory = randomBookDetails.categories[Math.floor(Math.random() * randomBookDetails.categories.length)];
          const collectionRecResponse = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(randomCategory)}&maxResults=5`
          );
          if (collectionRecResponse.ok) {
            const data = await collectionRecResponse.json();
            if (data.items) {
              const collectionRecs = data.items
                .filter((item: any) => item.id !== id && !readingListRecommendations.some(b => b.id === item.id))
                .map((item: any) => ({ ...item, source: 'collection' as const }));
              setCollectionRecommendations(collectionRecs);
            }
          }
        }
      } else {
        setCollectionRecommendations([]);
      }

    } catch (error) {
      console.error("Error fetching personal recommendations:", error);
      setReadingListRecommendations([]);
      setCollectionRecommendations([]);
    } finally {
      setLoadingReadingListRecommendations(false);
      setLoadingCollectionRecommendations(false);
    }
  };

  fetchPersonalRecommendations();
}, [book, id]);
// ...existing code...

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
              
              {/* Reading List Recommendations Section */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-amber-700 mb-4">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Based on Your Reading List
                  </span>
                </h2>
                
                {loadingReadingListRecommendations ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-700"></div>
                  </div>
                ) : hasReadingList && readingListRecommendations.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {readingListRecommendations.map((book) => (
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
                ) : (
                  <div className="bg-gray-50 p-8 text-center rounded-lg">
                    <p className="text-gray-500">Nothing to show! Add books to your reading list for personalized recommendations.</p>
                    <Link href="/reading-list" className="mt-4 inline-block text-amber-700 font-medium hover:underline">
                      Go to Reading List
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Collection Recommendations Section */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-amber-700 mb-4">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Based on Your Collections
                  </span>
                </h2>
                
                {loadingCollectionRecommendations ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-700"></div>
                  </div>
                ) : hasCollections && collectionRecommendations.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {collectionRecommendations.map((book) => (
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
                ) : (
                  <div className="bg-gray-50 p-8 text-center rounded-lg">
                    <p className="text-gray-500">Nothing to show! Create collections and add books for personalized recommendations.</p>
                    <Link href="/collections" className="mt-4 inline-block text-amber-700 font-medium hover:underline">
                      Go to Collections
                    </Link>
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