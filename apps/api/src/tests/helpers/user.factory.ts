import { UserRole } from "../../authorization/roles.js";
import { UserStatus } from "../../modules/auth/model/user.model.js";
import { userRepository } from "../../modules/auth/repositories/user.repository.js";
import { authService } from "../../services/auth.service.js";
import { buildRegisterPayload } from "./factories.js";

type CreateUserOptions = {
  role?: UserRole;
  status?: UserStatus;
  emailVerified?: boolean;
};

export async function createUser(options: CreateUserOptions = {}) {
  const payload = buildRegisterPayload();

  await authService.register(payload);

  const user = await userRepository.findEmailWithPassword(payload.email);

  if (!user) {
    throw new Error("User creation failed.");
  }

  user.role = options.role ?? UserRole.USER;
  user.status = options.status ?? UserStatus.ACTIVE;
  user.emailVerified = options.emailVerified ?? true;

  await user.save();

  return {
    user,
    email: payload.email,
    password: payload.password,
  };
}

export async function createVerifiedUser() {
  return createUser({
    emailVerified: true,
  });
}

export async function createAdminUser() {
  return createUser({
    role: UserRole.ADMIN,
    emailVerified: true,
  });
}

export async function createInactiveUser() {
  return createUser({
    status: UserStatus.DEACTIVATED,
    emailVerified: true,
  });
}

export async function createUnverifiedUser() {
  return createUser({
    emailVerified: false,
  });
}
