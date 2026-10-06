import type { Test } from "supertest";

export function withApplicationCredentials(
  request: Test,
  clientId: string,
  clientSecret: string,
) {
  return request
    .set("X-DigitAuth-Client-Id", clientId)
    .set("X-DigitAuth-Client-Secret", clientSecret);
}
