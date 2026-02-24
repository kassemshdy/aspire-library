import { Navbar } from "@/components/shell/Navbar";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  const [totalBooks, availableBooks, checkedOutBooks, totalLoans] =
    await Promise.all([
      prisma.book.count(),
      prisma.book.count({ where: { status: "AVAILABLE" } }),
      prisma.book.count({ where: { status: "CHECKED_OUT" } }),
      prisma.loan.count(),
    ]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Welcome{session?.user?.name ? `, ${session.user.name}` : ""} 👋
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Quick snapshot of your mini library.
        </p>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total books" value={totalBooks} />
          <StatCard label="Available" value={availableBooks} />
          <StatCard label="Checked out" value={checkedOutBooks} />
          <StatCard label="Total loans" value={totalLoans} />
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
    </div>
  );
}

