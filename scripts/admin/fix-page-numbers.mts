/**
 * Fixes all DB chamber drawing page numbers.
 *
 * The old scripts stored INTERNAL TOC page numbers.
 * Actual PDF page = internal TOC page + 12.
 *
 * Z299.4 (206.pdf) confirmed mapping (internal → PDF page):
 *   6.5 Creedmoor  235 → 247  (verified visually ✓)
 *   .223 Remington 264 → 276  (verified visually ✓)
 *   .308 Winchester 306 → 318 (verified visually ✓)
 */
import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client";

const prisma = new PrismaClient();
const Z_BASE = "https://saami.org/wp-content/uploads/2018/01/206.pdf";
const Z = (page: number) => `${Z_BASE}#page=${page}`;

// Complete mapping: cartridgeName → correct PDF page number in 206.pdf
// Internal TOC page + 12 = PDF page (for Z299.4 entries)
// Newer cartridges not in Z299.4 use closest equivalent in the same caliber family
const PAGE_MAP: Record<string, number | null> = {
  // .224 / 5.56mm
  ".223 Remington":           276,  // internal 264 + 12
  "5.56×45mm NATO":           276,  // same chamber as .223 Rem
  ".224 Valkyrie":            271,  // not in Z299.4; use .22-250 Rem (same caliber family)
  ".22-250 Remington":        271,  // internal 259 + 12

  // .243 / 6mm
  ".243 Winchester":          279,  // internal 267 + 12
  "6mm Creedmoor":            246,  // not in Z299.4; use 6mm Remington chamber
  "6mm ARC":                  246,  // not in Z299.4; use 6mm Remington chamber
  "6mm Remington":            246,  // internal 234 + 12
  ".240 Weatherby Magnum":    287,  // use 257 Weatherby as closest

  // .264 / 6.5mm
  "6.5 Creedmoor":            247,  // internal 235 + 12 (verified ✓)
  "6.5 PRC":                  247,  // not in Z299.4; use 6.5 Creedmoor
  "6.5×47 Lapua":             247,  // not in Z299.4; use 6.5 Creedmoor
  ".260 Remington":           289,  // internal 277 + 12
  "6.5×55 Swedish":           247,  // not in Z299.4; use 6.5 Creedmoor
  ".264 Winchester Magnum":   290,  // internal 278 + 12
  "6.5 Grendel":              248,  // internal 236 + 12

  // .284 / 7mm
  "7mm Remington Magnum":     252,  // internal 240 + 12
  "7mm PRC":                  252,  // not in Z299.4; use 7mm Rem Mag
  "7mm-08 Remington":         258,  // internal 246 + 12
  ".280 Remington":           297,  // internal 285 + 12
  ".280 Ackley Improved":     296,  // internal 284 + 12
  "7mm Weatherby Magnum":     256,  // internal 244 + 12
  "7mm SAUM":                 253,  // internal 241 + 12

  // .308 / 7.62mm
  ".308 Winchester":          318,  // internal 306 + 12 (verified ✓)
  "7.62×51mm NATO":           318,  // same chamber as .308 Win
  ".30-06 Springfield":       303,  // internal 291 + 12
  ".300 Winchester Magnum":   313,  // internal 301 + 12
  ".300 PRC":                 313,  // not in Z299.4; use .300 Win Mag
  ".300 Norma Magnum":        313,  // not in Z299.4; use .300 Win Mag
  ".300 WSM":                 314,  // internal 302 + 12
  ".300 Weatherby Magnum":    312,  // internal 300 + 12
  ".30 Nosler":               300,  // internal 288 + 12

  // .338
  ".338 Lapua Magnum":        324,  // internal 312 + 12
  ".338 Winchester Magnum":   328,  // internal 316 + 12
  ".338 Norma Magnum":        328,  // not in Z299.4; use .338 Win Mag
  ".338 Federal":             323,  // internal 311 + 12
  ".340 Weatherby Magnum":    329,  // internal 317 + 12
};

async function main() {
  const rows = await prisma.chamberDrawing.findMany({
    select: { id: true, cartridgeName: true, saamiUrl: true },
  });

  console.log(`Updating ${rows.length} entries...\n`);
  let updated = 0;

  for (const row of rows) {
    const targetPage = PAGE_MAP[row.cartridgeName];
    if (targetPage === undefined) {
      console.log(`SKIP  (no mapping): ${row.cartridgeName}`);
      continue;
    }
    if (targetPage === null) {
      console.log(`SKIP  (null): ${row.cartridgeName}`);
      continue;
    }

    const newUrl = Z(targetPage);
    if (row.saamiUrl === newUrl) {
      console.log(`  OK  (already correct): ${row.cartridgeName} → p.${targetPage}`);
      continue;
    }

    await prisma.chamberDrawing.update({
      where: { id: row.id },
      data: { saamiUrl: newUrl },
    });
    console.log(` SET  ${row.cartridgeName}  →  p.${targetPage}`);
    updated++;
  }

  console.log(`\nDone. Updated ${updated} records.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
