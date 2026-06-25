import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession();
  const userId = session?.user?.id;
  if (!userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user || user.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Admin top nav */}
      <nav className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-3">
          <span className="mr-4 text-xs font-semibold uppercase tracking-widest text-amber-400">
            Admin
          </span>
          <NavLink href="/admin">Dashboard</NavLink>
          <NavLink href="/admin/codes">Access Codes</NavLink>
          <NavLink href="/admin/drawings">Chamber Drawings</NavLink>
          <div className="ml-auto">
            <Link
              href="/app"
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
            >
              ← App
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
    >
      {children}
    </Link>
  );
}
