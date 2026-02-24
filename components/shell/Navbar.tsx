"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { data } = useSession();
  const pathname = usePathname();
  const user = data?.user;

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800/50 dark:bg-zinc-950/80 dark:supports-[backdrop-filter]:bg-zinc-950/60">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Nav Links */}
        <div className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-bold text-zinc-900 transition-colors hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300"
          >
            <span className="text-2xl">📚</span>
            <span className="hidden sm:inline">Aspire Library</span>
          </Link>

          <div className="flex items-center gap-1">
            <NavLink href="/dashboard" isActive={isActive("/dashboard")}>
              Dashboard
            </NavLink>
            <NavLink href="/books" isActive={isActive("/books")}>
              Books
            </NavLink>
            <NavLink href="/loans" isActive={isActive("/loans")}>
              Loans
            </NavLink>
            {user?.role === "ADMIN" && (
              <NavLink href="/audit" isActive={isActive("/audit")}>
                Audit
              </NavLink>
            )}
          </div>
        </div>

        {/* User Info and Actions */}
        <div className="flex items-center gap-3">
          {user?.role && (
            <span className="hidden rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 sm:inline-block">
              {user.role}
            </span>
          )}

          {user?.email && (
            <span className="hidden text-sm text-zinc-600 dark:text-zinc-400 md:inline-block">
              {user.email}
            </span>
          )}

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Sign out
          </button>
        </div>
      </nav>
    </header>
  );
}

function NavLink({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
      }`}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
      )}
    </Link>
  );
}
