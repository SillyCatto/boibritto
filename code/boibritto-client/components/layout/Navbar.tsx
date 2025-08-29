"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";

import { initFirebase } from "@/lib/googleAuth";

initFirebase(); // Initialize Firebase only once

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // Function to determine if a link is active
  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") {
      return false;
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Get link styles based on active state
  const getLinkStyles = (path: string) => {
    if (isActive(path)) {
      return "font-medium text-amber-700 transition"; // Active link
    }
    return "text-gray-600 hover:text-amber-700 transition"; // Inactive link
  };

  return (
    <nav className="bg-white shadow-sm py-4 px-6 sm:px-10 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-2xl font-bold text-amber-700"
        >
          BoiBritto
        </Link>
        <div className="hidden md:flex space-x-8 items-center">
          <Link
            href="/"
            className={
              isActive("/")
                ? "font-medium text-amber-700 transition"
                : "text-gray-600 hover:text-amber-700 transition"
            }
          >
            Home
          </Link>
          {user && (
            <>
              <Link href="/explore" className={getLinkStyles("/explore")}>
                Explore
              </Link>
              <Link href="/books" className={getLinkStyles("/books")}>
                Books
              </Link>
              <Link
                href="/collections"
                className={getLinkStyles("/collections")}
              >
                Collections
              </Link>
              <Link href="/blogs" className={getLinkStyles("/blogs")}>
                Blogs
              </Link>
              <Link
                href="/discussions"
                className={getLinkStyles("/discussions")}
              >
                Discussions
              </Link>
            </>
          )}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-2 focus:outline-none"
                onClick={() => setMenuOpen((v) => !v)}
              >
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    width={36}
                    height={36}
                    className="rounded-full border border-amber-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center border border-amber-300">
                    <span className="text-amber-800 font-semibold text-sm">
                      {user.displayName?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
                <span
                  className={
                    isActive("/profile")
                      ? "font-medium text-amber-700"
                      : "font-medium text-gray-900"
                  }
                >
                  {user.displayName?.split(" ")[0] || "User"}
                </span>
                <svg
                  className="w-4 h-4 text-amber-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-65 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                  <div className="p-4 border-b">
                    <p className="font-medium text-gray-900">{user.displayName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    className={`block px-6 py-3 ${
                      isActive("/profile")
                        ? "text-amber-700 bg-amber-50"
                        : "text-gray-700 hover:bg-amber-50"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/books?author=me"
                    className="block px-6 py-3 text-gray-700 hover:bg-amber-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Books
                  </Link>
                  <Link
                    href="/my-collections"
                    className={`block px-6 py-3 ${
                      isActive("/my-collections")
                        ? "text-amber-700 bg-amber-50"
                        : "text-gray-700 hover:bg-amber-50"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    My Collections
                  </Link>
                  <Link
                    href="/readingitems"
                    className={`block px-6 py-3 ${
                      isActive("/readingitems")
                        ? "text-amber-700 bg-amber-50"
                        : "text-gray-700 hover:bg-amber-50"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Reading List
                  </Link>
                  <button
                    className="w-full text-left px-6 py-3 text-red-600 hover:bg-red-50"
                    onClick={async () => {
                      await signOut(getAuth());
                      setMenuOpen(false);
                      router.push("/");
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
                <Link
                  href="/signin"
                  className={`px-5 py-2 rounded-full ${
                    isActive("/signin")
                      ? "bg-amber-800 text-white"
                      : "bg-amber-700 text-white hover:bg-amber-800"
                  } font-medium transition`}
                >
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-7 w-7 text-amber-700"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-100 bg-white rounded-b-xl shadow">
          <div className="flex flex-col space-y-3 px-2 pb-3">
            <Link
              href="/"
              className={
                isActive("/")
                  ? "text-amber-700 font-medium py-2"
                  : "text-gray-900 hover:text-amber-700 font-medium py-2"
              }
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  href="/explore"
                  className={
                    isActive("/explore")
                      ? "text-amber-700 py-2"
                      : "text-gray-600 hover:text-amber-700 py-2"
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Explore
                </Link>
                <Link
                  href="/books"
                  className={
                    isActive("/books")
                      ? "text-amber-700 py-2"
                      : "text-gray-600 hover:text-amber-700 py-2"
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Books
                </Link>
                <Link
                  href="/collections"
                  className={
                    isActive("/collections")
                      ? "text-amber-700 py-2"
                      : "text-gray-600 hover:text-amber-700 py-2"
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Collections
                </Link>
                <Link
                  href="/discussions"
                  className={
                    isActive("/discussions")
                      ? "text-amber-700 py-2"
                      : "text-gray-600 hover:text-amber-700 py-2"
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Discussions
                </Link>
                <Link
                  href="/blogs"
                  className={
                    isActive("/blogs")
                      ? "text-amber-700 py-2"
                      : "text-gray-600 hover:text-amber-700 py-2"
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Blogs
                </Link>
                <Link
                  href="/profile"
                  className={
                    isActive("/profile")
                      ? "text-amber-700 py-2"
                      : "text-gray-700 hover:text-amber-700 py-2"
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/books?author=me"
                  className="text-gray-700 hover:text-amber-700 py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  My Books
                </Link>
                <button
                  className="text-red-600 hover:text-red-800 py-2 text-left"
                  onClick={async () => {
                    await signOut(getAuth());
                    setMenuOpen(false);
                    router.push("/");
                  }}
                >
                  Sign Out
                </button>
              </>
            )}
            {!user && (
              <>
                <Link
                  href="/signin"
                  className={
                    isActive("/signin")
                      ? "text-amber-800 font-medium py-2"
                      : "text-amber-700 hover:text-amber-800 font-medium py-2"
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className={`${
                    isActive("/signup")
                      ? "bg-amber-800"
                      : "bg-amber-700 hover:bg-amber-800"
                  } text-white rounded-full px-4 py-2 font-medium text-center transition`}
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
