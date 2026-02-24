import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/shell/Navbar";

export default async function AuditLogsPage() {
  const session = await auth();
  const userRole = session?.user?.role;

  // Only ADMIN can view audit logs
  if (userRole !== "ADMIN") {
    redirect("/dashboard");
  }

  const logs = await prisma.auditLog.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-6 py-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Audit Logs
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            System activity and administrative actions
          </p>
        </div>

        {logs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
            No audit logs found.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Timestamp</th>
                  <th className="px-4 py-2 font-medium">Action</th>
                  <th className="px-4 py-2 font-medium">Entity</th>
                  <th className="px-4 py-2 font-medium">User</th>
                  <th className="px-4 py-2 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900"
                  >
                    <td className="px-4 py-2 align-middle text-xs text-zinc-600 dark:text-zinc-300">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 align-middle">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          log.action.includes("DELETE")
                            ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                            : log.action.includes("CREATE")
                            ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-2 align-middle text-xs text-zinc-700 dark:text-zinc-200">
                      {log.entityType}
                      {log.entityId && (
                        <span className="ml-1 text-zinc-500 dark:text-zinc-400">
                          #{log.entityId.slice(0, 8)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 align-middle text-xs text-zinc-600 dark:text-zinc-300">
                      {log.user?.name || log.user?.email || "System"}
                    </td>
                    <td className="px-4 py-2 align-middle text-xs text-zinc-500 dark:text-zinc-400">
                      {log.metadata && typeof log.metadata === "object" && (
                        <details className="cursor-pointer">
                          <summary className="hover:text-zinc-700 dark:hover:text-zinc-300">
                            View
                          </summary>
                          <pre className="mt-1 max-w-md overflow-auto text-[10px]">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
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
