import { config } from "../../../config/index.js";
import type { EmailProvider } from "../providers/email.provider.js";

const DASHBOARD_URL = config.DASHBOARD_URL ?? "http://localhost:3000";
export class EmailService {
  constructor(private readonly provider: EmailProvider) {}

  async sendVerificationEmail(options: {
    email: string;
    verificationToken: string;
  }): Promise<void> {
    const verificationUrl = `${DASHBOARD_URL}/platform/verify-email?token=${encodeURIComponent(
      options.verificationToken,
    )}`;

    const html = `
      <h2>Verify your email</h2>
  
      <p>
        Thank you for registering with DigitAuth.
      </p>
  
      <p>
        Click the button below to verify your email address.
      </p>
  
      <p>
        <a href="${verificationUrl}">
          Verify Email
        </a>
      </p>
  
      <p>
        This verification link will expire in 24 hours.
      </p>
  
      <p>
        If you did not create a DigitAuth account, you can safely ignore
        this email.
      </p>
    `;

    await this.provider.sendEmail({
      to: options.email,
      subject: "Verify your DigitAuth email",
      html,
    });
  }

  async sendPasswordResetEmail(options: {
    email: string;
    firstName: string;
    resetToken: string;
  }): Promise<void> {
    const resetUrl = `${DASHBOARD_URL}/reset-password?token=${options.resetToken}`;

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

  async sendPlatformPasswordResetEmail(options: {
    email: string;
    resetToken: string;
  }): Promise<void> {
    const resetUrl = `${DASHBOARD_URL}/platform/reset-password?token=${encodeURIComponent(
      options.resetToken,
    )}`;

    const html = `
      <h2>Reset your DigitAuth password</h2>
  
      <p>
        We received a request to reset the password for your DigitAuth account.
      </p>
  
      <p>
        Click the button below to create a new password.
      </p>
  
      <p>
        <a href="${resetUrl}">
          Reset Password
        </a>
      </p>
  
      <p>
        This link will expire in 24 hours.
      </p>
  
      <p>
        If you did not request a password reset, you can safely ignore this email.
      </p>
    `;

    await this.provider.sendEmail({
      to: options.email,
      subject: "Reset your DigitAuth password",
      html,
    });
  }
}
