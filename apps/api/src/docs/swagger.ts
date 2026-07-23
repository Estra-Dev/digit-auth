import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { swaggerOptions } from "./swagger.options.js";

export const swaggerSpec = swaggerJsDoc(swaggerOptions);

export { swaggerUi };
