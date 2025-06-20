"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav className="bg-white shadow-sm py-4 px-6 sm:px-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="font-serif text-2xl font-bold text-amber-700">
          BoiBritto
        </Link>
        
        <div className="hidden md:flex space-x-8">
          <Link href="/" className="text-gray-900 font-medium">Home</Link>
          <Link href="/explore" className="text-gray-600 hover:text-amber-700">Explore</Link>
          <Link href="/collections" className="text-gray-600 hover:text-amber-700">Collections</Link>
          <Link href="/discussions" className="text-gray-600 hover:text-amber-700">Discussions</Link>
        </div>
        
        <div className="hidden md:block">
          <Link href="/signin" className="px-5 py-2 rounded-full border border-amber-700 text-amber-700 hover:bg-amber-50">
            Sign In
          </Link>
        </div>
        
        <button 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-col space-y-3 px-2 pb-3">
            <Link href="/" className="text-gray-900 font-medium py-2">Home</Link>
            <Link href="/explore" className="text-gray-600 hover:text-amber-700 py-2">Explore</Link>
            <Link href="/collections" className="text-gray-600 hover:text-amber-700 py-2">Collections</Link>
            <Link href="/discussions" className="text-gray-600 hover:text-amber-700 py-2">Discussions</Link>
            <Link href="/signin" className="text-amber-700 hover:text-amber-800 font-medium py-2">
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}