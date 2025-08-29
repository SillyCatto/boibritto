import "dotenv/config";
import request from "supertest";
import { describe, it, expect, beforeAll } from "vitest";
import app from "../api/app.js";

const API_BASE = "/api/reports";

describe("Report API", () => {
  let token;
  let discussionId;

  beforeAll(async () => {
    token = process.env.ID_TOKEN;
    if (!token) throw new Error("Missing ID_TOKEN in environment variables.");

    // Get a discussion ID to use for testing reports
    const discussionsRes = await request(app)
      .get("/api/discussions")
      .set("Authorization", `Bearer ${token}`);

    if (discussionsRes.body.data.discussions.length > 0) {
      discussionId = discussionsRes.body.data.discussions[0]._id;
    }
  });

  describe("POST /api/reports", () => {
    it("should successfully submit a report", async () => {
      if (!discussionId) {
        console.log("Skipping test - no discussion available to report");
        return;
      }

      const reportData = {
        reportType: "discussion",
        targetId: discussionId,
        reason: "spam",
        description: "This is spam content",
      };

      const response = await request(app)
        .post(API_BASE)
        .set("Authorization", `Bearer ${token}`)
        .send(reportData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Report submitted successfully");
      expect(response.body.data).toHaveProperty("reportId");
      expect(response.body.data.reportType).toBe("discussion");
      expect(response.body.data.reason).toBe("spam");
      expect(response.body.data.status).toBe("pending");
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post(API_BASE)
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Report type, target ID, and reason are required"
      );
    });

    it("should validate report type", async () => {
      const reportData = {
        reportType: "invalid_type",
        targetId: "507f1f77bcf86cd799439011",
        reason: "spam",
      };

      const response = await request(app)
        .post(API_BASE)
        .set("Authorization", `Bearer ${token}`)
        .send(reportData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid report type");
    });

    it("should validate reason", async () => {
      const reportData = {
        reportType: "discussion",
        targetId: "507f1f77bcf86cd799439011",
        reason: "invalid_reason",
      };

      const response = await request(app)
        .post(API_BASE)
        .set("Authorization", `Bearer ${token}`)
        .send(reportData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid reason");
    });
  });

  describe("GET /api/reports/my-reports", () => {
    it("should fetch user's reports with pagination", async () => {
      const response = await request(app)
        .get(`${API_BASE}/my-reports`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Reports retrieved successfully");
      expect(Array.isArray(response.body.data.reports)).toBe(true);
      expect(response.body.data.pagination).toHaveProperty("currentPage");
      expect(response.body.data.pagination).toHaveProperty("totalReports");
    });

    it("should validate status filter", async () => {
      const response = await request(app)
        .get(`${API_BASE}/my-reports?status=invalid_status`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid status filter");
    });

    it("should validate report type filter", async () => {
      const response = await request(app)
        .get(`${API_BASE}/my-reports?reportType=invalid_type`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid report type filter");
    });

    it("should handle pagination parameters", async () => {
      const response = await request(app)
        .get(`${API_BASE}/my-reports?page=1&limit=5`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.reports.length).toBeLessThanOrEqual(5);
    });

    it("should filter by valid status", async () => {
      const response = await request(app)
        .get(`${API_BASE}/my-reports?status=pending`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(
        response.body.data.reports.every(
          (report) => report.status === "pending"
        )
      ).toBe(true);
    });

    it("should filter by valid report type", async () => {
      const response = await request(app)
        .get(`${API_BASE}/my-reports?reportType=discussion`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(
        response.body.data.reports.every(
          (report) => report.reportType === "discussion"
        )
      ).toBe(true);
    });
  });
});
