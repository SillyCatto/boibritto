import Chapter from '../models/chapter.models.js';
import UserBook from '../models/userBook.models.js';
import mongoose from 'mongoose';
import { logError } from '../utils/logger.js';
import { sendSuccess, sendError } from '../utils/response.js';
import HTTP from '../utils/httpStatus.js';

// Helper function to calculate word count
const calculateWordCount = (content) => {
  return content.trim().split(/\s+/).filter(word => word.length > 0).length;
};

const getChaptersForBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { published } = req.query;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid book ID");
    }

    // Check if book exists
    const book = await UserBook.findById(bookId);
    if (!book) {
      return sendError(res, HTTP.NOT_FOUND, "Book not found");
    }

    // Build filter for chapters
    let filter = { book: bookId };

    // Check access permissions
    const isAuthor = book.author.toString() === userId?.toString();

    if (!isAuthor) {
      // Non-authors can only see public chapters
      filter.visibility = "public";
    }

    // Filter by published status if specified
    if (published !== undefined) {
      filter.visibility = published === 'true' ? "public" : "private";
    }

    const chapters = await Chapter.find(filter)
      .populate("author", "username displayName avatar")
      .select('-content') // Exclude content for performance
      .sort({ chapterNumber: 1 });

    return sendSuccess(res, HTTP.OK, "Chapters fetched successfully", { chapters });
  } catch (err) {
    logError("Failed to fetch chapters", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to fetch chapters");
  }
};

const getChapterById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid chapter ID");
    }

    const chapter = await Chapter.findById(id)
      .populate("author", "username displayName avatar")
      .populate({
        path: "book",
        select: "title author",
        populate: {
          path: "author",
          select: "username displayName"
        }
      });

    if (!chapter) {
      return sendError(res, HTTP.NOT_FOUND, "Chapter not found");
    }

    // Check access permissions
    const isAuthor = chapter.author._id.toString() === userId?.toString();
    const isPublic = chapter.visibility === "public";

    if (!isPublic && !isAuthor) {
      return sendError(res, HTTP.FORBIDDEN, "You do not have access to this chapter");
    }

    return sendSuccess(res, HTTP.OK, "Chapter fetched successfully", { chapter });
  } catch (err) {
    logError("Failed to fetch chapter", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to fetch chapter");
  }
};

const createChapter = async (req, res) => {
  try {
    // Check if req.body.data exists
    if (!req.body.data) {
      return sendError(res, HTTP.BAD_REQUEST, "Request data is required");
    }

    const { bookId, title, content, chapterNumber, visibility = "private" } = req.body.data;
    const userId = req.user._id;

    // Validation
    if (!bookId || !title || !content || !chapterNumber) {
      return sendError(res, HTTP.BAD_REQUEST, "BookId, title, content, and chapterNumber are required");
    }

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid book ID");
    }

    if (title.length > 200) {
      return sendError(res, HTTP.BAD_REQUEST, "Title cannot exceed 200 characters");
    }

    if (content.length > 50000) {
      return sendError(res, HTTP.BAD_REQUEST, "Content cannot exceed 50,000 characters");
    }

    if (chapterNumber < 1) {
      return sendError(res, HTTP.BAD_REQUEST, "Chapter number must be at least 1");
    }

    // Check if book exists and user is the author
    const book = await UserBook.findById(bookId);
    if (!book) {
      return sendError(res, HTTP.NOT_FOUND, "Book not found");
    }

    if (book.author.toString() !== userId.toString()) {
      return sendError(res, HTTP.FORBIDDEN, "You can only create chapters for your own books");
    }

    // Check visibility constraints
    if (visibility === "public" && book.visibility === "private") {
      return sendError(res, HTTP.BAD_REQUEST, "Chapter cannot be public when the book is private");
    }

    // Check for duplicate chapter number
    const existingChapter = await Chapter.findOne({ book: bookId, chapterNumber });
    if (existingChapter) {
      return sendError(res, HTTP.BAD_REQUEST, "Chapter number already exists for this book");
    }

    // Calculate word count
    const wordCount = calculateWordCount(content);

    const newChapter = new Chapter({
      book: bookId,
      author: userId,
      title,
      content,
      chapterNumber,
      visibility,
      wordCount
    });

    const savedChapter = await newChapter.save();
    await savedChapter.populate("author", "username displayName avatar");

    return sendSuccess(res, HTTP.CREATED, "Chapter created successfully", { chapter: savedChapter });
  } catch (err) {
    logError("Failed to create chapter", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to create chapter");
  }
};

