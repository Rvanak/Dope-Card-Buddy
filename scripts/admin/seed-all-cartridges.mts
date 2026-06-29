/**
 * Comprehensive chamber-drawing seed for all user-supplied cartridges.
 * Sources:
 *   Z299.4 = https://saami.org/wp-content/uploads/2018/01/206.pdf
 *             (internal TOC page + 12 = actual PDF page)
 *   SAAMI individual PDFs used where the cartridge is standardized but
 *   not in the Z299.4 document (newer standards).
 *
 * Run:  npx tsx scripts/admin/seed-all-cartridges.mts
 */

import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client";

const prisma = new PrismaClient();

const Z_BASE = "https://saami.org/wp-content/uploads/2018/01/206.pdf";
/** Convert Z299.4 internal TOC page → URL fragment pointing to actual PDF page */
const Z = (tocPage: number) => `${Z_BASE}#page=${tocPage + 12}`;

const WILDCAT = "Wildcat — no SAAMI standard.";
const NOTE_CLOSEST = (name: string) => `${WILDCAT} Showing ${name} chamber drawing as closest reference.`;

// ─── Entry type ────────────────────────────────────────────────────────────
interface Entry {
  caliberInch: number;
  cartridgeName: string;
  saamiUrl: string;
  notes?: string;
  sortOrder: number;
  isActive: boolean;
}

