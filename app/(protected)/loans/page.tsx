import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/shell/Navbar";

export default async function LoansPage() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;

  // Show all loans for ADMIN/LIBRARIAN, only user's loans for MEMBER
  const loans = await prisma.loan.findMany({
    where:
      userRole === "ADMIN" || userRole === "LIBRARIAN"
        ? {}
        : { userId },
    include: {
      book: {
        select: {
          title: true,
          author: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { checkedOutAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-6 py-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Loan History
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {userRole === "ADMIN" || userRole === "LIBRARIAN"
              ? "All library loan transactions"
              : "Your borrowing history"}
          </p>
        </div>

        {loans.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
            No loan history found.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Book</th>
                  {(userRole === "ADMIN" || userRole === "LIBRARIAN") && (
                    <th className="px-4 py-2 font-medium">User</th>
                  )}
                  <th className="px-4 py-2 font-medium">Checked Out</th>
                  <th className="px-4 py-2 font-medium">Due Date</th>
                  <th className="px-4 py-2 font-medium">Returned</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {loans.map((loan) => (
                  <tr
                    key={loan.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900"
                  >
                    <td className="px-4 py-2 align-middle">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {loan.book.title}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        by {loan.book.author}
                      </div>
                    </td>
                    {(userRole === "ADMIN" || userRole === "LIBRARIAN") && (
                      <td className="px-4 py-2 align-middle text-xs text-zinc-700 dark:text-zinc-200">
                        {loan.user.name || loan.user.email}
                      </td>
                    )}
                    <td className="px-4 py-2 align-middle text-xs text-zinc-600 dark:text-zinc-300">
                      {new Date(loan.checkedOutAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 align-middle text-xs text-zinc-600 dark:text-zinc-300">
                      {new Date(loan.dueAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 align-middle text-xs text-zinc-600 dark:text-zinc-300">
                      {loan.returnedAt
                        ? new Date(loan.returnedAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-2 align-middle">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          loan.status === "RETURNED"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        }`}
                      >
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
