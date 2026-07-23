import type { Options } from "swagger-jsdoc";
import { config } from "../config/index.js";

export const swaggerOptions: Options = {
  definition: {
    openapi: "3.1.0",

    info: {
      title: "DigitAuth API",
      version: "1.0.0",
      description:
        "A production-ready authentication API built with Express, TypeScript, MongoDB and JWT.",
      contact: {
        name: "DigitAuth",
        email: "support@digitauth.dev",
      },
      license: {
        name: "MIT",
      },
    },

    server: [
      {
        url: config.API_BASE_URL,
        description: config.env === "production" ? "Production" : "Development",
      },
    ],

    tags: [
      {
        name: "Authentication",
        description: "Authentication related endpoints",
      },
      {
        name: "Users",
        description: "Current user endpoints",
      },
      {
        name: "Health",
        description: "Application health",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter a valid JWT Access Token.",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: [
    "./src/docs/**/*.ts",
    "./src/controllers/*.ts",
    "./src/modules/**/*.ts",
  ],
};
