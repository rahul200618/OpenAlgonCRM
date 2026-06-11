import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "test@example.com";
  const rawPassword = "Password123";

  console.log(`Creating test organization...`);
  const org = await prisma.organization.create({
    data: {
      name: "Test Organization",
      plan: "free",
      status: "active",
      companySize: "1-10",
      industry: "Technology",
    },
  });

  console.log(`Hashing password...`);
  const hashedPassword = await bcrypt.hash(rawPassword, 12);

  console.log(`Creating user ${email} with status ACTIVE...`);
  const user = await prisma.users.create({
    data: {
      name: "Test User",
      email: email,
      password: hashedPassword,
      userStatus: "ACTIVE",
      role: "admin",
      organization_id: org.id,
      emailVerified: true,
    },
  });

  console.log(`\n🎉 Success! Test User created.`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${rawPassword}`);
}

main()
  .catch((e) => {
    console.error("Error creating test user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
