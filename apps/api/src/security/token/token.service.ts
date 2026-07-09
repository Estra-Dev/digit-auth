import { cryptoService } from "../crypto/crypto.service.js";

export class TokenService {
  generateVerificationToken() {
    return cryptoService.generateRandomToken(32);
  }

  generatePasswordResetToken() {
    return cryptoService.generateRandomToken(32);
  }

  generateApiKey() {
    return cryptoService.generateRandomToken(32);
  }

  generateMagicLinkToken() {
    return cryptoService.generateRandomToken(32);
  }

  generateInvitationToken() {
    return cryptoService.generateRandomToken(32);
  }
}

export const tokenService = new TokenService();
