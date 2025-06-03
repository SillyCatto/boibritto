import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../api/app.js";
import { createTestUserAndGetIdToken } from "../api/utils/emulateAuth.js";

describe("GET /api/test/ping", () => {
  it("should return pong", async () => {
    const res = await request(app).get("/api/test/ping");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("pong");
  });
});

describe("GET /api/test/protected", () => {
  it("should return token verified successfully", async () => {
    const email = "testuser@example.com";
    const password = "testpass123";

    const idToken = await createTestUserAndGetIdToken({ email, password });
    console.log(`ID token: ${idToken}`);

    const res = await request(app)
      .get("/api/test/protected")
      .set("Authorization", `Bearer ${idToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("token verified successfully");
    expect(res.body.data.email).toBe(email); // if you attach email in token
  });
});
