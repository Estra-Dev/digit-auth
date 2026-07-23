// import type { UserDocument } from "../modules/auth/model/user.model.ts";
import type { AuthenticatedUser } from "./authenticated-user.ts";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
