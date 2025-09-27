"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { initFirebase } from "@/lib/googleAuth";

// Initialize Firebase
initFirebase();

interface UserProfile {
  _id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  interestedGenres: string[];
  createdAt: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ProfilesResponse {
  profiles: UserProfile[];
  pagination: PaginationData;
}

export default function CommunityPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Auth listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        router.push("/signin");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Fetch profiles
  const fetchProfiles = async (page: number = 1, search: string = "") => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();

      const params = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
      });

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"
        }/api/profile?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch profiles");
      }

      const data = await response.json();

      if (data.success) {
        const profilesData: ProfilesResponse = data.data;
        setProfiles(profilesData.profiles);
        setPagination(profilesData.pagination);
        setError("");
      } else {
        setError(data.message || "Failed to load profiles");
      }
    } catch (err) {
      console.error("Failed to fetch profiles:", err);
      setError("Failed to load community profiles");
    } finally {
      setLoading(false);
    }
  };

  // Load profiles when user is authenticated
  useEffect(() => {
    if (user) {
      fetchProfiles(currentPage, searchQuery);
    }
  }, [user, currentPage]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProfiles(1, searchQuery);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Format join date
  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community</h1>
          <p className="text-gray-600">
            Discover and connect with fellow book enthusiasts
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search users by name or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-700"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Profiles Grid */}
        {!loading && !error && (
          <>
            {profiles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {profiles.map((profile) => (
                    <Link
                      key={profile._id}
                      href={`/community/${profile._id}`}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-amber-200 transition-all duration-200"
                    >
                      <div className="flex items-center mb-4">
                        {profile.avatar ? (
                          <Image
                            src={profile.avatar}
                            alt={profile.displayName}
                            width={48}
                            height={48}
                            className="rounded-full mr-4"
                            unoptimized
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                            <span className="text-amber-700 font-semibold text-lg">
                              {profile.displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {profile.displayName}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            @{profile.username}
                          </p>
                        </div>
                      </div>

                      {/* Bio */}
                      {profile.bio && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {profile.bio}
                        </p>
                      )}

                      {/* Interested Genres */}
                      {profile.interestedGenres.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {profile.interestedGenres
                              .slice(0, 3)
                              .map((genre) => (
                                <span
                                  key={genre}
                                  className="inline-block px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full"
                                >
                                  {genre}
                                </span>
                              ))}
                            {profile.interestedGenres.length > 3 && (
                              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{profile.interestedGenres.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Join date */}
                      <p className="text-xs text-gray-500">
                        Joined {formatJoinDate(profile.createdAt)}
                      </p>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <span className="px-4 py-2 text-sm text-gray-700">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* Results info */}
                {pagination && (
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-500">
                      Showing {profiles.length} of {pagination.totalUsers} users
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8 text-amber-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {searchQuery ? "No users found" : "No community members yet"}
                </h3>
                <p className="text-gray-500">
                  {searchQuery
                    ? `No users match "${searchQuery}". Try a different search term.`
                    : "Be the first to join our growing community!"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
