"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const GENRES = [
  "fiction", "non-fiction", "fantasy", "sci-fi", "mystery", "romance", "thriller", "historical", "biography", "poetry", "self-help", "horror", "drama", "adventure", "comedy", "spirituality", "philosophy", "science", "psychology", "young-adult", "children", "classic", "graphic-novel", "memoir", "education", "others"
];

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/auth/signup`,
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
      router.push("/");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Signup failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col justify-center">
      <div className="max-w-lg w-full mx-auto px-6 py-12 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-amber-700 mb-6 text-center">Complete Your Profile</h2>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Username</span>
            <input
              type="text"
              className="mt-1 block w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Bio</span>
            <textarea
              className="mt-1 block w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </label>
          <div className="mb-4">
            <span className="text-gray-700 font-medium">Interested Genres (up to 5)</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {GENRES.map((genre) => (
                <button
                  type="button"
                  key={genre}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    genres.includes(genre)
                      ? "bg-amber-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-amber-100"
                  }`}
                  onClick={() => handleGenreToggle(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 font-medium transition-colors mt-4"
          >
            {isLoading ? "Creating Account..." : "Complete Signup"}
          </button>
        </form>
      </div>
    </div>
  );
}