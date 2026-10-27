import type { Server } from "node:http";

import app from "./config/app.js";
import { config } from "./config/index.js";
import { logger } from "./config/logger.js";
import { connectDatabase } from "./database/connection.js";
import {
  startWebhookWorker,
  stopWebhookWorker,
} from "./modules/webhook/service/webhook-worker.service.js";

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const server: Server = app.listen(config.port, () => {
    logger.info(`
      DigitAuth API Started

      Environment: ${config.env}
      Port: ${config.port}

      http://localhost:${config.port}
    `);

    startWebhookWorker();
  });

  let shuttingDown = false;

  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    logger.info({ signal }, "Shutting down DigitAuth API.");

    server.close((error) => {
      if (error) {
        logger.error({ err: error }, "HTTP server shutdown failed.");
      }
    });

    try {
      await stopWebhookWorker();
      logger.info("Webhook worker shutdown complete.");
      process.exitCode = 0;
    } catch (error) {
      logger.error({ err: error }, "Webhook worker shutdown failed.");
      process.exitCode = 1;
    }
  };

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

bootstrap().catch((error: unknown) => {
  logger.fatal({ err: error }, "DigitAuth API failed to start.");
  process.exitCode = 1;
});
