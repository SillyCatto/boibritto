import request from "supertest";
import app from "../api/app.js";

const API_BASE = "/api/discussions";

describe("Discussion API Tests", () => {
  let token;

  beforeAll(async () => {
    // Set up authentication token from environment
    token = process.env.ID_TOKEN;
  });

  describe("GET /api/discussions", () => {
    it("should fetch all public discussions successfully", async () => {
      const res = await request(app)
        .get(API_BASE)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("message", "Discussions fetched successfully");
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("discussions");
      expect(Array.isArray(res.body.data.discussions)).toBe(true);
    });

    it("should return discussions with correct structure", async () => {
      const res = await request(app)
        .get(API_BASE)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      if (res.body.data.discussions.length > 0) {
        const discussion = res.body.data.discussions[0];

        expect(discussion).toHaveProperty("_id");
        expect(discussion).toHaveProperty("title");
        expect(discussion).toHaveProperty("visibility", "public");
        expect(discussion).toHaveProperty("spoilerAlert");
        expect(discussion).toHaveProperty("genres");
        expect(discussion).toHaveProperty("createdAt");
        expect(discussion).toHaveProperty("updatedAt");

        // Check user population
        expect(discussion).toHaveProperty("user");
        expect(discussion.user).toHaveProperty("_id");
        expect(discussion.user).toHaveProperty("username");
        expect(discussion.user).toHaveProperty("displayName");
        expect(discussion.user).toHaveProperty("avatar");

        // Should not include content (preview only)
        expect(discussion).not.toHaveProperty("content");
      }
    });

    it("should fetch current user's discussions with author=me", async () => {
      const res = await request(app)
        .get(`${API_BASE}?author=me`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("discussions");
      expect(Array.isArray(res.body.data.discussions)).toBe(true);
    });

    it("should search discussions by title", async () => {
      const searchQuery = "book";
      const res = await request(app)
        .get(`${API_BASE}?search=${searchQuery}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("discussions");

      // If results exist, verify search works
      if (res.body.data.discussions.length > 0) {
        res.body.data.discussions.forEach(discussion => {
          expect(discussion.title.toLowerCase()).toContain(searchQuery.toLowerCase());
        });
      }
    });

    it("should fetch discussions by specific user ID", async () => {
      // First get discussions to find a user ID
      const allDiscussions = await request(app)
        .get(API_BASE)
        .set("Authorization", `Bearer ${token}`);

      if (allDiscussions.body.data.discussions.length > 0) {
        const userId = allDiscussions.body.data.discussions[0].user._id;

        const res = await request(app)
          .get(`${API_BASE}?author=${userId}`)
          .set("Authorization", `Bearer ${token}`)
          .expect(200);

        expect(res.body).toHaveProperty("success", true);
        expect(res.body.data).toHaveProperty("discussions");

        // All discussions should be from the specified user
        res.body.data.discussions.forEach(discussion => {
          expect(discussion.user._id).toBe(userId);
        });
      }
    });

    it("should combine search and author filters", async () => {
      const res = await request(app)
        .get(`${API_BASE}?author=me&search=test`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("discussions");
    });

    it("should return 404 for non-existent user ID", async () => {
      const fakeUserId = "123456789012345678901234";
      const res = await request(app)
        .get(`${API_BASE}?author=${fakeUserId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "User not found");
    });

    it("should limit results to 20 discussions", async () => {
      const res = await request(app)
        .get(API_BASE)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.discussions.length).toBeLessThanOrEqual(20);
    });

    it("should sort discussions by most recent (updatedAt)", async () => {
      const res = await request(app)
        .get(API_BASE)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      const discussions = res.body.data.discussions;
      if (discussions.length > 1) {
        for (let i = 0; i < discussions.length - 1; i++) {
          const current = new Date(discussions[i].updatedAt);
          const next = new Date(discussions[i + 1].updatedAt);
          expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
        }
      }
    });

    it("should require authentication", async () => {
      const res = await request(app)
        .get(API_BASE)
        .expect(401);

      expect(res.body).toHaveProperty("success", false);
    });

    it("should handle invalid author parameter gracefully", async () => {
      const res = await request(app)
        .get(`${API_BASE}?author=invalid_id`)
        .set("Authorization", `Bearer ${token}`)
        .expect(500);

      expect(res.body).toHaveProperty("success", false);
    });
  });
});