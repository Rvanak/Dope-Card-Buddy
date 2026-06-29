import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LEGAL_DISCLAIMER_VERSION } from "@/lib/legal-disclaimer";

function resolveClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (!forwardedFor) return null;
  const firstIp = forwardedFor.split(",")[0]?.trim();
  return firstIp || null;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      legalAcceptedAt: new Date(),
      legalAcceptedVersion: LEGAL_DISCLAIMER_VERSION,
      legalAcceptedIp: resolveClientIp(request),
    },
  });

  return NextResponse.json({ ok: true, version: LEGAL_DISCLAIMER_VERSION });
}
