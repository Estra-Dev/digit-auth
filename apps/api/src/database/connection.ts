import mongoose from "mongoose";
import { logger } from "../config/logger.js";
import { config } from "../config/index.js";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);

    logger.info("MONGODB CONNECTED");
  } catch (error) {
    logger.error(error);

    process.exit(1);
  }
};
