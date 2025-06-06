require("dotenv").config();

import request from "supertest";
import { describe, it, expect, beforeAll } from "vitest";
import app from "../api/app.js";

describe("GET /api/collections", () => {
  let token;

  beforeAll(() => {
    token = process.env.ID_TOKEN;
    if (!token) {
      throw new Error("Missing ID_TOKEN in environment variables.");
    }
  });

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
    expect(res.body.message).toBe("Collections fetched successfully");
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
