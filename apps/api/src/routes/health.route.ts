import { Router } from "express";
import { ApiResponse } from "../core/response/ApiResponse.js";

const healthRouter = Router();

healthRouter.get("/", (req, res) => {
  return ApiResponse.success(res, {
    message: "DigitAuth API is healthy.",
    data: {
      version: "v1",
      uptime: process.uptime(),
    },
  });
});

export default healthRouter;
