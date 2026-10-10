export { createDigitAuth } from "./lib/digit-auth.js";

export { Permission, RolePermissions, UserRole } from "@digit-auth/core";

export {
  DigitAuthClient,
  DigitAuthError,
  createDigitAuthClient,
} from "./lib/digit-auth-client.js";

export { getAuth, requireAuth } from "./middleware/require-auth.js";

export { requireRole } from "./middleware/require-role.js";

export { requirePermission } from "./middleware/require-permission.js";

export {
  requireOwner,
  requireOwnership,
} from "./middleware/require-ownership.js";

export type { DigitAuth, DigitAuthOptions } from "./lib/digit-auth.js";

export type { DigitAuthClientOptions } from "./lib/digit-auth-client.js";

export type { OwnershipOptions } from "./middleware/require-ownership.js";

export type {
  AuthenticatedRequest,
  AuthenticatedUser,
  DigitAuthApiResponse,
  UserStatus,
} from "./types/auth.js";
