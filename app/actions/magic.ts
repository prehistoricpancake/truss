"use server";

import { createMagicToken } from "@/lib/magic";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const baseUrl = process.env.NEXTAUTH_URL || "https://truss-rust.vercel.app";
const isDev = process.env.NODE_ENV === "development";
const fromAddress = process.env.RESEND_FROM || "onboarding@resend.dev";

export async function sendMagicLink(email: string): Promise<{ success: boolean; error?: string }> {
  let token: string;
  try {
    token = await createMagicToken(email);
  } catch (error) {
    console.error("Magic link — DynamoDB error:", error);
    return { success: false, error: "Failed to create sign-in token. Please try again." };
  }

  const link = `${baseUrl}/magic-verify?token=${token}&email=${encodeURIComponent(email)}`;

  if (isDev) {
    console.log(`\n\n🔗 Magic link for ${email}:\n${link}\n`);
    return { success: true };
  }

  try {
    const { error: resendError } = await resend.emails.send({
      from: `Truss <${fromAddress}>`,
      to: email,
      subject: "Your sign-in link for Truss",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 40px 32px; border-radius: 16px;">
          <p style="font-size: 24px; font-weight: 600; margin: 0 0 8px;">Truss</p>
          <p style="color: #71717a; font-size: 14px; margin: 0 0 32px;">Cross-platform content infrastructure</p>
          <p style="color: #e4e4e7; font-size: 15px; margin: 0 0 24px;">Click the button below to sign in. This link expires in 15 minutes.</p>
          <a href="${link}" style="display: inline-block; background: #6d5ef0; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-size: 14px; font-weight: 500;">Sign in to Truss</a>
          <p style="color: #52525b; font-size: 12px; margin: 32px 0 0;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (resendError) {
      console.error("Magic link — Resend error:", resendError);
      return { success: false, error: "Failed to send email. Please try again." };
    }

    return { success: true };
  } catch (error) {
    console.error("Magic link — Resend exception:", error);
    return { success: false, error: "Failed to send email. Please try again." };
  }
}

