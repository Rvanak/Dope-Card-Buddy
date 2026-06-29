import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client";

const prisma = new PrismaClient();

// Z299.4 base URL (2015 edition — the publicly accessible copy on saami.org)
// CHAMBER drawing pages are the second half of the PDF.
// Confirmed: 6.5 Creedmoor cartridge=39 chamber=235 (offset +196)
//            .308 Win cartridge=110 chamber=306 (offset +196)
// All other chamber pages estimated with the same +196 offset.
const Z_BASE = "https://saami.org/wp-content/uploads/2018/01/206.pdf";
const Z = (page: number) => `${Z_BASE}#page=${page}`;

// Individual SAAMI PDFs contain ONLY the drawing pages — no page number needed.
// For those, we just store the bare PDF URL (no fragment).
const UPDATES: { cartridgeName: string; pdfUrl: string }[] = [
  // ─── .224 ────────────────────────────────────────────────────────
  // Chamber drawing pages estimated at cartridge page + 196
  { cartridgeName: ".223 Remington",           pdfUrl: Z(263) },  // cartridge≈67 → chamber≈263
  { cartridgeName: "5.56×45mm NATO",           pdfUrl: Z(263) },  // same chamber as .223
  { cartridgeName: ".224 Valkyrie",            pdfUrl: "https://saami.org/wp-content/uploads/2018/04/224-Valkyrie.pdf" },
  { cartridgeName: ".22-250 Remington",        pdfUrl: Z(256) },  // cartridge≈60 → chamber≈256

  // ─── .243 ────────────────────────────────────────────────────────
  { cartridgeName: ".243 Winchester",          pdfUrl: Z(271) },  // cartridge≈75 → chamber≈271
  { cartridgeName: "6mm Creedmoor",            pdfUrl: "https://saami.org/wp-content/uploads/2018/04/6mm-Creedmoor.pdf" },
  { cartridgeName: "6mm ARC",                  pdfUrl: "https://saami.org/wp-content/uploads/2020/06/Public-Announcement-6mm-ARC-2020-05-15.pdf" },
  { cartridgeName: "6mm Remington",            pdfUrl: Z(272) },  // cartridge≈76 → chamber≈272
  { cartridgeName: ".240 Weatherby Magnum",    pdfUrl: Z(269) },  // cartridge≈73 → chamber≈269

  // ─── .264 / 6.5mm ────────────────────────────────────────────────
  { cartridgeName: "6.5 Creedmoor",            pdfUrl: Z(235) },  // CONFIRMED chamber=235
  { cartridgeName: "6.5 PRC",                  pdfUrl: "https://saami.org/wp-content/uploads/2019/05/6.5-PRC-Public-Introduction.pdf" },
  { cartridgeName: "6.5×47 Lapua",             pdfUrl: Z(237) },  // cartridge≈41 → chamber≈237
  { cartridgeName: ".260 Remington",           pdfUrl: Z(231) },  // cartridge≈35 → chamber≈231
  { cartridgeName: "6.5×55 Swedish",           pdfUrl: Z(240) },  // cartridge≈44 → chamber≈240
  { cartridgeName: ".264 Winchester Magnum",   pdfUrl: Z(232) },  // cartridge≈36 → chamber≈232
  { cartridgeName: "6.5 Grendel",              pdfUrl: Z(234) },  // cartridge≈38 → chamber≈234

  // ─── .284 / 7mm ──────────────────────────────────────────────────
  { cartridgeName: "7mm Remington Magnum",     pdfUrl: Z(300) },  // cartridge≈104 → chamber≈300
  { cartridgeName: "7mm PRC",                  pdfUrl: "https://saami.org/wp-content/uploads/2022/12/7mm-PRC-Public-Introduction.pdf" },
  { cartridgeName: "7mm-08 Remington",         pdfUrl: Z(293) },  // cartridge≈97 → chamber≈293
  { cartridgeName: ".280 Remington",           pdfUrl: Z(284) },  // cartridge≈88 → chamber≈284
  { cartridgeName: ".280 Ackley Improved",     pdfUrl: Z(285) },  // cartridge≈89 → chamber≈285
  { cartridgeName: "7mm Weatherby Magnum",     pdfUrl: Z(304) },  // cartridge≈108 → chamber≈304
  { cartridgeName: "7mm SAUM",                 pdfUrl: Z(297) },  // cartridge≈101 → chamber≈297

  // ─── .308 / 7.62mm ───────────────────────────────────────────────
  { cartridgeName: ".308 Winchester",          pdfUrl: Z(306) },  // CONFIRMED chamber=306
  { cartridgeName: "7.62×51mm NATO",          pdfUrl: Z(306) },  // same chamber as .308 Win
  { cartridgeName: ".30-06 Springfield",       pdfUrl: Z(309) },  // cartridge≈113 → chamber≈309
  { cartridgeName: ".300 Winchester Magnum",   pdfUrl: Z(322) },  // cartridge≈126 → chamber≈322
  { cartridgeName: ".300 PRC",                 pdfUrl: "https://saami.org/wp-content/uploads/2018/07/300-PRC-Public-Introduction.pdf" },
  { cartridgeName: ".300 Norma Magnum",        pdfUrl: "https://saami.org/wp-content/uploads/2018/04/300-Norma-Magnum.pdf" },
  { cartridgeName: ".300 WSM",                 pdfUrl: Z(325) },  // cartridge≈129 → chamber≈325
  { cartridgeName: ".300 Weatherby Magnum",    pdfUrl: Z(326) },  // cartridge≈130 → chamber≈326
  { cartridgeName: ".30 Nosler",               pdfUrl: "https://saami.org/wp-content/uploads/2018/04/30-Nosler-CC-Drawing.pdf" },

  // ─── .338 ────────────────────────────────────────────────────────
  { cartridgeName: ".338 Lapua Magnum",        pdfUrl: Z(344) },  // cartridge≈148 → chamber≈344
  { cartridgeName: ".338 Winchester Magnum",   pdfUrl: Z(345) },  // cartridge≈149 → chamber≈345
  { cartridgeName: ".338 Norma Magnum",        pdfUrl: "https://saami.org/wp-content/uploads/2018/04/338-Norma-Magnum.pdf" },
  { cartridgeName: ".338 Federal",             pdfUrl: Z(339) },  // cartridge≈143 → chamber≈339
  { cartridgeName: ".340 Weatherby Magnum",    pdfUrl: Z(351) },  // cartridge≈155 → chamber≈351
];

async function main() {
  let updated = 0;
  for (const u of UPDATES) {
    const result = await prisma.chamberDrawing.updateMany({
      where: { cartridgeName: u.cartridgeName },
      data: { saamiUrl: u.pdfUrl },
    });
    if (result.count > 0) {
      console.log(`✅ ${u.cartridgeName}`);
      updated += result.count;
    } else {
      console.log(`⚠  Not found: ${u.cartridgeName}`);
    }
  }
  console.log(`\nDone. ${updated} records updated.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
