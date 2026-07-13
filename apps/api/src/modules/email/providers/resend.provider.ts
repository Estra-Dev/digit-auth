import { Resend } from "resend";
import { config } from "../../../config/index.js";
import type { EmailProvider } from "./email.provider.js";

const resend = new Resend(config.RESEND_API_KEY);

export class ResendProvider implements EmailProvider {
  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const { error } = await resend.emails.send({
      from: config.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}

export const resendProvider = new ResendProvider();
