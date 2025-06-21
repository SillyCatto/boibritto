"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <nav className="bg-white shadow-sm py-4 px-6 sm:px-10 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 font-serif text-2xl font-bold text-amber-700">    
          BoiBritto
        </Link>
        <div className="hidden md:flex space-x-8 items-center">
          <Link href="/" className="text-gray-900 font-medium hover:text-amber-700 transition">Home</Link>
          <Link href="/explore" className="text-gray-600 hover:text-amber-700 transition">Explore</Link>
          <Link href="/collections" className="text-gray-600 hover:text-amber-700 transition">Collections</Link>
          <Link href="/discussions" className="text-gray-600 hover:text-amber-700 transition">Discussions</Link>
          {user ? (
            <div className="relative">
              <button
                className="flex items-center gap-2 focus:outline-none"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <Image
                  src={user.photoURL }
                  alt={user.displayName}
                  width={36}
                  height={36}
                  className="rounded-full border border-amber-200"
                />
                <span className="font-medium text-gray-900">{user.displayName?.split(" ")[0] || "User"}</span>
                <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-65 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      <Image
                        src={user.photoURL }
                        alt={user.displayName }
                        width={40}
                        height={40}
                        className="rounded-full border"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{user.displayName}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </div>
                  <Link href="/profile" className="block px-6 py-3 text-gray-700 hover:bg-amber-50">Profile</Link>
                  <button
                    className="w-full text-left px-6 py-3 text-red-600 hover:bg-red-50"
                    onClick={async () => {
                      await signOut(getAuth());
                      setMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
                <div className="flex space-x-2 items-center">
                <Link href="/signin" className="px-5 py-2 rounded-full border border-amber-700 text-amber-700 hover:bg-amber-50 font-medium transition">Sign In</Link>
                <Link href="/signup" className="px-5 py-2 rounded-full bg-amber-700 text-white hover:bg-amber-800 font-medium transition">Sign Up</Link>
                </div>
            </>
          )}
        </div>
        <button
          className="md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-7 w-7 text-amber-700">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-100 bg-white rounded-b-xl shadow">
          <div className="flex flex-col space-y-3 px-2 pb-3">
            <Link href="/" className="text-gray-900 font-medium py-2">Home</Link>
            <Link href="/explore" className="text-gray-600 hover:text-amber-700 py-2">Explore</Link>
            <Link href="/collections" className="text-gray-600 hover:text-amber-700 py-2">Collections</Link>
            <Link href="/discussions" className="text-gray-600 hover:text-amber-700 py-2">Discussions</Link>
            {user ? (
              <>
                <Link href="/profile" className="text-gray-700 hover:text-amber-700 py-2">Profile</Link>
                <button
                  className="text-red-600 hover:text-red-800 py-2 text-left"
                  onClick={async () => {
                    await signOut(getAuth());
                    setMenuOpen(false);
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/signin" className="text-amber-700 hover:text-amber-800 font-medium py-2">Sign In</Link>
                <Link href="/signup" className="bg-amber-700 text-white rounded-full px-4 py-2 font-medium text-center hover:bg-amber-800 transition">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}