/**
 * Seeds chamber drawings for the 5 caliber families in rifleBulletDatabase.ts
 * that were not covered by seed-all-cartridges.mts:
 *   .311/.312  (.303 British, 7.62×39, 7.62×54R)
 *   .323       (8mm Mauser / 8×57)
 *   .348       (.348 Winchester)
 *   .366       (9.3mm)
 *   .423/.404  (.404 Jeffery)
 *
 * Run:  npx tsx scripts/admin/seed-missing-calibers.mts
 */

import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client";

const prisma = new PrismaClient();

const Z_BASE = "https://saami.org/wp-content/uploads/2018/01/206.pdf";
const Z = (tocPage: number) => `${Z_BASE}#page=${tocPage + 12}`;
const NOTE_CLOSEST = (name: string) =>
  `Wildcat / non-SAAMI. Showing ${name} as closest reference.`;

interface Entry {
  caliberInch: number;
  cartridgeName: string;
  saamiUrl: string;
  notes?: string;
  sortOrder: number;
  isActive: boolean;
}

const ENTRIES: Entry[] = [
  // ─────────────────────────────────────────────────────────────
  //  .311/.312 cal  (.303 British, 7.62×39, 7.62×54R)
  // ─────────────────────────────────────────────────────────────
  { caliberInch: 0.311, cartridgeName: ".303 British",        saamiUrl: Z(303), sortOrder: 1, isActive: true },
  { caliberInch: 0.311, cartridgeName: "7.62×39",             saamiUrl: Z(249), sortOrder: 2, isActive: true },
  { caliberInch: 0.311, cartridgeName: "7.62×54R",            saamiUrl: Z(249), sortOrder: 3, isActive: true,
    notes: NOTE_CLOSEST("7.62×39 (same bore)") },
  { caliberInch: 0.311, cartridgeName: "8mm Mauser (7.92×57)",saamiUrl: Z(250), sortOrder: 4, isActive: true },

  // ─────────────────────────────────────────────────────────────
  //  .323 cal  (8mm Mauser / 8×57 — groove diameter)
  // ─────────────────────────────────────────────────────────────
  { caliberInch: 0.323, cartridgeName: "8×57 IS (8mm Mauser)", saamiUrl: Z(250), sortOrder: 1, isActive: true },
  { caliberInch: 0.323, cartridgeName: "8mm Remington Magnum", saamiUrl: Z(251), sortOrder: 2, isActive: true },
  { caliberInch: 0.323, cartridgeName: "325 Winchester Short Magnum", saamiUrl: Z(309), sortOrder: 3, isActive: true },

  // ─────────────────────────────────────────────────────────────
  //  .348 cal  (.348 Winchester)
  // ─────────────────────────────────────────────────────────────
  { caliberInch: 0.348, cartridgeName: ".348 Winchester",     saamiUrl: Z(318), sortOrder: 1, isActive: true },

  // ─────────────────────────────────────────────────────────────
  //  .366 cal  (9.3mm)
  // ─────────────────────────────────────────────────────────────
  { caliberInch: 0.366, cartridgeName: "9.3×62",              saamiUrl: Z(252), sortOrder: 1, isActive: true },
  { caliberInch: 0.366, cartridgeName: "9.3×74R",             saamiUrl: Z(252), sortOrder: 2, isActive: true,
    notes: NOTE_CLOSEST("9.3×62 (same bore)") },
  { caliberInch: 0.366, cartridgeName: "370 Sako Magnum",     saamiUrl: Z(326), sortOrder: 3, isActive: true },
  { caliberInch: 0.366, cartridgeName: "376 Steyr",           saamiUrl: Z(331), sortOrder: 4, isActive: true },

  // ─────────────────────────────────────────────────────────────
  //  .423/.404 cal  (.404 Jeffery)
  // ─────────────────────────────────────────────────────────────
  { caliberInch: 0.423, cartridgeName: ".404 Jeffery",        saamiUrl: Z(334), sortOrder: 1, isActive: true,
    notes: NOTE_CLOSEST("405 Winchester (similar bore; .404 Jeffery not in SAAMI Z299.4)") },
  { caliberInch: 0.423, cartridgeName: "405 Winchester",      saamiUrl: Z(334), sortOrder: 2, isActive: true },
];

async function main() {
  const existing = await prisma.chamberDrawing.findMany({
    select: { cartridgeName: true },
  });
  const existingNames = new Set(existing.map((e) => e.cartridgeName));

  let added = 0, skipped = 0;
  for (const entry of ENTRIES) {
    if (existingNames.has(entry.cartridgeName)) {
      console.log(`  SKIP  ${entry.cartridgeName}`);
      skipped++;
      continue;
    }
    await prisma.chamberDrawing.create({ data: entry });
    console.log(`  ADD   ${entry.cartridgeName}  (cal ${entry.caliberInch})`);
    added++;
  }
  console.log(`\nDone — added ${added}, skipped ${skipped}.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
