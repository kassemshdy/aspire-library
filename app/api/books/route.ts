import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageBooks } from "@/lib/authz";
import { createBook, listBooks } from "@/lib/services/bookService";
import type { BookStatus } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const statusParam = searchParams.get("status") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const status =
    statusParam === "ALL"
      ? "ALL"
      : (statusParam as BookStatus | undefined);

  const result = await listBooks(
    {
      query,
      category,
      status,
    },
    page
  );

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user || !canManageBooks(role)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const payload = await request.json();

  if (!payload.title || !payload.author) {
    return new NextResponse("Title and author are required", { status: 400 });
  }

  const book = await createBook(
    {
      title: payload.title,
      author: payload.author,
      isbn: payload.isbn,
      category: payload.category,
      language: payload.language,
      publishedYear: payload.publishedYear
        ? Number(payload.publishedYear)
        : undefined,
      description: payload.description,
    },
    (session.user as any).id
  );

  return NextResponse.json(book, { status: 201 });
}

