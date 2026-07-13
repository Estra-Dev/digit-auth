import type { EmailProvider } from "../providers/email.provider.js";

export class EmailService {
  constructor(private readonly provider: EmailProvider) {}

  async sendVerificationEmail(options: {
    email: string;
    firstName: string;
    verificationToken: string;
  }): Promise<void> {
    const verificationUrl = `http://localhost:5173/verify-email?token=${options.verificationToken}`;

    const html = `
      <h2>Hello ${options.firstName},</h2>

      <p>
        Thank you for registering with DigitAuth.
      </p>

      <p>
        Click the button below to verify your email.
      </p>

      <a href="${verificationUrl}">Verify Email</a>
    `;

    await this.provider.sendEmail({
      to: options.email,
      subject: "Verify Email",
      html,
    });
  }

  async sendPasswordResetEmail(options: {
    email: string;
    firstName: string;
    resetToken: string;
  }): Promise<void> {
    const resetUrl = `http://localhost:5173/reset-password?token=${options.resetToken}`;

    const html = `
    <h2>Hello ${options.firstName},</h2>

    <p>
      We received a request to reset your password.
    </p>

    <p>
      Click the button below.
    </p>

    <a href="${resetUrl}">
      Reset Password
    </a>

    <p>
      If you didn't request this,
      you can safely ignore this email.
    </p>
    `;

    await this.provider.sendEmail({
      to: options.email,
      subject: "Reset your Password",
      html,
    });
  }
}
