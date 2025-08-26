import UserBook from '../models/userBook.models.js';
import Chapter from '../models/chapter.models.js';
import mongoose from 'mongoose';
import { logError } from '../utils/logger.js';
import { sendSuccess, sendError } from '../utils/response.js';
import HTTP from '../utils/httpStatus.js';

const getUserBooksList = async (req, res) => {
  try {
    const { author, page = 1, search, genre, completed } = req.query;
    const PAGE_SIZE = 20;
    let filter = {};

    if (!author) {
      // All public books
      filter.visibility = "public";
    } else if (author === "me") {
      // All books of the authenticated user (private + public)
      filter.author = req.user._id;
    } else {
      // Public books of the specified user
      filter.author = author;
      filter.visibility = "public";
    }

    // Search by title
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    // Filter by genre
    if (genre) {
      filter.genres = { $in: [genre] };
    }

    // Filter by completion status
    if (completed !== undefined) {
      filter.isCompleted = completed === 'true';
    }

    let query = UserBook.find(filter).populate(
      "author",
      "displayName username avatar",
    );

    // Always apply pagination
    query = query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);

    const books = await query.sort({ createdAt: -1 });

    // Get chapter counts and total word counts for each book
    const booksWithStats = await Promise.all(
      books.map(async (book) => {
        const chapterStats = await Chapter.aggregate([
          { $match: { book: book._id } },
          {
            $group: {
              _id: null,
              chapterCount: { $sum: 1 },
              totalWordCount: { $sum: "$wordCount" }
            }
          }
        ]);

        const stats = chapterStats[0] || { chapterCount: 0, totalWordCount: 0 };

        return {
          _id: book._id,
          author: book.author,
          title: book.title,
          synopsis: book.synopsis,
          genres: book.genres,
          visibility: book.visibility,
          coverImage: book.coverImage,
          likes: book.likes,
          isCompleted: book.isCompleted,
          createdAt: book.createdAt,
          updatedAt: book.updatedAt,
          chapterCount: stats.chapterCount,
          totalWordCount: stats.totalWordCount
        };
      })
    );

    return sendSuccess(res, HTTP.OK, "User books fetched successfully", { books: booksWithStats });
  } catch (err) {
    logError("Failed to fetch user books", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to fetch user books");
  }
};

const getOneUserBookByID = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid book ID");
    }

    const book = await UserBook.findById(id).populate(
      "author",
      "displayName username avatar",
    );

    if (!book) {
      return sendError(res, HTTP.NOT_FOUND, "User book not found");
    }

    // Check if user can access this book
    const canAccess = book.visibility === "public" || book.author._id.toString() === userId?.toString();

    if (!canAccess) {
      return sendError(res, HTTP.FORBIDDEN, "You do not have access to this book");
    }

    // Get chapters for this book
    const chapters = await Chapter.find({ book: id })
      .select('title chapterNumber visibility wordCount createdAt')
      .sort({ chapterNumber: 1 });

    // Filter chapters based on user permissions
    const filteredChapters = chapters.filter(chapter => {
      return chapter.visibility === "public" || book.author._id.toString() === userId?.toString();
    });

    const bookWithChapters = {
      _id: book._id,
      author: book.author,
      title: book.title,
      synopsis: book.synopsis,
      genres: book.genres,
      visibility: book.visibility,
      coverImage: book.coverImage,
      likes: book.likes,
      isCompleted: book.isCompleted,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      chapters: filteredChapters
    };

    return sendSuccess(res, HTTP.OK, "User book fetched successfully", { book: bookWithChapters });
  } catch (err) {
    logError("Failed to fetch user book", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to fetch user book");
  }
};

