import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addHours } from "@/lib/access-codes";
import {
  consumeRateLimit,
  extractIpFromHeader,
  logSecurityEvent,
  verifyTurnstileToken,
} from "@/lib/security";

const redeemSchema = z.object({
  code: z.string().min(6).max(40),
  turnstileToken: z.string().optional(),
});

export async function POST(request: Request) {
  const ip = extractIpFromHeader(request.headers.get("x-forwarded-for"));
  if (ip) {
    const ipLimit = await consumeRateLimit({
      key: ip,
      scope: "redeem:ip",
      max: 30,
      windowMs: 15 * 60 * 1000,
    });
    if (!ipLimit.allowed) {
      await logSecurityEvent({
        category: "rate_limit",
        route: "/api/access/redeem",
        message: "Redeem IP limit exceeded.",
        ip,
      });
      return NextResponse.json({ error: "Too many attempts. Try later." }, { status: 429 });
    }
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = redeemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid access code." }, { status: 400 });
  }

  const captchaValid = await verifyTurnstileToken(parsed.data.turnstileToken, ip);
  if (!captchaValid) {
    await logSecurityEvent({
      category: "bot_block",
      route: "/api/access/redeem",
      message: "Turnstile verification failed for redeem.",
      ip,
      userId,
    });
    return NextResponse.json({ error: "Verification failed. Try again." }, { status: 400 });
  }

  const codeText = parsed.data.code.trim().toUpperCase();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const accessCode = await tx.accessCode.findUnique({
        where: { code: codeText },
      });

      if (!accessCode || !accessCode.isActive) {
        return { error: "Code is invalid or inactive." };
      }

      if (accessCode.expiresAt.getTime() <= Date.now()) {
        return { error: "Code has expired." };
      }

      if (accessCode.usedCount >= accessCode.maxUses) {
        return { error: "Code usage limit has been reached." };
      }

      const existingRedemption = await tx.accessCodeRedemption.findUnique({
        where: {
          accessCodeId_userId: {
            accessCodeId: accessCode.id,
            userId,
          },
        },
      });
      if (existingRedemption) {
        return { error: "You have already redeemed this code." };
      }

      const now = new Date();
      const grantedUntil = addHours(now, accessCode.grantHours);

      await tx.accessCodeRedemption.create({
        data: {
          accessCodeId: accessCode.id,
          userId,
          grantedUntil,
        },
      });

      await tx.accessCode.update({
        where: { id: accessCode.id },
        data: {
          usedCount: { increment: 1 },
          isActive: accessCode.usedCount + 1 < accessCode.maxUses,
        },
      });

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { trialAccessExpiresAt: true },
      });

      const currentExpiry = user?.trialAccessExpiresAt;
      const nextExpiry =
        currentExpiry && currentExpiry.getTime() > grantedUntil.getTime()
          ? currentExpiry
          : grantedUntil;

      await tx.user.update({
        where: { id: userId },
        data: { trialAccessExpiresAt: nextExpiry },
      });

      return { ok: true, grantedUntil: nextExpiry };
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      grantedUntil: result.grantedUntil.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to redeem code." }, { status: 500 });
  }
}
