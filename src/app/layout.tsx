import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LegalDisclaimerGate } from "@/components/legal-disclaimer-gate";
import { LEGAL_DISCLAIMER_VERSION } from "@/lib/legal-disclaimer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dope Card Buddy",
  description: "Subscription-based ballistic cards and field dope tools.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerAuthSession();
  const userId = session?.user?.id;

  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { legalAcceptedVersion: true },
      })
    : null;

  const initialAccepted = user?.legalAcceptedVersion === LEGAL_DISCLAIMER_VERSION;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LegalDisclaimerGate initialAccepted={initialAccepted} isSignedIn={Boolean(userId)} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
