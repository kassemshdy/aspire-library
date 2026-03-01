"use client";

import { useState } from "react";
import { ShoppingCart, Loader2, TrendingUp, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type PurchaseRecommendation = {
  title: string;
  author: string;
  category: string;
  publishedYear?: number;
  description: string;
  reason: string;
};

type TopBook = {
  title: string;
  author: string;
  category: string;
  loanCount: number;
};

export function PurchaseRecommendations() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<PurchaseRecommendation[]>([]);
  const [topBooks, setTopBooks] = useState<TopBook[]>([]);
  const [totalLoans, setTotalLoans] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/purchase-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to load recommendations");
      }

      const data = await res.json();
      setRecommendations(data.recommendations || []);
      setTopBooks(data.basedOn?.topBooks || []);
      setTotalLoans(data.basedOn?.totalLoans || 0);
      setHasLoaded(true);

      if (data.recommendations?.length > 0) {
        toast.success(`Generated ${data.recommendations.length} purchase recommendations!`);
      } else {
        toast.info("No recommendations available. Try adding more loan activity.");
      }
    } catch (error) {
      console.error("Purchase recommendations error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "AI recommendations are not available";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getAmazonSearchUrl = (title: string, author: string) => {
    const query = encodeURIComponent(`${title} ${author}`);
    return `https://www.amazon.com/s?k=${query}&i=stripbooks`;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:border-green-900 dark:from-green-950 dark:to-emerald-950">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h2 className="text-base font-semibold text-green-900 dark:text-green-100">
              AI Purchase Recommendations
            </h2>
          </div>
          {hasLoaded && totalLoans > 0 && (
            <div className="flex items-center gap-1 text-xs text-green-700 dark:text-green-300">
              <TrendingUp className="h-3 w-3" />
              Based on {totalLoans} loans
            </div>
          )}
        </div>
        <p className="mb-4 text-sm text-green-700 dark:text-green-300">
          Analyze loan patterns to discover what books to order next for your library.
        </p>

        <button
          type="button"
          onClick={loadRecommendations}
          disabled={loading}
          className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing borrowing patterns...
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Get Purchase Recommendations
            </>
          )}
        </button>
      </div>

      {hasLoaded && topBooks.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Most Popular Books in Your Library
          </h3>
          <div className="space-y-2">
            {topBooks.map((book, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex-1">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {book.title}
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {" "}by {book.author}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 dark:text-zinc-500">
                    {book.category}
                  </span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {book.loanCount} loans
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Recommended Books to Purchase ({recommendations.length})
          </h3>
          {recommendations.map((book, index) => (
            <div
              key={index}
              className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {book.title}
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    by {book.author}
                  </p>
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {book.description}
                </p>
                <div className="flex items-start gap-2 rounded-md bg-green-50 p-2 dark:bg-green-950/50">
                  <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <p className="text-xs text-green-700 dark:text-green-300">
                    <strong>Why recommend:</strong> {book.reason}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-500">
                  {book.category && (
                    <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
                      {book.category}
                    </span>
                  )}
                  {book.publishedYear && (
                    <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
                      {book.publishedYear}
                    </span>
                  )}
                </div>
              </div>
              <a
                href={getAmazonSearchUrl(book.title, book.author)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
              >
                <ShoppingCart className="h-4 w-4" />
                Amazon
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
