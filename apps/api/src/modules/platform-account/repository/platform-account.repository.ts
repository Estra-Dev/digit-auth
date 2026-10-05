import type { ClientSession } from "mongoose";

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

  async findByIdWithPassword(
    id: string,
  ): Promise<PlatformAccountDocument | null> {
    return PlatformAccount.findById(id).select("+passwordHashed");
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

  async deleteById(id: string): Promise<void> {
    await PlatformAccount.deleteOne({
      _id: id,
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

  async markEmailVerified(id: string): Promise<PlatformAccountDocument | null> {
    return PlatformAccount.findOneAndUpdate(
      {
        _id: id,
        emailVerified: false,
      },
      {
        $set: {
          emailVerified: true,
        },
      },
      {
        new: true,
      },
    );
  }

  async updatePassword(
    id: string,
    passwordHashed: string,
    session?: ClientSession,
  ): Promise<PlatformAccountDocument | null> {
    const options = {
      new: true,
      runValidators: true,
      ...(session ? { session } : {}),
    };

    return PlatformAccount.findByIdAndUpdate(
      id,
      {
        $set: {
          passwordHashed,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      },
      options,
    );
  }
}

export const platformAccountRepository = new PlatformAccountRepository();
