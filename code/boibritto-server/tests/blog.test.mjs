import "dotenv/config";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../api/app.js";

describe("Blog API", () => {
  let token;
  let createdBlogId;

  beforeAll(() => {
    token = process.env.ID_TOKEN;
    if (!token) {
      throw new Error("Missing ID_TOKEN in environment variables.");
    }
  });

  afterAll(async () => {
    // Clean up created blog
    if (createdBlogId) {
      await request(app)
        .delete(`/api/blogs/${createdBlogId}`)
        .set("Authorization", `Bearer ${token}`);
    }
  });

  describe("GET /api/blogs", () => {
    it("should fetch all public blogs with pagination", async () => {
      const res = await request(app)
        .get("/api/blogs")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Blogs fetched successfully");
      expect(Array.isArray(res.body.data.blogs)).toBe(true);

      const blog = res.body.data.blogs[0];
      if (blog) {
        expect(blog).toHaveProperty("_id");
        expect(blog).toHaveProperty("title");
        expect(blog).toHaveProperty("content");
        expect(blog).toHaveProperty("visibility", "public");
        expect(blog.user).toHaveProperty("username");
        expect(blog.user).toHaveProperty("displayName");
      }
    });

    it("should fetch only the authenticated user's blogs when author=me", async () => {
      const res = await request(app)
        .get("/api/blogs?author=me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.blogs)).toBe(true);

      for (const blog of res.body.data.blogs) {
        expect(blog.user).toBeDefined();
        expect(blog.user._id).toBeDefined();
      }
    });

    it("should return 401 if token is missing", async () => {
      const res = await request(app).get("/api/blogs");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/blogs", () => {
    it("should create a new blog", async () => {
      const res = await request(app)
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            title: "Test Blog",
            content: "This is a test blog post.",
            visibility: "private",
            spoilerAlert: false,
            genres: [],
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Blog created successfully");
      expect(res.body.data.blog).toHaveProperty("_id");
      expect(res.body.data.blog.title).toBe("Test Blog");

      createdBlogId = res.body.data.blog._id; // Save for patch/delete
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send({}); // Missing required fields

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/blogs/:id", () => {
    it("should fetch a blog by ID", async () => {
      const res = await request(app)
        .get(`/api/blogs/${createdBlogId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Blog fetched successfully");
      expect(res.body.data.blog).toHaveProperty("_id", createdBlogId);
    });

    it("should return 400 for invalid blog ID", async () => {
      const res = await request(app)
        .get(`/api/blogs/invalidId123`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PATCH /api/blogs/:id", () => {
    it("should update an existing blog", async () => {
      const res = await request(app)
        .patch(`/api/blogs/${createdBlogId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            title: "Updated Test Blog",
            content: "Updated content",
            visibility: "friends",
            spoilerAlert: true,
            genres: [],
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Blog updated successfully");
      expect(res.body.data.blog.title).toBe("Updated Test Blog");
    });

    it("should return 400 for invalid blog ID", async () => {
      const res = await request(app)
        .patch(`/api/blogs/invalidId123`)
        .set("Authorization", `Bearer ${token}`)
        .send({ data: { title: "Doesn't Matter" } });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("DELETE /api/blogs/:id", () => {
    it("should delete a blog by ID", async () => {
      const res = await request(app)
        .delete(`/api/blogs/${createdBlogId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Blog deleted successfully");

      // Clear the ID so afterAll doesn't try to delete again
      createdBlogId = null;
    });

    it("should return 404 if blog does not exist", async () => {
      const res = await request(app)
        .delete(`/api/blogs/64f6a1cfc8f5550000000000`)
        .set("Authorization", `Bearer ${token}`);

      expect([400, 404]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });
});
