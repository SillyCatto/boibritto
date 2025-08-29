"use client";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/googleAuth";
import { Comment, CreateCommentData, commentsAPI } from "@/lib/commentsAPI";
import CommentForm from "./CommentForm";
import Image from "next/image";

interface CommentItemProps {
  comment: Comment;
  discussionId: string;
  discussionOwnerId: string;
  onUpdate: (commentId: string, updatedComment: Comment) => Promise<void>;
  onDelete: (commentId: string, isReply?: boolean) => Promise<void>;
  onReply: (commentData: CreateCommentData) => Promise<void>;
  isSubmitting: boolean;
  isReply?: boolean;
}

export default function CommentItem({
  comment,
  discussionId,
  discussionOwnerId,
  onUpdate,
  onDelete,
  onReply,
  isSubmitting,
  isReply = false,
}: CommentItemProps) {
  const [user] = useAuthState(auth);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editSpoilerAlert, setEditSpoilerAlert] = useState(
    comment.spoilerAlert
  );
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOwner = user && comment.user.uid === user.uid;
  const isOP = comment.user.uid === discussionOwnerId;

  // Handle edit submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOwner) {
      console.error("Cannot edit comment: user is not owner");
      return;
    }

    if (!editContent.trim()) return;
    if (editContent.length > 500) return;

    try {
      setUpdating(true);
      const response = await commentsAPI.updateComment(comment._id, {
        content: editContent.trim(),
        spoilerAlert: editSpoilerAlert,
      });

      await onUpdate(comment._id, response.comment);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update comment:", err);
    } finally {
      setUpdating(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!isOwner) {
      console.error("Cannot delete comment: user is not owner");
      return;
    }

    try {
      setDeleting(true);
      await onDelete(comment._id, isReply);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Failed to delete comment:", err);
    } finally {
      setDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 1 ? "just now" : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={`${isReply ? "ml-12 relative" : ""}`}>
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <div className="relative h-10 w-10 rounded-full overflow-hidden">
            <Image
              src={comment.user.avatar}
              alt={comment.user.displayName}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

        <div className="flex-1">
          {/* Comment header */}
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-medium text-gray-900">
              {comment.user.displayName}
            </h4>
            <span className="text-gray-500 text-sm">
              @{comment.user.username}
            </span>
            {isOP && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
                OP
              </span>
            )}
            <span className="text-gray-400 text-sm">•</span>
            <span className="text-gray-400 text-sm">
              {formatDate(comment.createdAt)}
            </span>
            {comment.updatedAt !== comment.createdAt && (
              <span className="text-gray-400 text-sm">(edited)</span>
            )}
          </div>

          {/* Spoiler warning */}
          {comment.spoilerAlert && !showSpoiler && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-red-800">
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
                  <span className="text-sm font-medium">
                    This comment contains spoilers
                  </span>
                </div>
                <button
                  onClick={() => setShowSpoiler(true)}
                  className="text-red-700 hover:text-red-800 text-sm underline"
                >
                  Show anyway
                </button>
              </div>
            </div>
          )}

          {/* Comment content */}
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="mb-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={500}
                disabled={updating}
              />

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editSpoilerAlert}
                      onChange={(e) => setEditSpoilerAlert(e.target.checked)}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      disabled={updating}
                    />
                    <span className="text-sm text-gray-600">
                      Contains spoilers
                    </span>
                  </label>

                  <span className="text-xs text-gray-400">
                    {editContent.length}/500
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                      setEditSpoilerAlert(comment.spoilerAlert);
                    }}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                    disabled={updating}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={!editContent.trim() || updating}
                    className="px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center space-x-1"
                  >
                    {updating && (
                      <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                    )}
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            (!comment.spoilerAlert || showSpoiler) && (
              <div className="text-gray-800 mb-3 whitespace-pre-wrap">
                {comment.content}
              </div>
            )
          )}

          {/* Comment actions */}
          {!isEditing && (
            <div className="flex items-center space-x-4 text-sm">
              {!isReply && ( // Only show reply button for parent comments
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-gray-500 hover:text-amber-600 transition-colors flex items-center space-x-1"
                  disabled={isSubmitting}
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
                      d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.627 2.707-3.227V6.741c0-1.6-1.123-2.994-2.707-3.227A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.514C3.373 3.747 2.25 5.14 2.25 6.741v6.018z"
                    />
                  </svg>
                  <span>Reply</span>
                </button>
              )}

              {isOwner && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-500 hover:text-blue-600 transition-colors flex items-center space-x-1"
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
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-gray-500 hover:text-red-600 transition-colors flex items-center space-x-1"
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
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* Delete confirmation modal */}
          {showDeleteConfirm && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <div
                className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative border border-amber-100"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-red-700 mb-4 text-center">
                  Delete Comment
                </h3>
                <p className="text-gray-700 mb-6 text-center leading-relaxed">
                  Are you sure you want to delete this comment?
                  {!isReply &&
                    comment.replies &&
                    comment.replies.length > 0 && (
                      <span className="text-red-600 block mt-2">
                        This will also delete all {comment.replies.length} reply
                        {comment.replies.length > 1 ? "ies" : ""} to this
                        comment.
                      </span>
                    )}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition-colors duration-200 shadow-sm flex items-center justify-center space-x-2"
                  >
                    {deleting && (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    )}
                    <span>Delete Comment</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 font-medium hover:bg-amber-100 hover:border-amber-300 disabled:opacity-50 transition-colors duration-200 shadow-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-4">
              <CommentForm
                discussionId={discussionId}
                parentCommentId={comment._id}
                onSubmit={onReply}
                submitting={isSubmitting}
                placeholder={`Reply to ${comment.user.displayName}...`}
                onCancel={() => setShowReplyForm(false)}
                autoFocus={true}
              />
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 relative">
              {/* Vertical line connecting to replies */}
              <div
                className="absolute left-5 top-0 w-0.5 bg-amber-200"
                style={{ height: "calc(100% - 1rem)" }}
              ></div>

              <div className="space-y-4">
                {comment.replies.map((reply, index) => (
                  <div key={reply._id} className="relative">
                    <CommentItem
                      comment={reply}
                      discussionId={discussionId}
                      discussionOwnerId={discussionOwnerId}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      onReply={onReply}
                      isSubmitting={isSubmitting}
                      isReply={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
