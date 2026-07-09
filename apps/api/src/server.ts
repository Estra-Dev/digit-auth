import app from "./config/app.js";
import { config } from "./config/index.js";
import { logger } from "./config/logger.js";
import { connectDatabase } from "./database/connection.js";

async function bootstrap() {
  await connectDatabase();

  app.listen(config.port, () => {
    logger.info(`
      DigitAuth API Started
  
      Environment: ${config.env}
      Port: ${config.port}
  
      http://localhost:${config.port}
      `);
  });
}

bootstrap();
