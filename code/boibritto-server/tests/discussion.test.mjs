import "dotenv/config";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../api/app.js";

const API_BASE = "/api/discussions";

describe("Discussion API", () => {
  let token;
  let createdDiscussionId;
  let publicDiscussionId;

  beforeAll(async () => {
    token = process.env.ID_TOKEN;
    if (!token) throw new Error("Missing ID_TOKEN in environment variables.");
    // Get a public discussion ID for tests
    const res = await request(app)
      .get(API_BASE)
      .set("Authorization", `Bearer ${token}`);
    publicDiscussionId = res.body.data.discussions[0]?._id;
  });

  afterAll(async () => {
    // Clean up created discussion
    if (createdDiscussionId) {
      await request(app)
        .delete(`${API_BASE}/${createdDiscussionId}`)
        .set("Authorization", `Bearer ${token}`);
    }
  });

  describe("GET /api/discussions", () => {
    it("should fetch all public discussions with pagination", async () => {
      const res = await request(app)
        .get(API_BASE)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Discussions fetched successfully");
      expect(Array.isArray(res.body.data.discussions)).toBe(true);

      const discussion = res.body.data.discussions[0];
      if (discussion) {
        expect(discussion).toHaveProperty("_id");
        expect(discussion).toHaveProperty("title");
        expect(discussion).toHaveProperty("visibility", "public");
        expect(discussion.user).toHaveProperty("username");
        expect(discussion.user).toHaveProperty("displayName");
      }
    });

    it("should fetch only the authenticated user's discussions when author=me", async () => {
      const res = await request(app)
        .get(`${API_BASE}?author=me`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.discussions)).toBe(true);

      for (const discussion of res.body.data.discussions) {
        expect(discussion.user).toBeDefined();
        expect(discussion.user._id).toBeDefined();
      }
    });

    it("should return 401 if token is missing", async () => {
      const res = await request(app).get(API_BASE);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/discussions/:id", () => {
    it("should fetch a public discussion by ID", async () => {
      if (!publicDiscussionId) return;
      const res = await request(app)
        .get(`${API_BASE}/${publicDiscussionId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.discussion).toBeDefined();
      expect(res.body.data.discussion.content).toBeDefined();
      expect(res.body.data.discussion.visibility).toBe("public");
    });

    it("should return 404 for non-existent discussion ID", async () => {
      const fakeId = "123456789012345678901234";
      const res = await request(app)
        .get(`${API_BASE}/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);
      expect([400, 404]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it("should return 500 for invalid discussion ID format", async () => {
      const res = await request(app)
        .get(`${API_BASE}/invalid_id`)
        .set("Authorization", `Bearer ${token}`);
      expect([400, 500]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 if token is missing", async () => {
      if (!publicDiscussionId) return;
      const res = await request(app)
        .get(`${API_BASE}/${publicDiscussionId}`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return populated user data", async () => {
      if (!publicDiscussionId) return;
      const res = await request(app)
        .get(`${API_BASE}/${publicDiscussionId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      const user = res.body.data.discussion.user;
      expect(user).toBeDefined();
      expect(user._id).toBeDefined();
      expect(user.username).toBeDefined();
      expect(user.displayName).toBeDefined();
      expect(user.avatar).toBeDefined();
    });
  });

  // ...
});