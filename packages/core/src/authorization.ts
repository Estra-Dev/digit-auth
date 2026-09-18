export enum UserRole {
  USER = "USER",
  MODERATOR = "MODERATOR",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum Permission {
  USER_READ = "USER_READ",
  USER_CREATE = "USER_CREATE",
  USER_UPDATE = "USER_UPDATE",
  USER_DELETE = "USER_DELETE",

  PROFILE_READ = "PROFILE_READ",
  PROFILE_UPDATE = "PROFILE_UPDATE",

  SESSION_READ = "SESSION_READ",
  SESSION_DELETE = "SESSION_DELETE",

  SECURITY_EVENT_READ = "SECURITY_EVENT_READ",

  AUDIT_LOG_READ = "AUDIT_LOG_READ",

  COURSE_READ = "COURSE_READ",
  COURSE_CREATE = "COURSE_CREATE",
  COURSE_UPDATE = "COURSE_UPDATE",
  COURSE_DELETE = "COURSE_DELETE",
}

export const RolePermissions: Record<UserRole, readonly Permission[]> = {
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
