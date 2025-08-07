import nodemailer from "nodemailer"
import { generateToken } from "./jwt"

const requiredEnvVars = [
  "EMAIL_SERVER_HOST",
  "EMAIL_SERVER_PORT",
  "EMAIL_SERVER_USER",
  "EMAIL_SERVER_PASSWORD",
  "EMAIL_FROM",
  "NEXTAUTH_URL",
]

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  secure: process.env.EMAIL_SERVER_SECURE === "true",
  tls: {
    rejectUnauthorized: false, // useful in dev with self-signed certs
  },
})

export async function sendVerificationEmail(email: string) {
  try {
    const token = await generateToken({ email })
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Verify your email address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify your email address</h2>
          <p>Thank you for registering with InkPress. Please click the button below to verify your email address:</p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Verify Email
          </a>
          <p>If you did not request this verification, please ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log(`Verification email sent to ${email}: ${info.messageId}`)

  } catch (error) {
    console.error(`Failed to send verification email to ${email}:`, error)
    throw new Error("Email delivery failed. Please try again later.")
  }
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log(`Email sent to ${to}: ${info.messageId}`)
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error)
    throw new Error("Email delivery failed. Please try again later.")
  }
}

interface SendInviteEmailOptions {
    to: string;
    organizationName: string;
}

export async function sendInviteEmail({ to, organizationName }: SendInviteEmailOptions) {
    const loginUrl = process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/auth/login` : 'http://localhost:3000/auth/login';

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject: `You're invited to join ${organizationName} on DITBlogs`,
        html: `
            <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                <h2>You've been invited!</h2>
                <p>You have been invited to join the <strong>${organizationName}</strong> organization on DITBlogs.</p>
                <p>Click the button below to accept your invitation and get started.</p>
                <a href="${loginUrl}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
                    Accept Invitation
                </a>
                <p style="font-size: 12px; color: #888; margin-top: 30px;">
                    If you were not expecting this invitation, you can safely ignore this email.
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Invitation email sent to ${to}`);
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        // Depending on your needs, you might want to throw this error
        // to let the calling API know the email failed.
        throw new Error("Failed to send invitation email.");
    }
}
