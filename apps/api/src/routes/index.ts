import { type Express } from "express";
// import healthRouter from "./health.route.js";
import authRouter from "./auth.route.js";
import healthRouter from "../modules/health/health.routes.js";
import testRoutes from "./test.routes.js";
import securityRouter from "../modules/security/security.routes.js";
import profileRouter from "../modules/profile/profile.routes.js";
import adminRouter from "../modules/admin/routes/admin.routes.js";
import platformAuthRouter from "./platform-auth.route.js";
import platformApplicationRouter from "./platform-application.route.js";
import platformUserRouter from "../modules/platform-user/routes/platform-user.routes.js";
import platformSessionRouter from "../modules/platform-session/routes/platform-session.routes.js";
import workspaceRoutes from "./workspace.routes.js";

export const registerRoutes = (app: Express) => {
  app.get("/", (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome to the DigitAuth API.",
      version: "v1",
      docs: "/api/v1/health",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/v1/health", healthRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/platform/applications", platformApplicationRouter);
  app.use("/api/v1/platform/users", platformUserRouter);
  app.use("/api/v1/platform/auth", platformAuthRouter);
  app.use("/api/v1/platform/sessions", platformSessionRouter);
  app.use("/api/v1/test", testRoutes);
  app.use("/api/v1/security", securityRouter);
  app.use("/api/v1/profile", profileRouter);
  app.use("/api/v1/admin", adminRouter);
  app.use("/api/v1/workspace", workspaceRoutes);
  // app.use("/api/v1/health", healthRouter);
};
