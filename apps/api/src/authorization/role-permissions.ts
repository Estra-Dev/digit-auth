import { Permission } from "./permissions.js";
import { UserRole } from "./roles.js";

export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.USER_READ,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,

    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE,

    Permission.SESSION_READ,
    Permission.SESSION_DELETE,

    Permission.SECURITY_EVENT_READ,
    Permission.AUDIT_LOG_READ,

    Permission.COURSE_READ,
    Permission.COURSE_CREATE,
    Permission.COURSE_UPDATE,
    Permission.COURSE_DELETE,
  ],

  [UserRole.USER]: [Permission.PROFILE_READ, Permission.PROFILE_UPDATE],
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.MODERATOR]: Object.values(Permission),
};
