import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

export const registerMiddleware = (app: Express) => {
  app.use(helmet());

  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );

  app.use(compression());
  app.use(cookieParser());
  app.use(express.json());

  app.use(
    express.urlencoded({
      extended: true,
    }),
  );

  app.use(morgan("dev"));
};
