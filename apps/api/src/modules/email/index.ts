import { resendProvider } from "./providers/resend.provider.js";
import { testEmailProvider } from "./providers/test.provider.js";
import { EmailService } from "./services/email.service.js";

const provider =
  process.env.NODE_ENV === "test" ? testEmailProvider : resendProvider;

export const emailService = new EmailService(provider);

export { testEmailProvider };
