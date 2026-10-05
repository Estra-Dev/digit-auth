import {
  EmailVerificationToken,
  type EmailVerificationTokenDocument,
} from "../model/email-verification-token.model.js";

export class EmailVerificationTokenRepository {
  async create(data: {
    accountId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<EmailVerificationTokenDocument> {
    return EmailVerificationToken.create({
      accountId: data.accountId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
    });
  }

  async findByTokenHash(
    tokenHash: string,
  ): Promise<EmailVerificationTokenDocument | null> {
    return EmailVerificationToken.findOne({
      tokenHash,
    }).select("+tokenHash");
  }

  async markUsed(id: string): Promise<EmailVerificationTokenDocument | null> {
    return EmailVerificationToken.findOneAndUpdate(
      {
        _id: id,
        usedAt: null,
      },
      {
        $set: {
          usedAt: new Date(),
        },
      },
      {
        new: true,
      },
    );
  }

  async deleteActiveTokensByAccountId(accountId: string): Promise<void> {
    await EmailVerificationToken.deleteMany({
      accountId,
      usedAt: null,
    });
  }
}

export const emailVerificationTokenRepository =
  new EmailVerificationTokenRepository();
