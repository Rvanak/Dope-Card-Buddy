import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addHours, generateAccessCode } from "@/lib/access-codes";
import { consumeRateLimit, extractIpFromHeader, logSecurityEvent } from "@/lib/security";

const createCodeSchema = z.object({
  grantHours: z.number().int().min(1).max(168).default(24),
  maxUses: z.number().int().min(1).max(100).default(1),
  validHours: z.number().int().min(1).max(720).default(24),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const codes = await prisma.accessCode.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      code: true,
      expiresAt: true,
      grantHours: true,
      maxUses: true,
      usedCount: true,
      isActive: true,
      createdAt: true,
      redemptions: {
        orderBy: { redeemedAt: "desc" },
        take: 5,
        select: { user: { select: { email: true } }, redeemedAt: true, grantedUntil: true },
      },
    },
  });

  return NextResponse.json({ codes });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const id = body?.id as string | undefined;
  const isActive = body?.isActive as boolean | undefined;

  if (!id || typeof isActive !== "boolean") {
    return NextResponse.json({ error: "id and isActive required." }, { status: 400 });
  }

  const updated = await prisma.accessCode.update({
    where: { id },
    data: { isActive },
    select: { id: true, code: true, isActive: true },
  });

  return NextResponse.json({ ok: true, code: updated });
}

export async function POST(request: Request) {
  const ip = extractIpFromHeader(request.headers.get("x-forwarded-for"));
  if (ip) {
    const ipLimit = await consumeRateLimit({
      key: ip,
      scope: "admin-codes:ip",
      max: 120,
      windowMs: 10 * 60 * 1000,
    });
    if (!ipLimit.allowed) {
      await logSecurityEvent({
        category: "rate_limit",
        route: "/api/admin/access-codes",
        message: "Admin code generation IP limit exceeded.",
        ip,
      });
      return NextResponse.json({ error: "Too many attempts. Please wait." }, { status: 429 });
    }
  }

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rawBody = await request.json().catch(() => ({}));
  const parsed = createCodeSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { grantHours, maxUses, validHours } = parsed.data;
  const expiresAt = addHours(new Date(), validHours);

  let created = null;
  for (let i = 0; i < 5; i += 1) {
    const code = generateAccessCode(10);
    try {
      created = await prisma.accessCode.create({
        data: {
          code,
          grantHours,
          maxUses,
          expiresAt,
          createdByUserId: admin.id,
        },
      });
      break;
    } catch {
      // Retry on unique collisions.
    }
  }

  if (!created) {
    return NextResponse.json({ error: "Could not generate code. Try again." }, { status: 500 });
  }

  return NextResponse.json({
    code: created.code,
    expiresAt: created.expiresAt,
    grantHours: created.grantHours,
    maxUses: created.maxUses,
  });
}
