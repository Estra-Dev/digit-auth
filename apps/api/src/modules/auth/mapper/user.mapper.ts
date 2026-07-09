import type { UserDocument } from "../model/user.model.js";

export class UserMapper {
  static toResponse(user: UserDocument) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      emailVerified: user.emailVerified,
    };
  }
}
