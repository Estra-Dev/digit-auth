export interface EmailProvider {
  sendEmail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void>;
}
