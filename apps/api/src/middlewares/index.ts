import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { Application } from "../modules/application/model/application.model.js";
import { ApplicationStatus } from "../modules/application/types/application.types.js";

import { apiRateLimit } from "./rate-limit/api-rate-limit.js";
import { config } from "../config/index.js";

export const registerMiddleware = (app: Express) => {
  // app.use(
  //   helmet({
  //     crossOriginResourcePolicy: false,
  //   }),
  // );
  app.use(helmet());

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, false);
          return;
        }

        // Keep the existing platform/dashboard origin allowlist.
        if (config.CORS_ORIGINS.includes(origin)) {
          callback(null, true);
          return;
        }

        // For browser preflight, the publishable-key value is not available
        // to the server yet. Allow origins registered to active applications;
        // the actual request is checked against its specific application above.
        void Application.exists({
          status: ApplicationStatus.ACTIVE,
          allowedOrigins: origin,
        })
          .then((applicationExists) => {
            callback(null, Boolean(applicationExists));
          })
          .catch((error: Error) => {
            callback(error);
          });
      },
      credentials: true,
    }),
  );

  app.use(compression());
  app.use(cookieParser());
  // app.use(express.json());
  app.use(
    express.json({
      limit: "100kb",
    }),
  );

  // app.use(
  //   express.urlencoded({
  //     extended: true,
  //   }),
  // );
  app.use(
    express.urlencoded({
      extended: true,
      limit: "100kb",
    }),
  );

  app.use(morgan("dev"));

  app.use("/api/v1", apiRateLimit);
};
