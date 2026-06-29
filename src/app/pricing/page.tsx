import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/entitlements";
import { CheckoutButton } from "@/components/checkout-button";
import { RedeemAccessCode } from "@/components/redeem-access-code";

export default async function PricingPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) redirect("/");

  const entitled = await hasActiveSubscription(session.user.id);
  if (entitled) redirect("/app");

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-10 text-zinc-100">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-400">Pricing</p>
        <h1 className="mt-2 text-3xl font-bold">Unlock Dope Card Buddy Pro</h1>
        <p className="mt-3 text-zinc-300">
          Choose a monthly subscription or pay $5 for a full 24 hours of access — no commitment.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-amber-400">Best Value</p>
            <h2 className="mt-1 text-xl font-semibold">Monthly Access</h2>
            <p className="mt-1 text-2xl font-bold">
              $9.99 <span className="text-sm font-normal text-zinc-400">/ month</span>
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Unlimited access. Cancel anytime from the billing portal.
            </p>
            <div className="mt-4">
              <CheckoutButton billingType="monthly" buttonLabel="Start Monthly Plan" />
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Day Pass</p>
            <h2 className="mt-1 text-xl font-semibold">24-Hour Access</h2>
            <p className="mt-1 text-2xl font-bold">
              $5.00 <span className="text-sm font-normal text-zinc-400">/ day</span>
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Full access for 24 hours from time of payment. No subscription.
            </p>
            <div className="mt-4">
              <CheckoutButton billingType="one_time" buttonLabel="Buy Day Pass" />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link className="text-sm text-zinc-400 hover:text-zinc-200" href="/">
            Back to landing
          </Link>
        </div>

        <RedeemAccessCode />
      </div>
    </main>
  );
}