const updateChapter = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if req.body.data exists
    if (!req.body.data) {
      return sendError(res, HTTP.BAD_REQUEST, "Request data is required");
    }

    const { title, content, visibility } = req.body.data;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid chapter ID");
    }

    const chapter = await Chapter.findById(id).populate('book');
    if (!chapter) {
      return sendError(res, HTTP.NOT_FOUND, "Chapter not found");
    }

    // Check if user is the author
    if (chapter.author.toString() !== userId.toString()) {
      return sendError(res, HTTP.FORBIDDEN, "You can only update your own chapters");
    }

    // Validate field lengths
    if (title && title.length > 200) {
      return sendError(res, HTTP.BAD_REQUEST, "Title cannot exceed 200 characters");
    }

    if (content && content.length > 50000) {
      return sendError(res, HTTP.BAD_REQUEST, "Content cannot exceed 50,000 characters");
    }

    // Check visibility constraints
    if (visibility === "public" && chapter.book.visibility === "private") {
      return sendError(res, HTTP.BAD_REQUEST, "Chapter cannot be public when the book is private");
    }

    // Build update data
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) {
      updateData.content = content;
      updateData.wordCount = calculateWordCount(content);
    }
    if (visibility !== undefined) updateData.visibility = visibility;

    const updatedChapter = await Chapter.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("author", "username displayName avatar");

    return sendSuccess(res, HTTP.OK, "Chapter updated successfully", { chapter: updatedChapter });
  } catch (err) {
    logError("Failed to update chapter", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to update chapter");
  }
};

const deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid chapter ID");
    }

    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return sendError(res, HTTP.NOT_FOUND, "Chapter not found");
    }

    // Check if user is the author
    if (chapter.author.toString() !== userId.toString()) {
      return sendError(res, HTTP.FORBIDDEN, "You can only delete your own chapters");
    }

    await Chapter.findByIdAndDelete(id);

    return sendSuccess(res, HTTP.OK, "Chapter deleted successfully");
  } catch (err) {
    logError("Failed to delete chapter", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to delete chapter");
  }
};

const likeChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid chapter ID");
    }

    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return sendError(res, HTTP.NOT_FOUND, "Chapter not found");
    }

    // Check if chapter is public
    if (chapter.visibility !== "public") {
      return sendError(res, HTTP.FORBIDDEN, "You can only like public chapters");
    }

    // Check if user is the author
    if (chapter.author.toString() === userId.toString()) {
      return sendError(res, HTTP.BAD_REQUEST, "You cannot like your own chapter");
    }

    const isLiked = chapter.likes.includes(userId);
    let updatedChapter;

    if (isLiked) {
      // Unlike the chapter
      updatedChapter = await Chapter.findByIdAndUpdate(
        id,
        { $pull: { likes: userId } },
        { new: true }
      );
      return sendSuccess(res, HTTP.OK, "Chapter unliked successfully", {
        liked: false,
        likeCount: updatedChapter.likes.length
      });
    } else {
      // Like the chapter
      updatedChapter = await Chapter.findByIdAndUpdate(
        id,
        { $addToSet: { likes: userId } },
        { new: true }
      );
      return sendSuccess(res, HTTP.OK, "Chapter liked successfully", {
        liked: true,
        likeCount: updatedChapter.likes.length
      });
    }
  } catch (err) {
    logError("Failed to like/unlike chapter", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to like/unlike chapter");
  }
};

export const ChapterController = {
  getChaptersForBook,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
  likeChapter
};
