"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { initFirebase } from "@/lib/googleAuth";
import { fetchBookDetails } from "@/lib/googleBooks";
import ReportModal from "@/components/ui/ReportModal";

// Initialize Firebase
initFirebase();

interface UserProfileData {
  _id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  interestedGenres: string[];
  createdAt: string;
  updatedAt: string;
}

interface Collection {
  _id: string;
  title: string;
  description: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
}

interface ReadingItem {
  _id: string;
  volumeId: string;
  status: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  bookDetails?: {
    title: string;
    authors: string[];
    thumbnail: string;
  };
}

interface Blog {
  _id: string;
  title: string;
  visibility: string;
  spoilerAlert: boolean;
  genres: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

const tabs = ["Collections", "Reading Tracker", "Blogs"];

export default function UserProfilePage({ params }: ProfilePageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [readingList, setReadingList] = useState<ReadingItem[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [activeTab, setActiveTab] = useState("Collections");
  const [loading, setLoading] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [error, setError] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);

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

  // Fetch profile data
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user, resolvedParams.id]);

  // Fetch book details for reading list
  useEffect(() => {
    if (readingList.length > 0 && !loadingBooks) {
      // Check if any items are missing book details
      const needsEnrichment = readingList.some((item) => !item.bookDetails);
      if (needsEnrichment) {
        enrichReadingListWithBookDetails();
      }
    }
  }, [readingList]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"
        }/api/profile/${resolvedParams.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();

      if (data.success) {
        setProfile(data.data.profile_data);
        setCollections(data.data.collections || []);
        setReadingList(data.data.reading_tracker || []);
        setBlogs(data.data.blogs || []);
        setError("");
      } else {
        setError(data.message || "Failed to load user profile");
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setError("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const enrichReadingListWithBookDetails = async () => {
    if (loadingBooks) return; // Prevent multiple concurrent calls

    setLoadingBooks(true);
    try {
      console.log(
        "Enriching reading list with book details:",
        readingList.length,
        "items"
      );

      // Add timeout to prevent infinite loading
      const timeout = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout: Book details fetch took too long")),
          30000
        )
      );

      const enrichmentPromise = Promise.all(
        readingList.map(async (item) => {
          // Skip if already has book details
          if (item.bookDetails) {
            return item;
          }

          try {
            console.log(`Fetching details for book: ${item.volumeId}`);
            const bookDetails = await fetchBookDetails(item.volumeId);
            return {
              ...item,
              bookDetails: {
                title: bookDetails.title,
                authors: bookDetails.authors || [],
                thumbnail: bookDetails.imageLinks?.thumbnail || "",
              },
            };
          } catch (error) {
            console.error(
              `Failed to fetch details for book ${item.volumeId}:`,
              error
            );
            return {
              ...item,
              bookDetails: {
                title: `Book ID: ${item.volumeId}`,
                authors: ["Unknown Author"],
                thumbnail: "",
              },
            };
          }
        })
      );

      const enrichedList = (await Promise.race([
        enrichmentPromise,
        timeout,
      ])) as ReadingItem[];
      console.log("Successfully enriched reading list");
      setReadingList(enrichedList);
    } catch (error) {
      console.error("Failed to enrich reading list:", error);
      // Set fallback data for all items
      const fallbackList = readingList.map((item) => ({
        ...item,
        bookDetails: {
          title: `Book ID: ${item.volumeId}`,
          authors: ["Unknown Author"],
          thumbnail: "",
        },
      }));
      setReadingList(fallbackList);
    } finally {
      setLoadingBooks(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "reading":
        return "bg-blue-100 text-blue-800";
      case "want-to-read":
        return "bg-yellow-100 text-yellow-800";
      case "paused":
        return "bg-orange-100 text-orange-800";
      case "dropped":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Collections":
        return (
          <div className="space-y-4">
            {collections.length > 0 ? (
              collections.map((collection) => (
                <Link
                  key={collection._id}
                  href={`/collections/${collection._id}`}
                  className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-amber-200 hover:bg-amber-50 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {collection.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                    {collection.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created {formatDate(collection.createdAt)}</span>
                    <span
                      className={`px-2 py-1 rounded-full ${
                        collection.visibility === "public"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {collection.visibility}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
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
                      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500">No public collections yet</p>
              </div>
            )}
          </div>
        );

      case "Reading Tracker":
        return (
          <div className="space-y-4">
            {loadingBooks ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-700 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading books...</p>
                <p className="text-xs text-gray-400 mt-1">
                  This may take a moment
                </p>
              </div>
            ) : readingList.length > 0 ? (
              readingList.map((item) => (
                <div
                  key={item._id}
                  className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg"
                >
                  {item.bookDetails?.thumbnail ? (
                    <Image
                      src={item.bookDetails.thumbnail}
                      alt={item.bookDetails.title || "Book cover"}
                      width={60}
                      height={90}
                      className="rounded shadow-sm flex-shrink-0"
                      unoptimized
                    />
                  ) : (
                    <div className="w-15 h-22 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-500 text-xs">No Image</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {item.bookDetails?.title || `Book ID: ${item.volumeId}`}
                    </h3>
                    {item.bookDetails?.authors &&
                      item.bookDetails.authors.length > 0 && (
                        <p className="text-gray-600 text-sm truncate">
                          by {item.bookDetails.authors.join(", ")}
                        </p>
                      )}
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(
                          item.status
                        )}`}
                      >
                        {item.status.replace("-", " ")}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
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
                      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                    />
                  </svg>
                </div>
                <p className="text-gray-500">No public reading activity yet</p>
              </div>
            )}
          </div>
        );

      case "Blogs":
        return (
          <div className="space-y-4">
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <Link
                  key={blog._id}
                  href={`/blogs/${blog._id}`}
                  className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-amber-200 hover:bg-amber-50 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {blog.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    {blog.spoilerAlert && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                        ⚠️ Spoiler
                      </span>
                    )}
                    {blog.genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created {formatDate(blog.createdAt)}</span>
                    <span
                      className={`px-2 py-1 rounded-full ${
                        blog.visibility === "public"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {blog.visibility}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
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
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    />
                  </svg>
                </div>
                <p className="text-gray-500">No public blogs yet</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 text-red-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Profile Not Found
          </h3>
          <p className="text-gray-500 mb-4">
            {error || "This user profile could not be found."}
          </p>
          <Link
            href="/community"
            className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
          >
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between mb-6">
            <Link
              href="/community"
              className="text-amber-700 hover:text-amber-800 flex items-center gap-1 text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Back to Community
            </Link>

            {/* Report Button */}
            <button
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white border border-red-600 rounded-lg hover:bg-red-700 hover:border-red-700 transition-all duration-200 font-medium text-sm shadow-sm"
              title="Report this user"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3l1.664 6L3 15l13.333-6L3 3z"
                />
              </svg>
              Report User
            </button>
          </div>

          <div className="flex items-start gap-6">
            {/* Avatar */}
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={profile.displayName}
                width={120}
                height={120}
                className="rounded-full border-4 border-amber-200"
                unoptimized
              />
            ) : (
              <div className="w-30 h-30 rounded-full bg-amber-100 flex items-center justify-center border-4 border-amber-200">
                <span className="text-amber-700 font-bold text-4xl">
                  {profile.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profile.displayName}
              </h1>
              <p className="text-lg text-gray-600 mb-4">@{profile.username}</p>

              {profile.bio && (
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Interested Genres */}
              {profile.interestedGenres.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Interested Genres
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interestedGenres.map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Join Date */}
              <p className="text-sm text-gray-500">
                Member since {formatDate(profile.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-amber-500 text-amber-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>{renderTabContent()}</div>
      </div>

      {/* Report Modal */}
      {user && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          targetType="user"
          targetId={resolvedParams.id}
          targetTitle={profile?.displayName}
        />
      )}
    </div>
  );
}
