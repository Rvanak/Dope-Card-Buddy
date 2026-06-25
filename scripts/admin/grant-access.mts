import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Grant all admin users permanent (100-year) access
  const admins = await prisma.user.findMany({ where: { role: "admin" } });

  if (admins.length === 0) {
    console.error("No admin users found. Create one first with npm run admin:create");
    process.exit(1);
  }

  const farFuture = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);

  for (const admin of admins) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { trialAccessExpiresAt: farFuture },
    });
    console.log(`✅ Granted permanent access to ${admin.email}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
