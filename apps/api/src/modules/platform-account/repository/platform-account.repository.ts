import { PlatformAccount } from "../model/platform-account.model.js";

import type { PlatformAccountDocument } from "../model/platform-account.model.js";

export class PlatformAccountRepository {
  async findByEmail(email: string): Promise<PlatformAccountDocument | null> {
    return PlatformAccount.findOne({
      email: email.toLowerCase(),
    });
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<PlatformAccountDocument | null> {
    return PlatformAccount.findOne({
      email: email.toLowerCase(),
    }).select("+passwordHashed");
  }

  async findById(id: string): Promise<PlatformAccountDocument | null> {
    return PlatformAccount.findById(id);
  }

  async create(data: {
    email: string;
    passwordHashed: string;
    emailVerified?: boolean;
  }): Promise<PlatformAccountDocument> {
    return PlatformAccount.create({
      email: data.email.toLowerCase(),
      passwordHashed: data.passwordHashed,
      emailVerified: data.emailVerified ?? false,
    });
  }

  async incrementFailedLoginAttempts(
    id: string,
  ): Promise<PlatformAccountDocument | null> {
    return PlatformAccount.findByIdAndUpdate(
      id,
      {
        $inc: {
          failedLoginAttempts: 1,
        },
      },
      {
        new: true,
      },
    );
  }

  async resetFailedLoginAttempts(
    id: string,
  ): Promise<PlatformAccountDocument | null> {
    return PlatformAccount.findByIdAndUpdate(
      id,
      {
        $set: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      },
      {
        new: true,
      },
    );
  }

  async lockAccount(
    id: string,
    lockedUntil: Date,
  ): Promise<PlatformAccountDocument | null> {
    return PlatformAccount.findByIdAndUpdate(
      id,
      {
        $set: {
          lockedUntil,
        },
      },
      {
        new: true,
      },
    );
  }
}

export const platformAccountRepository = new PlatformAccountRepository();
