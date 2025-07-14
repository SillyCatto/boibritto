"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Helper to safely render <p> tags as real paragraphs
function renderDescription(desc?: string) {
  if (!desc) return <span>No description available.</span>;
  // Replace <br> and <br/> with newlines for safety
  let clean = desc.replace(/<br\s*\/?>/gi, "\n");
  // Split by <p> tags
  const paragraphs = clean
    .split(/<\/?p>/gi)
    .map(s => s.trim())
    .filter(Boolean);
  return paragraphs.map((para, idx) => (
    <p key={idx} className="mb-3 last:mb-0 text-gray-800 text-sm">{para}</p>
  ));
}

export default function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBook() {
      setLoading(true);
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
      const data = await res.json();
      setBook(data);
      setLoading(false);
    }
    if (id) fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Book not found.
      </div>
    );
  }

  const info = book.volumeInfo || {};
// ...existing code...
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 bg-white rounded-2xl shadow-lg p-8">
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
          {/* Add to Collection Button (disabled for now) */}
          <button
            disabled
            className="w-full mt-4 px-6 py-3 rounded-lg bg-amber-700 text-white font-semibold shadow hover:bg-amber-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            // TODO: Implement add to collection functionality
          >
            Add to Collection List
          </button>
                    {/* Add to Collection Button (disabled for now) */}
          <button
            disabled
            className="w-full mt-4 px-6 py-3 rounded-lg bg-amber-700 text-white font-semibold shadow hover:bg-amber-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            // TODO: Implement add to collection functionality
          >
            Add to Reading List
          </button>
          {/* Beautiful Back to Explore Button */}
          <Link
            href="/explore"
            className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-amber-200 bg-white text-amber-700 font-semibold shadow hover:bg-amber-50 hover:text-amber-800 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                {info.categories.map((cat: string, idx: number) => (
                  <span key={idx} className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
                    {cat}
                  </span>
                ))}
              </div>
            )}
            {info.averageRating && (
              <div className="mb-2 text-amber-600 font-medium">
                Rating: {info.averageRating} / 5
              </div>
            )}
          </div>
          <div className="bg-amber-50 rounded-lg p-4 shadow-inner">
            <h2 className="text-lg font-semibold text-amber-700 mb-2">Description</h2>
            <div>
              {renderDescription(info.description)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
// ...existing code...

    }