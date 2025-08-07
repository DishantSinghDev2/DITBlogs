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



interface SendNewsletterEmailOptions {
    to: string;
    subject: string;
    organizationName: string;
    posts: Array<{ title: string; slug: string; excerpt?: string | null }>;
}

export async function sendNewsletterEmail({ to, subject, organizationName, posts }: SendNewsletterEmailOptions) {
    const unsubscribeToken = generateToken(to);
    const unsubscribeUrl = `${process.env.NEXTAUTH_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;
    const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const postsHtml = posts.map(post => `
        <div style="margin-bottom: 20px;">
            <h3 style="margin: 0; font-size: 18px;">
                <a href="${siteUrl}/blog/${post.slug}" style="color: #1a1a1a; text-decoration: none;">${post.title}</a>
            </h3>
            ${post.excerpt ? `<p style="margin: 5px 0 0; color: #555;">${post.excerpt}</p>` : ''}
        </div>
    `).join('');

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #f8f8f8; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; color: #333;">${organizationName}'s Weekly Digest</h1>
                </div>
                <div style="padding: 20px;">
                    ${postsHtml}
                </div>
                <div style="background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #888;">
                    <p>You received this email because you subscribed to our newsletter.</p>
                    <p><a href="${unsubscribeUrl}" style="color: #555; text-decoration: underline;">Unsubscribe</a></p>
                </div>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
}


interface SendWelcomeEmailOptions {
    to: string;
    organizationName: string;
}

export async function sendWelcomeEmail({ to, organizationName }: SendWelcomeEmailOptions) {
    const unsubscribeToken = generateToken(to);
    const unsubscribeUrl = `${process.env.NEXTAUTH_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;
    const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject: `Welcome to the ${organizationName} Newsletter!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                
                <!-- Header Image -->
                <div style="text-align: center; background-color: #f4f4f7; padding: 40px 20px;">
                    <h1 style="color: #1a1a1a; margin: 0; font-size: 28px;">Welcome Aboard!</h1>
                </div>

                <!-- Main Content -->
                <div style="padding: 30px 20px; color: #333333; line-height: 1.6;">
                    <h2 style="font-size: 20px; color: #1a1a1a;">Thanks for subscribing to the ${organizationName} newsletter!</h2>
                    <p>We're thrilled to have you as part of our community. You're all set to receive the latest posts, news, and updates directly to your inbox.</p>
                    
                    <h3 style="font-size: 18px; color: #1a1a1a; border-bottom: 2px solid #e0e0e0; padding-bottom: 5px; margin-top: 30px;">What to Expect:</h3>
                    <ul style="padding-left: 20px;">
                        <li><strong>Weekly Digests:</strong> Get a roundup of our newest and most popular articles every week.</li>
                        <li><strong>Exclusive Content:</strong> Access insights and articles available only to our subscribers.</li>
                        <li><strong>No Spam:</strong> We respect your inbox and promise to only send you high-quality, relevant content.</li>
                    </ul>

                    <p style="margin-top: 30px;">In the meantime, you can check out our latest posts on our blog:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${siteUrl}/blog" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Explore the Blog
                        </a>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #f4f4f7; padding: 20px; text-align: center; font-size: 12px; color: #888888;">
                    <p>You received this email because you subscribed to our newsletter.</p>
                    <p>Not your cup of tea? <a href="${unsubscribeUrl}" style="color: #555555; text-decoration: underline;">Unsubscribe here</a>.</p>
                    <p>&copy; ${new Date().getFullYear()} ${organizationName}. All Rights Reserved.</p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent successfully to ${to}`);
    } catch (error) {
        console.error(`Failed to send welcome email to ${to}:`, error);
        // We throw the error to let the API route know that something went wrong.
        throw new Error("The welcome email could not be sent.");
    }
}