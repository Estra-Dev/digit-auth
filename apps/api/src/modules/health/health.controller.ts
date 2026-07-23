import type { Request, Response } from "express";
import { ApiResponse } from "../../core/response/ApiResponse.js";
import { config } from "../../config/index.js";
import { getDatabaseHealth } from "./database-health.js";

export class HealthController {
  check(_req: Request, res: Response) {
    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Application is Healthy",
      data: {
        status: "OK",
        environment: config.env,
        uptime: process.uptime(),
        timestamp: new Date(),
        version: process.env.npm_package_version ?? "1.0.0",
        database: getDatabaseHealth(),
      },
    });
  }
}

export const healthController = new HealthController();
