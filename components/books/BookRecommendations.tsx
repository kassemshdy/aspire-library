"use client";

import { useState } from "react";
import { Sparkles, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import type { Book } from "@prisma/client";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BookStatusBadge } from "./BookStatusBadge";

type BookRecommendationsProps = {
  bookId: string;
  bookTitle: string;
};

export function BookRecommendations({
  bookId,
  bookTitle,
}: BookRecommendationsProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadRecommendations = async () => {
    if (loaded) return; // Don't reload if already loaded

    setLoading(true);
    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });

      if (!res.ok) {
        throw new Error("Failed to load recommendations");
      }

      const data = await res.json();
      setRecommendations(data.recommendations || []);
      setLoaded(true);

      if (data.recommendations?.length === 0) {
        toast.info("No similar books found in the catalog");
      }
    } catch (error) {
      console.error("Recommendations error:", error);
      toast.error("AI recommendations are not available");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && !loaded) {
      loadRecommendations();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 rounded-md border border-purple-600 bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 hover:bg-purple-100 dark:border-purple-500 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900"
        >
          <Sparkles className="h-3 w-3" />
          Similar
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <AlertDialogTitle>Books Similar to</AlertDialogTitle>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">
                {bookTitle}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </AlertDialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600 dark:text-purple-400" />
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Finding similar books...
                </p>
              </div>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
              No similar books found in the catalog.
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((book) => (
                <div
                  key={book.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-3 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/50"
                >
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {book.title}
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      by {book.author}
                    </p>
                    {book.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-500 line-clamp-2">
                        {book.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <BookStatusBadge status={book.status} />
                      {book.category && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {book.category}
                        </span>
                      )}
                      {book.publishedYear && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {book.publishedYear}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/books/${book.id}/edit`}
                    className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    onClick={() => setOpen(false)}
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Powered by Claude AI
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
