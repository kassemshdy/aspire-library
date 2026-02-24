"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { BookStatus } from "@prisma/client";
import { useTransition, useState, useEffect } from "react";

const STATUS_OPTIONS: { label: string; value: BookStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Available", value: "AVAILABLE" },
  { label: "Checked out", value: "CHECKED_OUT" },
  { label: "Archived", value: "ARCHIVED" },
];

export function BookFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("query") ?? "");

  const statusParam = (searchParams.get("status") ??
    "ALL") as BookStatus | "ALL";

  useEffect(() => {
    setQuery(searchParams.get("query") ?? "");
  }, [searchParams]);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateParams({ query: query || null });
            }
          }}
          placeholder="Search by title, author, ISBN..."
          className="w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
        <button
          type="button"
          onClick={() => updateParams({ query: query || null })}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Search
        </button>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-zinc-600 dark:text-zinc-400">
          Status
        </label>
        <select
          value={statusParam}
          onChange={(e) =>
            updateParams({
              status: e.target.value === "ALL" ? null : e.target.value,
            })
          }
          className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {typeof opt.label === "string" ? opt.label : ""}
            </option>
          ))}
        </select>
        {isPending && (
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Updating...
          </span>
        )}
      </div>
    </div>
  );
}

