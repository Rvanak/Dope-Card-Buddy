import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { consumeRateLimit, extractIpFromHeader } from "@/lib/security";

type BillingType = "monthly" | "one_time";

function resolveBillingType(value: unknown): BillingType {
  return value === "one_time" ? "one_time" : "monthly";
}

export async function POST(request: Request) {
  const ip = extractIpFromHeader(request.headers.get("x-forwarded-for"));
  if (ip) {
    const ipLimit = await consumeRateLimit({
      key: ip,
      scope: "checkout:ip",
      max: 50,
      windowMs: 15 * 60 * 1000,
    });
    if (!ipLimit.allowed) {
      return NextResponse.json({ error: "Too many checkout attempts. Please wait." }, { status: 429 });
    }
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let requestBody: { billingType?: string } = {};
  try {
    requestBody = await request.json();
  } catch {
    requestBody = {};
  }

  const billingType = resolveBillingType(requestBody.billingType);
  const monthlyPriceId = process.env.STRIPE_MONTHLY_PRICE_ID ?? process.env.STRIPE_PRICE_ID;
  const oneTimePriceId = process.env.STRIPE_ONE_TIME_PRICE_ID;
  const priceId = billingType === "one_time" ? oneTimePriceId : monthlyPriceId;
  if (!priceId) {
    const missingKey =
      billingType === "one_time"
        ? "STRIPE_ONE_TIME_PRICE_ID"
        : "STRIPE_MONTHLY_PRICE_ID (or STRIPE_PRICE_ID)";
    return NextResponse.json({ error: `${missingKey} is not configured.` }, { status: 500 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const stripe = getStripe();
  let customerId = user.stripeCustomerId ?? undefined;

  if (customerId) {
    // Verify the stored customer exists in the current Stripe mode (test vs live).
    // If it doesn't, the key was switched and we need a fresh customer.
    try {
      await stripe.customers.retrieve(customerId);
    } catch {
      customerId = undefined;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: null },
      });
    }
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const checkoutMode = billingType === "one_time" ? "payment" : "subscription";
  const checkout = await stripe.checkout.sessions.create({
    mode: checkoutMode,
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/app?paid=1`,
    cancel_url: `${origin}/pricing?canceled=1`,
    allow_promotion_codes: true,
    metadata: { userId: user.id, billingType },
  });

  return NextResponse.json({ url: checkout.url });
}
