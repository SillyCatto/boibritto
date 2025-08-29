"use client";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/googleAuth";
import { commentsAPI, Comment, CreateCommentData } from "@/lib/commentsAPI";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";

interface CommentsProps {
  discussionId: string;
  discussionOwnerId: string; // To identify OP comments
}

export default function Comments({
  discussionId,
  discussionOwnerId,
}: CommentsProps) {
  const [user] = useAuthState(auth);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true);
        const response = await commentsAPI.getComments(discussionId);
        setComments(response.comments);
      } catch (err) {
        console.error("Failed to load comments:", err);
        setError("Failed to load comments");
      } finally {
        setLoading(false);
      }
    };

    if (user && discussionId) {
      loadComments();
    }
  }, [user, discussionId]);

  // Handle new comment submission
  const handleCommentSubmit = async (commentData: CreateCommentData) => {
    try {
      setSubmitting(true);
      const response = await commentsAPI.createComment(commentData);

      // Add new comment to the list
      if (commentData.parentComment) {
        // It's a reply - add to the parent comment's replies
        setComments((prevComments) =>
          prevComments.map((comment) => {
            if (comment._id === commentData.parentComment) {
              return {
                ...comment,
                replies: [...(comment.replies || []), response.comment],
              };
            }
            return comment;
          })
        );
      } else {
        // It's a parent comment - add to main list
        setComments((prevComments) => [...prevComments, response.comment]);
      }
    } catch (err) {
      console.error("Failed to create comment:", err);
      setError("Failed to create comment");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle comment update
  const handleCommentUpdate = async (
    commentId: string,
    updatedComment: Comment
  ) => {
    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment._id === commentId) {
          return updatedComment;
        }
        // Check replies
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply._id === commentId ? updatedComment : reply
            ),
          };
        }
        return comment;
      })
    );
  };

  // Handle comment deletion
  const handleCommentDelete = async (
    commentId: string,
    isReply: boolean = false
  ) => {
    try {
      await commentsAPI.deleteComment(commentId);

      if (isReply) {
        // Remove reply from parent's replies
        setComments((prevComments) =>
          prevComments.map((comment) => ({
            ...comment,
            replies:
              comment.replies?.filter((reply) => reply._id !== commentId) || [],
          }))
        );
      } else {
        // Remove parent comment (and all its replies)
        setComments((prevComments) =>
          prevComments.filter((comment) => comment._id !== commentId)
        );
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
      setError("Failed to delete comment");
    }
  };

  // Calculate total comment count including replies
  const getTotalCommentCount = () => {
    return comments.reduce((total, comment) => {
      return total + 1 + (comment.replies?.length || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Comments ({getTotalCommentCount()})
      </h3>

      {error && (
        <div className="mb-6 p-3 bg-red-100 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={() => setError("")}
            className="text-red-600 text-sm hover:underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Comment form for new top-level comments */}
      <div className="mb-8">
        <CommentForm
          discussionId={discussionId}
          onSubmit={handleCommentSubmit}
          submitting={submitting}
          placeholder="Share your thoughts about this discussion..."
        />
      </div>

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 mx-auto text-gray-400 mb-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
            />
          </svg>
          <h4 className="text-lg font-medium text-gray-800 mb-2">
            No comments yet
          </h4>
          <p className="text-gray-500">
            Be the first to share your thoughts about this discussion.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              discussionId={discussionId}
              discussionOwnerId={discussionOwnerId}
              onUpdate={handleCommentUpdate}
              onDelete={handleCommentDelete}
              onReply={handleCommentSubmit}
              isSubmitting={submitting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
