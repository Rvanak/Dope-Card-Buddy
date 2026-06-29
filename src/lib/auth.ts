import { compare } from "bcryptjs";
import { z } from "zod";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import {
  consumeRateLimit,
  extractIpFromHeader,
  logSecurityEvent,
  normalizeEmail,
  verifyTurnstileToken,
} from "@/lib/security";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  turnstileToken: z.string().optional(),
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials, req) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const email = normalizeEmail(parsed.data.email);
        const ip =
          extractIpFromHeader(
            typeof req?.headers?.["x-forwarded-for"] === "string"
              ? req.headers["x-forwarded-for"]
              : null,
          ) ??
          (typeof req?.headers?.["x-real-ip"] === "string" ? req.headers["x-real-ip"] : null);

        const captchaValid = await verifyTurnstileToken(parsed.data.turnstileToken, ip);
        if (!captchaValid) {
          await logSecurityEvent({
            category: "bot_block",
            route: "/api/auth/callback/credentials",
            message: "Turnstile verification failed for login.",
            ip,
            email,
          });
          return null;
        }

        if (ip) {
          const ipRate = await consumeRateLimit({
            key: ip,
            scope: "login:ip",
            max: 20,
            windowMs: 15 * 60 * 1000,
          });
          if (!ipRate.allowed) {
            await logSecurityEvent({
              category: "rate_limit",
              route: "/api/auth/callback/credentials",
              message: "Login IP limit exceeded.",
              ip,
              email,
            });
            return null;
          }
        }

        const emailRate = await consumeRateLimit({
          key: email,
          scope: "login:email",
          max: 10,
          windowMs: 15 * 60 * 1000,
        });
        if (!emailRate.allowed) {
          await logSecurityEvent({
            category: "rate_limit",
            route: "/api/auth/callback/credentials",
            message: "Login email limit exceeded.",
            ip,
            email,
          });
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user) return null;

        const validPassword = await compare(parsed.data.password, user.passwordHash);
        if (!validPassword) {
          await logSecurityEvent({
            category: "auth_failure",
            route: "/api/auth/callback/credentials",
            message: "Password validation failed.",
            ip,
            email,
            userId: user.id,
          });
          return null;
        }

        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

export function getServerAuthSession() {
  return getServerSession(authOptions);
}
