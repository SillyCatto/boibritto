import { AdminJS } from "adminjs";
import { buildAuthenticatedRouter } from "@adminjs/express";
import { Database, Resource } from "@adminjs/mongoose";
import express from "express";
import session from "express-session";
import formidable from "express-formidable";
import mongoose from "mongoose";

// Import your models
import User from "./models/user.models.js";
import Blog from "./models/blog.models.js";
import Collection from "./models/collection.models.js";
import ReadingList from "./models/readingList.models.js";
import Comment from "./models/comment.models.js";

// Register the Mongoose adapter
AdminJS.registerAdapter({ Database, Resource });

const DEFAULT_ADMIN = {
  email: process.env.ADMIN_EMAIL || "admin@boibritto.com",
  password: process.env.ADMIN_PASSWORD || "admin",
};

const authenticate = async (email, password) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

const setupAdmin = (app) => {
  const adminJS = new AdminJS({
    resources: [
      {
        resource: User,
        options: {
          navigation: { name: "Users Management" },
        },
      },
      {
        resource: Blog,
        options: {
          navigation: { name: "Content Management" },
        },
      },
      {
        resource: Collection,
        options: {
          navigation: { name: "Content Management" },
        },
      },
      {
        resource: ReadingList,
        options: {
          navigation: { name: "Content Management" },
        },
      },
      {
        resource: Comment,
        options: {
          navigation: { name: "Content Management" },
        },
      },
    ],
    rootPath: "/admin",
    branding: {
      companyName: "Boibritto Admin Panel",
      logo: false,
      softwareBrothers: false,
    },
  });

  const router = buildAuthenticatedRouter(
    adminJS,
    {
      authenticate,
      cookieName: "boibritto-admin",
      cookiePassword:
        process.env.COOKIE_SECRET || "super-secret-cookie-password",
    },
    null,
    {
      resave: false,
      saveUninitialized: true,
      secret: process.env.SESSION_SECRET || "super-secret-session",
      cookie: {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      },
      name: "boibritto.admin",
    }
  );

  return router;
};

export default setupAdmin;
