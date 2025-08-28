import "dotenv/config";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../api/app.js";

const API_BASE = "/api/comments";

describe("Comment API", () => {
  let token;
  let discussionId;
  let createdCommentId;
  let createdReplyId;

  beforeAll(async () => {
    token = process.env.ID_TOKEN;
    if (!token) throw new Error("Missing ID_TOKEN in environment variables.");

    // Create a test discussion for comment testing
    const discussionData = {
      data: {
        title: "Test Discussion for Comments",
        content: "This is a test discussion created for testing comment functionality",
        spoilerAlert: false,
        genres: ["fiction"]
      }
    };

    const discussionRes = await request(app)
      .post("/api/discussions")
      .set("Authorization", `Bearer ${token}`)
      .send(discussionData);

    if (discussionRes.status !== 201) {
      throw new Error(`Failed to create test discussion: ${discussionRes.body.message}`);
    }

    discussionId = discussionRes.body.data.discussion._id;
  });

  afterAll(async () => {
    // Clean up created comments
    if (createdReplyId) {
      await request(app)
        .delete(`${API_BASE}/${createdReplyId}`)
        .set("Authorization", `Bearer ${token}`);
    }
    if (createdCommentId) {
      await request(app)
        .delete(`${API_BASE}/${createdCommentId}`)
        .set("Authorization", `Bearer ${token}`);
    }

    // Clean up test discussion
    if (discussionId) {
      await request(app)
        .delete(`/api/discussions/${discussionId}`)
        .set("Authorization", `Bearer ${token}`);
    }
  });

  describe("POST /api/comments", () => {
    it("should create a new parent comment", async () => {
      const commentData = {
        data: {
          discussionId,
          content: "This is a test comment for the discussion",
          spoilerAlert: false
        }
      };

      const res = await request(app)
        .post(API_BASE)
        .set("Authorization", `Bearer ${token}`)
        .send(commentData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Comment created successfully");
      expect(res.body.data.comment).toHaveProperty("_id");
      expect(res.body.data.comment.content).toBe(commentData.data.content);
      expect(res.body.data.comment.spoilerAlert).toBe(false);
      expect(res.body.data.comment.parentComment).toBe(null);
      expect(res.body.data.comment.user).toHaveProperty("username");
      expect(res.body.data.comment.user).toHaveProperty("displayName");

      createdCommentId = res.body.data.comment._id;
    });

    it("should create a reply to a parent comment", async () => {
      const replyData = {
        data: {
          discussionId,
          content: "This is a reply to the parent comment",
          spoilerAlert: false,
          parentComment: createdCommentId
        }
      };

      const res = await request(app)
        .post(API_BASE)
        .set("Authorization", `Bearer ${token}`)
        .send(replyData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Comment created successfully");
      expect(res.body.data.comment.content).toBe(replyData.data.content);
      expect(res.body.data.comment.parentComment).toBe(createdCommentId);

      createdReplyId = res.body.data.comment._id;
    });

    it("should reject comment with invalid content", async () => {
      const invalidData = {
        data: {
          discussionId,
          content: "a".repeat(501), // Exceeds 500 character limit
          spoilerAlert: false
        }
      };

      const res = await request(app)
        .post(API_BASE)
        .set("Authorization", `Bearer ${token}`)
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Content is required and must be <= 500 characters");
    });

    it("should reject reply to a reply (enforce 1-level depth)", async () => {
      const invalidReply = {
        data: {
          discussionId,
          content: "This should fail - reply to a reply",
          spoilerAlert: false,
          parentComment: createdReplyId
        }
      };

      const res = await request(app)
        .post(API_BASE)
        .set("Authorization", `Bearer ${token}`)
        .send(invalidReply);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Comments can only be 1 level deep (replies to replies are not allowed)");
    });
  });

  describe("GET /api/comments/:discussionId", () => {
    it("should fetch comments for a discussion in hierarchical structure", async () => {
      const res = await request(app)
        .get(`${API_BASE}/${discussionId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Comments fetched successfully");
      expect(Array.isArray(res.body.data.comments)).toBe(true);

      // Check if our created comment is in the response
      const parentComment = res.body.data.comments.find(c => c._id === createdCommentId);
      if (parentComment) {
        expect(parentComment).toHaveProperty("content");
        expect(parentComment).toHaveProperty("user");
        expect(parentComment.user).toHaveProperty("username");
        expect(Array.isArray(parentComment.replies)).toBe(true);

        // Check if reply is nested properly
        const reply = parentComment.replies.find(r => r._id === createdReplyId);
        if (reply) {
          expect(reply.parentComment).toBe(createdCommentId);
        }
      }
    });

    it("should return 404 for non-existent discussion", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .get(`${API_BASE}/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PATCH /api/comments/:id", () => {
    it("should update comment content and spoilerAlert", async () => {
      const updateData = {
        data: {
          content: "Updated comment content",
          spoilerAlert: true
        }
      };

      const res = await request(app)
        .patch(`${API_BASE}/${createdCommentId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Comment updated successfully");
      expect(res.body.data.comment.content).toBe(updateData.data.content);
      expect(res.body.data.comment.spoilerAlert).toBe(true);
    });

    it("should reject update with invalid content length", async () => {
      const invalidUpdate = {
        data: {
          content: "a".repeat(501)
        }
      };

      const res = await request(app)
        .patch(`${API_BASE}/${createdCommentId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(invalidUpdate);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 for non-existent comment", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .patch(`${API_BASE}/${fakeId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ data: { content: "test" } });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("DELETE /api/comments/:id", () => {
    it("should delete a reply comment", async () => {
      const res = await request(app)
        .delete(`${API_BASE}/${createdReplyId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Comment deleted successfully");
      expect(res.body.data).toEqual({});

      createdReplyId = null; // Mark as deleted
    });

    it("should delete parent comment and track deleted count", async () => {
      // First create a new parent comment and reply for this test
      const parentRes = await request(app)
        .post(API_BASE)
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            discussionId,
            content: "Parent comment to be deleted",
            spoilerAlert: false
          }
        });

      const parentId = parentRes.body.data.comment._id;

      const replyRes = await request(app)
        .post(API_BASE)
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: {
            discussionId,
            content: "Reply to be deleted with parent",
            spoilerAlert: false,
            parentComment: parentId
          }
        });

      // Now delete the parent comment
      const deleteRes = await request(app)
        .delete(`${API_BASE}/${parentId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
      expect(deleteRes.body.message).toBe("Comment and its replies deleted successfully");
      expect(deleteRes.body.data.deletedCount).toBe(2);
    });

    it("should return 404 for non-existent comment", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .delete(`${API_BASE}/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
