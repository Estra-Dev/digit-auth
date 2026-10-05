import { createHash, randomBytes } from "node:crypto";

import { AppError } from "../../../core/errors/AppError.js";
import { emailVerificationTokenRepository } from "../repository/email-verification-token.repository.js";

const VERIFICATION_TOKEN_BYTES = 32;

const VERIFICATION_TOKEN_TTL_MS = 1000 * 60 * 60 * 24;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export class EmailVerificationService {
  async createVerificationToken(accountId: string) {
    await emailVerificationTokenRepository.deleteActiveTokensByAccountId(
      accountId,
    );

    const rawToken = randomBytes(VERIFICATION_TOKEN_BYTES).toString("hex");

    const tokenHash = hashToken(rawToken);

    const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

    await emailVerificationTokenRepository.create({
      accountId,
      tokenHash,
      expiresAt,
    });

    return {
      token: rawToken,
      expiresAt,
    };
  }

  async deleteActiveVerificationTokens(accountId: string) {
    await emailVerificationTokenRepository.deleteActiveTokensByAccountId(
      accountId,
    );
  }

  async getVerificationTokenAccountId(token: string) {
    if (!token) {
      throw new AppError("Verification token is required.", 400, true);
    }

    const tokenHash = hashToken(token);

    const verificationToken =
      await emailVerificationTokenRepository.findByTokenHash(tokenHash);

    if (!verificationToken) {
      throw new AppError("Invalid or expired verification token.", 400, true);
    }

    if (verificationToken.usedAt) {
      throw new AppError(
        "This verification token has already been used.",
        400,
        true,
      );
    }

    if (verificationToken.expiresAt.getTime() <= Date.now()) {
      throw new AppError("Invalid or expired verification token.", 400, true);
    }

    return {
      accountId: verificationToken.accountId.toString(),
      tokenId: verificationToken.id,
    };
  }

  async consumeVerificationToken(tokenId: string) {
    const verificationToken =
      await emailVerificationTokenRepository.markUsed(tokenId);

    if (!verificationToken) {
      throw new AppError("Verification token is no longer valid.", 400, true);
    }

    return verificationToken;
  }
}

export const emailVerificationService = new EmailVerificationService();
