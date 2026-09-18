import {
  createDigitAuthClient,
  type DigitAuthClient,
  type DigitAuthClientOptions,
} from "./digit-auth-client.js";

export type DigitAuthOptions = DigitAuthClientOptions;

export type DigitAuth = {
  client: DigitAuthClient;
};

export function createDigitAuth(
  options: DigitAuthOptions,
): DigitAuth {
  return {
    client: createDigitAuthClient(options),
  };
}
