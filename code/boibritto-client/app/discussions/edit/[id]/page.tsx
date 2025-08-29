"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/googleAuth";
import { discussionsAPI, Discussion } from "@/lib/discussionAPI";
import { GENRES } from "@/lib/constants";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

interface DiscussionFormData {
  title: string;
  content: string;
  spoilerAlert: boolean;
  genres: string[];
}

export default function EditDiscussionPage() {
  const params = useParams();
  const router = useRouter();
  const [user, userLoading] = useAuthState(auth);
  const discussionId = params.id as string;

  const [formData, setFormData] = useState<DiscussionFormData>({
    title: "",
    content: "",
    spoilerAlert: false,
    genres: [],
  });
  const [originalDiscussion, setOriginalDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  // Load existing discussion
  useEffect(() => {
    const loadDiscussion = async () => {
      try {
        setInitialLoading(true);
        const response = await discussionsAPI.getDiscussion(discussionId);
        const discussion = response.discussion;
        
        // Check if user owns the discussion
        if (user && user.uid !== discussion.user.uid) {
          setError("You don't have permission to edit this discussion");
          return;
        }

        setOriginalDiscussion(discussion);
        setFormData({
          title: discussion.title,
          content: discussion.content,
          spoilerAlert: discussion.spoilerAlert,
          genres: discussion.genres,
        });
      } catch (err) {
        console.error("Failed to load discussion:", err);
        setError("Failed to load discussion");
      } finally {
        setInitialLoading(false);
      }
    };

    if (user && discussionId) {
      loadDiscussion();
    } else if (!userLoading && !user) {
      router.push("/signin");
    }
  }, [user, userLoading, discussionId, router]);

  if (userLoading || initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  if (error || !originalDiscussion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
          strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-red-400 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" 
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Cannot edit discussion</h3>
          <p className="text-gray-500 mb-6">
            {error || "The discussion you're trying to edit doesn't exist or you don't have permission."}
          </p>
          <Link href="/discussions" className="text-amber-700 hover:text-amber-800 font-medium">
            Back to discussions →
          </Link>
        </div>
      </div>
    );
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Title and content are required");
      return;
    }

    if (formData.title.length > 100) {
      setError("Title must be 100 characters or less");
      return;
    }

    if (formData.content.length > 2000) {
      setError("Content must be 2000 characters or less");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const updateData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        spoilerAlert: formData.spoilerAlert,
        genres: formData.genres,
      };

      const response = await discussionsAPI.updateDiscussion(discussionId, updateData);
      
      if (response.discussion) {
        router.push(`/discussions/${response.discussion._id}`);
      } else {
        setError("Failed to update discussion");
      }
    } catch (error: unknown) {
      console.error("Failed to update discussion:", error);
      const errorMessage = (error as { message?: string })?.message || "Failed to update discussion";
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

  return (
    <main className="bg-white text-gray-900 py-16 px-6 sm:px-10 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Discussion</h1>
          <Link
            href={`/discussions/${discussionId}`}
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
            Back to Discussion
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
              Discussion Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg"
              placeholder="What would you like to discuss?"
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/100 characters
            </p>
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
              Check this if your discussion contains spoilers
            </p>
          </div>

          {/* Genres */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Genres (Optional)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
              {GENRES.map((genre) => (
                <label
                  key={genre}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.genres.includes(genre)}
                    onChange={() => handleGenreChange(genre)}
                    className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700">
                    {genre.charAt(0).toUpperCase() + genre.slice(1).replace('-', ' ')}
                  </span>
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
                    {genre.charAt(0).toUpperCase() + genre.slice(1).replace('-', ' ')}
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

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discussion Content * (Markdown supported)
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
            <p className="text-xs text-gray-500 mt-1">
              {formData.content.length}/2000 characters
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <Link
              href={`/discussions/${discussionId}`}
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
                  Updating...
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
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    />
                  </svg>
                  Update Discussion
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