const createUserBook = async (req, res) => {
  try {
    // Check if req.body.data exists
    if (!req.body.data) {
      return sendError(res, HTTP.BAD_REQUEST, "Request data is required");
    }

    const { title, synopsis, genres, visibility = "private", coverImage } = req.body.data;
    const userId = req.user._id;

    if (!title) {
      return sendError(res, HTTP.BAD_REQUEST, "Title is required");
    }

    if (title.length > 500) {
      return sendError(res, HTTP.BAD_REQUEST, "Title cannot exceed 500 characters");
    }

    if (synopsis && synopsis.length > 1000) {
      return sendError(res, HTTP.BAD_REQUEST, "Synopsis cannot exceed 1000 characters");
    }

    const newBook = new UserBook({
      author: userId,
      title,
      synopsis,
      genres: genres || [],
      visibility,
      coverImage
    });

    const savedBook = await newBook.save();
    await savedBook.populate("author", "displayName username avatar");

    return sendSuccess(res, HTTP.CREATED, "User book created successfully", { book: savedBook });
  } catch (err) {
    logError("Failed to create user book", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to create user book");
  }
};

const updateUserBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if req.body.data exists
    if (!req.body.data) {
      return sendError(res, HTTP.BAD_REQUEST, "Request data is required");
    }

    const { title, synopsis, genres, visibility, coverImage, isCompleted } = req.body.data;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid book ID");
    }

    const book = await UserBook.findById(id);

    if (!book) {
      return sendError(res, HTTP.NOT_FOUND, "User book not found");
    }

    // Check if user is the author
    if (book.author.toString() !== userId.toString()) {
      return sendError(res, HTTP.FORBIDDEN, "You can only update your own books");
    }

    // Validate field lengths
    if (title && title.length > 500) {
      return sendError(res, HTTP.BAD_REQUEST, "Title cannot exceed 500 characters");
    }

    if (synopsis && synopsis.length > 1000) {
      return sendError(res, HTTP.BAD_REQUEST, "Synopsis cannot exceed 1000 characters");
    }

    // Check for visibility conflicts
    if (visibility === "private") {
      const hasPublicChapters = await Chapter.findOne({ book: id, visibility: "public" });
      if (hasPublicChapters) {
        return sendError(res, HTTP.BAD_REQUEST, "Cannot make book private while it has public chapters");
      }
    }

    // Check for completion without chapters
    if (isCompleted === true) {
      const chapterCount = await Chapter.countDocuments({ book: id });
      if (chapterCount === 0) {
        return sendError(res, HTTP.BAD_REQUEST, "Cannot mark book as completed without any chapters");
      }
    }

    // Update fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (synopsis !== undefined) updateData.synopsis = synopsis;
    if (genres !== undefined) updateData.genres = genres;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;

    const updatedBook = await UserBook.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("author", "displayName username avatar");

    return sendSuccess(res, HTTP.OK, "User book updated successfully", { book: updatedBook });
  } catch (err) {
    logError("Failed to update user book", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to update user book");
  }
};

const deleteUserBook = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid book ID");
    }

    const book = await UserBook.findById(id);

    if (!book) {
      return sendError(res, HTTP.NOT_FOUND, "User book not found");
    }

    // Check if user is the author
    if (book.author.toString() !== userId.toString()) {
      return sendError(res, HTTP.FORBIDDEN, "You can only delete your own books");
    }

    // Delete all chapters of this book
    await Chapter.deleteMany({ book: id });

    // Delete the book
    await UserBook.findByIdAndDelete(id);

    return sendSuccess(res, HTTP.OK, "User book and all chapters deleted successfully");
  } catch (err) {
    logError("Failed to delete user book", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to delete user book");
  }
};

const likeUserBook = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid book ID");
    }

    const book = await UserBook.findById(id);

    if (!book) {
      return sendError(res, HTTP.NOT_FOUND, "User book not found");
    }

    // Check if book is public
    if (book.visibility !== "public") {
      return sendError(res, HTTP.FORBIDDEN, "You can only like public books");
    }

    // Check if user is the author
    if (book.author.toString() === userId.toString()) {
      return sendError(res, HTTP.BAD_REQUEST, "You cannot like your own book");
    }

    const isLiked = book.likes.includes(userId);
    let updatedBook;

    if (isLiked) {
      // Unlike the book
      updatedBook = await UserBook.findByIdAndUpdate(
        id,
        { $pull: { likes: userId } },
        { new: true }
      );
      return sendSuccess(res, HTTP.OK, "Book unliked successfully", {
        liked: false,
        likeCount: updatedBook.likes.length
      });
    } else {
      // Like the book
      updatedBook = await UserBook.findByIdAndUpdate(
        id,
        { $addToSet: { likes: userId } },
        { new: true }
      );
      return sendSuccess(res, HTTP.OK, "Book liked successfully", {
        liked: true,
        likeCount: updatedBook.likes.length
      });
    }
  } catch (err) {
    logError("Failed to like/unlike user book", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to like/unlike user book");
  }
};

export const UserBookController = {
  getUserBooksList,
  getOneUserBookByID,
  createUserBook,
  updateUserBook,
  deleteUserBook,
  likeUserBook
};