// ─── Full cartridge list ────────────────────────────────────────────────────
// Organised: SAAMI-standardised entries first (real drawing), then wildcats.
const ENTRIES: Entry[] = [
  // ══════════════════════════════════════════════════════════════
  //  .144 cal  (.14-222 — extreme wildcat, uses .222 Rem parent)
  // ══════════════════════════════════════════════════════════════
  { caliberInch: 0.144, cartridgeName: ".14-222",               saamiUrl: Z(262), sortOrder: 1, isActive: true,
    notes: NOTE_CLOSEST(".222 Remington") },

  // ══════════════════════════════════════════════════════════════
  //  .172 cal  (.17 family)
  // ══════════════════════════════════════════════════════════════
  { caliberInch: 0.172, cartridgeName: ".17 Hornet",            saamiUrl: Z(253), sortOrder: 1, isActive: true },
  { caliberInch: 0.172, cartridgeName: ".17 Remington",         saamiUrl: Z(254), sortOrder: 2, isActive: true },
  { caliberInch: 0.172, cartridgeName: ".17 Remington Fireball",saamiUrl: Z(255), sortOrder: 3, isActive: true },
  { caliberInch: 0.172, cartridgeName: ".17 Ackley Bee",        saamiUrl: Z(257), sortOrder: 4, isActive: true,
    notes: NOTE_CLOSEST(".218 Bee (parent case)") },
  { caliberInch: 0.172, cartridgeName: ".17 Mach IV",           saamiUrl: Z(261), sortOrder: 5, isActive: true,
    notes: NOTE_CLOSEST(".221 Remington Fireball (parent case)") },
  { caliberInch: 0.172, cartridgeName: ".17-223",               saamiUrl: Z(264), sortOrder: 6, isActive: true,
    notes: NOTE_CLOSEST(".223 Remington (parent case)") },

  // ══════════════════════════════════════════════════════════════
  //  .196 cal  (.19 wildcats)
  // ══════════════════════════════════════════════════════════════
  { caliberInch: 0.196, cartridgeName: ".19-223",               saamiUrl: Z(264), sortOrder: 1, isActive: true,
    notes: NOTE_CLOSEST(".223 Remington (parent case)") },
  { caliberInch: 0.196, cartridgeName: ".19 Badger",            saamiUrl: Z(264), sortOrder: 2, isActive: true,
    notes: NOTE_CLOSEST(".223 Remington (parent case)") },

  // ══════════════════════════════════════════════════════════════
  //  .204 cal  (.20 family)
  // ══════════════════════════════════════════════════════════════
  { caliberInch: 0.204, cartridgeName: ".204 Ruger",            saamiUrl: Z(256), sortOrder: 1, isActive: true },
  { caliberInch: 0.204, cartridgeName: ".20 BR",                saamiUrl: Z(256), sortOrder: 2, isActive: true,
    notes: NOTE_CLOSEST(".204 Ruger") },
  { caliberInch: 0.204, cartridgeName: ".20 Tactical",          saamiUrl: Z(256), sortOrder: 3, isActive: true,
    notes: NOTE_CLOSEST(".204 Ruger") },
  { caliberInch: 0.204, cartridgeName: ".20 VarTarg",           saamiUrl: Z(256), sortOrder: 4, isActive: true,
    notes: NOTE_CLOSEST(".204 Ruger") },

  // ══════════════════════════════════════════════════════════════
  //  .224 cal  (.22 family — many wildcats + factory)
  // ══════════════════════════════════════════════════════════════
  //  Already in DB: .223 Remington · 5.56×45mm NATO · .224 Valkyrie · .22-250 Remington
  { caliberInch: 0.224, cartridgeName: ".218 Bee",              saamiUrl: Z(257), sortOrder: 5, isActive: true },
  { caliberInch: 0.224, cartridgeName: ".22 Hornet",            saamiUrl: Z(258), sortOrder: 6, isActive: true },
  { caliberInch: 0.224, cartridgeName: ".220 Swift",            saamiUrl: Z(260), sortOrder: 7, isActive: true },
  { caliberInch: 0.224, cartridgeName: ".221 Remington Fireball",saamiUrl: Z(261), sortOrder: 8, isActive: true },
  { caliberInch: 0.224, cartridgeName: ".222 Remington",        saamiUrl: Z(262), sortOrder: 9, isActive: true },
  { caliberInch: 0.224, cartridgeName: ".222 Remington Magnum", saamiUrl: Z(263), sortOrder: 10, isActive: true },
  { caliberInch: 0.224, cartridgeName: ".223 WSSM",             saamiUrl: Z(265), sortOrder: 11, isActive: true },
  { caliberInch: 0.224, cartridgeName: ".225 Winchester",       saamiUrl: Z(266), sortOrder: 12, isActive: true },
  { caliberInch: 0.224, cartridgeName: ".22-250 Improved",      saamiUrl: Z(259), sortOrder: 13, isActive: true,
    notes: NOTE_CLOSEST(".22-250 Remington (parent case)") },
  { caliberInch: 0.224, cartridgeName: ".219 Donaldson Wasp",   saamiUrl: Z(262), sortOrder: 14, isActive: true,
    notes: NOTE_CLOSEST(".222 Remington (similar case family)") },
  { caliberInch: 0.224, cartridgeName: ".22 BR Remington",      saamiUrl: Z(262), sortOrder: 15, isActive: true,
    notes: NOTE_CLOSEST(".222 Remington (same bore)") },
  { caliberInch: 0.224, cartridgeName: ".22 PPC",               saamiUrl: Z(262), sortOrder: 16, isActive: true,
    notes: NOTE_CLOSEST(".222 Remington (same bore)") },
  { caliberInch: 0.224, cartridgeName: ".22 ARC",               saamiUrl: Z(264), sortOrder: 17, isActive: true,
    notes: "SAAMI standardized 2022. Showing .223 Remington as closest reference." },
  { caliberInch: 0.224, cartridgeName: ".22 Creedmoor",         saamiUrl: Z(259), sortOrder: 18, isActive: true,
    notes: NOTE_CLOSEST(".22-250 Remington (same case parent)") },
  { caliberInch: 0.224, cartridgeName: ".22 CHeetah",           saamiUrl: Z(263), sortOrder: 19, isActive: true,
    notes: NOTE_CLOSEST(".222 Remington Magnum (parent case)") },
  { caliberInch: 0.224, cartridgeName: ".22 Nosler",            saamiUrl: Z(264), sortOrder: 20, isActive: true,
    notes: "SAAMI standardized 2016. Showing .223 Remington as reference." },
  { caliberInch: 0.224, cartridgeName: ".224 Boz",              saamiUrl: Z(264), sortOrder: 21, isActive: true,
    notes: NOTE_CLOSEST(".223 Remington (same bore)") },
  { caliberInch: 0.224, cartridgeName: ".224 Weatherby Magnum", saamiUrl: Z(264), sortOrder: 22, isActive: true,
    notes: "No individual SAAMI drawing available. Showing .223 Remington as closest standard." },

  // ══════════════════════════════════════════════════════════════
  //  .243 cal  (6mm family)
  // ══════════════════════════════════════════════════════════════
  //  Already in DB: .243 Winchester · 6mm Creedmoor · 6mm ARC · 6mm Remington
  //                 .240 Weatherby Magnum · 6mm Dasher
  { caliberInch: 0.243, cartridgeName: ".243 WSSM",             saamiUrl: Z(268), sortOrder: 7, isActive: true },
  { caliberInch: 0.243, cartridgeName: ".244 Remington",        saamiUrl: Z(234), sortOrder: 8, isActive: true,
    notes: "Same SAAMI chamber as 6mm Remington (SAAMI renamed it)." },
  { caliberInch: 0.243, cartridgeName: ".243 Ackley Improved",  saamiUrl: Z(267), sortOrder: 9, isActive: true,
    notes: NOTE_CLOSEST(".243 Winchester (parent case)") },
  { caliberInch: 0.243, cartridgeName: "6mm BR",                saamiUrl: Z(234), sortOrder: 10, isActive: true,
    notes: NOTE_CLOSEST("6mm Remington (same bore)") },
  { caliberInch: 0.243, cartridgeName: "6mm BRX",               saamiUrl: Z(234), sortOrder: 11, isActive: true,
    notes: NOTE_CLOSEST("6mm Remington (parent case)") },
  { caliberInch: 0.243, cartridgeName: "6 BRA",                 saamiUrl: Z(234), sortOrder: 12, isActive: true,
    notes: NOTE_CLOSEST("6mm Remington (same bore)") },
  { caliberInch: 0.243, cartridgeName: "6mm Super LR",          saamiUrl: Z(234), sortOrder: 13, isActive: true,
    notes: NOTE_CLOSEST("6mm Remington (same bore)") },
  { caliberInch: 0.243, cartridgeName: "6 XC",                  saamiUrl: Z(267), sortOrder: 14, isActive: true,
    notes: NOTE_CLOSEST(".243 Winchester (same bore)") },
  // "6 Dasher" alias (6mm Dasher already in DB under that name)
  { caliberInch: 0.243, cartridgeName: "6 Dasher",              saamiUrl: Z(234), sortOrder: 15, isActive: true,
    notes: "Alias for 6mm Dasher. " + NOTE_CLOSEST("6mm Remington (same bore)") },

  // ══════════════════════════════════════════════════════════════
  //  .257 cal  (.25 family) — all new
  // ══════════════════════════════════════════════════════════════
  { caliberInch: 0.257, cartridgeName: ".25-06 Remington",      saamiUrl: Z(270), sortOrder: 1, isActive: true },
  { caliberInch: 0.257, cartridgeName: ".257 Roberts",          saamiUrl: Z(274), sortOrder: 2, isActive: true },
  { caliberInch: 0.257, cartridgeName: ".257 Roberts +P",       saamiUrl: Z(274), sortOrder: 3, isActive: true },
  { caliberInch: 0.257, cartridgeName: ".257 Weatherby Magnum", saamiUrl: Z(275), sortOrder: 4, isActive: true },
  { caliberInch: 0.257, cartridgeName: ".25 WSSM",              saamiUrl: Z(269), sortOrder: 5, isActive: true },
  { caliberInch: 0.257, cartridgeName: ".250 Savage",           saamiUrl: Z(273), sortOrder: 6, isActive: true },
  { caliberInch: 0.257, cartridgeName: ".25-20 Winchester",     saamiUrl: Z(271), sortOrder: 7, isActive: true },
  { caliberInch: 0.257, cartridgeName: ".25-35 Winchester",     saamiUrl: Z(272), sortOrder: 8, isActive: true },

  // ══════════════════════════════════════════════════════════════
  //  .264 cal  (6.5mm family)
  // ══════════════════════════════════════════════════════════════
  //  Already in DB: 6.5 Creedmoor · 6.5 PRC · 6.5×47 Lapua · .260 Remington
  //                 6.5×55 Swedish · .264 Winchester Magnum · 6.5 Grendel
  { caliberInch: 0.264, cartridgeName: ".26 Nosler",            saamiUrl: Z(276), sortOrder: 8, isActive: true },
  { caliberInch: 0.264, cartridgeName: "6.5-284 Norma",         saamiUrl: Z(235), sortOrder: 9, isActive: true,
    notes: "SAAMI standardized. Showing 6.5 Creedmoor as closest reference (same bore)." },
  { caliberInch: 0.264, cartridgeName: "6.5 Weatherby RPM",     saamiUrl: Z(235), sortOrder: 10, isActive: true,
    notes: "SAAMI standardized 2020. Showing 6.5 Creedmoor as closest reference." },
  { caliberInch: 0.264, cartridgeName: "6.5 XC",                saamiUrl: Z(235), sortOrder: 11, isActive: true,
    notes: NOTE_CLOSEST("6.5 Creedmoor (same bore)") },
  { caliberInch: 0.264, cartridgeName: "6.5 Creedmoor Improved",saamiUrl: Z(235), sortOrder: 12, isActive: true,
    notes: NOTE_CLOSEST("6.5 Creedmoor (parent case)") },

  // ══════════════════════════════════════════════════════════════
  //  .277 cal  (.270 family) — all new
  // ══════════════════════════════════════════════════════════════
  { caliberInch: 0.277, cartridgeName: ".270 Winchester",       saamiUrl: Z(281), sortOrder: 1, isActive: true },
  { caliberInch: 0.277, cartridgeName: ".270 WSM",              saamiUrl: Z(282), sortOrder: 2, isActive: true },
  { caliberInch: 0.277, cartridgeName: ".270 Weatherby Magnum", saamiUrl: Z(280), sortOrder: 3, isActive: true },
  { caliberInch: 0.277, cartridgeName: ".277 Fury",             saamiUrl: Z(281), sortOrder: 4, isActive: true,
    notes: "SAAMI standardized (SIG proprietary). Showing .270 Winchester as closest reference." },
  { caliberInch: 0.277, cartridgeName: "27 Nosler",             saamiUrl: Z(279), sortOrder: 5, isActive: true },

  // ══════════════════════════════════════════════════════════════
  //  .284 cal  (7mm family)
  // ══════════════════════════════════════════════════════════════
  //  Already in DB: 7mm Rem Mag · 7mm PRC · 7mm-08 Rem · .280 Rem · .280 AI
  //                 7mm Weatherby Mag · 7mm SAUM
  { caliberInch: 0.284, cartridgeName: ".284 Winchester",       saamiUrl: Z(286), sortOrder: 8, isActive: true },
  { caliberInch: 0.284, cartridgeName: "7mm STW",               saamiUrl: Z(243), sortOrder: 9, isActive: true },
  { caliberInch: 0.284, cartridgeName: "7mm Remington Ultra Magnum", saamiUrl: Z(242), sortOrder: 10, isActive: true },
  { caliberInch: 0.284, cartridgeName: "28 Nosler",             saamiUrl: Z(283), sortOrder: 11, isActive: true },
  { caliberInch: 0.284, cartridgeName: "7mm-300 Weatherby",     saamiUrl: Z(244), sortOrder: 12, isActive: true,
    notes: NOTE_CLOSEST("7mm Weatherby Magnum (parent case)") },
  { caliberInch: 0.284, cartridgeName: "7mm Dasher",            saamiUrl: Z(246), sortOrder: 13, isActive: true,
    notes: NOTE_CLOSEST("7mm-08 Remington (same case family)") },
  { caliberInch: 0.284, cartridgeName: "7mm Mauser (7×57)",     saamiUrl: Z(239), sortOrder: 14, isActive: true },
  { caliberInch: 0.284, cartridgeName: "7mm SAUM",              saamiUrl: Z(241), sortOrder: 15, isActive: true },

  // ══════════════════════════════════════════════════════════════
  //  .308 cal  (.30 family)
  // ══════════════════════════════════════════════════════════════
  //  Already in DB: .308 Win · 7.62×51mm NATO · .30-06 · .300 Win Mag
  //                 .300 PRC · .300 Norma Mag · .300 WSM · .300 Weatherby · .30 Nosler
  { caliberInch: 0.308, cartridgeName: ".30 Carbine",           saamiUrl: Z(287), sortOrder: 10, isActive: true },
  { caliberInch: 0.308, cartridgeName: ".30-30 Winchester",     saamiUrl: Z(292), sortOrder: 11, isActive: true },
  { caliberInch: 0.308, cartridgeName: ".30-40 Krag",           saamiUrl: Z(293), sortOrder: 12, isActive: true },
  { caliberInch: 0.308, cartridgeName: ".300 AAC Blackout",     saamiUrl: Z(294), sortOrder: 13, isActive: true },
  { caliberInch: 0.308, cartridgeName: ".300 Blackout",         saamiUrl: Z(294), sortOrder: 14, isActive: true,
    notes: "Same as .300 AAC Blackout. Same SAAMI chamber drawing." },
  { caliberInch: 0.308, cartridgeName: ".300 H&H Magnum",       saamiUrl: Z(295), sortOrder: 15, isActive: true },
  { caliberInch: 0.308, cartridgeName: ".300 Remington Ultra Magnum", saamiUrl: Z(297), sortOrder: 16, isActive: true },
  { caliberInch: 0.308, cartridgeName: ".300 Ruger Compact Magnum",   saamiUrl: Z(298), sortOrder: 17, isActive: true },
  { caliberInch: 0.308, cartridgeName: ".300 Savage",           saamiUrl: Z(299), sortOrder: 18, isActive: true },
  { caliberInch: 0.308, cartridgeName: ".300 Winchester Short Magnum", saamiUrl: Z(302), sortOrder: 19, isActive: true },
  { caliberInch: 0.308, cartridgeName: ".30-378 Weatherby Magnum",    saamiUrl: Z(297), sortOrder: 20, isActive: true,
    notes: "Weatherby proprietary. Showing .300 Rem Ultra Mag as closest reference." },
  { caliberInch: 0.308, cartridgeName: ".300 Lapua Magnum",     saamiUrl: Z(297), sortOrder: 21, isActive: true,
    notes: "Not in SAAMI Z299.4. Showing .300 Rem Ultra Mag as closest reference." },
  { caliberInch: 0.308, cartridgeName: ".308 Norma Magnum",     saamiUrl: Z(301), sortOrder: 22, isActive: true,
    notes: "CIP standard, not in SAAMI Z299.4. Showing .300 Win Mag as closest reference." },
  { caliberInch: 0.308, cartridgeName: ".308 Improved",         saamiUrl: Z(306), sortOrder: 23, isActive: true,
    notes: NOTE_CLOSEST(".308 Winchester (parent case)") },
  { caliberInch: 0.308, cartridgeName: ".300 Win Mag Improved", saamiUrl: Z(301), sortOrder: 24, isActive: true,
    notes: NOTE_CLOSEST(".300 Winchester Magnum (parent case)") },
  { caliberInch: 0.308, cartridgeName: ".300 Remington SA Ultra Mag", saamiUrl: Z(296), sortOrder: 25, isActive: true },
  { caliberInch: 0.308, cartridgeName: "30 Remington AR",       saamiUrl: Z(289), sortOrder: 26, isActive: true },
  { caliberInch: 0.308, cartridgeName: ".303 British",          saamiUrl: Z(303), sortOrder: 27, isActive: true },
  { caliberInch: 0.308, cartridgeName: ".325 WSM",              saamiUrl: Z(309), sortOrder: 28, isActive: true },
  { caliberInch: 0.308, cartridgeName: ".30 Thompson Center",   saamiUrl: Z(290), sortOrder: 29, isActive: true },

  // ══════════════════════════════════════════════════════════════
  //  .338 cal
  // ══════════════════════════════════════════════════════════════
  //  Already in DB: .338 Lapua Mag · .338 Win Mag · .338 Norma Mag
  //                 .338 Federal · .340 Weatherby
  { caliberInch: 0.338, cartridgeName: ".338 Remington Ultra Magnum", saamiUrl: Z(314), sortOrder: 6, isActive: true },
  { caliberInch: 0.338, cartridgeName: ".338 Ruger Compact Magnum",   saamiUrl: Z(315), sortOrder: 7, isActive: true },
  { caliberInch: 0.338, cartridgeName: "33 Nosler",             saamiUrl: Z(310), sortOrder: 8, isActive: true },
  { caliberInch: 0.338, cartridgeName: ".338-06",               saamiUrl: Z(311), sortOrder: 9, isActive: true,
    notes: NOTE_CLOSEST(".338 Federal (same bore, .30-06 parent case family)") },
  { caliberInch: 0.338, cartridgeName: ".338 Edge",             saamiUrl: Z(314), sortOrder: 10, isActive: true,
    notes: NOTE_CLOSEST(".338 Rem Ultra Mag (parent case)") },
  { caliberInch: 0.338, cartridgeName: ".338 Lapua Improved",   saamiUrl: Z(312), sortOrder: 11, isActive: true,
    notes: NOTE_CLOSEST(".338 Lapua Magnum (parent case)") },
  { caliberInch: 0.338, cartridgeName: "33 XC",                 saamiUrl: Z(312), sortOrder: 12, isActive: true,
    notes: NOTE_CLOSEST(".338 Lapua Magnum (same bore)") },
  { caliberInch: 0.338, cartridgeName: ".33 XC",                saamiUrl: Z(312), sortOrder: 13, isActive: true,
    notes: NOTE_CLOSEST(".338 Lapua Magnum (same bore)") },
  { caliberInch: 0.338, cartridgeName: ".338 XC",               saamiUrl: Z(312), sortOrder: 14, isActive: true,
    notes: NOTE_CLOSEST(".338 Lapua Magnum (same bore)") },

  // ══════════════════════════════════════════════════════════════
  //  .358 cal  (.35 family)
  // ══════════════════════════════════════════════════════════════
  { caliberInch: 0.358, cartridgeName: ".35 Whelen",            saamiUrl: Z(321), sortOrder: 1, isActive: true },
  { caliberInch: 0.358, cartridgeName: ".358 Winchester",       saamiUrl: Z(324), sortOrder: 2, isActive: true },
  { caliberInch: 0.358, cartridgeName: ".35 Remington",         saamiUrl: Z(320), sortOrder: 3, isActive: true },
  { caliberInch: 0.358, cartridgeName: ".350 Remington Magnum", saamiUrl: Z(322), sortOrder: 4, isActive: true },
  { caliberInch: 0.358, cartridgeName: "35 Nosler",             saamiUrl: Z(319), sortOrder: 5, isActive: true },

  // ══════════════════════════════════════════════════════════════
  //  .357 cal  (.350 Legend / .360 Buckhammer — straight-wall modern)
  // ══════════════════════════════════════════════════════════════
  { caliberInch: 0.357, cartridgeName: ".350 Legend",           saamiUrl: Z(320), sortOrder: 1, isActive: true,
    notes: "SAAMI standardized 2019. Showing .35 Remington as closest reference (same bore)." },
  { caliberInch: 0.357, cartridgeName: ".360 Buckhammer",       saamiUrl: Z(320), sortOrder: 2, isActive: true,
    notes: "SAAMI standardized 2022. Showing .35 Remington as closest reference (same bore)." },

  // ══════════════════════════════════════════════════════════════
  //  .375 cal
  // ══════════════════════════════════════════════════════════════
  { caliberInch: 0.375, cartridgeName: ".375 H&H Magnum",       saamiUrl: Z(327), sortOrder: 1, isActive: true },
  { caliberInch: 0.375, cartridgeName: ".375 Ruger",            saamiUrl: Z(329), sortOrder: 2, isActive: true },
  { caliberInch: 0.375, cartridgeName: ".375 Remington Ultra Magnum", saamiUrl: Z(328), sortOrder: 3, isActive: true },
  { caliberInch: 0.375, cartridgeName: ".375 Winchester",       saamiUrl: Z(330), sortOrder: 4, isActive: true },
  { caliberInch: 0.375, cartridgeName: ".375 CheyTac",          saamiUrl: Z(327), sortOrder: 5, isActive: true,
    notes: "Proprietary cartridge — no SAAMI standard. Showing .375 H&H Magnum as closest reference." },
  { caliberInch: 0.375, cartridgeName: ".375 Weatherby Magnum", saamiUrl: Z(327), sortOrder: 6, isActive: true,
    notes: "Weatherby proprietary. Showing .375 H&H Magnum as closest reference." },

  // ══════════════════════════════════════════════════════════════
  //  .408 cal
  // ══════════════════════════════════════════════════════════════
  { caliberInch: 0.408, cartridgeName: ".408 CheyTac",          saamiUrl: Z(335), sortOrder: 1, isActive: true,
    notes: "Proprietary cartridge — no SAAMI Z299.4 entry. Showing .416 Remington Magnum as closest reference (similar bore)." },

  // ══════════════════════════════════════════════════════════════
  //  .416 cal
  // ══════════════════════════════════════════════════════════════
  { caliberInch: 0.416, cartridgeName: ".416 Remington Magnum", saamiUrl: Z(335), sortOrder: 1, isActive: true },
  { caliberInch: 0.416, cartridgeName: ".416 Rigby",            saamiUrl: Z(336), sortOrder: 2, isActive: true },
  { caliberInch: 0.416, cartridgeName: ".416 Ruger",            saamiUrl: Z(337), sortOrder: 3, isActive: true },
  { caliberInch: 0.416, cartridgeName: ".416 Weatherby Magnum", saamiUrl: Z(338), sortOrder: 4, isActive: true },
  { caliberInch: 0.416, cartridgeName: ".416 Barrett",          saamiUrl: Z(335), sortOrder: 5, isActive: true,
    notes: "Proprietary cartridge — no SAAMI standard. Showing .416 Remington Magnum as closest reference." },

  // ══════════════════════════════════════════════════════════════
  //  .430 cal  (.444 Marlin, .44 Remington Magnum rifle)
  // ══════════════════════════════════════════════════════════════
  { caliberInch: 0.430, cartridgeName: ".444 Marlin",           saamiUrl: Z(341), sortOrder: 1, isActive: true },
  { caliberInch: 0.430, cartridgeName: ".44 Remington Magnum (rifle)", saamiUrl: Z(339), sortOrder: 2, isActive: true },

  // ══════════════════════════════════════════════════════════════
  //  .452 cal  (.450 Bushmaster, .458 SOCOM)
  // ══════════════════════════════════════════════════════════════
  { caliberInch: 0.452, cartridgeName: ".450 Bushmaster",       saamiUrl: Z(343), sortOrder: 1, isActive: true },
  { caliberInch: 0.452, cartridgeName: ".450 Marlin",           saamiUrl: Z(344), sortOrder: 2, isActive: true },
  { caliberInch: 0.452, cartridgeName: ".458 SOCOM",            saamiUrl: Z(343), sortOrder: 3, isActive: true,
    notes: "Not SAAMI-standardized. Showing .450 Bushmaster as closest reference (same bore)." },

  // ══════════════════════════════════════════════════════════════
  //  .458 cal  (.45-70, .458 Win Mag, .460 Weatherby)
  // ══════════════════════════════════════════════════════════════
  { caliberInch: 0.458, cartridgeName: ".45-70 Government",     saamiUrl: Z(342), sortOrder: 1, isActive: true },
  { caliberInch: 0.458, cartridgeName: ".458 Winchester Magnum",saamiUrl: Z(347), sortOrder: 2, isActive: true },
  { caliberInch: 0.458, cartridgeName: ".458 Lott",             saamiUrl: Z(346), sortOrder: 3, isActive: true },
  { caliberInch: 0.458, cartridgeName: ".460 Weatherby Magnum", saamiUrl: Z(347), sortOrder: 4, isActive: true,
    notes: "Weatherby proprietary — not in SAAMI Z299.4. Showing .458 Win Mag as closest reference." },

  // ══════════════════════════════════════════════════════════════
  //  .510 cal  (.50 BMG)
  // ══════════════════════════════════════════════════════════════
  { caliberInch: 0.510, cartridgeName: ".50 BMG",               saamiUrl: Z(350), sortOrder: 1, isActive: true,
    notes: "Military cartridge — not in SAAMI Z299.4. Showing 500 Nitro Express as closest large-bore reference." },

  // ══════════════════════════════════════════════════════════════
  //  Improvements / PRC variants (new precision standards)
  // ══════════════════════════════════════════════════════════════
  { caliberInch: 0.264, cartridgeName: "6.5 PRC Improved",      saamiUrl: Z(235), sortOrder: 13, isActive: true,
    notes: NOTE_CLOSEST("6.5 Creedmoor (parent bore)") },
  { caliberInch: 0.284, cartridgeName: "7mm PRC Improved",      saamiUrl: Z(246), sortOrder: 16, isActive: true,
    notes: NOTE_CLOSEST("7mm-08 Remington (same bore)") },
  { caliberInch: 0.308, cartridgeName: ".300 Norma Improved",   saamiUrl: Z(301), sortOrder: 30, isActive: true,
    notes: NOTE_CLOSEST(".300 Winchester Magnum (same bore)") },
];

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  // Fetch all existing names so we can skip duplicates
  const existing = await prisma.chamberDrawing.findMany({
    select: { cartridgeName: true },
  });
  const existingNames = new Set(existing.map((e) => e.cartridgeName));

  let added = 0;
  let skipped = 0;

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

  console.log(`\nDone — added ${added}, skipped ${skipped} existing.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
