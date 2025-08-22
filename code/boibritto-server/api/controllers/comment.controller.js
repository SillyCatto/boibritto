import Comment from "../models/comment.models.js";
import Discussion from "../models/discussion.models.js";
import { sendSuccess, sendError } from "../utils/response.js";
import HTTP from "../utils/httpStatus.js";
import { logError } from "../utils/logger.js";

const getCommentsByDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;

    // Verify discussion exists and is public
    const discussion = await Discussion.findById(discussionId);
    if (!discussion || discussion.visibility !== "public") {
      return sendError(res, HTTP.NOT_FOUND, "Discussion not found or not accessible");
    }

    // Fetch all comments for the discussion
    const allComments = await Comment.find({ discussion: discussionId })
      .populate("user", "_id username displayName avatar")
      .sort({ createdAt: 1 }); // Oldest first for better reading flow

    // Separate parent comments and replies
    const parentComments = allComments.filter(comment => !comment.parentComment);
    const replies = allComments.filter(comment => comment.parentComment);

    // Build hierarchical structure
    const commentsWithReplies = parentComments.map(parentComment => {
      const commentReplies = replies.filter(reply =>
        reply.parentComment.toString() === parentComment._id.toString()
      );

      return {
        ...parentComment.toObject(),
        replies: commentReplies.map(reply => reply.toObject())
      };
    });

    return sendSuccess(res, HTTP.OK, "Comments fetched successfully", {
      comments: commentsWithReplies,
    });
  } catch (err) {
    logError("Failed to fetch comments", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to fetch comments");
  }
};

export const CommentController = {
  getCommentsByDiscussion,
};
