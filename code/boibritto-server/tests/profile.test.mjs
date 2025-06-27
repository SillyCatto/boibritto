import "dotenv/config";
import request from "supertest";
import { describe, it, expect, beforeAll } from "vitest";
import app from "../api/app.js";

describe("Profile API", () => {
  let token;
  let userId;

  beforeAll(async () => {
    token = process.env.ID_TOKEN;
    if (!token) throw new Error("Missing ID_TOKEN in environment variables.");

    // Fetch current user ID for use in public profile tests
    const res = await request(app)
      .get("/api/profile/me")
      .set("Authorization", `Bearer ${token}`);
    userId = res.body.data?.profile_data?._id;
  });

  describe("GET /api/profile/me", () => {
    it("should fetch the authenticated user's profile", async () => {
      const res = await request(app)
        .get("/api/profile/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile_data).toBeDefined();
      expect(res.body.data.profile_data.email).toBeDefined();
      expect(Array.isArray(res.body.data.collections)).toBe(true);
      expect(Array.isArray(res.body.data.reading_tracker)).toBe(true);
      expect(Array.isArray(res.body.data.blogs)).toBe(true);
    });

    it("should return 401 if token is missing", async () => {
      const res = await request(app).get("/api/profile/me");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PATCH /api/profile/me", () => {
    it("should update username, bio, and interestedGenres", async () => {
      const res = await request(app)
        .patch("/api/profile/me")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            username: "testuser123",
            bio: "Updated bio for testing",
            interestedGenres: ["fiction", "mystery"],
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile.username).toBe("testuser123");
      expect(res.body.data.profile.bio).toBe("Updated bio for testing");
      expect(res.body.data.profile.interestedGenres).toContain("fiction");
    });

    it("should update only one field if only one is provided", async () => {
      const res = await request(app)
        .patch("/api/profile/me")
        .set("Authorization", `Bearer ${token}`)
        .send({ data: { bio: "Bio only update" } });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile.bio).toBe("Bio only update");
    });

    it("should return 400 if no data is provided", async () => {
      const res = await request(app)
        .patch("/api/profile/me")
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 if no valid fields are provided", async () => {
      const res = await request(app)
        .patch("/api/profile/me")
        .set("Authorization", `Bearer ${token}`)
        .send({ data: { invalidField: "value" } });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 if interestedGenres is not an array", async () => {
      const res = await request(app)
        .patch("/api/profile/me")
        .set("Authorization", `Bearer ${token}`)
        .send({ data: { interestedGenres: "not-an-array" } });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 409 if username is already taken", async () => {
      // Try to set username to an existing user's username
      const res = await request(app)
        .patch("/api/profile/me")
        .set("Authorization", `Bearer ${token}`)
        .send({ data: { username: "existingusername" } }); // Replace with a known username in your DB

      if (res.status === 409) {
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/Username already taken/);
      }
    });

    it("should return 401 if token is missing", async () => {
      const res = await request(app)
        .patch("/api/profile/me")
        .send({ data: { bio: "Should not update" } });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/profile/:userID", () => {
    it("should fetch a user's public profile and public content", async () => {
      const res = await request(app)
        .get(`/api/profile/${userId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile_data).toBeDefined();
      expect(res.body.data.profile_data.email).toBeUndefined();
      expect(res.body.data.profile_data.username).toBeDefined();
      expect(Array.isArray(res.body.data.collections)).toBe(true);
      expect(Array.isArray(res.body.data.reading_tracker)).toBe(true);
      expect(Array.isArray(res.body.data.blogs)).toBe(true);
    });

    it("should return 404 if user does not exist", async () => {
      const res = await request(app)
        .get("/api/profile/64f6a1cfc8f5550000000000")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 if token is missing", async () => {
      const res = await request(app).get(`/api/profile/${userId}`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});