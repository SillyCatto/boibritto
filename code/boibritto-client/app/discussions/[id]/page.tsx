"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/googleAuth";
import { discussionsAPI, Discussion } from "@/lib/discussionAPI";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function DiscussionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user] = useAuthState(auth);
  const discussionId = params.id as string;

  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Load discussion
  useEffect(() => {
    const loadDiscussion = async () => {
      try {
        setLoading(true);
        const response = await discussionsAPI.getDiscussion(discussionId);
        setDiscussion(response.discussion);
      } catch (err) {
        console.error("Failed to load discussion:", err);
        setError("Failed to load discussion");
      } finally {
        setLoading(false);
      }
    };

    if (user && discussionId) {
      loadDiscussion();
    }
  }, [user, discussionId]);

  // Handle delete
  const handleDelete = async () => {
    if (!discussion || !window.confirm("Are you sure you want to delete this discussion?")) {
      return;
    }

    try {
      setDeleting(true);
      await discussionsAPI.deleteDiscussion(discussion._id);
      router.push("/discussions");
    } catch (err) {
      console.error("Failed to delete discussion:", err);
      setError("Failed to delete discussion");
    } finally {
      setDeleting(false);
    }
  };

  // Check if user owns the discussion
  const isOwner = user && discussion && user.uid === discussion.user.uid;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
          strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" 
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Sign in required</h3>
          <p className="text-gray-500 mb-6">
            You need to sign in to view discussions.
          </p>
          <Link href="/signin" className="text-amber-700 hover:text-amber-800 font-medium">
            Sign in to continue →
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  if (error || !discussion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
          strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-red-400 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" 
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Discussion not found</h3>
          <p className="text-gray-500 mb-6">
            {error || "The discussion you're looking for doesn't exist or you don't have permission to view it."}
          </p>
          <Link href="/discussions" className="text-amber-700 hover:text-amber-800 font-medium">
            Back to discussions →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/discussions"
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
              Back to Discussions
            </Link>

            {isOwner && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/discussions/edit/${discussion._id}`}
                  className="px-4 py-2 text-amber-700 border border-amber-700 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-1"
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
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  {deleting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600"></div>
                  ) : (
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
                  )}
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Spoiler alert */}
          {discussion.spoilerAlert && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.75 3.25h19.5m-19.5 0a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25m-19.5 0V9.75A2.25 2.25 0 014.5 7.5h15a2.25 2.25 0 012.25 2.25v6.5z"
                  />
                </svg>
                <span className="font-medium">Spoiler Alert!</span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                This discussion contains spoilers about books or stories.
              </p>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{discussion.title}</h1>

          {/* Author and date info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-full overflow-hidden">
                <Image 
                  src={discussion.user.avatar} 
                  alt={discussion.user.displayName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{discussion.user.displayName}</h3>
                <p className="text-gray-500 text-sm">@{discussion.user.username}</p>
              </div>
            </div>
            <div className="text-gray-400 text-sm">
              <p>
                Created {new Date(discussion.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                })}
              </p>
              {discussion.updatedAt !== discussion.createdAt && (
                <p>
                  Updated {new Date(discussion.updatedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Genres */}
          {discussion.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {discussion.genres.map((genre) => (
                <span 
                  key={genre}
                  className="bg-amber-50 text-amber-800 text-sm px-3 py-1 rounded-full"
                >
                  {genre.charAt(0).toUpperCase() + genre.slice(1).replace('-', ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-lg max-w-none text-gray-800">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {discussion.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Comments section placeholder */}
        <div className="bg-white rounded-lg shadow-sm p-8 mt-8">
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
            strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" 
              d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Comments Coming Soon</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We're working on adding comment functionality to discussions. 
              Soon you'll be able to share your thoughts and engage with other readers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
