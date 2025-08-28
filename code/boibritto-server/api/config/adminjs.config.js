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
        sortBy: "createdAt",
      },
    },
    {
      resource: Blog,
      options: {
        navigation: { name: "Content Management" },
        sortBy: "createdAt",
      },
    },
    {
      resource: Collection,
      options: {
        navigation: { name: "Content Management" },
        sortBy: "createdAt",
      },
    },
    {
      resource: Discussion,
      options: {
        navigation: { name: "Community Management" },
        sortBy: "createdAt",
      },
    },
    {
      resource: Comment,
      options: {
        navigation: { name: "Community Management" },
        sortBy: "createdAt",
      },
    },
    {
      resource: UserBook,
      options: {
        navigation: { name: "Content Management" },
        sortBy: "createdAt",
      },
    },
    {
      resource: Chapter,
      options: {
        navigation: { name: "Content Management" },
        sortBy: "chapterNumber",
      },
    },
    {
      resource: ReadingList,
      options: {
        navigation: { name: "Content Management" },
        sortBy: "createdAt",
      },
    },
    {
      resource: Report,
      options: {
        navigation: { name: "Moderation" },
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
