import { auth } from "@/lib/auth";
import { canManageBooks } from "@/lib/authz";
import { redirect } from "next/navigation";
import { BookForm } from "@/components/books/BookForm";

export default async function NewBookPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session?.user || !canManageBooks(role)) {
    redirect("/books");
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-6">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Add a new book
        </h1>
        <BookForm mode="create" />
      </main>
    </div>
  );
}

