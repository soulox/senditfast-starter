import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);

// Initialize Mailgun client
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
});

const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || '';
const FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL || 'noreply@senditfast.com';

export async function sendTransferEmail({
  to,
  transferUrl,
  senderName,
  expiresAt,
  fileCount,
  totalSize,
  message,
  recipientId
}: {
  to: string;
  transferUrl: string;
  senderName?: string;
  expiresAt: Date;
  fileCount: number;
  totalSize: number;
  message?: string;
  recipientId?: string;
}) {
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
    console.warn('[Email] Mailgun not configured - skipping email');
    return { success: false, error: 'Mailgun not configured' };
  }

  const sender = senderName || 'Someone';
  const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
  const expiryDate = expiresAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Add tracking parameters to URLs
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000';
  const trackingUrl = recipientId ? `${transferUrl}?r=${recipientId}` : transferUrl;
  const openTrackingUrl = recipientId ? `${baseUrl}/api/email/track/open/${recipientId}` : null;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've received files</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">
                📦 You've received files!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                <strong>${sender}</strong> has sent you ${fileCount} file${fileCount > 1 ? 's' : ''} (${sizeInMB} MB) via SendItFast.
              </p>

              ${message ? `
              <div style="background: #f9fafb; border-left: 4px solid #667eea; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #6b7280; font-style: italic;">
                  "${message}"
                </p>
              </div>
              ` : ''}

              <!-- Download Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${trackingUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                      📥 Download Files
                    </a>
                  </td>
                </tr>
              </table>

              <!-- File Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #6b7280; font-size: 14px;">📁 Files:</span>
                    <strong style="color: #1f2937; font-size: 14px; margin-left: 8px;">${fileCount}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #6b7280; font-size: 14px;">💾 Size:</span>
                    <strong style="color: #1f2937; font-size: 14px; margin-left: 8px;">${sizeInMB} MB</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #6b7280; font-size: 14px;">⏰ Expires:</span>
                    <strong style="color: #1f2937; font-size: 14px; margin-left: 8px;">${expiryDate}</strong>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
                  ⚠️ <strong>Important:</strong> This link will expire on ${expiryDate}. Download your files before then!
                </p>
              </div>

              <!-- Link -->
              <p style="margin: 20px 0 0 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${trackingUrl}" style="color: #667eea; word-break: break-all;">${trackingUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                Sent via <strong style="color: #667eea;">SendItFast</strong>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Fast, secure file transfers
              </p>
            </td>
          </tr>

        </table>
        ${openTrackingUrl ? `<img src="${openTrackingUrl}" width="1" height="1" style="display:none;" alt="" />` : ''}
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const textContent = `
You've received files!

${sender} has sent you ${fileCount} file${fileCount > 1 ? 's' : ''} (${sizeInMB} MB) via SendItFast.

${message ? `Message: "${message}"\n\n` : ''}

Download your files: ${trackingUrl}

File Details:
- Files: ${fileCount}
- Size: ${sizeInMB} MB
- Expires: ${expiryDate}

⚠️ Important: This link will expire on ${expiryDate}. Download your files before then!

---
Sent via SendItFast - Fast, secure file transfers
  `;

  try {
    const result = await mg.messages.create(MAILGUN_DOMAIN, {
      from: `SendItFast <${FROM_EMAIL}>`,
      to: [to],
      subject: `📦 ${sender} sent you ${fileCount} file${fileCount > 1 ? 's' : ''} via SendItFast`,
      text: textContent,
      html: htmlContent,
    });

    console.log('[Email] Sent transfer notification to:', to, 'ID:', result.id);
    return { success: true, messageId: result.id };
  } catch (error: any) {
    console.error('[Email] Failed to send:', error);
    return { success: false, error: error.message };
  }
}

export async function sendTeamInviteEmail({
  to,
  inviterName,
  inviterEmail,
  teamName,
  acceptUrl
}: {
  to: string;
  inviterName?: string;
  inviterEmail: string;
  teamName?: string;
  acceptUrl: string;
}) {
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
    console.warn('[Email] Mailgun not configured - skipping email');
    return { success: false, error: 'Mailgun not configured' };
  }

  const inviter = inviterName || inviterEmail;
  const team = teamName || 'their team';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">
                👥 Team Invitation
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                <strong>${inviter}</strong> has invited you to join ${team} on SendItFast.
              </p>

              <p style="margin: 0 0 20px 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                As a team member, you'll be able to collaborate on file transfers and access shared resources.
              </p>

              <!-- Accept Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${acceptUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                      ✅ Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link -->
              <p style="margin: 20px 0 0 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${acceptUrl}" style="color: #10b981; word-break: break-all;">${acceptUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                Sent via <strong style="color: #667eea;">SendItFast</strong>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Fast, secure file transfers
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const textContent = `
Team Invitation

${inviter} has invited you to join ${team} on SendItFast.

As a team member, you'll be able to collaborate on file transfers and access shared resources.

Accept invitation: ${acceptUrl}

---
Sent via SendItFast - Fast, secure file transfers
  `;

  try {
    const result = await mg.messages.create(MAILGUN_DOMAIN, {
      from: `SendItFast <${FROM_EMAIL}>`,
      to: [to],
      subject: `👥 ${inviter} invited you to join their team on SendItFast`,
      text: textContent,
      html: htmlContent,
    });

    console.log('[Email] Sent team invite to:', to, 'ID:', result.id);
    return { success: true, messageId: result.id };
  } catch (error: any) {
    console.error('[Email] Failed to send:', error);
    return { success: false, error: error.message };
  }
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  userName
}: {
  to: string;
  resetUrl: string;
  userName?: string;
}) {
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
    console.warn('[Email] Mailgun not configured - skipping email');
    return { success: false, error: 'Mailgun not configured' };
  }

  const name = userName || 'there';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">
                🔑 Reset Your Password
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                Hi ${name},
              </p>

              <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                We received a request to reset your password for your SendItFast account. Click the button below to create a new password:
              </p>

              <!-- Reset Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                      🔒 Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->}
              <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.6;">
                  ⚠️ <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request this reset, please ignore this email and your password will remain unchanged.
                </p>
              </div>

              <!-- Link -->
              <p style="margin: 20px 0 0 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                Sent via <strong style="color: #667eea;">SendItFast</strong>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Fast, secure file transfers
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const textContent = `
Reset Your Password

Hi ${name},

We received a request to reset your password for your SendItFast account.

Click this link to reset your password:
${resetUrl}

⚠️ Security Notice: This link will expire in 1 hour. If you didn't request this reset, please ignore this email and your password will remain unchanged.

---
Sent via SendItFast - Fast, secure file transfers
  `;

  try {
    const result = await mg.messages.create(MAILGUN_DOMAIN, {
      from: `SendItFast <${FROM_EMAIL}>`,
      to: [to],
      subject: `🔑 Reset your SendItFast password`,
      text: textContent,
      html: htmlContent,
    });

    console.log('[Email] Sent password reset to:', to, 'ID:', result.id);
    return { success: true, messageId: result.id };
  } catch (error: any) {
    console.error('[Email] Failed to send:', error);
    return { success: false, error: error.message };
  }
}

export function isConfigured(): boolean {
  return !!(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN);
}