import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaClient } from "../../src/generated/prisma/client";

const prisma = new PrismaClient();

const email = process.env.ADMIN_EMAIL?.toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD.");
  console.error('Run as: ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="StrongPass123!" npm run admin:create');
  process.exit(1);
}

if (password.length < 8) {
  console.error("ADMIN_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

async function run() {
  if (!email || !password) {
    throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD.");
  }

  const passwordHash = await hash(password, 12);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: "admin", passwordHash },
    });
    console.log(`Updated existing user as admin: ${email}`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "admin",
    },
  });
  console.log(`Created admin user: ${email}`);
}

run()
  .catch((error) => {
    console.error("Failed to create admin user.");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
