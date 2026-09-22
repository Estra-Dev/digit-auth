import type { ApplicationDocument } from "../modules/application/model/application.model.js";
import type { AuthenticatedUser } from "./authenticated-user.ts";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      application?: ApplicationDocument;
    }
  }
}

export {};
