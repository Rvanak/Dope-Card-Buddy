import { NextResponse, type NextRequest } from "next/server";

function buildCsp(request: NextRequest) {
  // Check at request time so Edge Runtime always has the correct value.
  // In production builds, NODE_ENV is "production" and eval is excluded.
  const dev = process.env.NODE_ENV === "development";
  // Also allow a per-request override via a custom env var for platforms that
  // don't surface NODE_ENV correctly inside the Edge Runtime.
  const forceEval = process.env.NEXT_PUBLIC_CSP_ALLOW_EVAL === "1";
  const allowEval = dev || forceEval;

  // Include the request origin in connect-src for HMR websocket in dev.
  const origin = request.nextUrl.origin;
  const connectSrc = dev
    ? `connect-src 'self' ${origin} ws: wss: https://api.stripe.com https://challenges.cloudflare.com`
    : "connect-src 'self' https://api.stripe.com https://challenges.cloudflare.com";

  const scriptSrc = allowEval
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://cdnjs.cloudflare.com"
    : "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://cdnjs.cloudflare.com";

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    connectSrc,
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://challenges.cloudflare.com",
    "object-src 'self' https://saami.org",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", buildCsp(request));
  // SAMEORIGIN allows the /demo iframe on /app to load; DENY would block it.
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set("Origin-Agent-Cluster", "?1");

  if (request.nextUrl.protocol === "https:") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  return response;
}

export const config = {
  matcher: [
    // Exclude static assets, Next.js internals, and /demo/ HTML files.
    // /demo/ files are plain static HTML with their own external dependencies
    // and must not receive our restrictive CSP/CORP headers.
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|demo/.*\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|map)$).*)",
  ],
};
