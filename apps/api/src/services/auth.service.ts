import { Types } from "mongoose";
import { passwordService } from "./../security/password/password.service.js";
import { AppError } from "../core/errors/AppError.js";
import { userRepository } from "../modules/auth/repositories/user.repository.js";
import { tokenHashService } from "../security/index.js";
import { jwtService } from "../security/jwt/jwt.service.js";
import type { RegisterInput } from "../validators/auth.validator.js";
import type { LoginInput } from "../validators/login.schema.js";
import { UserMapper } from "../modules/auth/mapper/user.mapper.js";
import { sessionRepository } from "../modules/auth/repositories/session.repository.js";
import { addDays } from "../shared/utils/date.js";
import { config } from "../config/index.js";
import { email } from "zod";

export class AuthService {
  async register(data: RegisterInput) {
    // check if user exist
    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError("An Account with this email already exist", 409, true);
    }
    const hashedPassword = await passwordService.hash(data.password);
    // const isValid = await verifyPassword(hashedPassword, data.password);
    // console.log(hashedPassword, isValid);

    // create the user
    const user = await userRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHashed: hashedPassword,
      email: data.email,
    });

    return UserMapper.toResponse(user);
    // return {
    //   id: userId,
    //   email: data.email,
    //   hashedPassword,
    //   accessToken,
    //   refreshToken,
    //   createdAt: new Date(),
    // };
  }

  async login(data: LoginInput) {
    const user = await userRepository.findEmailWithPassword(data.email);
    if (!user) {
      throw new AppError("Invalid Email or Password", 401, true);
    }

    const validPassword = await passwordService.verify(
      user.passwordHashed,
      data.password,
    );
    if (!validPassword) {
      throw new AppError("Invalid Email or Password", 401, true);
    }

    // Generate JWT payload
    const payload = {
      sub: user.id,
      email: user.email,
    };

    // Generate tokens
    const accessToken = await jwtService.generateAccessToken(payload);
    const refreshToken = await jwtService.generateRefreshToken(payload);

    // Hash refresh token
    const refreshTokenHash = tokenHashService.hash(refreshToken);

    // create session
    await sessionRepository.create({
      userId: user._id,
      refreshTokenHash,
      expiresAt: addDays(config.SESSION_EXPIRES_IN_DAYS),
    });

    return {
      user: UserMapper.toResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    // Verify the refresh token
    const payload = await jwtService.verifyRefreshToken(refreshToken);

    // console.log(payload);

    // Hash the incoming refresh token
    const refreshTokenHash = tokenHashService.hash(refreshToken);

    // Find the matching session
    const session = await sessionRepository.findByUserIdAndRefreshTokenHash(
      new Types.ObjectId(payload.sub),
      refreshTokenHash,
    );

    // Reject if no active session exists
    if (!session) {
      throw new AppError("Invalid Refresh Token", 401, true);
    }

    // Delete the old session (rotation)
    await sessionRepository.deleteById(session.id);

    //  Create a fresh JWT payload
    const newPayload = {
      sub: payload.sub,
      email: payload.email,
    };

    // Generate new tokens
    const accessToken = await jwtService.generateAccessToken(newPayload);
    const newRefreshToken = await jwtService.generateRefreshToken(newPayload);

    // Hash the new refresh token
    const newRefreshTokenHash = tokenHashService.hash(newRefreshToken);

    // Store the new session
    await sessionRepository.create({
      userId: new Types.ObjectId(payload.sub),
      refreshTokenHash: newRefreshTokenHash,
      expiresAt: addDays(config.SESSION_EXPIRES_IN_DAYS),
    });

    // Return the new tokens
    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const payload = await jwtService.verifyRefreshToken(refreshToken);

    const refreshTokenHash = tokenHashService.hash(refreshToken);

    const session = await sessionRepository.findByUserIdAndRefreshTokenHash(
      new Types.ObjectId(payload.sub),
      refreshTokenHash,
    );

    if (session) {
      await sessionRepository.deleteById(session.id);
    }
  }
  async logoutAll(refreshToken: string): Promise<void> {
    const payload = await jwtService.verifyRefreshToken(refreshToken);

    const userId = new Types.ObjectId(payload.sub);

    await sessionRepository.deleteAllForUser(userId);
  }
}

export const authService = new AuthService();
