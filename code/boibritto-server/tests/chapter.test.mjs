import "dotenv/config";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../api/app.js";

describe("Chapter API", () => {
  let token;
  let createdBookId;
  let createdChapterId;
  let otherUserToken;

  beforeAll(() => {
    token = process.env.ID_TOKEN;
    otherUserToken = process.env.OTHER_USER_ID_TOKEN;
    if (!token) {
      throw new Error("Missing ID_TOKEN in environment variables.");
    }
  });

  afterAll(async () => {
    // Clean up created chapter and book
    if (createdChapterId) {
      await request(app)
        .delete(`/api/chapters/${createdChapterId}`)
        .set("Authorization", `Bearer ${token}`);
    }
    if (createdBookId) {
      await request(app)
        .delete(`/api/user-books/${createdBookId}`)
        .set("Authorization", `Bearer ${token}`);
    }
  });

  // First create a test book for chapter operations
  describe("Setup - Create Test Book", () => {
    it("should create a test book for chapter operations", async () => {
      const res = await request(app)
        .post("/api/user-books")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            title: "Test Book for Chapters",
            synopsis: "A book created for testing chapters",
            visibility: "public"
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      createdBookId = res.body.data.book._id;
    });
  });

  describe("POST /api/chapters", () => {
    it("should create a new chapter", async () => {
      const res = await request(app)
        .post("/api/chapters")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            bookId: createdBookId,
            title: "Chapter 1: The Beginning",
            content: "This is the first chapter of our test book. It contains some interesting content that will be used for testing purposes.",
            chapterNumber: 1,
            visibility: "public"
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Chapter created successfully");
      expect(res.body.data.chapter).toHaveProperty("_id");
      expect(res.body.data.chapter.title).toBe("Chapter 1: The Beginning");
      expect(res.body.data.chapter.chapterNumber).toBe(1);
      expect(res.body.data.chapter.visibility).toBe("public");
      expect(res.body.data.chapter.wordCount).toBeGreaterThan(0);

      createdChapterId = res.body.data.chapter._id;
    });

    it("should create a chapter with default visibility", async () => {
      const res = await request(app)
        .post("/api/chapters")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            bookId: createdBookId,
            title: "Chapter 2: The Journey",
            content: "This is the second chapter with default private visibility.",
            chapterNumber: 2
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.chapter.visibility).toBe("private");

      // Clean up this chapter
      await request(app)
        .delete(`/api/chapters/${res.body.data.chapter._id}`)
        .set("Authorization", `Bearer ${token}`);
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/chapters")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            bookId: createdBookId,
            title: "Chapter without content"
            // Missing content and chapterNumber
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("BookId, title, content, and chapterNumber are required");
    });

    it("should return 400 for invalid book ID", async () => {
      const res = await request(app)
        .post("/api/chapters")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            bookId: "invalidId123",
            title: "Test Chapter",
            content: "Test content",
            chapterNumber: 1
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid book ID");
    });

    it("should return 400 if title exceeds maximum length", async () => {
      const longTitle = "a".repeat(201);
      const res = await request(app)
        .post("/api/chapters")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            bookId: createdBookId,
            title: longTitle,
            content: "Test content",
            chapterNumber: 3
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Title cannot exceed 200 characters");
    });

    it("should return 400 if content exceeds maximum length", async () => {
      const longContent = "a".repeat(50001);
      const res = await request(app)
        .post("/api/chapters")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            bookId: createdBookId,
            title: "Test Chapter",
            content: longContent,
            chapterNumber: 3
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Content cannot exceed 50,000 characters");
    });

    it("should return 400 if chapter number already exists", async () => {
      const res = await request(app)
        .post("/api/chapters")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            bookId: createdBookId,
            title: "Duplicate Chapter",
            content: "This chapter has a duplicate number",
            chapterNumber: 1 // Same as the first chapter
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Chapter number already exists for this book");
    });

    it("should return 404 for non-existent book", async () => {
      const res = await request(app)
        .post("/api/chapters")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            bookId: "64f6a1cfc8f5550000000000",
            title: "Test Chapter",
            content: "Test content",
            chapterNumber: 1
          }
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Book not found");
    });

    it("should return 401 if token is missing", async () => {
      const res = await request(app)
        .post("/api/chapters")
        .send({
          data: {
            bookId: createdBookId,
            title: "Test Chapter",
            content: "Test content",
            chapterNumber: 3
          }
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/chapters/book/:bookId", () => {
    it("should fetch chapters for a book", async () => {
      const res = await request(app)
        .get(`/api/chapters/book/${createdBookId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Chapters fetched successfully");
      expect(Array.isArray(res.body.data.chapters)).toBe(true);

      const chapter = res.body.data.chapters[0];
      if (chapter) {
        expect(chapter).toHaveProperty("_id");
        expect(chapter).toHaveProperty("title");
        expect(chapter).toHaveProperty("chapterNumber");
        expect(chapter).toHaveProperty("visibility");
        expect(chapter).toHaveProperty("wordCount");
        expect(chapter).not.toHaveProperty("content"); // Content should be excluded
        expect(chapter.author).toHaveProperty("username");
      }
    });

    it("should filter chapters by published status", async () => {
      const res = await request(app)
        .get(`/api/chapters/book/${createdBookId}?published=true`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.chapters)).toBe(true);

      // All returned chapters should be public
      for (const chapter of res.body.data.chapters) {
        expect(chapter.visibility).toBe("public");
      }
    });

    it("should return 400 for invalid book ID", async () => {
      const res = await request(app)
        .get(`/api/chapters/book/invalidId123`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid book ID");
    });

    it("should return 404 for non-existent book", async () => {
      const res = await request(app)
        .get(`/api/chapters/book/64f6a1cfc8f5550000000000`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Book not found");
    });
  });

  describe("GET /api/chapters/:id", () => {
    it("should fetch a chapter by ID", async () => {
      const res = await request(app)
        .get(`/api/chapters/${createdChapterId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Chapter fetched successfully");
      expect(res.body.data.chapter).toHaveProperty("_id", createdChapterId);
      expect(res.body.data.chapter).toHaveProperty("title");
      expect(res.body.data.chapter).toHaveProperty("content"); // Full content should be included
      expect(res.body.data.chapter).toHaveProperty("book");
      expect(res.body.data.chapter.book).toHaveProperty("title");
    });

    it("should return 400 for invalid chapter ID", async () => {
      const res = await request(app)
        .get(`/api/chapters/invalidId123`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid chapter ID");
    });

    it("should return 404 for non-existent chapter", async () => {
      const res = await request(app)
        .get(`/api/chapters/64f6a1cfc8f5550000000000`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Chapter not found");
    });
  });

  describe("PATCH /api/chapters/:id", () => {
    it("should update a chapter", async () => {
      const res = await request(app)
        .patch(`/api/chapters/${createdChapterId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            title: "Updated Chapter 1: The New Beginning",
            content: "This is the updated content for the first chapter. It has been revised and improved with more details.",
            visibility: "public"
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Chapter updated successfully");
      expect(res.body.data.chapter.title).toBe("Updated Chapter 1: The New Beginning");
      expect(res.body.data.chapter.content).toContain("updated content");
      expect(res.body.data.chapter.wordCount).toBeGreaterThan(0);
    });

    it("should partially update a chapter", async () => {
      const res = await request(app)
        .patch(`/api/chapters/${createdChapterId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            title: "Partially Updated Chapter 1"
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.chapter.title).toBe("Partially Updated Chapter 1");
      // Content should remain the same from previous update
      expect(res.body.data.chapter.content).toContain("updated content");
    });

    it("should return 400 for invalid chapter ID", async () => {
      const res = await request(app)
        .patch(`/api/chapters/invalidId123`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            title: "Updated Title"
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid chapter ID");
    });

    it("should return 404 for non-existent chapter", async () => {
      const res = await request(app)
        .patch(`/api/chapters/64f6a1cfc8f5550000000000`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            title: "Updated Title"
          }
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Chapter not found");
    });

    it("should return 403 if user is not the author", async () => {
      if (!otherUserToken) {
        console.log("Skipping test: OTHER_USER_ID_TOKEN not available");
        return;
      }

      const res = await request(app)
        .patch(`/api/chapters/${createdChapterId}`)
        .set("Authorization", `Bearer ${otherUserToken}`)
        .send({
          data: {
            title: "Unauthorized Update"
          }
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("You can only update your own chapters");
    });

    it("should return 400 if title exceeds maximum length", async () => {
      const longTitle = "a".repeat(201);
      const res = await request(app)
        .patch(`/api/chapters/${createdChapterId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            title: longTitle
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Title cannot exceed 200 characters");
    });

    it("should return 400 if content exceeds maximum length", async () => {
      const longContent = "a".repeat(50001);
      const res = await request(app)
        .patch(`/api/chapters/${createdChapterId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            content: longContent
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Content cannot exceed 50,000 characters");
    });
  });

  describe("POST /api/chapters/:id/like", () => {
    it("should like a public chapter", async () => {
      if (!otherUserToken) {
        console.log("Skipping like test: OTHER_USER_ID_TOKEN not available");
        return;
      }

      const res = await request(app)
        .post(`/api/chapters/${createdChapterId}/like`)
        .set("Authorization", `Bearer ${otherUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Chapter liked successfully");
      expect(res.body.data.liked).toBe(true);
      expect(res.body.data.likeCount).toBeGreaterThan(0);
    });

    it("should unlike a previously liked chapter", async () => {
      if (!otherUserToken) {
        console.log("Skipping unlike test: OTHER_USER_ID_TOKEN not available");
        return;
      }

      const res = await request(app)
        .post(`/api/chapters/${createdChapterId}/like`)
        .set("Authorization", `Bearer ${otherUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Chapter unliked successfully");
      expect(res.body.data.liked).toBe(false);
    });

    it("should return 400 if author tries to like their own chapter", async () => {
      const res = await request(app)
        .post(`/api/chapters/${createdChapterId}/like`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("You cannot like your own chapter");
    });

    it("should return 400 for invalid chapter ID", async () => {
      const res = await request(app)
        .post(`/api/chapters/invalidId123/like`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid chapter ID");
    });

    it("should return 404 for non-existent chapter", async () => {
      const res = await request(app)
        .post(`/api/chapters/64f6a1cfc8f5550000000000/like`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Chapter not found");
    });
  });

  describe("DELETE /api/chapters/:id", () => {
    it("should return 403 if user is not the author", async () => {
      if (!otherUserToken) {
        console.log("Skipping delete authorization test: OTHER_USER_ID_TOKEN not available");
        return;
      }

      const res = await request(app)
        .delete(`/api/chapters/${createdChapterId}`)
        .set("Authorization", `Bearer ${otherUserToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("You can only delete your own chapters");
    });

    it("should return 400 for invalid chapter ID", async () => {
      const res = await request(app)
        .delete(`/api/chapters/invalidId123`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid chapter ID");
    });

    it("should return 404 for non-existent chapter", async () => {
      const res = await request(app)
        .delete(`/api/chapters/64f6a1cfc8f5550000000000`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Chapter not found");
    });

    it("should delete a chapter by ID", async () => {
      const res = await request(app)
        .delete(`/api/chapters/${createdChapterId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Chapter deleted successfully");

      // Clear the ID so afterAll doesn't try to delete again
      createdChapterId = null;
    });

    it("should return 401 if token is missing", async () => {
      const res = await request(app)
        .delete(`/api/chapters/64f6a1cfc8f5550000000000`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed request data", async () => {
      const res = await request(app)
        .post("/api/chapters")
        .set("Authorization", `Bearer ${token}`)
        .send({
          invalidData: {
            title: "Test"
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Request data is required");
    });

    it("should handle invalid authorization header", async () => {
      const res = await request(app)
        .get(`/api/chapters/book/${createdBookId}`)
        .set("Authorization", "InvalidToken");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
