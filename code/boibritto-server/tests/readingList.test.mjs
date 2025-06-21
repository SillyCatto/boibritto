require("dotenv").config();

import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../api/app.js";

describe("Reading List API", () => {
  let token;
  let createdItemId;

  beforeAll(async () => {
    token = process.env.ID_TOKEN;
    if (!token) {
      throw new Error("Missing ID_TOKEN in environment variables.");
    }
  });

  afterAll(async () => {
    // Clean up created reading list item
    if (createdItemId) {
      await request(app)
        .delete(`/api/reading-list/${createdItemId}`)
        .set("Authorization", `Bearer ${token}`);
    }
  });

  describe("GET /api/reading-list/me", () => {
    it("should fetch the authenticated user's reading list", async () => {
      const res = await request(app)
        .get("/api/reading-list/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe(
        "Reading list for current user fetched successfully",
      );
      expect(Array.isArray(res.body.data.readingList)).toBe(true);
    });

    it("should return 401 if token is missing", async () => {
      const res = await request(app).get("/api/reading-list/me");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/reading-list/:userID", () => {
    it("should fetch public reading list items of a user", async () => {
      // Use the authenticated user's ID for a valid test
      const meRes = await request(app)
        .get("/api/reading-list/me")
        .set("Authorization", `Bearer ${token}`);
      const myList = meRes.body.data.readingList;
      const myUserId = myList[0]?.user || null;
      if (!myUserId) return;

      const res = await request(app)
        .get(`/api/reading-list/${myUserId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.readingList)).toBe(true);
    });
  });

  describe("POST /api/reading-list", () => {
    it("should add a book to the reading list", async () => {
      const res = await request(app)
        .post("/api/reading-list")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            volumeId: "test-google-book-id",
            status: "reading",
            startedAt: "2025-06-01T00:00:00.000Z",
            visibility: "private",
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Book added to reading list successfully");
      expect(Array.isArray(res.body.data.readingList)).toBe(true);

      // Find the created item
      const item = res.body.data.readingList.find(
        (i) => i.volumeId === "test-google-book-id",
      );
      expect(item).toBeDefined();
      expect(item.status).toBe("reading");
      expect(item.visibility).toBe("private");
      createdItemId = item._id;
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/reading-list")
        .set("Authorization", `Bearer ${token}`)
        .send({ data: { status: "interested" } }); // missing volumeId

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 409 Conflict if book already exists in reading list", async () => {
      // add a book first
      const firstRes = await request(app)
        .post("/api/reading-list")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            volumeId: "duplicate-book-id",
            status: "interested",
            visibility: "private",
          },
        });

      expect(firstRes.status).toBe(200);

      // try adding same book again
      const secondRes = await request(app)
        .post("/api/reading-list")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            volumeId: "duplicate-book-id",
            status: "interested",
          },
        });

      expect(secondRes.status).toBe(409);
      expect(secondRes.body.success).toBe(false);

      // Cleanup
      const created = firstRes.body.data?.readingList?.find(
        (i) => i.volumeId === "duplicate-book-id",
      );
      if (created) {
        await request(app)
          .delete(`/api/reading-list/${created._id}`)
          .set("Authorization", `Bearer ${token}`);
      }
    });

    it("should return 400 if 'reading' status is missing startedAt", async () => {
      const res = await request(app)
        .post("/api/reading-list")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            volumeId: "missing-startedAt",
            status: "reading",
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(
        "startedAt date is required when status is 'reading'",
      );
    });

    it("should return 400 if status is 'completed' but missing completedAt", async () => {
      const res = await request(app)
        .post("/api/reading-list")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            volumeId: "test-invalid-completed-book",
            status: "completed",
            startedAt: "2025-06-01T00:00:00.000Z",
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 if completedAt is before startedAt", async () => {
      const res = await request(app)
        .post("/api/reading-list")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            volumeId: "invalid-date-sequence-book",
            status: "completed",
            startedAt: "2025-06-05T00:00:00.000Z",
            completedAt: "2025-06-01T00:00:00.000Z", // before startedAt
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(
        "completedAt cannot be earlier than startedAt",
      );
    });
  });

  //---------
  describe("PATCH /api/reading-list/:id", () => {
    it("should update a reading list item", async () => {
      const res = await request(app)
        .patch(`/api/reading-list/${createdItemId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            status: "completed",
            startedAt: "2025-06-01T00:00:00.000Z",
            completedAt: "2025-06-05T00:00:00.000Z",
            visibility: "friends",
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Reading list updated successfully");
      expect(Array.isArray(res.body.data.readingList)).toBe(true);

      const updated = res.body.data.readingList.find(
        (i) => i._id === createdItemId,
      );
      expect(updated.status).toBe("completed");
      expect(updated.visibility).toBe("friends");
    });

    it("should return 400 for invalid reading list item ID", async () => {
      const res = await request(app)
        .patch(`/api/reading-list/invalidId123`)
        .set("Authorization", `Bearer ${token}`)
        .send({ data: { status: "completed" } });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 if completedAt is before startedAt during update", async () => {
      // First, create a valid entry
      const createRes = await request(app)
        .post("/api/reading-list")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            volumeId: "update-bad-date-book",
            status: "reading",
            startedAt: "2025-06-10T00:00:00.000Z",
          },
        });

      const itemId = createRes.body.data.readingList.find(
        (i) => i.volumeId === "update-bad-date-book",
      )._id;

      // Try to update with invalid dates
      const res = await request(app)
        .patch(`/api/reading-list/${itemId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            status: "completed",
            startedAt: "2025-06-10T00:00:00.000Z",
            completedAt: "2025-06-01T00:00:00.000Z",
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(
        "completedAt cannot be earlier than startedAt",
      );

      // Cleanup
      await request(app)
        .delete(`/api/reading-list/${itemId}`)
        .set("Authorization", `Bearer ${token}`);
    });
  });

  describe("DELETE /api/reading-list/:id", () => {
    it("should delete a reading list item by ID", async () => {
      const res = await request(app)
        .delete(`/api/reading-list/${createdItemId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Reading list item deleted successfully");

      // Clear the ID so afterAll doesn't try to delete again
      createdItemId = null;
    });

    it("should return 404 if item does not exist", async () => {
      const res = await request(app)
        .delete(`/api/reading-list/64f6a1cfc8f5550000000000`)
        .set("Authorization", `Bearer ${token}`);

      expect([400, 404]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });
});
