"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchBookDetails } from "@/lib/googleBooks";
import AddToCollectionButton from "@/components/book/AddToCollectionButton";
import AddToReadingListButton from "@/components/book/AddToReadingListButton";

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
      </div>
    </>
  );
}



