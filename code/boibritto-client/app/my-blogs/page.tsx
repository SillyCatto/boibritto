"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initFirebase } from "@/lib/googleAuth";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Initialize Firebase
initFirebase();

interface Blog {
  _id: string;
  title: string;
  content: string;
  spoilerAlert: boolean;
  genres: string[];
  visibility: "public" | "private" | "friends";
  createdAt: string;
  updatedAt: string;
}

export default function MyBlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    const fetchMyBlogs = async () => {
      setLoading(true);
      setError("");

      try {
        const auth = getAuth();

        if (!auth.currentUser) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        const token = await auth.currentUser.getIdToken();

        const response = await axios.get(
          `${
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"
          }/api/blogs?owner=me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        const { data } = response;

        if (data.success) {
          setBlogs(data.data.blogs || []);
        } else {
          setError(data.message || "Failed to load blogs");
        }
      } catch (error: unknown) {
        console.error("Failed to load blogs:", error);
        const errorMessage =
          (
            error as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (error as { message?: string })?.message ||
          "Failed to load blogs";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchMyBlogs();
      } else {
        router.push("/signin");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Calculate estimated read time
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return readTime;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Open delete modal
  const openDeleteModal = (blogId: string, blogTitle: string) => {
    setBlogToDelete({ id: blogId, title: blogTitle });
    setShowDeleteModal(true);
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setBlogToDelete(null);
  };

  // Delete blog function
  const handleDeleteBlog = async () => {
    if (!blogToDelete) return;

    try {
      const auth = getAuth();
      if (!auth.currentUser) {
        setError("User not authenticated");
        return;
      }

      const token = await auth.currentUser.getIdToken();

      const response = await axios.delete(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"
        }/api/blogs/${blogToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Remove the blog from the list
        setBlogs((prev) => prev.filter((blog) => blog._id !== blogToDelete.id));
        setShowDeleteModal(false);
        setBlogToDelete(null);
      } else {
        setError(response.data.message || "Failed to delete blog");
      }
    } catch (error: unknown) {
      console.error("Failed to delete blog:", error);
      const errorMessage =
        (
          error as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to delete blog";
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600">{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-amber-700 text-white rounded-lg"
          onClick={() => router.push("/signin")}
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <main className="bg-white text-gray-900 py-16 px-6 sm:px-10 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Blogs</h1>
          <Link
            href="/blogs"
            className="text-amber-700 hover:text-amber-800 flex items-center gap-1"
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
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            Back to All Blogs
          </Link>
        </div>

        <div className="mb-8">
          <Link
            href="/blogs/write"
            className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors inline-flex items-center gap-2"
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
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
            Write New Blog
          </Link>
        </div>

        {blogs.length > 0 ? (
          <div className="space-y-6">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="border border-gray-200 rounded-xl p-6 bg-white hover:bg-amber-50 hover:border-amber-200 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Link
                      href={`/blogs/${blog._id}`}
                      className="text-xl font-semibold text-amber-700 hover:text-amber-800 line-clamp-2"
                    >
                      {blog.title}
                    </Link>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span>{formatDate(blog.createdAt)}</span>
                      <span className="mx-2">•</span>
                      <span>{calculateReadTime(blog.content)} min read</span>
                      <span className="mx-2">•</span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          blog.visibility === "public"
                            ? "bg-green-100 text-green-700"
                            : blog.visibility === "private"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {blog.visibility}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/blogs/edit/${blog._id}`}
                      className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-md transition-colors"
                      title="Edit blog"
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
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                        />
                      </svg>
                    </Link>
                    <button
                      onClick={() => openDeleteModal(blog._id, blog.title)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors"
                      title="Delete blog"
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
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Blog Content Preview */}
                <div className="mb-4 text-gray-600">
                  <div className="line-clamp-2">
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
                      {blog.content.substring(0, 150) + "..."}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Genres and Spoiler Alert */}
                <div className="flex flex-wrap gap-1 items-center">
                  {blog.spoilerAlert && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded flex items-center gap-1">
                      <span>⚠️</span>
                      <span>Spoiler</span>
                    </span>
                  )}
                  {blog.genres &&
                    blog.genres.length > 0 &&
                    blog.genres.map((genre: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded"
                      >
                        {genre}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
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
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Blogs Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start sharing your thoughts and experiences with the world!
            </p>
            <Link
              href="/blogs/write"
              className="inline-flex items-center px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
            >
              Write Your First Blog
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 ml-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && blogToDelete && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={closeDeleteModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative border border-amber-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-red-700 mb-4 text-center">
              Delete Blog
            </h3>
            <p className="text-gray-700 mb-6 text-center leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-red-700">
                "{blogToDelete.title}"
              </span>
              ? This action cannot be undone and will permanently remove your
              blog.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteBlog}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors duration-200 shadow-sm"
              >
                Delete Blog
              </button>
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 font-medium hover:bg-amber-100 hover:border-amber-300 transition-colors duration-200 shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
