import { type Express } from "express";
// import healthRouter from "./health.route.js";
import authRouter from "./auth.route.js";
import healthRouter from "../modules/health/health.routes.js";

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
  // app.use("/api/v1/health", healthRouter);
};
