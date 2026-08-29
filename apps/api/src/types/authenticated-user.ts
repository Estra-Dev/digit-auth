import type { UserRole } from "../authorization/roles.js";
import type { UserStatus } from "../modules/auth/model/user.model.js";

export interface AuthenticatedUser {
  id: string;
  email: string;

  firstName: string;
  lastName: string;

  role: UserRole;
  status: UserStatus;

  emailVerified: boolean;

  failedLoginAttempts: number;

  lockedUntil?: Date | null;
}
