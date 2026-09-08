import type { EmailProvider } from "./email.provider.js";

export class TestEmailProvider implements EmailProvider {
  public readonly sentEmails: Array<{
    to: string;
    subject: string;
    html: string;
  }> = [];

  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    this.sentEmails.push(options);
  }
}

export const testEmailProvider = new TestEmailProvider();
