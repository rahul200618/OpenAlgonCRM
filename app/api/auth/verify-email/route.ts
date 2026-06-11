import { NextResponse } from "next/server";
import { prismadb as prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return new NextResponse("Missing token", { status: 400 });
    }

    const existingToken = await prisma.verificationToken.findUnique({
      where: {
        token,
      },
    });

    if (!existingToken) {
      return new NextResponse("Token does not exist!", { status: 400 });
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
      return new NextResponse("Token has expired!", { status: 400 });
    }

    const existingUser = await prisma.users.findUnique({
      where: {
        email: existingToken.identifier,
      },
    });

    if (!existingUser) {
      return new NextResponse("Email does not exist!", { status: 400 });
    }

    await prisma.users.update({
      where: {
        id: existingUser.id,
      },
      data: {
        emailVerified: true,
        userStatus: "ACTIVE", // Activate the user
        email: existingToken.identifier, // Update email if they changed it
      },
    });

    await prisma.verificationToken.delete({
      where: {
        id: (existingToken as any).id || existingToken.token,
        token: existingToken.token
      },
    });

    return NextResponse.json({ success: "Email verified successfully!" });
  } catch (error) {
    console.error("[VERIFY_EMAIL_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
