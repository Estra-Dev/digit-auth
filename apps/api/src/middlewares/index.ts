import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

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
      origin: config.CORS_ORIGIN,
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
