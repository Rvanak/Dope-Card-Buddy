import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  consumeRateLimit,
  extractIpFromHeader,
  logSecurityEvent,
  normalizeEmail,
  verifyTurnstileToken,
} from "@/lib/security";

const registrationSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character (!@#$%^&* etc)."),
  turnstileToken: z.string().optional(),
});

export async function POST(request: Request) {
  const ip = extractIpFromHeader(request.headers.get("x-forwarded-for"));
  if (ip) {
    const ipLimit = await consumeRateLimit({
      key: ip,
      scope: "register:ip",
      max: 12,
      windowMs: 10 * 60 * 1000,
    });
    if (!ipLimit.allowed) {
      await logSecurityEvent({
        category: "rate_limit",
        route: "/api/register",
        message: "Registration IP limit exceeded.",
        ip,
      });
      return NextResponse.json({ error: "Too many attempts. Please try later." }, { status: 429 });
    }
  }

  const body = await request.json().catch(() => null);
  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message;
    return NextResponse.json(
      { error: firstError ?? "Please provide a valid email and a strong password." },
      { status: 400 },
    );
  }

  const email = normalizeEmail(parsed.data.email);
  const captchaValid = await verifyTurnstileToken(parsed.data.turnstileToken, ip);
  if (!captchaValid) {
    await logSecurityEvent({
      category: "bot_block",
      route: "/api/register",
      message: "Turnstile verification failed for register.",
      ip,
      email,
    });
    return NextResponse.json({ error: "Verification failed. Try again." }, { status: 400 });
  }

  const emailLimit = await consumeRateLimit({
    key: email,
    scope: "register:email",
    max: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!emailLimit.allowed) {
    await logSecurityEvent({
      category: "rate_limit",
      route: "/api/register",
      message: "Registration email limit exceeded.",
      ip,
      email,
    });
    return NextResponse.json({ error: "Too many attempts. Please try later." }, { status: 429 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await logSecurityEvent({
      category: "auth_signal",
      route: "/api/register",
      message: "Registration attempted on existing account.",
      ip,
      email,
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const passwordHash = await hash(parsed.data.password, 12);
  await prisma.user.create({ data: { email, passwordHash } });
  return NextResponse.json({ ok: true });
}
