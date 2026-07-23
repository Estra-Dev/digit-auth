import express from "express";
import { registerMiddleware } from "../middlewares/index.js";
import { registerRoutes } from "../routes/index.js";
import { notFoundMiddleware } from "../middlewares/notFound.middleware.js";
import { errorMiddleware } from "../middlewares/error.middleware.js";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { swaggerSpec, swaggerUi } from "../docs/swagger.js";
import { config } from "./index.js";

const app = express();

registerMiddleware(app);

if (config.env !== "production") {
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
    }),
  );
}

registerRoutes(app);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DigitAuth is running successfully",
    version: "v1",
    timestamp: new Date().toISOString(),
  });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
