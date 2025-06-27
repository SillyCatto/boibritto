import User from "../models/user.models.js";
import Blog from "../models/blog.models.js";
import Collection from "../models/collection.models.js";
import ReadingList from "../models/readingList.models.js";
import Admin from "../models/admin.models.js";
// import Comment from "../models/comment.models.js";

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
    // {
    //   resource: Comment,
    //   options: {
    //     navigation: { name: "Content Management" },
    //   },
    // },
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
  // assets: {
  //   styles: ['/admin-custom.css'],
  // },
};

export default adminConfig;
