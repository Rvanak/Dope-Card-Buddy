import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const session = await getServerAuthSession();
  const userId = session?.user?.id;
  if (!userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, email: true },
  });
  if (!user || user.role !== "admin") redirect("/");

  const [codeCount, activeCodeCount, drawingCount] = await Promise.all([
    prisma.accessCode.count(),
    prisma.accessCode.count({ where: { isActive: true, expiresAt: { gt: new Date() } } }),
    prisma.chamberDrawing.count({ where: { isActive: true } }),
  ]);

  const recentCodes = await prisma.accessCode.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      code: true,
      grantHours: true,
      maxUses: true,
      usedCount: true,
      isActive: true,
      expiresAt: true,
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">Signed in as {user.email}</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Active Access Codes" value={activeCodeCount} total={codeCount} />
        <StatCard label="Chamber Drawings" value={drawingCount} />
        <StatCard label="Recent Redemptions" value={recentCodes.reduce((s, c) => s + c.usedCount, 0)} />
      </div>

      {/* Quick actions */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <ActionCard
          href="/admin/codes"
          title="Access Codes"
          description="Generate codes that bypass the paywall for 1–168 hours. Set max uses and expiry."
          badge="Manage"
          color="amber"
        />
        <ActionCard
          href="/admin/drawings"
          title="Chamber Drawings"
          description="Add, edit, or hide SAAMI chamber drawing links organized by caliber group."
          badge="Manage"
          color="sky"
        />
      </div>

      {/* Recent codes preview */}
      {recentCodes.length > 0 && (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent Access Codes</h2>
            <Link href="/admin/codes" className="text-xs text-amber-400 hover:text-amber-300">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {recentCodes.map((c) => {
              const expired = c.expiresAt.getTime() <= Date.now();
              const exhausted = c.usedCount >= c.maxUses;
              const live = c.isActive && !expired && !exhausted;
              return (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5">
                  <span className="font-mono text-sm text-amber-300">{c.code}</span>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span>{c.grantHours}h grant</span>
                    <span>{c.usedCount}/{c.maxUses} uses</span>
                    <span
                      className={`rounded px-1.5 py-0.5 font-medium ${
                        live
                          ? "bg-emerald-900/50 text-emerald-400"
                          : "bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {expired ? "expired" : exhausted ? "used up" : live ? "live" : "inactive"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value, total }: { label: string; value: number; total?: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-xs uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">
        {value}
        {total !== undefined && (
          <span className="ml-1 text-base font-normal text-zinc-500">/ {total}</span>
        )}
      </p>
    </div>
  );
}

function ActionCard({
  href,
  title,
  description,
  badge,
  color,
}: {
  href: string;
  title: string;
  description: string;
  badge: string;
  color: "amber" | "sky";
}) {
  const accent = color === "amber" ? "text-amber-400 border-amber-900/60" : "text-sky-400 border-sky-900/60";
  return (
    <Link
      href={href}
      className={`block rounded-xl border bg-zinc-900 p-5 hover:bg-zinc-800/80 ${accent}`}
    >
      <p className={`text-xs font-semibold uppercase tracking-widest ${color === "amber" ? "text-amber-400" : "text-sky-400"}`}>
        {badge}
      </p>
      <h2 className="mt-1 text-lg font-semibold text-white">{title}</h2>
      <p className="mt-1 text-sm text-zinc-400">{description}</p>
    </Link>
  );
}
