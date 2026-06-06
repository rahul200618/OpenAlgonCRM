import { NextResponse } from "next/server";
import { prismadb as prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const existingToken = await prisma.verificationToken.findFirst({
      where: {
        token,
      },
    });

    if (!existingToken) {
      return new NextResponse("Invalid or expired token", { status: 400 });
    }

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
      return new NextResponse("Token has expired", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.users.update({
      where: {
        email: existingToken.identifier,
      },
      data: {
        password: hashedPassword,
      },
    });

    // Clean up token after use
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: existingToken.identifier,
          token: existingToken.token,
        },
      },
    });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("[RESET_PASSWORD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
