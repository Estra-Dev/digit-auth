import express from "express";
import { registerMiddleware } from "../middlewares/index.js";
import { registerRoutes } from "../routes/index.js";
import { notFoundMiddleware } from "../middlewares/notFound.middleware.js";
import { errorMiddleware } from "../middlewares/error.middleware.js";

const app = express();

registerMiddleware(app);
registerRoutes(app);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DigitAuth is running successfully",
    version: "v1",
    timestamp: new Date().toISOString(),
  });
});

export default app;
