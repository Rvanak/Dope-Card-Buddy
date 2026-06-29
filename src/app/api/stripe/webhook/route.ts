import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

function subscriptionEndDate(subscription: Stripe.Subscription) {
  const periodEnd = (subscription as Stripe.Subscription & { current_period_end?: number })
    .current_period_end;
  return periodEnd ? new Date(periodEnd * 1000) : null;
}

async function resolveUserId(customerId: string, metadataUserId?: string | null) {
  if (metadataUserId) return metadataUserId;
  const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
  return user?.id ?? null;
}

export async function POST(request: Request) {
  const signature = (await headers()).get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing Stripe webhook config." }, { status: 400 });
  }

  const payload = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (!session.customer) break;
        const customerId = String(session.customer);
        const userId = await resolveUserId(customerId, session.metadata?.userId);
        if (!userId) break;

        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: customerId },
        });

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(String(session.subscription));
          await prisma.subscription.upsert({
            where: { userId },
            update: {
              status: subscription.status,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscription.id,
              currentPeriodEnd: subscriptionEndDate(subscription),
            },
            create: {
              userId,
              status: subscription.status,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscription.id,
              currentPeriodEnd: subscriptionEndDate(subscription),
            },
          });
        }

        if (session.mode === "payment" && session.payment_status === "paid") {
          // Grant 24 hours of access from the time of payment
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
          await prisma.user.update({
            where: { id: userId },
            data: { trialAccessExpiresAt: expiresAt },
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = String(subscription.customer);
        const userId = await resolveUserId(customerId, subscription.metadata?.userId);
        if (!userId) break;

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            status: subscription.status,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            currentPeriodEnd: subscriptionEndDate(subscription),
          },
          create: {
            userId,
            status: subscription.status,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            currentPeriodEnd: subscriptionEndDate(subscription),
          },
        });
        break;
      }

      // invoice.paid fires on every successful charge for a subscription.
      // Retrieve the linked subscription to refresh its period-end date.
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        // Stripe API 2025+: subscription moved from invoice.subscription to
        // invoice.parent.subscription_details.subscription. Cast to support both.
        const inv = invoice as unknown as {
          subscription?: string | { id: string } | null;
          parent?: { subscription_details?: { subscription?: string | { id: string } | null } | null } | null;
        };
        const subRef =
          inv.parent?.subscription_details?.subscription ?? inv.subscription;
        const subscriptionId = typeof subRef === "string" ? subRef : subRef?.id;
        if (!subscriptionId) break;

        const customerId = String(invoice.customer);
        const userId = await resolveUserId(customerId, invoice.metadata?.userId);
        if (!userId) break;

        const stripe = getStripe();
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await prisma.subscription.upsert({
          where: { userId },
          update: {
            status: subscription.status,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            currentPeriodEnd: subscriptionEndDate(subscription),
          },
          create: {
            userId,
            status: subscription.status,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            currentPeriodEnd: subscriptionEndDate(subscription),
          },
        });
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error("Stripe webhook handling failed", error);
    return NextResponse.json({ error: "Webhook handler error." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
