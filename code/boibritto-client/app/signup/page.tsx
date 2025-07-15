"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

const GENRES = [
  "fiction",
  "non-fiction",
  "fantasy",
  "sci-fi",
  "mystery",
  "romance",
  "thriller",
  "historical",
  "biography",
  "poetry",
  "self-help",
  "horror",
  "drama",
  "adventure",
  "comedy",
  "spirituality",
  "philosophy",
  "science",
  "psychology",
  "children",
  "classic",
  "graphic-novel",
  "memoir",
  "education",
  "others",
];

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleGenreToggle = (genre: string) => {
    setGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : prev.length < 5
        ? [...prev, genre]
        : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const { getAuth } = await import("firebase/auth");
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      const idToken = await user.getIdToken();

      await axios.post(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"
        }/api/auth/signup`,
        {
          data: {
            username,
            bio,
            interestedGenres: genres,
          },
        },
        {
          headers: { Authorization: `Bearer ${idToken}` },
          withCredentials: true,
        }
      );
      router.push("/profile");
    } catch (err: unknown) {
      const errorMessage =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Signup failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Format genre name for display
  const formatGenre = (genre: string) => {
    return genre
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-14 flex flex-col justify-center">
      <div className="max-w-xl w-full mx-auto px-8 py-14 bg-white rounded-2xl shadow-lg relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-100 rounded-full opacity-70"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-amber-50 rounded-full"></div>

        <div className="relative">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-1 w-16 relative"></div>
            </div>
            <h1 className="font-serif text-3xl font-bold text-amber-700 mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-600 max-w-sm mx-auto">
              Tell us about yourself to personalize your reading experience
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username field */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  @
                </span>
                <input
                  type="text"
                  className="pl-8 w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Choose a unique username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                This will be your unique identifier on BoiBritto
              </p>
            </div>

            {/* Bio field */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Bio
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Tell us a bit about yourself and your reading interests..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional, max 500 characters
              </p>
            </div>

            {/* Genre dropdown */}
            <div ref={dropdownRef}>
              <label className="block text-gray-700 font-medium mb-2">
                Interested Genres{" "}
                <span className="text-sm font-normal text-gray-500">
                  (Select up to 5)
                </span>
              </label>

              {/* Selected genres display */}
              <div className="flex flex-wrap gap-2 mb-2">
                {genres.length === 0 && (
                  <div className="text-gray-400 text-sm">
                    No genres selected
                  </div>
                )}

                {genres.map((genre) => (
                  <div
                    key={genre}
                    className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {formatGenre(genre)}
                    <button
                      type="button"
                      onClick={() => handleGenreToggle(genre)}
                      className="ml-1 text-amber-700 hover:text-amber-900"
                    >
                      <span className="sr-only">Remove {genre}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Dropdown trigger button */}
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between py-3 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <span className="text-gray-700">
                  {genres.length === 5
                    ? "Maximum genres selected"
                    : "Select genres"}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    dropdownOpen ? "transform rotate-180" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto scrollbar-thin scrollbar-thumb-gray-300">
                  <div className="p-2 grid grid-cols-2 gap-1">
                    {GENRES.map((genre) => {
                      const isSelected = genres.includes(genre);
                      const isDisabled = genres.length >= 5 && !isSelected;

                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => handleGenreToggle(genre)}
                          disabled={isDisabled}
                          className={`px-3 py-2 text-sm text-left rounded-md flex items-center ${
                            isSelected
                              ? "bg-amber-100 text-amber-800"
                              : isDisabled
                              ? "opacity-50 cursor-not-allowed bg-gray-50 text-gray-400"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 mr-2 flex-shrink-0 rounded border ${
                              isSelected
                                ? "bg-amber-700 border-amber-700"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <svg
                                className="w-4 h-4 text-white"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                              >
                                <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                              </svg>
                            )}
                          </span>
                          {formatGenre(genre)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Selected: {genres.length}/5
              </p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 font-medium transition-colors mt-4 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </>
              ) : (
                "Complete Signup"
              )}
            </button>
          </form>

          {/* Sign in link */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-amber-700 font-medium hover:text-amber-800 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
