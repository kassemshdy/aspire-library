import Link from "next/link";
import type { Book } from "@prisma/client";
import { BookStatusBadge } from "./BookStatusBadge";
import { LoanButton } from "./LoanButton";
import { BookRecommendations } from "./BookRecommendations";

export function BookTable({ books }: { books: Book[] }) {
  if (books.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
        No books found. Try adjusting your filters or add a new book.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-2 font-medium">Title</th>
            <th className="px-4 py-2 font-medium">Author</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Category</th>
            <th className="px-4 py-2 font-medium">Year</th>
            <th className="px-4 py-2 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {books.map((book) => (
            <tr key={book.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900">
              <td className="px-4 py-2 align-middle text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {book.title}
              </td>
              <td className="px-4 py-2 align-middle text-sm text-zinc-700 dark:text-zinc-200">
                {book.author}
              </td>
              <td className="px-4 py-2 align-middle">
                <BookStatusBadge status={book.status} />
              </td>
              <td className="px-4 py-2 align-middle text-xs text-zinc-600 dark:text-zinc-300">
                {book.category || "—"}
              </td>
              <td className="px-4 py-2 align-middle text-xs text-zinc-600 dark:text-zinc-300">
                {book.publishedYear ?? "—"}
              </td>
              <td className="px-4 py-2 align-middle text-right text-xs">
                <div className="flex items-center justify-end gap-2">
                  <LoanButton
                    bookId={book.id}
                    bookTitle={book.title}
                    status={book.status}
                  />
                  <BookRecommendations
                    bookId={book.id}
                    bookTitle={book.title}
                  />
                  <Link
                    href={`/books/${book.id}/edit`}
                    className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Edit
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

