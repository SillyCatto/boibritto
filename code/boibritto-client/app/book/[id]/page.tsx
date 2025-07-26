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


          </div>
        </div>
      </div>
    </>
  );
}