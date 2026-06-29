import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found. Please subscribe first." }, { status: 404 });
  }

  const stripe = getStripe();

  // Verify the customer exists in the current Stripe mode (handles test↔live key switch).
  try {
    await stripe.customers.retrieve(user.stripeCustomerId);
  } catch {
    await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: null } });
    return NextResponse.json({ error: "Billing account not found. Please subscribe again." }, { status: 404 });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${origin}/app`,
  });
  return NextResponse.json({ url: portal.url });
}
