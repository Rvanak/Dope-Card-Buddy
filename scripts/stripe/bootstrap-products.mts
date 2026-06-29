import "dotenv/config";
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  console.error("Missing STRIPE_SECRET_KEY in .env");
  process.exit(1);
}

const stripe = new Stripe(secretKey);

const monthlyAmount = Number(process.env.STRIPE_BOOTSTRAP_MONTHLY_AMOUNT_CENTS ?? "999");
const oneTimeAmount = Number(process.env.STRIPE_BOOTSTRAP_ONE_TIME_AMOUNT_CENTS ?? "4900");
const currency = (process.env.STRIPE_BOOTSTRAP_CURRENCY ?? "usd").toLowerCase();
const productName = process.env.STRIPE_BOOTSTRAP_PRODUCT_NAME ?? "Dope Card Buddy Pro";

if (!Number.isInteger(monthlyAmount) || monthlyAmount <= 0) {
  console.error("STRIPE_BOOTSTRAP_MONTHLY_AMOUNT_CENTS must be a positive integer.");
  process.exit(1);
}

if (!Number.isInteger(oneTimeAmount) || oneTimeAmount <= 0) {
  console.error("STRIPE_BOOTSTRAP_ONE_TIME_AMOUNT_CENTS must be a positive integer.");
  process.exit(1);
}

async function createPrices() {
  const product = await stripe.products.create({
    name: productName,
    metadata: { app: "dope-card-buddy-paywall" },
  });

  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    currency,
    unit_amount: monthlyAmount,
    recurring: { interval: "month" },
    metadata: { billingType: "monthly", app: "dope-card-buddy-paywall" },
  });

  const oneTimePrice = await stripe.prices.create({
    product: product.id,
    currency,
    unit_amount: oneTimeAmount,
    metadata: { billingType: "one_time", app: "dope-card-buddy-paywall" },
  });

  console.log("Created Stripe product/prices:");
  console.log(`  Product: ${product.id}`);
  console.log(`  Monthly price: ${monthlyPrice.id}`);
  console.log(`  One-time price: ${oneTimePrice.id}`);
  console.log("");
  console.log("Copy these into your .env:");
  console.log(`STRIPE_MONTHLY_PRICE_ID="${monthlyPrice.id}"`);
  console.log(`STRIPE_ONE_TIME_PRICE_ID="${oneTimePrice.id}"`);
  console.log(`STRIPE_PRICE_ID="${monthlyPrice.id}"`);
}

createPrices().catch((error) => {
  console.error("Failed to create Stripe product/prices.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
