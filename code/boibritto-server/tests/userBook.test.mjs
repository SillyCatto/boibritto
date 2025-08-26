import "dotenv/config";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../api/app.js";

describe("User Book API", () => {
  let token;
  let createdBookId;
  let otherUserToken;

  beforeAll(() => {
    token = process.env.ID_TOKEN;
    otherUserToken = process.env.OTHER_USER_ID_TOKEN; // For testing access permissions
    if (!token) {
      throw new Error("Missing ID_TOKEN in environment variables.");
    }
  });

  afterAll(async () => {
    // Clean up created book
    if (createdBookId) {
      await request(app)
        .delete(`/api/user-books/${createdBookId}`)
        .set("Authorization", `Bearer ${token}`);
    }
  });

  describe("GET /api/user-books", () => {
    it("should fetch all public user books with pagination", async () => {
      const res = await request(app)
        .get("/api/user-books")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("User books fetched successfully");
      expect(Array.isArray(res.body.data.books)).toBe(true);

      const book = res.body.data.books[0];
      if (book) {
        expect(book).toHaveProperty("_id");
        expect(book).toHaveProperty("title");
        expect(book).toHaveProperty("synopsis");
        expect(book).toHaveProperty("genres");
        expect(book).toHaveProperty("visibility", "public");
        expect(book).toHaveProperty("chapterCount");
        expect(book).toHaveProperty("totalWordCount");
        expect(book.author).toHaveProperty("username");
        expect(book.author).toHaveProperty("displayName");
      }
    });

    it("should fetch only the authenticated user's books when author=me", async () => {
      const res = await request(app)
        .get("/api/user-books?author=me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.books)).toBe(true);

      for (const book of res.body.data.books) {
        expect(book.author).toBeDefined();
        expect(book.author._id).toBeDefined();
      }
    });

    it("should filter books by genre", async () => {
      const res = await request(app)
        .get("/api/user-books?genre=fiction")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.books)).toBe(true);

      for (const book of res.body.data.books) {
        expect(book.genres).toContain("fiction");
      }
    });

    it("should filter books by completion status", async () => {
      const res = await request(app)
        .get("/api/user-books?completed=true")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.books)).toBe(true);

      for (const book of res.body.data.books) {
        expect(book.isCompleted).toBe(true);
      }
    });

    it("should search books by title", async () => {
      const res = await request(app)
        .get("/api/user-books?search=test")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.books)).toBe(true);
    });

    it("should return 401 if token is missing", async () => {
      const res = await request(app).get("/api/user-books");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/user-books", () => {
    it("should create a new user book", async () => {
      const res = await request(app)
        .post("/api/user-books")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            title: "Test Book",
            synopsis: "This is a test book for testing purposes",
            genres: ["fiction", "drama"],
            visibility: "private",
            coverImage: "https://example.com/cover.jpg"
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("User book created successfully");
      expect(res.body.data.book).toHaveProperty("_id");
      expect(res.body.data.book.title).toBe("Test Book");
      expect(res.body.data.book.synopsis).toBe("This is a test book for testing purposes");
      expect(res.body.data.book.genres).toEqual(["fiction", "drama"]);
      expect(res.body.data.book.visibility).toBe("private");
      expect(res.body.data.book.isCompleted).toBe(false);

      createdBookId = res.body.data.book._id; // Save for other tests
    });

    it("should create a book with default values", async () => {
      const res = await request(app)
        .post("/api/user-books")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            title: "Minimal Test Book"
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.book.title).toBe("Minimal Test Book");
      expect(res.body.data.book.visibility).toBe("private");
      expect(res.body.data.book.genres).toEqual([]);
      expect(res.body.data.book.isCompleted).toBe(false);

      // Clean up this book
      await request(app)
        .delete(`/api/user-books/${res.body.data.book._id}`)
        .set("Authorization", `Bearer ${token}`);
    });

    it("should return 400 if title is missing", async () => {
      const res = await request(app)
        .post("/api/user-books")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            synopsis: "Book without title"
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Title is required");
    });

    it("should return 400 if title exceeds maximum length", async () => {
      const longTitle = "a".repeat(501); // Exceeds 500 character limit
      const res = await request(app)
        .post("/api/user-books")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            title: longTitle
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Title cannot exceed 500 characters");
    });

    it("should return 400 if synopsis exceeds maximum length", async () => {
      const longSynopsis = "a".repeat(1001); // Exceeds 1000 character limit
      const res = await request(app)
        .post("/api/user-books")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            title: "Test Book",
            synopsis: longSynopsis
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Synopsis cannot exceed 1000 characters");
    });

    it("should return 401 if token is missing", async () => {
      const res = await request(app)
        .post("/api/user-books")
        .send({
          data: {
            title: "Test Book"
          }
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/user-books/:id", () => {
    it("should fetch a user book by ID", async () => {
      const res = await request(app)
        .get(`/api/user-books/${createdBookId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("User book fetched successfully");
      expect(res.body.data.book).toHaveProperty("_id", createdBookId);
      expect(res.body.data.book).toHaveProperty("title");
      expect(res.body.data.book).toHaveProperty("chapters");
      expect(Array.isArray(res.body.data.book.chapters)).toBe(true);
    });

    it("should return 400 for invalid book ID", async () => {
      const res = await request(app)
        .get(`/api/user-books/invalidId123`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid book ID");
    });

    it("should return 404 for non-existent book", async () => {
      const res = await request(app)
        .get(`/api/user-books/64f6a1cfc8f5550000000000`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("User book not found");
    });
  });

  describe("PATCH /api/user-books/:id", () => {
    it("should update an existing user book", async () => {
      const res = await request(app)
        .patch(`/api/user-books/${createdBookId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            title: "Updated Test Book",
            synopsis: "Updated synopsis for testing",
            genres: ["fiction", "mystery"],
            visibility: "public"
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("User book updated successfully");
      expect(res.body.data.book.title).toBe("Updated Test Book");
      expect(res.body.data.book.synopsis).toBe("Updated synopsis for testing");
      expect(res.body.data.book.genres).toEqual(["fiction", "mystery"]);
      expect(res.body.data.book.visibility).toBe("public");
    });

    it("should partially update a user book", async () => {
      const res = await request(app)
        .patch(`/api/user-books/${createdBookId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            synopsis: "Only updating synopsis"
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.book.synopsis).toBe("Only updating synopsis");
      expect(res.body.data.book.title).toBe("Updated Test Book"); // Should remain unchanged
    });

    it("should return 400 for invalid book ID", async () => {
      const res = await request(app)
        .patch(`/api/user-books/invalidId123`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            title: "Doesn't Matter"
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid book ID");
    });

    it("should return 404 for non-existent book", async () => {
      const res = await request(app)
        .patch(`/api/user-books/64f6a1cfc8f5550000000000`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            title: "Updated Title"
          }
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("User book not found");
    });

    it("should return 403 if user is not the author", async () => {
      if (!otherUserToken) {
        console.log("Skipping test: OTHER_USER_ID_TOKEN not available");
        return;
      }

      const res = await request(app)
        .patch(`/api/user-books/${createdBookId}`)
        .set("Authorization", `Bearer ${otherUserToken}`)
        .send({
          data: {
            title: "Unauthorized Update"
          }
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("You can only update your own books");
    });

    it("should return 400 if title exceeds maximum length", async () => {
      const longTitle = "a".repeat(501);
      const res = await request(app)
        .patch(`/api/user-books/${createdBookId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            title: longTitle
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Title cannot exceed 500 characters");
    });

    it("should return 400 if synopsis exceeds maximum length", async () => {
      const longSynopsis = "a".repeat(1001);
      const res = await request(app)
        .patch(`/api/user-books/${createdBookId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            synopsis: longSynopsis
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Synopsis cannot exceed 1000 characters");
    });

    it("should return 400 when trying to mark book as completed without chapters", async () => {
      const res = await request(app)
        .patch(`/api/user-books/${createdBookId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            isCompleted: true
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Cannot mark book as completed without any chapters");
    });
  });

  describe("POST /api/user-books/:id/like", () => {
    it("should like a public user book", async () => {
      // First, make sure the book is public
      await request(app)
        .patch(`/api/user-books/${createdBookId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            visibility: "public"
          }
        });

      if (!otherUserToken) {
        console.log("Skipping like test: OTHER_USER_ID_TOKEN not available");
        return;
      }

      const res = await request(app)
        .post(`/api/user-books/${createdBookId}/like`)
        .set("Authorization", `Bearer ${otherUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Book liked successfully");
      expect(res.body.data.liked).toBe(true);
      expect(res.body.data.likeCount).toBeGreaterThan(0);
    });

    it("should unlike a previously liked book", async () => {
      if (!otherUserToken) {
        console.log("Skipping unlike test: OTHER_USER_ID_TOKEN not available");
        return;
      }

      const res = await request(app)
        .post(`/api/user-books/${createdBookId}/like`)
        .set("Authorization", `Bearer ${otherUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Book unliked successfully");
      expect(res.body.data.liked).toBe(false);
    });

    it("should return 400 if author tries to like their own book", async () => {
      const res = await request(app)
        .post(`/api/user-books/${createdBookId}/like`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("You cannot like your own book");
    });

    it("should return 400 for invalid book ID", async () => {
      const res = await request(app)
        .post(`/api/user-books/invalidId123/like`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid book ID");
    });

    it("should return 404 for non-existent book", async () => {
      const res = await request(app)
        .post(`/api/user-books/64f6a1cfc8f5550000000000/like`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("User book not found");
    });
  });

  describe("DELETE /api/user-books/:id", () => {
    it("should return 403 if user is not the author", async () => {
      if (!otherUserToken) {
        console.log("Skipping delete authorization test: OTHER_USER_ID_TOKEN not available");
        return;
      }

      const res = await request(app)
        .delete(`/api/user-books/${createdBookId}`)
        .set("Authorization", `Bearer ${otherUserToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("You can only delete your own books");
    });

    it("should return 400 for invalid book ID", async () => {
      const res = await request(app)
        .delete(`/api/user-books/invalidId123`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid book ID");
    });

    it("should return 404 for non-existent book", async () => {
      const res = await request(app)
        .delete(`/api/user-books/64f6a1cfc8f5550000000000`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("User book not found");
    });

    it("should delete a user book by ID", async () => {
      const res = await request(app)
        .delete(`/api/user-books/${createdBookId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("User book and all chapters deleted successfully");

      // Clear the ID so afterAll doesn't try to delete again
      createdBookId = null;
    });

    it("should return 401 if token is missing", async () => {
      const res = await request(app)
        .delete(`/api/user-books/64f6a1cfc8f5550000000000`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed request data", async () => {
      const res = await request(app)
        .post("/api/user-books")
        .set("Authorization", `Bearer ${token}`)
        .send({
          invalidData: {
            title: "Test"
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should handle invalid authorization header", async () => {
      const res = await request(app)
        .get("/api/user-books")
        .set("Authorization", "InvalidToken");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
