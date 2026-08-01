import argon2 from "argon2";
import { config } from "../../config/index.js";

// export const hashPassword = async (password: string): Promise<string> => {
//   return argon2.hash(password, {
//     type: argon2.argon2id,
//     memoryCost: 65536,
//     timeCost: 3,
//     parallelism: 4,
//   });
// };

// export const verifyPassword = async (
//   hash: string,
//   password: string,
// ): Promise<boolean> => {
//   return argon2.verify(hash, password);
// };

export class PasswordService {
  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,

      memoryCost: config.isTest ? 1024 : 65536,

      timeCost: config.isTest ? 1 : 3,

      parallelism: 1,
    });
  }

  async verify(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
}

export const passwordService = new PasswordService();
