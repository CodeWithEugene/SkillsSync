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
  const title = isSignup ? "Welcome to SkillsSync!" : "You signed in to SkillsSync"
  const message = isSignup
    ? "You successfully created your SkillsSync account."
    : "You successfully signed in to your SkillsSync account."
  const subtext = isSignup
    ? "We're glad to have you. Start building your skill profile and get verified on-chain."
    : "If you did not sign in, please secure your account by changing your password."

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb;">
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; padding: 32px; border-radius: 12px; max-width: 420px; margin: 0 auto; border: 1px solid #e5e7eb;">
    <div style="text-align: center; margin-bottom: 24px;">
      <img src="${LOGO_URL}" alt="SkillsSync Logo" style="width: 240px; height: 120px; object-fit: contain; display: inline-block; margin-bottom: 8px;" />
      <h1 style="color: #0190fe; font-size: 2rem; margin: 0;">${title}</h1>
    </div>
    <p style="color: #111827; font-size: 1.1rem; margin-bottom: 24px; text-align: center;">
      ${message}
    </p>
    <p style="color: #374151; font-size: 1rem; text-align: center; margin-bottom: 0;">
      <span style="font-size: 0.85rem;">${subtext}</span><br><br>
      <span style="color: #6b7280; font-size: 0.95rem;">— The <a href="https://www.skillssync.xyz/" style="color: #0190fe; text-decoration: none;">SkillsSync</a> Team</span>
    </p>
  </div>
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
