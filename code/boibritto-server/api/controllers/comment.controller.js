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

const createComment = async (req, res) => {
  try {
    const { discussionId, content, spoilerAlert, parentComment } = req.body.data || {};

    // Validation
    if (!discussionId || typeof discussionId !== "string") {
      return sendError(res, HTTP.BAD_REQUEST, "Discussion ID is required");
    }
    if (!content || typeof content !== "string" || content.length > 500) {
      return sendError(res, HTTP.BAD_REQUEST, "Content is required and must be <= 500 characters");
    }
    if (typeof spoilerAlert !== "boolean") {
      return sendError(res, HTTP.BAD_REQUEST, "spoilerAlert is required and must be boolean");
    }

    // Verify discussion exists and is public
    const discussion = await Discussion.findById(discussionId);
    if (!discussion || discussion.visibility !== "public") {
      return sendError(res, HTTP.NOT_FOUND, "Discussion not found or not accessible");
    }

    // If parentComment is provided, validate it exists and enforce 1-level depth
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) {
        return sendError(res, HTTP.NOT_FOUND, "Parent comment not found");
      }
      // Check if parent comment belongs to the same discussion
      if (parent.discussion.toString() !== discussionId) {
        return sendError(res, HTTP.BAD_REQUEST, "Parent comment must belong to the same discussion");
      }
      // Check if trying to reply to a reply (enforce 1-level depth)
      if (parent.parentComment) {
        return sendError(res, HTTP.BAD_REQUEST, "Comments can only be 1 level deep (replies to replies are not allowed)");
      }
    }

    // Create the comment
    const comment = await Comment.create({
      discussion: discussionId,
      user: req.user._id,
      content,
      spoilerAlert,
      parentComment: parentComment || null,
    });

    // Populate user data for response
    const populatedComment = await Comment.findById(comment._id)
      .populate("user", "_id username displayName avatar");

    return sendSuccess(res, HTTP.CREATED, "Comment created successfully", {
      comment: populatedComment,
    });
  } catch (err) {
    // Handle mongoose validation errors (including the pre-save hook)
    if (err.message && err.message.includes("1 level deep")) {
      return sendError(res, HTTP.BAD_REQUEST, err.message);
    }
    logError("Failed to create comment", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to create comment");
  }
};

const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, spoilerAlert } = req.body.data || {};

    // Find the comment
    const comment = await Comment.findById(id);
    if (!comment) {
      return sendError(res, HTTP.NOT_FOUND, "Comment not found");
    }

    // Check if user is the owner
    if (comment.user.toString() !== req.user._id.toString()) {
      return sendError(res, HTTP.FORBIDDEN, "You can only update your own comments");
    }

    // Validation for content if provided
    if (content !== undefined) {
      if (typeof content !== "string" || content.length > 500) {
        return sendError(res, HTTP.BAD_REQUEST, "Content must be a string and <= 500 characters");
      }
    }

    // Validation for spoilerAlert if provided
    if (spoilerAlert !== undefined && typeof spoilerAlert !== "boolean") {
      return sendError(res, HTTP.BAD_REQUEST, "spoilerAlert must be boolean");
    }

    // Build update object with only provided fields
    const updateData = {};
    if (content !== undefined) updateData.content = content;
    if (spoilerAlert !== undefined) updateData.spoilerAlert = spoilerAlert;

    // If no fields to update
    if (Object.keys(updateData).length === 0) {
      return sendError(res, HTTP.BAD_REQUEST, "No valid fields provided for update");
    }

    // Update the comment
    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("user", "_id username displayName avatar");

    return sendSuccess(res, HTTP.OK, "Comment updated successfully", {
      comment: updatedComment,
    });
  } catch (err) {
    logError("Failed to update comment", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to update comment");
  }
};

export const CommentController = {
  getCommentsByDiscussion,
  createComment,
  updateComment,
};
