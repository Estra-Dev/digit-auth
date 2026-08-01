import mongoose from "mongoose";
import { beforeAll, afterAll, afterEach } from "vitest";
import {
  connectDatabase,
  disconnectDatabase,
} from "../../database/connection.js";

beforeAll(async () => {
  await connectDatabase();
});

afterEach(async () => {
  const collections = Object.values(mongoose.connection.collections);

  for (const collection of collections) {
    if (collection) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  await disconnectDatabase();
});
