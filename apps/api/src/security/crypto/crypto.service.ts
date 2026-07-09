import { randomBytes, randomUUID } from "node:crypto";

export class CryptoService {
  generateUUID(): string {
    return randomUUID();
  }

  generateRandomToken(length: 32): string {
    return randomBytes(length).toString("hex");
  }
}

export const cryptoService = new CryptoService();
