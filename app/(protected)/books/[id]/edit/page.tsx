import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canManageBooks } from "@/lib/authz";
import { getBookById } from "@/lib/services/bookService";
import { BookForm } from "@/components/books/BookForm";
import { Navbar } from "@/components/shell/Navbar";

type PageParams = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBookPage({ params }: PageParams) {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user || !canManageBooks(role)) {
    redirect("/books");
  }

  const { id } = await params;
  const book = await getBookById(id);
  if (!book) {
    redirect("/books");
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-6">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Edit book
        </h1>
        <BookForm mode="edit" initial={book} />
      </main>
    </div>
  );
}

