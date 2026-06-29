import { prisma } from "@/lib/prisma";

const ACTIVE_STATUSES = new Set(["active", "trialing", "one_time_access", "lifetime"]);

export async function hasActiveSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { trialAccessExpiresAt: true },
  });

  if (user?.trialAccessExpiresAt && user.trialAccessExpiresAt.getTime() > Date.now()) {
    return true;
  }

  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) return false;
  if (!ACTIVE_STATUSES.has(sub.status)) return false;
  if (sub.status === "one_time_access" || sub.status === "lifetime") return true;
  if (!sub.currentPeriodEnd) return true;
  return sub.currentPeriodEnd.getTime() > Date.now();
}
