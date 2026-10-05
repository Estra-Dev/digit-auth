import type { Request, Response } from "express";

import { ApiResponse } from "../core/response/ApiResponse.js";
import { platformAccountRepository } from "../modules/platform-account/index.js";
import { emailVerificationService } from "../modules/email-verification/index.js";

export async function verifyPlatformEmail(req: Request, res: Response) {
  const token = typeof req.body?.token === "string" ? req.body.token : "";

  const verification =
    await emailVerificationService.getVerificationTokenAccountId(token);

  const account = await platformAccountRepository.markEmailVerified(
    verification.accountId,
  );

  if (!account) {
    throw new Error("Unable to verify this account.");
  }

  await emailVerificationService.consumeVerificationToken(verification.tokenId);

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
