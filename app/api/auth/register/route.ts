import { NextResponse } from "next/server";
import { prismadb as prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, companyName, industry, companySize, phone } = body;

    if (!email || !password || !name || !companyName || !industry || !companySize) {
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

    // Create the organization first
    const organization = await prisma.organization.create({
      data: {
        name: companyName,
        industry,
        companySize,
        plan: "free",
        status: "active",
      },
    });

    // Create the user as admin for this organization
    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        userStatus: "ACTIVE",
        role: "admin",
        organization_id: organization.id,
      },
    });

    return NextResponse.json({ message: "User and Organization created successfully" });
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
