import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const calParam = searchParams.get("cal");

  if (!calParam) {
    return NextResponse.json({ error: "cal parameter required." }, { status: 400 });
  }

  const cal = parseFloat(calParam);
  if (isNaN(cal)) {
    return NextResponse.json({ error: "Invalid cal value." }, { status: 400 });
  }

  const drawings = await prisma.chamberDrawing.findMany({
    where: { caliberInch: cal, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { cartridgeName: "asc" }],
    select: {
      id: true,
      cartridgeName: true,
      saamiUrl: true,
      notes: true,
      caliberInch: true,
    },
  });

  return NextResponse.json({ drawings });
}
