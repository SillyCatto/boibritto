"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface User {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
}

interface Blog {
  _id: string;
  user: User;
  title: string;
  content: string;
  spoilerAlert: boolean;
  genres: string[];
  visibility: "public" | "private" | "friends";
  createdAt: string;
  updatedAt: string;
  readTime?: number;
}

export default function BlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthInitialized(true);

      try {
        setLoading(true);

        let headers = {};

        if (user) {
          const token = await user.getIdToken();
          headers = {
            Authorization: `Bearer ${token}`,
          };
        } else {
          // If not authenticated, redirect to signin
          router.push("/signin");
          return;
        }

        // Fetch all public blogs
        const response = await axios.get(
          `${
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"
          }/api/blogs`,
          {
            headers,
            withCredentials: true,
          }
        );

        if (response.data.success) {
          const blogsData = response.data.data.blogs || [];
          setBlogs(blogsData);
        } else {
          setError(response.data.message || "Failed to load blogs");
        }
      } catch (error: any) {
        console.error("Error fetching blogs:", error);
        setError(
          error?.response?.data?.message ||
            error?.message ||
            "An error occurred"
        );
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate estimated read time
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return readTime;
  };

  // Get visibility badge
  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case "public":
        return (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
            Public
          </span>
        );
      case "private":
        return (
          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
            Private
          </span>
        );
      case "friends":
        return (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            Friends
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => router.push("/explore")}
          className="px-4 py-2 bg-amber-700 text-white rounded-md"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Public Blogs</h1>
          <button
            className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800"
            onClick={() => router.push("/my-blogs")}
          >
            My Blogs
          </button>
        </div>

        {blogs.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
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
            <p className="text-gray-500 mb-4">No public blogs found.</p>
            <button
              className="inline-block px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800"
              onClick={() => router.push("/my-blogs")}
            >
              Write Your First Blog
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {blogs.map((blog) => (
              <Link
                key={blog._id}
                href={`/blogs/${blog._id}`}
                className="block bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Blog Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {blog.title}
                      </h2>
                      {/* Author info */}
                      <div className="flex items-center text-sm text-gray-600">
                        <Image
                          src={blog.user.avatar}
                          alt={blog.user.displayName}
                          width={20}
                          height={20}
                          className="rounded-full mr-2"
                          unoptimized
                        />
                        <span>
                          by {blog.user.displayName} (@{blog.user.username})
                        </span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(blog.createdAt)}</span>
                        <span className="mx-2">•</span>
                        <span>{calculateReadTime(blog.content)} min read</span>
                      </div>
                    </div>
                    {getVisibilityBadge(blog.visibility)}
                  </div>

                  {/* Blog Content Preview */}
                  <div className="mb-4">
                    <div className="text-gray-600 line-clamp-3">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: () => null,
                          h2: () => null,
                          h3: () => null,
                          h4: () => null,
                          h5: () => null,
                          h6: () => null,
                          img: () => null,
                          a: ({ children }) => <span>{children}</span>,
                        }}
                      >
                        {blog.content.substring(0, 200) + "..."}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Genres and metadata */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div>
                      {blog.genres && blog.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {blog.genres
                            .slice(0, 3)
                            .map((genre: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded"
                              >
                                {genre}
                              </span>
                            ))}
                          {blog.genres.length > 3 && (
                            <span className="text-gray-400">
                              +{blog.genres.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      {blog.spoilerAlert && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full ml-2">
                          ⚠️ Spoiler Alert
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-amber-700">
                      <span className="hover:underline">Read more →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
