import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

type RateLimitParams = {
  key: string;
  scope: string;
  max: number;
  windowMs: number;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function extractIpFromHeader(forwardedFor: string | null | undefined) {
  if (!forwardedFor) return null;
  return forwardedFor.split(",")[0]?.trim() || null;
}

export async function getRequestIp() {
  const requestHeaders = await headers();
  return (
    extractIpFromHeader(requestHeaders.get("x-forwarded-for")) ??
    requestHeaders.get("x-real-ip") ??
    null
  );
}

export async function consumeRateLimit({ key, scope, max, windowMs }: RateLimitParams) {
  const now = Date.now();
  const windowStartMs = Math.floor(now / windowMs) * windowMs;
  const windowStart = new Date(windowStartMs);

  const bucket = await prisma.rateLimitBucket.upsert({
    where: {
      key_scope_windowStart: {
        key,
        scope,
        windowStart,
      },
    },
    create: {
      key,
      scope,
      windowStart,
      count: 1,
    },
    update: {
      count: { increment: 1 },
    },
    select: { count: true },
  });

  const resetAt = windowStartMs + windowMs;
  const remaining = Math.max(0, max - bucket.count);
  return {
    allowed: bucket.count <= max,
    remaining,
    retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
  };
}

export async function logSecurityEvent(params: {
  category: string;
  route: string;
  message: string;
  ip?: string | null;
  email?: string | null;
  userId?: string | null;
  metadata?: unknown;
}) {
  const { category, route, message, ip, email, userId, metadata } = params;
  await prisma.securityEvent.create({
    data: {
      category,
      route,
      message,
      ip: ip ?? null,
      email: email ?? null,
      userId: userId ?? null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

export async function verifyTurnstileToken(token: string | null | undefined, ip?: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  const formData = new URLSearchParams();
  formData.set("secret", secret);
  formData.set("response", token);
  if (ip) formData.set("remoteip", ip);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  if (!response.ok) return false;
  const body = (await response.json()) as { success?: boolean };
  return Boolean(body.success);
}
