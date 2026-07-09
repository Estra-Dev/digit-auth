import pino, { levels, transport } from "pino";
import { config } from "./index.js";

const loggerOptions =
  config.env === "development"
    ? {
        level: "info",
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      }
    : {
        level: "info",
      };

export const logger = pino(loggerOptions);
