"use client";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/googleAuth";
import { CreateCommentData } from "@/lib/commentsAPI";
import Image from "next/image";

interface CommentFormProps {
  discussionId: string;
  parentCommentId?: string;
  onSubmit: (commentData: CreateCommentData) => Promise<void>;
  submitting: boolean;
  placeholder?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export default function CommentForm({
  discussionId,
  parentCommentId,
  onSubmit,
  submitting,
  placeholder = "Write a comment...",
  onCancel,
  autoFocus = false,
}: CommentFormProps) {
  const [user] = useAuthState(auth);
  const [content, setContent] = useState("");
  const [spoilerAlert, setSpoilerAlert] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    if (content.length > 500) {
      setError("Comment must be 500 characters or less");
      return;
    }

    try {
      setError("");
      await onSubmit({
        discussionId,
        content: content.trim(),
        spoilerAlert,
        parentComment: parentCommentId,
      });

      // Reset form
      setContent("");
      setSpoilerAlert(false);

      // If this was a reply form, call onCancel to hide it
      if (onCancel) {
        onCancel();
      }
    } catch (err) {
      setError("Failed to post comment");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || "User"}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full text-gray-500 text-sm font-medium">
                {(user.displayName || user.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none ${
              spoilerAlert ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
            rows={3}
            maxLength={500}
            autoFocus={autoFocus}
            disabled={submitting}
          />

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={spoilerAlert}
                  onChange={(e) => setSpoilerAlert(e.target.checked)}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  disabled={submitting}
                />
                <span className="text-sm text-gray-600">Contains spoilers</span>
              </label>

              <span className="text-xs text-gray-400">
                {content.length}/500
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={!content.trim() || submitting}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {submitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                )}
                <span>{parentCommentId ? "Reply" : "Comment"}</span>
              </button>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>
      </div>
    </form>
  );
}
