"use client";

import { useState } from "react";
import { Sparkles, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type BookSuggestion = {
  title: string;
  author: string;
  category?: string;
  publishedYear?: number;
  description: string;
};

export function BookDiscovery() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<BookSuggestion[]>([]);
  const [addingBook, setAddingBook] = useState<string | null>(null);

  const handleDiscover = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setLoading(true);
    setSuggestions([]);

    try {
      const res = await fetch("/api/ai/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to discover books");
      }

      const data = await res.json();
      setSuggestions(data.suggestions || []);

      if (data.suggestions?.length === 0) {
        toast.info("No book suggestions found. Try a different query.");
      } else {
        toast.success(
          `Found ${data.suggestions.length} book suggestion${data.suggestions.length > 1 ? "s" : ""}!`
        );
      }
    } catch (error) {
      console.error("Discovery error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "AI discovery is not available";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (book: BookSuggestion) => {
    setAddingBook(book.title);

    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          category: book.category || null,
          publishedYear: book.publishedYear || null,
          description: book.description || null,
          isbn: null,
          language: null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add book");
      }

      toast.success(`"${book.title}" added to library!`);

      // Remove the added book from suggestions
      setSuggestions((prev) => prev.filter((b) => b.title !== book.title));

      // Optionally redirect to books page
      // router.push("/books");
    } catch (error) {
      console.error("Add book error:", error);
      toast.error(`Failed to add "${book.title}"`);
    } finally {
      setAddingBook(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-4 dark:border-purple-900 dark:from-purple-950 dark:to-blue-950">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-base font-semibold text-purple-900 dark:text-purple-100">
            Discover New Books
          </h2>
        </div>
        <p className="mb-4 text-sm text-purple-700 dark:text-purple-300">
          Use AI to find recently published books to add to your library.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) {
                handleDiscover();
              }
            }}
            placeholder="e.g., 'popular science fiction 2024' or 'recent mystery thrillers'"
            className="flex-1 rounded-md border border-purple-300 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-purple-400 focus:border-purple-500 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-50 dark:placeholder:text-purple-500"
            disabled={loading}
          />
          <button
            type="button"
            onClick={handleDiscover}
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-purple-500 dark:hover:bg-purple-600"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Discover
              </>
            )}
          </button>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            AI Suggestions ({suggestions.length})
          </h3>
          {suggestions.map((book, index) => (
            <div
              key={`${book.title}-${index}`}
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
              <button
                type="button"
                onClick={() => handleAddBook(book)}
                disabled={addingBook === book.title}
                className="flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
              >
                {addingBook === book.title ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add to Library
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
