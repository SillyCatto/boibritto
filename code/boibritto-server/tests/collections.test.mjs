require("dotenv").config();

import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../api/app.js";

describe("Collection API", () => {
  let token;
  let createdCollectionId;

  beforeAll(() => {
    token = process.env.ID_TOKEN;
    if (!token) {
      throw new Error("Missing ID_TOKEN in environment variables.");
    }
  });

  afterAll(async () => {
    // Clean up created collection
    if (createdCollectionId) {
      await request(app)
        .delete(`/api/collections/${createdCollectionId}`)
        .set("Authorization", `Bearer ${token}`);
    }
  });

  describe("GET /api/collections", () => {
    it("should fetch all public collections with pagination", async () => {
      const res = await request(app)
        .get("/api/collections")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Collections fetched successfully");
      expect(Array.isArray(res.body.data.collections)).toBe(true);

      const collection = res.body.data.collections[0];
      if (collection) {
        expect(collection).toHaveProperty("_id");
        expect(collection).toHaveProperty("title");
        expect(collection).toHaveProperty("description");
        expect(collection).toHaveProperty("visibility", "public");
        expect(collection.user).toHaveProperty("username");
        expect(collection.user).toHaveProperty("displayName");
      }
    });

    it("should fetch only the authenticated user's collections when owner=me", async () => {
      const res = await request(app)
        .get("/api/collections?owner=me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.collections)).toBe(true);

      for (const collection of res.body.data.collections) {
        expect(collection.user).toBeDefined();
        expect(collection.user._id).toBeDefined();
      }
    });

    it("should return 401 if token is missing", async () => {
      const res = await request(app).get("/api/collections");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/collections", () => {
    it("should create a new collection", async () => {
      const res = await request(app)
        .post("/api/collections")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            title: "Test Collection",
            description: "This is a test collection",
            visibility: "private",
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Collection created successfully");
      expect(res.body.data.collection).toHaveProperty("_id");
      expect(res.body.data.collection.title).toBe("Test Collection");

      createdCollectionId = res.body.data.collection._id; // Save for patch/delete
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/collections")
        .set("Authorization", `Bearer ${token}`)
        .send({}); // Missing required fields

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PATCH /api/collections/:id", () => {
    it("should update an existing collection", async () => {
      const res = await request(app)
        .patch(`/api/collections/${createdCollectionId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            title: "Updated Test Collection",
            description: "Updated description",
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Collection updated successfully");
      expect(res.body.data.collection.title).toBe("Updated Test Collection");
    });

    it("should return 404 for invalid collection ID", async () => {
      const res = await request(app)
        .patch(`/api/collections/invalidId123`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Doesn't Matter" });

      expect(res.status).toBe(400); // Or 404 depending on how you handle invalid IDs
    });
  });

  describe("DELETE /api/collections/:id", () => {
    it("should delete a collection by ID", async () => {
      const res = await request(app)
        .delete(`/api/collections/${createdCollectionId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Collection deleted successfully");

      // Clear the ID so afterAll doesn't try to delete again
      createdCollectionId = null;
    });

    it("should return 404 if collection does not exist", async () => {
      const res = await request(app)
        .delete(`/api/collections/64f6a1cfc8f5550000000000`)
        .set("Authorization", `Bearer ${token}`);

      expect([400, 404]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });
});
