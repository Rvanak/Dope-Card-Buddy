/**
 * Finds ChamberDrawing entries whose saamiUrl is:
 *   - NULL / empty
 *   - The SAAMI HTML standards page (not a PDF)
 *   - Not ending in .pdf or containing /uploads/
 *
 * Run:  npx tsx scripts/admin/check-bad-urls.mts
 */
import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client";

const prisma = new PrismaClient();
const HTML_LANDING = "https://saami.org/technical-information/ansi-saami-standards/";

async function main() {
  const all = await prisma.chamberDrawing.findMany({
    select: { id: true, cartridgeName: true, caliberInch: true, saamiUrl: true, isActive: true },
    orderBy: [{ caliberInch: "asc" }, { cartridgeName: "asc" }],
  });

  const bad = all.filter(
    (d) =>
      !d.saamiUrl ||
      d.saamiUrl === HTML_LANDING ||
      (!d.saamiUrl.includes("/uploads/") && !d.saamiUrl.endsWith(".pdf"))
  );

  if (!bad.length) {
    console.log(`✅  All ${all.length} entries have valid PDF URLs.`);
    return;
  }

  console.log(`⚠️  Found ${bad.length} entries with missing or non-PDF URLs:\n`);
  bad.forEach((d) => {
    console.log(`  cal=${d.caliberInch}  ${d.cartridgeName}`);
    console.log(`    url=${d.saamiUrl ?? "(null)"}\n`);
  });

  console.log(`Total entries in DB: ${all.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
