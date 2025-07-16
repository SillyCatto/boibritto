import { AdminJS } from "adminjs";
import { buildAuthenticatedRouter } from "@adminjs/express";
import { Database, Resource } from "@adminjs/mongoose";

import { verifyAdminEmail } from "./firebase.service.js";
import { logError, logInfo } from "../utils/logger.js";
import AdminModel from "../models/admin.models.js";

import adminConfig from "../config/adminjs.config.js";

// register adapter with mongoose schema
try {
  AdminJS.registerAdapter({ Database, Resource });
} catch (error) {
  console.warn("AdminJS adapter registration warning:", error.message);
}

// firebase auth for adminjs
// still need to accept password as parameter as its expected by adminjs
// but dont use it directly since Firebase admin SDK doesnt allow password verification
// email-pass validation happens on frontend

// eslint-disable-next-line no-unused-vars
const authenticate = async (email, password) => {
  try {
    // verify if admin registred in firebase auth
    const userRecord = await verifyAdminEmail(email);

    if (!userRecord) {
      logInfo(`Admin login failed: no Firebase user found with email ${email}`);
      return null;
    }

    // check if admin user with this email is registered in db
    const adminUser = await AdminModel.findOne({ email });

    if (!adminUser) {
      logInfo(`Admin login failed: user ${email} not in admin collection`);
      return null;
    }

    // check if firebase uid for current admin login matches with uid of admin user
    // that is registred in db
    if (adminUser.uid !== userRecord.uid) {
      logInfo(`Admin login failed: UID mismatch for ${email}`);
      return null;
    }

    // Return the admin user for AdminJS session
    return {
      email: adminUser.email,
      id: adminUser._id.toString(),
      role: adminUser.role,
      name: adminUser.name,
    };
  } catch (error) {
    logError("Admin authentication error:", error);
    return null;
  }
};

// create AdminJS instance with imported configs
// eslint-disable-next-line no-unused-vars
const setupAdmin = (app) => {
  const adminJS = new AdminJS(adminConfig);

  // Build frontend code with custom components in development
  if (process.env.NODE_ENV !== "production") {
    adminJS.watch();
  }

  const router = buildAuthenticatedRouter(
    adminJS,
    {
      authenticate,
      cookieName: "boibritto-admin",
      cookiePassword: process.env.COOKIE_SECRET || "secret-cookie-password",
    },
    null,
    {
      resave: false,
      saveUninitialized: true,
      secret: process.env.SESSION_SECRET || "secret-session",
      cookie: {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      },
      name: "boibritto.admin",
    }
  );

  // Return both the AdminJS instance and router for proper mounting
  return { adminJS, router };
};

export default setupAdmin;
