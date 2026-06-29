import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthPanel } from "@/components/auth-panel";
import { SignOutButton } from "@/components/sign-out-button";
import { PreviewModal } from "@/components/preview-modal";

export default async function Home() {
  const session = await getServerAuthSession();
  const userRole = session?.user?.id
    ? (
        await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { role: true },
        })
      )?.role
    : null;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/60 bg-[#09090b]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded border border-amber-500/40 bg-amber-500/10 text-amber-400">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-4 w-4">
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="3" x2="12" y2="21" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" />
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-wide text-zinc-100">DOPE CARD BUDDY</span>
          </div>

          <div className="flex items-center gap-2">
            <PreviewModal />
            {session?.user ? (
              <Link href="/app" className="rounded-md bg-amber-500 px-4 py-1.5 text-xs font-semibold text-black hover:bg-amber-400 transition-colors">
                Open App →
              </Link>
            ) : (
              <a href="#signin" className="rounded-md bg-amber-500 px-4 py-1.5 text-xs font-semibold text-black hover:bg-amber-400 transition-colors">
                Sign In →
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background grid */}
        <div className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Radial glow */}
        <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/8 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 pb-20 pt-20 lg:grid-cols-2 lg:items-center">

          {/* Left — copy */}
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-medium tracking-widest text-amber-400 uppercase">Precision Ballistics Platform</span>
            </div>

            <h1 className="text-5xl font-bold leading-[1.08] tracking-tight lg:text-6xl">
              Your Dope Card,
              <br />
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                Dialed In.
              </span>
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-zinc-400">
              G7 drag model ballistics, SAAMI chamber drawings, density altitude truing, and
              print-ready wrist coach cards — all from your browser, any device.
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { icon: "◈", label: "G7 Point-Mass Trajectory" },
                { icon: "◈", label: "SAAMI Chamber Drawings" },
                { icon: "◈", label: "Density Altitude Truing" },
                { icon: "◈", label: "3×5 Wrist Coach Cards" },
                { icon: "◈", label: "Speed Drop Factor" },
                { icon: "◈", label: "Works on Any Browser" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 text-zinc-300">
                  <span className="text-amber-500/70 text-xs">{icon}</span>
                  {label}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <PreviewModal fullButton />
              <a href="#signin" className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/60 transition-all">
                Get Access
              </a>
            </div>
          </div>

          {/* Right — auth panel */}
          <div id="signin" className="scroll-mt-20">
            {session?.user ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur">
                <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="mt-3 text-xl font-semibold">Welcome back</h2>
                <p className="mt-1 text-sm text-zinc-400">{session.user.email}</p>
                <div className="mt-6 flex flex-col gap-2.5">
                  <Link href="/app" className="flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 transition-colors">
                    Open App →
                  </Link>
                  <Link href="/pricing" className="flex items-center justify-center rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-100 hover:bg-zinc-800 transition-colors">
                    Manage Subscription
                  </Link>
                  {userRole === "admin" && (
                    <Link href="/admin/codes" className="flex items-center justify-center rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                      Admin Panel
                    </Link>
                  )}
                  <SignOutButton className="w-full rounded-lg border border-zinc-800 px-4 py-2.5 text-sm text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 transition-colors" />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-2xl shadow-black/40 backdrop-blur overflow-hidden">
                <div className="border-b border-zinc-800/80 bg-zinc-950/60 px-6 py-4">
                  <p className="text-[10px] uppercase tracking-widest text-amber-500/70">Access Portal</p>
                  <p className="mt-0.5 text-xs text-zinc-500">Secured with Cloudflare Turnstile bot protection</p>
                </div>
                <div className="p-6">
                  <AuthPanel />
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────── */}
      <div className="border-y border-zinc-800/60 bg-zinc-900/30">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-zinc-800/60 px-5 md:grid-cols-4">
          {[
            { value: "G7", label: "Drag Model" },
            { value: "37+", label: "SAAMI Calibers" },
            { value: "2500", label: "Max Range (yds)" },
            { value: "3×5", label: "Wrist Coach Format" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center py-5 text-center">
              <span className="text-2xl font-bold text-amber-400">{value}</span>
              <span className="mt-0.5 text-xs text-zinc-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-800/60 bg-zinc-900/20 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-12 space-y-2 text-center">
            <p className="text-xs uppercase tracking-widest text-amber-500">What's Inside</p>
            <h2 className="text-3xl font-bold">Every Tool a Precision Shooter Needs</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "G7 Ballistic Solver",
                desc: "Point-mass trajectory with G7 drag model, wind drift, and spin drift at any range.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                ),
              },
              {
                title: "SAAMI Chamber Drawings",
                desc: "Official SAAMI V&P test barrel drawings for 37+ centerfire rifle calibers, rendered inline.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                ),
              },
              {
                title: "Density Altitude Truing",
                desc: "Real-time DA calculation with MIL truing table. Enter True @ Range to auto-tune your BC.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                ),
              },
              {
                title: "3×5 Wrist Coach Cards",
                desc: "Print-formatted dope cards sized for a wrist coach. Take your drops to the range.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                ),
              },
              {
                title: "Speed Drop Factor",
                desc: "Calculate speed drop factor from observed impacts and dial in your actual velocity.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                ),
              },
            ].map(({ title, desc, icon }) => (
              <div key={title} className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 transition-colors hover:border-zinc-700 hover:bg-zinc-900/70">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    {icon}
                  </svg>
                </div>
                <h3 className="font-semibold text-zinc-100">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA footer ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-zinc-800/60 py-20 text-center">
        <div className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(245,158,11,0.07), transparent)",
          }}
        />
        <div className="relative mx-auto max-w-2xl px-5">
          <p className="text-xs uppercase tracking-widest text-amber-500">Get Started</p>
          <h2 className="mt-3 text-4xl font-bold">Ready to Run Better Dope?</h2>
          <p className="mt-4 text-zinc-400">Monthly subscription or a $5 day pass. Cancel anytime.</p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a href="#signin" className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-8 py-3.5 text-sm font-bold text-black shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-colors">
              Create Account →
            </a>
            <PreviewModal fullButton={false} outline />
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/60 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-5 text-center sm:flex-row sm:justify-between sm:text-left">
          <span className="text-xs text-zinc-600">© {new Date().getFullYear()} Dope Card Buddy. All rights reserved.</span>
          <span className="text-xs text-zinc-700">For educational and field reference use only. Not a substitute for professional training.</span>
        </div>
      </footer>

    </div>
  );
}
