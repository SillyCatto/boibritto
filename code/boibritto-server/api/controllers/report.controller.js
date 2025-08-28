import Report from "../models/report.models.js";
import Collection from "../models/collection.models.js";
import Blog from "../models/blog.models.js";
import Discussion from "../models/discussion.models.js";
import Comment from "../models/comment.models.js";
import UserBook from "../models/userBook.models.js";
import User from "../models/user.models.js";
import { sendSuccess, sendError } from "../utils/response.js";
import HTTP from "../utils/httpStatus.js";
import { logError } from "../utils/logger.js";

// Helper function to validate if target exists
const validateTarget = async (reportType, targetId) => {
  let model;
  switch (reportType) {
    case "collection":
      model = Collection;
      break;
    case "blog":
      model = Blog;
      break;
    case "discussion":
      model = Discussion;
      break;
    case "comment":
      model = Comment;
      break;
    case "userbook":
      model = UserBook;
      break;
    case "user":
      model = User;
      break;
    default:
      return false;
  }

  const target = await model.findById(targetId);
  return !!target;
};

const submitReport = async (req, res) => {
  try {
    const { reportType, targetId, reason, description } = req.body;
    const reporterId = req.user._id;

    // Validate required fields
    if (!reportType || !targetId || !reason) {
      return sendError(
        res,
        HTTP.BAD_REQUEST,
        "Report type, target ID, and reason are required"
      );
    }

    // Validate report type
    const validReportTypes = [
      "collection",
      "blog",
      "discussion",
      "comment",
      "userbook",
      "user",
    ];
    if (!validReportTypes.includes(reportType)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid report type");
    }

    // Validate reason
    const validReasons = [
      "spam",
      "harassment",
      "hate_speech",
      "violence",
      "adult_content",
      "copyright_violation",
      "misinformation",
      "self_harm",
      "bullying",
      "impersonation",
      "other",
    ];
    if (!validReasons.includes(reason)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid reason");
    }

    // Check if target exists
    const targetExists = await validateTarget(reportType, targetId);
    if (!targetExists) {
      return sendError(res, HTTP.NOT_FOUND, "Target content not found");
    }

    // Check for existing report from same user
    const existingReport = await Report.findOne({
      reporter: reporterId,
      reportType,
      targetId,
    });

    if (existingReport) {
      return sendError(
        res,
        HTTP.CONFLICT,
        "You have already reported this content"
      );
    }

    // Create new report
    const reportData = {
      reporter: reporterId,
      reportType,
      targetId,
      reason,
      description: description?.trim() || undefined,
    };

    const newReport = await Report.create(reportData);

    // Populate reporter info for response
    await newReport.populate("reporter", "_id username displayName");

    return sendSuccess(res, HTTP.CREATED, "Report submitted successfully", {
      reportId: newReport._id,
      reportType: newReport.reportType,
      targetId: newReport.targetId,
      reason: newReport.reason,
      description: newReport.description,
      reportedBy: newReport.reporter._id,
      status: newReport.status,
      createdAt: newReport.createdAt,
    });
  } catch (err) {
    logError("Failed to submit report", err);
    return sendError(
      res,
      HTTP.INTERNAL_SERVER_ERROR,
      "Failed to submit report"
    );
  }
};

const getUserReports = async (req, res) => {
  try {
    const reporterId = req.user._id;
    const { page = 1, limit = 10, status, reportType } = req.query;

    // Validate and sanitize pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = { reporter: reporterId };

    if (status) {
      const validStatuses = [
        "pending",
        "under_review",
        "action_taken",
        "dismissed",
      ];
      if (validStatuses.includes(status)) {
        filter.status = status;
      } else {
        return sendError(res, HTTP.BAD_REQUEST, "Invalid status filter");
      }
    }

    if (reportType) {
      const validReportTypes = [
        "collection",
        "blog",
        "discussion",
        "comment",
        "userbook",
        "user",
      ];
      if (validReportTypes.includes(reportType)) {
        filter.reportType = reportType;
      } else {
        return sendError(res, HTTP.BAD_REQUEST, "Invalid report type filter");
      }
    }

    // Get total count for pagination
    const totalReports = await Report.countDocuments(filter);
    const totalPages = Math.ceil(totalReports / limitNum);

    // Fetch reports
    const reports = await Report.find(filter)
      .select(
        "_id reportType targetId reason description status createdAt updatedAt"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return sendSuccess(res, HTTP.OK, "Reports retrieved successfully", {
      reports,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalReports,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    logError("Failed to fetch user reports", err);
    return sendError(
      res,
      HTTP.INTERNAL_SERVER_ERROR,
      "Failed to fetch reports"
    );
  }
};

export const ReportController = {
  submitReport,
  getUserReports,
};
