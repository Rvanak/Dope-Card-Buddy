import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client";

const prisma = new PrismaClient();

// SAAMI standards are free public documents. Individual cartridge PDFs are
// linked directly where SAAMI publishes them as standalone files.
// For cartridges inside the full standard (Z299.4), the standards page URL is used.
const SAAMI_STANDARDS_PAGE = "https://saami.org/technical-information/ansi-saami-standards/";

const DRAWINGS = [
  // ─── .224 (0.224") ────────────────────────────────────────────────
  { caliberInch: 0.224, cartridgeName: ".223 Remington",              saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "NATO 5.56×45 chamber equivalent. SAAMI Z299.4.", sortOrder: 1 },
  { caliberInch: 0.224, cartridgeName: "5.56×45mm NATO",              saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Military NATO round; slightly larger chamber than .223 Rem.", sortOrder: 2 },
  { caliberInch: 0.224, cartridgeName: ".224 Valkyrie",               saamiUrl: "https://saami.org/wp-content/uploads/2019/09/ANSI-SAAMI-Z299.4-Approved-2015-Reaffirmed-2020.pdf", notes: "SAAMI accepted 2017. Based on 6.8 SPC case.", sortOrder: 3 },
  { caliberInch: 0.224, cartridgeName: ".22-250 Remington",           saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "High-velocity varmint cartridge. SAAMI Z299.4.", sortOrder: 4 },

  // ─── .243 (0.243") ────────────────────────────────────────────────
  { caliberInch: 0.243, cartridgeName: ".243 Winchester",             saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Based on .308 Win case necked down. SAAMI Z299.4.", sortOrder: 1 },
  { caliberInch: 0.243, cartridgeName: "6mm Creedmoor",               saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Long-range precision cartridge. SAAMI Z299.4.", sortOrder: 2 },
  { caliberInch: 0.243, cartridgeName: "6mm ARC",                     saamiUrl: "https://saami.org/wp-content/uploads/2020/06/Public-Announcement-6mm-ARC-2020-05-15.pdf", notes: "AR-15 compatible 6mm. SAAMI accepted 2020.", sortOrder: 3 },
  { caliberInch: 0.243, cartridgeName: "6mm Remington",               saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Also known as 244 Rem. SAAMI Z299.4.", sortOrder: 4 },
  { caliberInch: 0.243, cartridgeName: ".240 Weatherby Magnum",       saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Belted magnum 6mm. SAAMI Z299.4.", sortOrder: 5 },

  // ─── .264 (0.264" / 6.5mm) ────────────────────────────────────────
  { caliberInch: 0.264, cartridgeName: "6.5 Creedmoor",               saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Most popular precision 6.5mm. SAAMI Z299.4.", sortOrder: 1 },
  { caliberInch: 0.264, cartridgeName: "6.5 PRC",                     saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "High-velocity 6.5mm magnum. SAAMI Z299.4.", sortOrder: 2 },
  { caliberInch: 0.264, cartridgeName: "6.5×47 Lapua",                saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Match cartridge by Lapua. SAAMI accepted.", sortOrder: 3 },
  { caliberInch: 0.264, cartridgeName: ".260 Remington",              saamiUrl: SAAMI_STANDARDS_PAGE,        notes: ".308 Win necked to 6.5mm. SAAMI Z299.4.", sortOrder: 4 },
  { caliberInch: 0.264, cartridgeName: "6.5×55 Swedish",              saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Classic Scandinavian military cartridge. SAAMI Z299.4.", sortOrder: 5 },
  { caliberInch: 0.264, cartridgeName: ".264 Winchester Magnum",      saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Belted 6.5mm magnum. SAAMI Z299.4.", sortOrder: 6 },
  { caliberInch: 0.264, cartridgeName: "6.5 Grendel",                 saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "AR-15 compatible 6.5mm. SAAMI Z299.4.", sortOrder: 7 },

  // ─── .284 (0.284" / 7mm) ──────────────────────────────────────────
  { caliberInch: 0.284, cartridgeName: "7mm Remington Magnum",        saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Classic belted 7mm magnum. SAAMI Z299.4.", sortOrder: 1 },
  { caliberInch: 0.284, cartridgeName: "7mm PRC",                     saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Modern non-belted 7mm magnum. SAAMI Z299.4.", sortOrder: 2 },
  { caliberInch: 0.284, cartridgeName: "7mm-08 Remington",            saamiUrl: SAAMI_STANDARDS_PAGE,        notes: ".308 Win necked to 7mm. SAAMI Z299.4.", sortOrder: 3 },
  { caliberInch: 0.284, cartridgeName: ".280 Remington",              saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Also known as 7mm Express. SAAMI Z299.4.", sortOrder: 4 },
  { caliberInch: 0.284, cartridgeName: ".280 Ackley Improved",        saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Improved shoulder on .280 Rem. SAAMI Z299.4.", sortOrder: 5 },
  { caliberInch: 0.284, cartridgeName: "7mm Weatherby Magnum",        saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Weatherby proprietary belted magnum. SAAMI Z299.4.", sortOrder: 6 },
  { caliberInch: 0.284, cartridgeName: "7mm SAUM",                    saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Short Action Ultra Magnum. SAAMI Z299.4.", sortOrder: 7 },

  // ─── .308 (0.308" / 7.62mm) ───────────────────────────────────────
  { caliberInch: 0.308, cartridgeName: ".308 Winchester",             saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "The definitive long-range precision chambering. SAAMI Z299.4.", sortOrder: 1 },
  { caliberInch: 0.308, cartridgeName: "7.62×51mm NATO",             saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Military equivalent of .308 Win; slightly different headspace.", sortOrder: 2 },
  { caliberInch: 0.308, cartridgeName: ".30-06 Springfield",         saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Classic American service cartridge. SAAMI Z299.4.", sortOrder: 3 },
  { caliberInch: 0.308, cartridgeName: ".300 Winchester Magnum",     saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Most popular .30 cal magnum. SAAMI Z299.4.", sortOrder: 4 },
  { caliberInch: 0.308, cartridgeName: ".300 PRC",                   saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Precision Rifle Cartridge, non-belted magnum. SAAMI Z299.4.", sortOrder: 5 },
  { caliberInch: 0.308, cartridgeName: ".300 Norma Magnum",          saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "SOCOM-adopted sniper cartridge. SAAMI Z299.4.", sortOrder: 6 },
  { caliberInch: 0.308, cartridgeName: ".300 WSM",                   saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Winchester Short Magnum. SAAMI Z299.4.", sortOrder: 7 },
  { caliberInch: 0.308, cartridgeName: ".300 Weatherby Magnum",      saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "High-velocity belted magnum. SAAMI Z299.4.", sortOrder: 8 },
  { caliberInch: 0.308, cartridgeName: ".30 Nosler",                 saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Nosler proprietary non-belted magnum. SAAMI Z299.4.", sortOrder: 9 },

  // ─── .338 (0.338") ────────────────────────────────────────────────
  { caliberInch: 0.338, cartridgeName: ".338 Lapua Magnum",          saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Primary long-range sniper cartridge. SAAMI Z299.4.", sortOrder: 1 },
  { caliberInch: 0.338, cartridgeName: ".338 Winchester Magnum",     saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Classic belted .338. SAAMI Z299.4.", sortOrder: 2 },
  { caliberInch: 0.338, cartridgeName: ".338 Norma Magnum",          saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "SOCOM-evaluated long-range cartridge. SAAMI Z299.4.", sortOrder: 3 },
  { caliberInch: 0.338, cartridgeName: ".338 Federal",               saamiUrl: SAAMI_STANDARDS_PAGE,        notes: ".308 Win case necked to .338. SAAMI Z299.4.", sortOrder: 4 },
  { caliberInch: 0.338, cartridgeName: ".340 Weatherby Magnum",      saamiUrl: SAAMI_STANDARDS_PAGE,        notes: "Weatherby belted .338 magnum. SAAMI Z299.4.", sortOrder: 5 },
];

async function main() {
  console.log(`Seeding ${DRAWINGS.length} chamber drawings...`);

  let created = 0;
  let skipped = 0;

  for (const d of DRAWINGS) {
    const existing = await prisma.chamberDrawing.findFirst({
      where: { caliberInch: d.caliberInch, cartridgeName: d.cartridgeName },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.chamberDrawing.create({ data: d });
    created++;
  }

  console.log(`✅ Created: ${created}  Skipped (already exist): ${skipped}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
