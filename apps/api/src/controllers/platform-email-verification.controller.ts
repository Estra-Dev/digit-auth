import type { Request, Response } from "express";

import { AppError } from "../core/errors/AppError.js";
import { ApiResponse } from "../core/response/ApiResponse.js";
import { platformAccountRepository } from "../modules/platform-account/index.js";
import { emailVerificationService } from "../modules/email-verification/index.js";

export async function verifyPlatformEmail(req: Request, res: Response) {
  const token = typeof req.body?.token === "string" ? req.body.token : "";

  const verification =
    await emailVerificationService.getVerificationTokenAccountId(token);

  let account = await platformAccountRepository.markEmailVerified(
    verification.accountId,
  );

  // Another request may have verified the account concurrently.
  if (!account) {
    account = await platformAccountRepository.findById(verification.accountId);

    if (!account || !account.emailVerified) {
      throw new Error("Unable to verify this account.");
    }
  }

  try {
    await emailVerificationService.consumeVerificationToken(
      verification.tokenId,
    );
  } catch (error) {
    const isConcurrentTokenConsumption =
      error instanceof AppError &&
      error.statusCode === 400 &&
      error.message === "Verification token is no longer valid.";

    if (!isConcurrentTokenConsumption) {
      throw error;
    }

    // Only accept the token-consumption race if the account
    // has actually been verified successfully.
    const verifiedAccount = await platformAccountRepository.findById(
      verification.accountId,
    );

    if (!verifiedAccount?.emailVerified) {
      throw error;
    }

    account = verifiedAccount;
  }

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "Email verified successfully.",
    data: {
      account: {
        id: account.id,
        email: account.email,
        emailVerified: account.emailVerified,
        status: account.status,
      },
    },
  });
}
