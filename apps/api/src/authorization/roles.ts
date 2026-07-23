import { UserRole } from "../modules/auth/model/user.model.js";
import { Permission } from "./permissions.js";

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

    Permission.COURSE_READ,
    Permission.COURSE_CREATE,
    Permission.COURSE_UPDATE,
    Permission.COURSE_DELETE,
  ],

  [UserRole.USER]: [Permission.PROFILE_READ, Permission.PROFILE_UPDATE],
};
