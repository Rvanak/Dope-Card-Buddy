import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role !== "admin") return null;
  return userId;
}

export async function GET() {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const drawings = await prisma.chamberDrawing.findMany({
    orderBy: [{ caliberInch: "asc" }, { sortOrder: "asc" }, { cartridgeName: "asc" }],
  });

  return NextResponse.json({ drawings });
}

export async function POST(request: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json()) as {
    caliberInch: number;
    cartridgeName: string;
    saamiUrl?: string;
    notes?: string;
    sortOrder?: number;
  };

  if (!body.caliberInch || !body.cartridgeName?.trim()) {
    return NextResponse.json({ error: "caliberInch and cartridgeName are required." }, { status: 400 });
  }

  const drawing = await prisma.chamberDrawing.create({
    data: {
      caliberInch: body.caliberInch,
      cartridgeName: body.cartridgeName.trim(),
      saamiUrl: body.saamiUrl?.trim() || null,
      notes: body.notes?.trim() || null,
      sortOrder: body.sortOrder ?? 0,
    },
  });

  return NextResponse.json({ drawing });
}

export async function PATCH(request: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json()) as {
    id: string;
    cartridgeName?: string;
    saamiUrl?: string;
    notes?: string;
    sortOrder?: number;
    isActive?: boolean;
  };

  if (!body.id) return NextResponse.json({ error: "id required." }, { status: 400 });

  const drawing = await prisma.chamberDrawing.update({
    where: { id: body.id },
    data: {
      ...(body.cartridgeName !== undefined && { cartridgeName: body.cartridgeName.trim() }),
      ...(body.saamiUrl !== undefined && { saamiUrl: body.saamiUrl.trim() || null }),
      ...(body.notes !== undefined && { notes: body.notes.trim() || null }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });

  return NextResponse.json({ drawing });
}

export async function DELETE(request: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required." }, { status: 400 });

  await prisma.chamberDrawing.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
