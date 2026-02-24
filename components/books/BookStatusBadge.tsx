import type { BookStatus } from "@prisma/client";

const COLORS: Record<BookStatus, string> = {
  AVAILABLE:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/40 dark:text-emerald-200",
  CHECKED_OUT:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/40 dark:text-amber-200",
  ARCHIVED:
    "bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-zinc-900/60 dark:text-zinc-300",
};

export function BookStatusBadge({ status }: { status: BookStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${COLORS[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

