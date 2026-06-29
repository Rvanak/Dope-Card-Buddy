import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/entitlements";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { BillingPortalButton } from "@/components/billing-portal-button";
import { SignOutButton } from "@/components/sign-out-button";

// When Stripe redirects back with ?paid=1, the webhook may not have fired yet.
// Verify directly via the Stripe API and grant access immediately.
async function syncPaymentIfNeeded(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true, trialAccessExpiresAt: true },
  });
  if (!user?.stripeCustomerId) return;

  const stripe = getStripe();
  const FIVE_MINUTES = 5 * 60 * 1000;

  const sessions = await stripe.checkout.sessions.list({
    customer: user.stripeCustomerId,
    limit: 5,
  });

  const recentSession = sessions.data.find(
    (s) => s.payment_status === "paid" && s.created * 1000 > Date.now() - FIVE_MINUTES,
  );
  if (!recentSession) return;

  if (recentSession.mode === "payment") {
    // Day pass — grant 24 hours if not already active
    const alreadyActive =
      user.trialAccessExpiresAt && user.trialAccessExpiresAt.getTime() > Date.now();
    if (!alreadyActive) {
      await prisma.user.update({
        where: { id: userId },
        data: { trialAccessExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      });
    }
  } else if (recentSession.mode === "subscription" && recentSession.subscription) {
    // Monthly — retrieve and upsert the subscription so entitlements pass
    const subId =
      typeof recentSession.subscription === "string"
        ? recentSession.subscription
        : recentSession.subscription.id;
    const subscription = await stripe.subscriptions.retrieve(subId);
    const periodEnd = (subscription as { current_period_end?: number }).current_period_end;
    await prisma.subscription.upsert({
      where: { userId },
      update: {
        status: subscription.status,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      },
      create: {
        userId,
        status: subscription.status,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      },
    });
  }
}

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) redirect("/");

  const params = await searchParams;

  // If Stripe just redirected here after payment, sync access before the entitlement check.
  if (params.paid === "1") {
    await syncPaymentIfNeeded(session.user.id);
  }

  const entitled = await hasActiveSubscription(session.user.id);
  if (!entitled) redirect("/pricing");

  const userRole = (
    await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })
  )?.role;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-400">Dope Card Buddy</p>
        </div>

        <div className="flex items-center gap-2">
          <BillingPortalButton />
          <Link
            className="rounded-md border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800"
            href="/"
          >
            Home
          </Link>
          {userRole === "admin" ? (
            <Link
              className="rounded-md border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800"
              href="/admin/codes"
            >
              Admin
            </Link>
          ) : null}
          <SignOutButton className="rounded-md border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800" />
        </div>
      </header>

      <div className="h-[calc(100vh-72px)] w-full bg-zinc-950">
        <iframe
          src="/demo/dope-card-buddy-app.html"
          title="Dope Card Buddy App"
          className="h-full w-full"
        />
      </div>
    </main>
  );
}
