import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client";

const prisma = new PrismaClient();
const email = process.argv[2];

if (!email) {
  console.error("Usage: npx tsx scripts/admin/demote-user.mts <email>");
  process.exit(1);
}

const result = await prisma.user.updateMany({
  where: { email: email.toLowerCase() },
  data: { role: "user" },
});

if (result.count === 0) {
  console.log(`No user found with email: ${email}`);
} else {
  console.log(`✅ Demoted ${email} to regular user`);
}

await prisma.$disconnect();
