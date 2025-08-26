import User from "../models/user.models.js";
import Blog from "../models/blog.models.js";
import Collection from "../models/collection.models.js";
import ReadingList from "../models/readingList.models.js";
import Discussion from "../models/discussion.models.js";
import Comment from "../models/comment.models.js";
import Report from "../models/report.models.js";
import UserBook from "../models/userBook.models.js";
import Chapter from "../models/chapter.models.js";
import Admin from "../models/admin.models.js";

import customTheme from "./adminjs.theme.js";
import { componentLoader, Components } from "../../components/components.js";

// adminjs config
// contains all resources and their options

const adminConfig = {
  resources: [
    {
      resource: User,
      options: {
        navigation: { name: "Users Management" },
        listProperties: [
          "username",
          "displayName",
          "email",
          "isVerified",
          "createdAt",
        ],
        showProperties: [
          "username",
          "displayName",
          "email",
          "avatar",
          "bio",
          "interestedGenres",
          "isVerified",
          "firebaseUid",
          "createdAt",
          "updatedAt",
        ],
        filterProperties: [
          "username",
          "email",
          "isVerified",
          "interestedGenres",
        ],
        editProperties: [
          "username",
          "displayName",
          "bio",
          "interestedGenres",
          "isVerified",
        ],
        sortBy: "createdAt",
        actions: {
          // Superadmin can create users, others cannot (should use Firebase)
          new: {
            isAccessible: ({ currentAdmin }) =>
              currentAdmin?.role === "superadmin",
          },
          // Allow editing user details
          edit: {
            isAccessible: true,
          },
          // Only superadmin can delete users
          delete: {
            isAccessible: ({ currentAdmin }) =>
              currentAdmin?.role === "superadmin",
          },
        },
      },
    },
    {
      resource: Blog,
      options: {
        navigation: { name: "Content Management" },
        listProperties: ["title", "author", "visibility", "tags", "createdAt"],
        showProperties: [
          "title",
          "content",
          "author",
          "visibility",
          "tags",
          "createdAt",
          "updatedAt",
        ],
        filterProperties: ["author", "visibility", "tags"],
        editProperties: ["title", "content", "visibility", "tags"],
        sortBy: "createdAt",
        actions: {
          // Allow full CRUD operations for blogs
          new: {
            isAccessible: true,
          },
          edit: {
            isAccessible: true,
          },
          delete: {
            isAccessible: true,
          },
        },
      },
    },
    {
      resource: Collection,
      options: {
        navigation: { name: "Content Management" },
        listProperties: ["name", "owner", "visibility", "books", "createdAt"],
        showProperties: [
          "name",
          "description",
          "owner",
          "visibility",
          "books",
          "createdAt",
          "updatedAt",
        ],
        filterProperties: ["owner", "visibility"],
        editProperties: ["name", "description", "visibility", "books"],
        sortBy: "createdAt",
        actions: {
          // Allow full CRUD operations for collections
          new: {
            isAccessible: true,
          },
          edit: {
            isAccessible: true,
          },
          delete: {
            isAccessible: true,
          },
        },
      },
    },
    {
      resource: Discussion,
      options: {
        navigation: { name: "Community Management" },
        listProperties: [
          "title",
          "user",
          "visibility",
          "spoilerAlert",
          "genres",
          "createdAt",
        ],
        showProperties: [
          "title",
          "content",
          "user",
          "visibility",
          "spoilerAlert",
          "genres",
          "createdAt",
          "updatedAt",
        ],
        filterProperties: ["user", "visibility", "genres", "spoilerAlert"],
        editProperties: [
          "title",
          "content",
          "visibility",
          "spoilerAlert",
          "genres",
        ],
        sortBy: "createdAt",
        actions: {
          new: {
            isAccessible: ({ currentAdmin }) =>
              currentAdmin?.role === "superadmin",
          },
          edit: {
            isAccessible: true,
          },
          delete: {
            isAccessible: true,
          },
        },
      },
    },
    {
      resource: Comment,
      options: {
        navigation: { name: "Community Management" },
        listProperties: [
          "content",
          "user",
          "targetType",
          "targetId",
          "parentComment",
          "createdAt",
        ],
        showProperties: [
          "content",
          "user",
          "targetType",
          "targetId",
          "parentComment",
          "spoilerAlert",
          "createdAt",
          "updatedAt",
        ],
        filterProperties: [
          "user",
          "targetType",
          "parentComment",
          "spoilerAlert",
        ],
        editProperties: ["content", "spoilerAlert"],
        sortBy: "createdAt",
        actions: {
          new: {
            isAccessible: ({ currentAdmin }) =>
              currentAdmin?.role === "superadmin",
          },
          edit: {
            isAccessible: true,
          },
          delete: {
            isAccessible: true,
          },
        },
      },
    },
    {
      resource: UserBook,
      options: {
        navigation: { name: "Content Management" },
        listProperties: [
          "title",
          "author",
          "visibility",
          "genre",
          "coverImage",
          "createdAt",
        ],
        showProperties: [
          "title",
          "description",
          "author",
          "visibility",
          "genre",
          "tags",
          "coverImage",
          "createdAt",
          "updatedAt",
        ],
        filterProperties: ["author", "visibility", "genre", "tags"],
        editProperties: [
          "title",
          "description",
          "visibility",
          "genre",
          "tags",
          "coverImage",
        ],
        sortBy: "createdAt",
        actions: {
          new: {
            isAccessible: ({ currentAdmin }) =>
              currentAdmin?.role === "superadmin",
          },
          edit: {
            isAccessible: true,
          },
          delete: {
            isAccessible: true,
          },
        },
      },
    },
    {
      resource: Chapter,
      options: {
        navigation: { name: "Content Management" },
        listProperties: [
          "title",
          "book",
          "chapterNumber",
          "visibility",
          "createdAt",
        ],
        showProperties: [
          "title",
          "content",
          "book",
          "chapterNumber",
          "visibility",
          "createdAt",
          "updatedAt",
        ],
        filterProperties: ["book", "visibility"],
        editProperties: ["title", "content", "chapterNumber", "visibility"],
        sortBy: "chapterNumber",
        actions: {
          new: {
            isAccessible: ({ currentAdmin }) =>
              currentAdmin?.role === "superadmin",
          },
          edit: {
            isAccessible: true,
          },
          delete: {
            isAccessible: true,
          },
        },
      },
    },
    {
      resource: ReadingList,
      options: {
        navigation: { name: "Content Management" },
        listProperties: [
          "user",
          "bookTitle",
          "status",
          "progress",
          "startedAt",
          "completedAt",
        ],
        showProperties: [
          "user",
          "bookId",
          "bookTitle",
          "authors",
          "status",
          "progress",
          "rating",
          "review",
          "visibility",
          "startedAt",
          "completedAt",
          "createdAt",
          "updatedAt",
        ],
        filterProperties: ["user", "status", "visibility", "rating"],
        editProperties: [
          "status",
          "progress",
          "rating",
          "review",
          "visibility",
          "startedAt",
          "completedAt",
        ],
        sortBy: "createdAt",
        actions: {
          // Allow viewing and editing reading list items
          new: {
            isAccessible: true,
          },
          edit: {
            isAccessible: true,
          },
          delete: {
            isAccessible: true,
          },
        },
      },
    },
    {
      resource: Report,
      options: {
        navigation: { name: "Moderation" },
        listProperties: [
          "reporter",
          "reportType",
          "reason",
          "status",
          "createdAt",
        ],
        showProperties: [
          "reporter",
          "reportType",
          "targetId",
          "reason",
          "description",
          "status",
          "adminNotes",
          "reviewedBy",
          "reviewedAt",
          "createdAt",
        ],
        filterProperties: ["reportType", "reason", "status", "reviewedBy"],
        editProperties: ["status", "adminNotes", "reviewedBy", "reviewedAt"],
        sortBy: "createdAt",
        actions: {
          // Allow admins to review and update reports
          edit: {
            isAccessible: true,
            before: async (request) => {
              // Auto-set reviewedAt when status changes
              if (
                request.payload?.status &&
                request.payload.status !== "pending"
              ) {
                request.payload.reviewedAt = new Date();
              }
              return request;
            },
          },
          // Prevent deletion of reports for audit trail
          delete: {
            isAccessible: ({ currentAdmin }) =>
              currentAdmin?.role === "superadmin",
          },
          // Superadmin can create reports manually if needed, others cannot
          new: {
            isAccessible: ({ currentAdmin }) =>
              currentAdmin?.role === "superadmin",
          },
        },
      },
    },
    {
      resource: Admin,
      options: {
        navigation: { name: "Admin Management" },
        listProperties: ["username", "email", "role", "isActive", "createdAt"],
        showProperties: [
          "username",
          "email",
          "role",
          "isActive",
          "firebaseUid",
          "lastLogin",
          "createdAt",
          "updatedAt",
        ],
        filterProperties: ["role", "isActive"],
        editProperties: ["username", "role", "isActive"],
        sortBy: "createdAt",
        actions: {
          // disable editing/creating admin users directly via adminjs
          // admins should be created via firebase auth manager and manually added to mongodb
          new: {
            isAccessible: ({ currentAdmin }) =>
              currentAdmin?.role === "superadmin",
          },
          edit: {
            isAccessible: ({ currentAdmin }) =>
              currentAdmin?.role === "superadmin",
          },
          delete: {
            isAccessible: ({ currentAdmin }) =>
              currentAdmin?.role === "superadmin",
          },
        },
      },
    },
  ],
  rootPath: "/boibritto-internals-02354862/admin",
  loginPath: "/boibritto-internals-02354862/admin/login",
  logoutPath: "/boibritto-internals-02354862/admin/logout",
  branding: {
    companyName: "BoiBritto Admin Panel",
    logo: false,
    softwareBrothers: false,
    favicon: "/favicon.svg",
    theme: customTheme,
    withMadeWithLove: false,
  },
  componentLoader,

  // mount custom dashboard
  dashboard: {
    component: Components.Dashboard,
  },

  // Global CSS overrides
  assets: {
    styles: ["/admin-custom.css"],
  },
};

export default adminConfig;
