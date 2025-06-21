"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0 w-full md:w-1/3 flex items-center justify-center">
          {info.imageLinks?.thumbnail ? (
            <Image
              src={info.imageLinks.thumbnail}
              alt={info.title}
              width={200}
              height={300}
              className="rounded-lg shadow"
              unoptimized
            />
          ) : (
            <div className="w-48 h-72 bg-gray-200 flex items-center justify-center rounded-lg text-gray-400">
              No image available
            </div>
          )}
        </div>
        <div className="flex-1">
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
          <div className="mt-4 text-gray-800 whitespace-pre-line">
            {info.description || "No description available."}
          </div>
          <div className="mt-8">
            <Link href="/explore" className="text-amber-700 hover:underline">
              ← Back to Explore
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}