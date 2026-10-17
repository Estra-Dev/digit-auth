import { config } from "../../../config/index.js";
import type { EmailProvider } from "../providers/email.provider.js";

const DASHBOARD_URL = (config.DASHBOARD_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  "",
);

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
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Verify your DigitAuth email</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Confirm your email address to finish setting up your DigitAuth account.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f5f9;width:100%;">
    <tr>
      <td align="center" style="padding:36px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;">
          <tr>
            <td align="center" style="padding:0 0 24px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td valign="middle" style="width:42px;height:42px;background-color:#1d4ed8;border-radius:12px;text-align:center;vertical-align:middle;">
                    <span style="font-size:25px;line-height:42px;font-weight:700;color:#ffffff;">D</span>
                  </td>
                  <td valign="middle" style="padding-left:11px;font-size:23px;font-weight:700;letter-spacing:-0.5px;color:#0f172a;">
                    Digit<span style="color:#2563eb;">Auth</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:40px 36px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:22px;">
                    <div style="width:58px;height:58px;border-radius:50%;background-color:#eff6ff;color:#2563eb;font-size:27px;line-height:58px;text-align:center;font-weight:700;">
                      &#10003;
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size:27px;line-height:1.3;font-weight:700;letter-spacing:-0.6px;color:#0f172a;padding-bottom:14px;">
                    Verify your email address
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size:15px;line-height:1.8;color:#475569;padding-bottom:26px;">
                    Thanks for creating a DigitAuth account. Confirm that this email address belongs to you to continue setting up your developer workspace.
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 0 26px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" bgcolor="#2563eb" style="border-radius:10px;">
                          <a href="${verificationUrl}" target="_blank" style="display:inline-block;padding:15px 28px;border-radius:10px;background-color:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;line-height:1.2;font-weight:700;">
                            Verify email address
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size:13px;line-height:1.8;color:#64748b;padding-bottom:20px;">
                    This verification link expires in <strong style="color:#334155;">24 hours</strong>. If the button does not work, copy and paste this address into your browser:
                  </td>
                </tr>
                <tr>
                  <td style="font-size:12px;line-height:1.7;word-break:break-all;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:9px;padding:13px;color:#2563eb;">
                    <a href="${verificationUrl}" style="color:#2563eb;text-decoration:underline;">${verificationUrl}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:24px;font-size:13px;line-height:1.8;color:#64748b;">
                    If you did not create a DigitAuth account, you can safely ignore this email. No action is required.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:24px 12px 0;font-size:12px;line-height:1.8;color:#64748b;">
              Secure authentication infrastructure for your applications.<br>
              This is an automated message from DigitAuth. Please do not reply.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await this.provider.sendEmail({
      to: options.email,
      subject: "Verify your DigitAuth email address",
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
      <p>We received a request to reset your password.</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `;

    await this.provider.sendEmail({
      to: options.email,
      subject: "Reset your Password",
      html,
    });
  }

  async sendApplicationVerificationEmail(options: {
    email: string;
    verificationToken: string;
    applicationOrigin: string;
  }): Promise<void> {
    const applicationOrigin = options.applicationOrigin.replace(/\/+$/, "");
    const verificationUrl = `${applicationOrigin}/?token=${encodeURIComponent(
      options.verificationToken,
    )}`;

    const html = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Confirm your email address to finish setting up your account.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:36px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;">
          <tr>
            <td align="center" style="padding:0 0 24px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td valign="middle" style="width:42px;height:42px;background-color:#1d4ed8;border-radius:12px;text-align:center;">
                    <span style="font-size:25px;line-height:42px;font-weight:700;color:#ffffff;">D</span>
                  </td>
                  <td valign="middle" style="padding-left:11px;font-size:23px;font-weight:700;letter-spacing:-0.5px;color:#0f172a;">
                    Digit<span style="color:#2563eb;">Auth</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:40px 36px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:22px;">
                    <div style="width:58px;height:58px;border-radius:50%;background-color:#eff6ff;color:#2563eb;font-size:27px;line-height:58px;text-align:center;font-weight:700;">
                      &#10003;
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size:27px;line-height:1.3;font-weight:700;letter-spacing:-0.6px;color:#0f172a;padding-bottom:14px;">
                    Verify your email address
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size:15px;line-height:1.8;color:#475569;padding-bottom:26px;">
                    Thanks for creating your account. Confirm that this email address belongs to you to finish setting up your account.
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 0 26px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" bgcolor="#2563eb" style="border-radius:10px;">
                          <a href="${verificationUrl}" target="_blank" style="display:inline-block;padding:15px 28px;border-radius:10px;background-color:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;line-height:1.2;font-weight:700;">
                            Verify email address
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size:13px;line-height:1.8;color:#64748b;padding-bottom:12px;">
                    This verification link expires in <strong style="color:#334155;">24 hours</strong>.
                    If the button doesn't work, use the link below.
                  </td>
                </tr>
                <tr>
                  <td style="font-size:12px;line-height:1.7;word-break:break-all;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:9px;padding:13px;color:#2563eb;">
                    <a href="${verificationUrl}" style="color:#2563eb;text-decoration:underline;">${verificationUrl}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:24px;font-size:13px;line-height:1.8;color:#64748b;">
                    If you did not create this account, you can safely ignore this email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:24px 12px 0;font-size:12px;line-height:1.8;color:#64748b;">
              Secure authentication infrastructure for your applications.<br>
              This is an automated message from DigitAuth. Please do not reply.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await this.provider.sendEmail({
      to: options.email,
      subject: "Verify your email address",
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
      <p>We received a request to reset the password for your DigitAuth account.</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
    `;

    await this.provider.sendEmail({
      to: options.email,
      subject: "Reset your DigitAuth password",
      html,
    });
  }
}
