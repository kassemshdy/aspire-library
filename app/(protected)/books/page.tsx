import Link from "next/link";
import { auth } from "@/lib/auth";
import { listBooks } from "@/lib/services/bookService";
import { BookFilters } from "@/components/books/BookFilters";
import { BookTable } from "@/components/books/BookTable";
import { canManageBooks } from "@/lib/authz";

type PageProps = {
  searchParams: Promise<{
    query?: string;
    status?: string;
    page?: string;
  }>;
};

export default async function BooksPage({ searchParams }: PageProps) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const canManage = canManageBooks(role);

  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;

  const { items: books } = await listBooks(
    {
      query: params.query,
      status: (params.status as any) ?? "ALL",
    },
    page
  );

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-6 py-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Books
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Search and manage your library catalog.
            </p>
          </div>
          {canManage && (
            <Link
              href="/books/new"
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Add book
            </Link>
          )}
        </div>
        <BookFilters />
        <BookTable books={books} />
      </main>
    </div>
  );
}

