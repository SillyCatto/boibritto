"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initFirebase } from "@/lib/googleAuth";
import Link from "next/link";
import dynamic from "next/dynamic";

// Initialize Firebase
initFirebase();

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

interface BlogFormData {
  title: string;
  content: string;
  spoilerAlert: boolean;
  genres: string[];
  visibility: "public" | "private" | "friends";
}

// Predefined genres (you might want to fetch these from the backend)
const AVAILABLE_GENRES = [
  "Fiction",
  "Non-Fiction",
  "Mystery",
  "Romance",
  "Science Fiction",
  "Fantasy",
  "Biography",
  "History",
  "Technology",
  "Business",
  "Self-Help",
  "Health",
  "Travel",
  "Cooking",
  "Art",
  "Drama",
  "Poetry",
  "Horror",
  "Thriller",
  "Adventure",
  "Comedy",
];

export default function WriteBlogPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = Boolean(params?.id);
  const blogId = params?.id as string;

  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    content: "",
    spoilerAlert: false,
    genres: [],
    visibility: "public",
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [error, setError] = useState("");

  // Load existing blog for editing
  useEffect(() => {
    if (isEdit && blogId) {
      const loadBlog = async () => {
        try {
          const auth = getAuth();
          if (!auth.currentUser) {
            router.push("/signin");
            return;
          }

          const token = await auth.currentUser.getIdToken();
          const response = await axios.get(
            `${
              process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"
            }/api/blogs/${blogId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
            }
          );

          if (response.data.success) {
            const blog = response.data.data.blog;
            setFormData({
              title: blog.title,
              content: blog.content,
              spoilerAlert: blog.spoilerAlert || false,
              genres: blog.genres || [],
              visibility: blog.visibility,
            });
          } else {
            setError("Failed to load blog");
          }
        } catch (error: unknown) {
          console.error("Failed to load blog:", error);
          setError("Failed to load blog");
        } finally {
          setInitialLoading(false);
        }
      };

      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          loadBlog();
        } else {
          router.push("/signin");
        }
      });

      return () => unsubscribe();
    }
  }, [isEdit, blogId, router]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Title and content are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const auth = getAuth();
      if (!auth.currentUser) {
        setError("User not authenticated");
        return;
      }

      const token = await auth.currentUser.getIdToken();

      const requestData = {
        data: {
          title: formData.title.trim(),
          content: formData.content.trim(),
          spoilerAlert: formData.spoilerAlert,
          genres: formData.genres,
          visibility: formData.visibility,
        },
      };

      let response;
      if (isEdit) {
        response = await axios.patch(
          `${
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"
          }/api/blogs/${blogId}`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
      } else {
        response = await axios.post(
          `${
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"
          }/api/blogs`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
      }

      if (response.data.success) {
        const blogId = isEdit ? params.id : response.data.data.blog._id;
        router.push(`/blogs/${blogId}`);
      } else {
        setError(
          response.data.message ||
            `Failed to ${isEdit ? "update" : "create"} blog`
        );
      }
    } catch (error: unknown) {
      console.error(`Failed to ${isEdit ? "update" : "create"} blog:`, error);
      const errorMessage =
        (
          error as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (error as { message?: string })?.message ||
        `Failed to ${isEdit ? "update" : "create"} blog`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle genre selection
  const handleGenreChange = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  return (
    <main className="bg-white text-gray-900 py-16 px-6 sm:px-10 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? "Edit Blog" : "Write New Blog"}
          </h1>
          <Link
            href="/my-blogs"
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
            Back to My Blogs
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Blog Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg"
              placeholder="Enter your blog title"
              maxLength={200}
              required
            />
          </div>

          {/* Spoiler Alert */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.spoilerAlert}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    spoilerAlert: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Spoiler Alert
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Check this if your blog contains spoilers
            </p>
          </div>

          {/* Genres */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Genres (Select up to 5)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
              {AVAILABLE_GENRES.map((genre) => (
                <label
                  key={genre}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.genres.includes(genre)}
                    onChange={() => handleGenreChange(genre)}
                    disabled={
                      !formData.genres.includes(genre) &&
                      formData.genres.length >= 5
                    }
                    className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-700">{genre}</span>
                </label>
              ))}
            </div>
            {formData.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full"
                  >
                    {genre}
                    <button
                      type="button"
                      onClick={() => handleGenreChange(genre)}
                      className="ml-2 text-amber-600 hover:text-amber-800"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div>
            <label
              htmlFor="visibility"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Visibility
            </label>
            <select
              id="visibility"
              value={formData.visibility}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  visibility: e.target.value as
                    | "public"
                    | "private"
                    | "friends",
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="public">Public - Everyone can see</option>
              <option value="friends">
                Friends Only - Only your friends can see
              </option>
              <option value="private">Private - Only you can see</option>
            </select>
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content * (Markdown supported)
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <MDEditor
                value={formData.content}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, content: value || "" }))
                }
                preview="edit"
                hideToolbar={false}
                height={400}
                data-color-mode="light"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <Link
              href="/my-blogs"
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={
                loading || !formData.title.trim() || !formData.content.trim()
              }
              className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  {isEdit ? "Updating..." : "Publishing..."}
                </>
              ) : (
                <>
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
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.768 59.768 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                  </svg>
                  {isEdit ? "Update Blog" : "Publish Blog"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
