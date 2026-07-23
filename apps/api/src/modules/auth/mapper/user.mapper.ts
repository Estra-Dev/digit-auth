import type { AuthenticatedUser } from "../../../types/authenticated-user.js";
import type { UserDocument } from "../model/user.model.js";

export class UserMapper {
  static toResponse(user: UserDocument) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      emailVerified: user.emailVerified,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toAuthenticatedUser(user: AuthenticatedUser) {
    return {
      id: user.id,

      email: user.email,

      firstName: user.firstName,
      lastName: user.lastName,

      role: user.role,
      status: user.status,

      emailVerified: user.emailVerified,
    };
  }
}
