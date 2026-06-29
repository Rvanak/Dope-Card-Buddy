import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminAccessCodes } from "@/components/admin-access-codes";

export default async function AdminCodesPage() {
  const session = await getServerAuthSession();
  const userId = session?.user?.id;
  if (!userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, email: true },
  });
  if (!user || user.role !== "admin") redirect("/");

  const codes = await prisma.accessCode.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Access Codes</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Generate codes that bypass the paywall for a set number of hours.
        </p>
      </div>
      <AdminAccessCodes initialCodes={codes} />
    </div>
  );
}
