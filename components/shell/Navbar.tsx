\"use client\";

import { useSession, signOut } from \"next-auth/react\";

export function Navbar() {
  const { data } = useSession();
  const user = data?.user as (typeof data)["user"] & {
    role?: string;
  };

  return (
    <header className=\"flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950\">
      <div className=\"flex items-center gap-2\">
        <span className=\"text-sm font-semibold text-zinc-900 dark:text-zinc-50\">
          Aspire Library
        </span>
        {user?.role && (
          <span className=\"rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300\">
            {user.role}
          </span>
        )}
      </div>
      <div className=\"flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-200\">
        {user?.email && <span>{user.email}</span>}
        <button
          type=\"button\"
          onClick={() => signOut({ callbackUrl: \"/auth/signin\" })}
          className=\"rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800\"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}

