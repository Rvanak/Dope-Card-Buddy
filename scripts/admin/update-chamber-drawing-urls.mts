import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client";

const prisma = new PrismaClient();

// Z299.4 main PDF (2015 – still the publicly accessible copy)
// Page numbers reference cartridge drawing then chamber drawing within this PDF
const Z = (page: number) =>
  `https://saami.org/wp-content/uploads/2018/01/206.pdf#page=${page}`;

const UPDATES: { cartridgeName: string; pdfUrl: string }[] = [
  // ─── .224 ────────────────────────────────────────────────
  { cartridgeName: ".223 Remington",           pdfUrl: Z(67)  },
  { cartridgeName: "5.56×45mm NATO",           pdfUrl: Z(67)  },
  { cartridgeName: ".224 Valkyrie",            pdfUrl: "https://saami.org/wp-content/uploads/2018/04/224-Valkyrie.pdf" },
  { cartridgeName: ".22-250 Remington",        pdfUrl: Z(60)  },

  // ─── .243 ────────────────────────────────────────────────
  { cartridgeName: ".243 Winchester",          pdfUrl: Z(75)  },
  { cartridgeName: "6mm Creedmoor",            pdfUrl: "https://saami.org/wp-content/uploads/2018/04/6mm-Creedmoor.pdf" },
  { cartridgeName: "6mm ARC",                  pdfUrl: "https://saami.org/wp-content/uploads/2020/06/Public-Announcement-6mm-ARC-2020-05-15.pdf" },
  { cartridgeName: "6mm Remington",            pdfUrl: Z(76)  },
  { cartridgeName: ".240 Weatherby Magnum",    pdfUrl: Z(73)  },

  // ─── .264 / 6.5mm ────────────────────────────────────────
  { cartridgeName: "6.5 Creedmoor",            pdfUrl: Z(39)  },
  { cartridgeName: "6.5 PRC",                  pdfUrl: "https://saami.org/wp-content/uploads/2019/05/6.5-PRC-Public-Introduction.pdf" },
  { cartridgeName: "6.5×47 Lapua",             pdfUrl: Z(41)  },
  { cartridgeName: ".260 Remington",           pdfUrl: Z(35)  },
  { cartridgeName: "6.5×55 Swedish",           pdfUrl: Z(44)  },
  { cartridgeName: ".264 Winchester Magnum",   pdfUrl: Z(36)  },
  { cartridgeName: "6.5 Grendel",              pdfUrl: Z(38)  },

  // ─── .284 / 7mm ──────────────────────────────────────────
  { cartridgeName: "7mm Remington Magnum",     pdfUrl: Z(104) },
  { cartridgeName: "7mm PRC",                  pdfUrl: "https://saami.org/wp-content/uploads/2022/12/7mm-PRC-Public-Introduction.pdf" },
  { cartridgeName: "7mm-08 Remington",         pdfUrl: Z(97)  },
  { cartridgeName: ".280 Remington",           pdfUrl: Z(88)  },
  { cartridgeName: ".280 Ackley Improved",     pdfUrl: Z(89)  },
  { cartridgeName: "7mm Weatherby Magnum",     pdfUrl: Z(108) },
  { cartridgeName: "7mm SAUM",                 pdfUrl: Z(101) },

  // ─── .308 / 7.62mm ───────────────────────────────────────
  { cartridgeName: ".308 Winchester",          pdfUrl: Z(110) },
  { cartridgeName: "7.62×51mm NATO",          pdfUrl: Z(110) },
  { cartridgeName: ".30-06 Springfield",       pdfUrl: Z(113) },
  { cartridgeName: ".300 Winchester Magnum",   pdfUrl: Z(126) },
  { cartridgeName: ".300 PRC",                 pdfUrl: "https://saami.org/wp-content/uploads/2018/07/300-PRC-Public-Introduction.pdf" },
  { cartridgeName: ".300 Norma Magnum",        pdfUrl: "https://saami.org/wp-content/uploads/2018/04/300-Norma-Magnum.pdf" },
  { cartridgeName: ".300 WSM",                 pdfUrl: Z(129) },
  { cartridgeName: ".300 Weatherby Magnum",    pdfUrl: Z(130) },
  { cartridgeName: ".30 Nosler",               pdfUrl: "https://saami.org/wp-content/uploads/2018/04/30-Nosler-CC-Drawing.pdf" },

  // ─── .338 ────────────────────────────────────────────────
  { cartridgeName: ".338 Lapua Magnum",        pdfUrl: Z(148) },
  { cartridgeName: ".338 Winchester Magnum",   pdfUrl: Z(149) },
  { cartridgeName: ".338 Norma Magnum",        pdfUrl: "https://saami.org/wp-content/uploads/2018/04/338-Norma-Magnum.pdf" },
  { cartridgeName: ".338 Federal",             pdfUrl: Z(143) },
  { cartridgeName: ".340 Weatherby Magnum",    pdfUrl: Z(155) },
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
