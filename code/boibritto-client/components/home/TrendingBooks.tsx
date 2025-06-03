"use client";

import Image from "next/image";
import Link from "next/link";

const trendingBooks = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    image:
      "https://images.unsplash.com/photo-1608138313165-1f3c50f0d30c?q=80&w=800&auto=format&fit=crop",
    rating: 4.5,
  },
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
    image:
      "https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=800&auto=format&fit=crop",
    rating: 4.8,
  },
  {
    id: 3,
    title: "The Alchemist",
    author: "Paulo Coelho",
    image:
      "https://images.unsplash.com/photo-1614282361489-e4fdf4e3d9e1?q=80&w=800&auto=format&fit=crop",
    rating: 4.7,
  },
];

export default function TrendingBooks() {
  return (
    <section className="py-16 px-6 sm:px-10 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Trending Books
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {trendingBooks.map((book) => (
            <div
              key={book.id}
              className="bg-amber-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="relative h-64 w-full">
                <Image
                  src={book.image}
                  alt={book.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-xl font-semibold text-amber-700">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-600">by {book.author}</p>
                <div className="flex items-center gap-1 text-amber-600 text-sm">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 ${
                        i < Math.floor(book.rating) ? "fill-current" : "text-amber-200"
                      }`}
                      fill={i < book.rating ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.073 3.3a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.072 3.299c.3.921-.755 1.688-1.54 1.118L12 13.347l-2.95 2.159c-.784.57-1.838-.197-1.539-1.118l1.072-3.299a1 1 0 00-.364-1.118L5.42 8.727c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.073-3.3z"
                      />
                    </svg>
                  ))}
                  <span className="ml-2">{book.rating.toFixed(1)}</span>
                </div>
                <Link
                  href="#"
                  className="inline-block mt-2 px-4 py-2 rounded-full bg-amber-700 text-white text-sm font-medium hover:bg-amber-800"
                >
                  Read Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
