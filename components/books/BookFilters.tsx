"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { BookStatus } from "@prisma/client";
import { useTransition, useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  const [aiLoading, setAiLoading] = useState(false);

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

  const handleAiSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        throw new Error("AI search failed");
      }

      const data = await res.json();

      // Build search query from AI-extracted terms
      const searchTerms = data.searchTerms?.join(" ") || query;

      // Apply AI-extracted parameters
      updateParams({
        query: searchTerms,
        category: data.category || null,
        // Note: yearRange would need additional backend support
      });

      toast.success("AI search applied! Showing results based on your query.");
    } catch (error) {
      console.error("AI search error:", error);
      toast.error("AI search is not available. Please try regular search.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
            placeholder="Search by title, author, ISBN... or try AI search"
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
      <div className="flex items-center gap-2 border-t border-zinc-200 pt-2 dark:border-zinc-800">
        <button
          type="button"
          onClick={handleAiSearch}
          disabled={aiLoading || !query.trim()}
          className="flex items-center gap-1.5 rounded-md border border-blue-600 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
        >
          {aiLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3" />
          )}
          {aiLoading ? "Analyzing..." : "AI Search"}
        </button>
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Try natural language like "science fiction from the 90s"
        </span>
      </div>
    </div>
  );
}

