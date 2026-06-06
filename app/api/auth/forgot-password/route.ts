import { NextResponse } from "next/server";
import { prismadb as prisma } from "@/lib/prisma";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    const user = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      // Return 200 even if user not found for security purposes (don't leak emails)
      return NextResponse.json({ message: "Reset email sent" });
    }

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour from now

    // First delete any existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Create a new reset token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/en/reset-password?token=${token}`;

    const fromEmail = process.env.RESEND_FROM_EMAIL?.includes("@gmail.com") 
      ? "onboarding@resend.dev" 
      : (process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev");

    // Print the link in the console so it always works in development
    console.log("-----------------------------------------");
    console.log(`🔑 PASSWORD RESET LINK FOR ${email}:`);
    console.log(resetUrl);
    console.log("-----------------------------------------");

    try {
      await resend.emails.send({
        from: `OpenAlgon CRM <${fromEmail}>`,
        to: email,
        subject: "Reset your password",
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
            <p>Click the button below to set a new password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 20px;">Reset Password</a>
            <p style="margin-top: 30px; font-size: 12px; color: #666;">This link will expire in 1 hour.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.warn("[FORGOT_PASSWORD_EMAIL_WARNING] Could not send email via Resend, but token was generated.", emailError);
      // We don't throw here to ensure the user still gets a success message
      // and can grab the token from the server console!
    }

    return NextResponse.json({ message: "Reset email sent" });
  } catch (error) {
    console.error("[FORGOT_PASSWORD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
