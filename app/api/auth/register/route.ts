import { NextResponse } from "next/server";
import { prismadb as prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!email || !password || !name) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const existingUser = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return new NextResponse("Email already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        userStatus: "ACTIVE",
        role: "user",
      },
    });

    return NextResponse.json({ message: "User created successfully" });
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
