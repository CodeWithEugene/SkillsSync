import nodemailer from "nodemailer"

const LOGO_URL = "https://www.skillssync.xyz/logo.png"
const FROM_NAME = "SkillsSync"
const FROM_EMAIL = "info@skillssync.xyz"

function getTransporter() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) {
    throw new Error("Missing SMTP config: SMTP_HOST, SMTP_USER, SMTP_PASS required")
  }
  return nodemailer.createTransport({
    host,
    port: port ? parseInt(port, 10) : 587,
    secure: false,
    auth: { user, pass },
  })
}

function buildAuthNotificationHtml(type: "signup" | "login"): string {
  const isSignup = type === "signup"
  const title = isSignup ? "Welcome to SkillsSync" : "You signed in to SkillsSync"
  const message = isSignup
    ? "Your account has been created. Start building your skill profile and get verified on-chain."
    : "You successfully signed in to your SkillsSync account."

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding: 48px 32px; text-align: center;">
              <div style="margin-bottom: 32px;">
                <img src="${LOGO_URL}" alt="SkillsSync" width="160" height="160" style="display: block; margin: 0 auto; max-width: 160px; height: auto;" />
              </div>
              <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 600; color: #18181b;">${title}</h1>
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #52525b;">${message}</p>
              <p style="margin: 24px 0 0; font-size: 13px; color: #71717a;">— The SkillsSync Team</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim()
}

export type AuthNotificationType = "signup" | "login"

export async function sendAuthNotification(toEmail: string, type: AuthNotificationType): Promise<void> {
  const transporter = getTransporter()
  const subject = type === "signup" ? "Welcome to SkillsSync" : "You signed in to SkillsSync"
  const html = buildAuthNotificationHtml(type)

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: toEmail,
    subject,
    html,
  })
}
