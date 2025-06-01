import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-amber-50 to-white py-16 px-6 sm:px-10 flex-grow">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Discover Your Next <span className="text-amber-700">Favorite Book</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-md">
            Join BoiBritto to explore thousands of books, connect with fellow readers, and share your literary journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/explore" className="px-8 py-3 rounded-full bg-amber-700 text-white font-medium hover:bg-amber-800 text-center">
              Explore Books
            </Link>
            <Link href="/signup" className="px-8 py-3 rounded-full border border-amber-700 text-amber-700 font-medium hover:bg-amber-50 text-center">
              Sign Up Free
            </Link>
          </div>
        </div>
        
        <div className="relative h-80 md:h-96">
          <div className="absolute top-0 right-0 h-64 w-48 bg-amber-700 rounded-lg transform rotate-6"></div>
          <div className="absolute top-8 right-8 h-64 w-48 bg-white shadow-xl rounded-lg overflow-hidden">
            <Image 
              src="/book-cover.jpg" 
              alt="Featured book" 
              fill 
              style={{ objectFit: 'cover' }}
              className="rounded-lg"
            />
          </div>
          <div className="absolute top-16 right-24 h-64 w-48 bg-white shadow-xl rounded-lg transform -rotate-6"></div>
        </div>
      </div>
    </section>
  );
}