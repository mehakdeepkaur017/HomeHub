import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.isDeleted) {
      // Return success even if user not found to prevent email enumeration
      return NextResponse.json({ success: true, message: "If an account exists, a reset email has been sent." });
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // In a real app with a proper DB schema for tokens, we'd save it.
    // For this architecture, we would ideally have a `PasswordResetToken` model.
    // Since we are abstracting the email, we'll log it for development purposes.
    console.log(`[DEV ONLY] Reset Token for ${email}: ${resetToken}`);

    // await sendEmail(user.email, resetToken);

    return NextResponse.json({ success: true, message: "If an account exists, a reset email has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
